import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, registerSchema } from "@shared/schema";
import { ZodError } from "zod";
import { rawDb } from "./db";

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

// Database-backed session store
class SQLiteSessionStore extends session.Store {
  get(sid: string, callback: (err?: Error | null, session?: any) => void) {
    try {
      const row = rawDb
        .prepare(`SELECT sess FROM sessions WHERE sid = ? AND expire > ?`)
        .get(sid, Date.now() / 1000) as any;

      if (!row) return callback();
      callback(null, JSON.parse(row.sess));
    } catch (err) {
      callback(err as Error);
    }
  }

  set(sid: string, sess: any, callback?: (err?: Error | null) => void) {
    try {
      const expire = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 1 week
      rawDb
        .prepare(
          `INSERT OR REPLACE INTO sessions (sid, sess, expire) VALUES (?, ?, ?)`,
        )
        .run(sid, JSON.stringify(sess), expire);

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err as Error);
    }
  }

  destroy(sid: string, callback?: (err?: Error | null) => void) {
    try {
      rawDb.prepare(`DELETE FROM sessions WHERE sid = ?`).run(sid);
      if (callback) callback();
    } catch (err) {
      if (callback) callback(err as Error);
    }
  }
}

export function setupAuth(app: Express) {
  const sessionStore = new SQLiteSessionStore();

  // Clean up expired sessions periodically
  setInterval(
    () => {
      try {
        rawDb
          .prepare(`DELETE FROM sessions WHERE expire < ?`)
          .run(Math.floor(Date.now() / 1000));
      } catch (err) {
        console.error("Error cleaning up sessions:", err);
      }
    },
    60 * 60 * 1000,
  ); // 1 hour

  const sessionSettings: session.SessionOptions = {
    store: sessionStore,
    secret: process.env.SESSION_SECRET! || "jnfkdfnvkjf",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      secure: false, // for local dev over HTTP
      sameSite: "lax",
    },
  };

  // For local development do not require a proxy; in production behind a proxy set trusted proxy appropriately.
  app.set("trust proxy", 0);
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
