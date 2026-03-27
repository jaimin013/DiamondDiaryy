import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, registerSchema } from "@shared/schema";
import { ZodError } from "zod";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Create session store (memory store works well for all environments)
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // Prune expired entries every 24 hours
  });

  // Generate secure session secret
  const sessionSecret =
    process.env.SESSION_SECRET || randomBytes(32).toString("hex");

  const sessionSettings: session.SessionOptions = {
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax",
      httpOnly: true, // Prevent XSS attacks
    },
  };

  // Trust proxy only in production
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      console.log("Login attempt for username:", username);
      const user = await storage.getUserByUsername(username);
      console.log("User found:", !!user);
      if (!user) {
        console.log("User not found");
        return done(null, false);
      }
      const passwordMatch = await comparePasswords(password, user.password);
      console.log("Password match:", passwordMatch);
      if (!passwordMatch) {
        console.log("Password does not match");
        return done(null, false);
      }
      console.log("Login successful for user:", user.id);
      return done(null, user);
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    console.log("Register attempt for username:", req.body.username);

    try {
      // Validate input using registerSchema
      const validatedData = registerSchema.parse(req.body);
      console.log("Validated registration data:", {
        username: validatedData.username,
        email: validatedData.email,
      });

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(
        validatedData.username,
      );
      if (existingUser) {
        console.log("Username already exists:", validatedData.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
      });
      console.log("User created successfully:", user.id);

      // Auto-login the new user
      req.login(user, (err) => {
        if (err) {
          console.log("Login after register failed:", err);
          return next(err);
        }
        console.log("Auto-login after register successful for user:", user.id);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration validation error:", error);
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: error.errors[0].message, errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    console.log("Login successful, user:", req.user?.id);
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log(
      "GET /api/user, authenticated:",
      req.isAuthenticated(),
      "user:",
      req.user?.id,
    );
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
