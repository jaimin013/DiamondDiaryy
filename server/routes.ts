import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import {
  insertDiamondSchema,
  insertMemberSchema,
  addDiamondPriceSchema,
  addWorkDaySchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { db } from "./db";
import { users, members, diamonds, diamondPrices } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Health check endpoint for deployment monitoring
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      authenticated: req.isAuthenticated(),
      uptime: process.uptime(),
    });
  });

  // Authentication status endpoint
  app.get("/api/auth-status", (req, res) => {
    res.json({
      authenticated: req.isAuthenticated(),
      userId: req.user?.id || null,
    });
  });

  // Database viewer endpoint (for development only)
  app.get("/api/admin/database", async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      const allMembers = await db.select().from(members);
      const allDiamonds = await db.select().from(diamonds);

      res.json({
        summary: {
          totalUsers: allUsers.length,
          totalMembers: allMembers.length,
          totalDiamonds: allDiamonds.length,
        },
        data: {
          users: allUsers.map((u) => ({
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            language: u.language,
            notificationTime: u.notificationTime,
            notificationsEnabled: u.notificationsEnabled,
          })),
          members: allMembers,
          diamonds: allDiamonds,
        },
      });
    } catch (error) {
      console.error("Database viewer error:", error);
      res.status(500).json({ message: "Failed to retrieve database data" });
    }
  });

  // Member routes
  app.get("/api/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const members = await storage.getMembers(req.user.id);
    res.json(members);
  });

  app.get("/api/members/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const member = await storage.getMember(Number(req.params.id));
    if (!member || member.userId !== req.user.id) return res.sendStatus(404);
    res.json(member);
  });

  app.post("/api/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      console.log("POST /api/members user", req.user?.id, "body", req.body);
      const data = insertMemberSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const member = await storage.createMember(data);
      console.log("created member", member);
      res.json(member);
    } catch (error) {
      console.error("Error creating member", error);
      if (error instanceof ZodError)
        return res.status(400).json({ message: error.errors });
      res.status(500).json({ message: "Unable to create member" });
    }
  });

  app.put("/api/members/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const memberId = Number(req.params.id);
      const member = await storage.getMember(memberId);
      if (!member || member.userId !== req.user.id) return res.sendStatus(404);

      const data = insertMemberSchema
        .partial()
        .omit({ userId: true })
        .parse(req.body);
      const updated = await storage.updateMember(memberId, data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating member", error);
      if (error instanceof ZodError)
        return res.status(400).json({ message: error.errors });
      res.status(500).json({ message: "Unable to update member" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const memberId = Number(req.params.id);
      const member = await storage.getMember(memberId);
      if (!member || member.userId !== req.user.id) return res.sendStatus(404);

      await storage.deleteMember(memberId);
      res.json({ message: "Member deleted" });
    } catch (error) {
      console.error("Error deleting member", error);
      res.status(500).json({ message: "Unable to delete member" });
    }
  });

  // Diamond routes
  app.get("/api/diamonds", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const memberId = req.query.memberId
      ? Number(req.query.memberId)
      : undefined;

    console.log(
      "GET /api/diamonds - userId:",
      req.user.id,
      "memberId:",
      memberId,
      "params:",
      req.query,
    );

    if (memberId && memberId <= 0) {
      console.error("Invalid memberId received:", memberId);
      return res.status(400).json({ message: "Invalid memberId" });
    }

    try {
      const diamonds = await storage.getDiamonds(req.user.id, memberId);

      // Log data integrity check
      if (memberId) {
        const filtered = diamonds.filter((d) => d.memberId !== memberId);
        if (filtered.length > 0) {
          console.error("CRITICAL: Returned diamonds with wrong memberId!");
          console.log(
            "Expected memberId:",
            memberId,
            "Got:",
            filtered.map((d) => d.memberId),
          );
        }
      }

      console.log(
        "Returning",
        diamonds.length,
        "diamonds for memberId:",
        memberId,
      );
      res.json(diamonds);
    } catch (error) {
      console.error("Error fetching diamonds:", error);
      res.status(500).json({ message: "Failed to fetch diamonds" });
    }
  });

  app.post("/api/diamonds", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      console.log("POST /api/diamonds user", req.user?.id, "body", req.body);
      const data = insertDiamondSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const diamond = await storage.createDiamond(data);
      console.log("created diamond", diamond);
      res.json(diamond);
    } catch (error) {
      console.error("Error creating diamond", error);
      if (error instanceof ZodError) {
        res.status(400).send(error.errors);
      } else {
        res.status(500).send("Internal server error");
      }
    }
  });

  // Settings routes
  app.patch("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.updateUser(req.user.id, req.body);
    res.json(user);
  });

  // Diamond Price routes
  app.get("/api/diamond-prices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const prices = await storage.getDiamondPrices(req.user.id);
    res.json(prices);
  });

  app.post("/api/diamond-prices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      console.log(
        "POST /api/diamond-prices user",
        req.user?.id,
        "body",
        req.body,
      );
      const data = addDiamondPriceSchema.parse(req.body);
      const price = await storage.createDiamondPrice({
        ...data,
        userId: req.user.id,
      });
      console.log("created diamond price", price);
      res.json(price);
    } catch (error) {
      console.error("Error creating diamond price", error);
      if (error instanceof ZodError)
        return res.status(400).json({ message: error.errors });
      res.status(500).json({ message: "Unable to create diamond price" });
    }
  });

  app.put("/api/diamond-prices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const priceId = Number(req.params.id);
      const price = await storage.getDiamondPrice(priceId);
      if (!price || price.userId !== req.user.id) return res.sendStatus(404);

      const data = addDiamondPriceSchema.partial().parse(req.body);
      const updated = await storage.updateDiamondPrice(priceId, data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating diamond price", error);
      if (error instanceof ZodError)
        return res.status(400).json({ message: error.errors });
      res.status(500).json({ message: "Unable to update diamond price" });
    }
  });

  app.delete("/api/diamond-prices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const priceId = Number(req.params.id);
      const price = await storage.getDiamondPrice(priceId);
      if (!price || price.userId !== req.user.id) return res.sendStatus(404);

      await storage.deleteDiamondPrice(priceId);
      res.json({ message: "Diamond price deleted" });
    } catch (error) {
      console.error("Error deleting diamond price", error);
      res.status(500).json({ message: "Unable to delete diamond price" });
    }
  });

  // Work Day routes
  app.get("/api/work-days", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const memberId = Number(req.query.memberId);
      const monthYear = req.query.monthYear as string | undefined;

      if (!memberId)
        return res.status(400).json({ message: "memberId is required" });

      const workDays = await storage.getWorkDays(
        req.user.id,
        memberId,
        monthYear,
      );
      res.json(workDays);
    } catch (error) {
      console.error("Error fetching work days", error);
      res.status(500).json({ message: "Unable to fetch work days" });
    }
  });

  app.post("/api/work-days", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = addWorkDaySchema.parse(req.body);
      const memberId = Number(req.body.memberId);

      // Verify member ownership
      const member = await storage.getMember(memberId);
      if (!member || member.userId !== req.user.id)
        return res.status(403).json({ message: "Unauthorized" });

      const workDay = await storage.createOrUpdateWorkDay(
        req.user.id,
        memberId,
        data.date,
        data.isWorkDay,
      );
      res.json(workDay);
    } catch (error) {
      console.error("Error creating/updating work day", error);
      if (error instanceof ZodError)
        return res.status(400).json({ message: error.errors });
      res.status(500).json({ message: "Unable to create/update work day" });
    }
  });

  app.delete("/api/work-days/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const workDayId = Number(req.params.id);
      const workDay = await storage.getWorkDay(workDayId);

      if (!workDay || workDay.userId !== req.user.id)
        return res.status(403).json({ message: "Unauthorized" });

      await storage.deleteWorkDay(workDayId);
      res.json({ message: "Work day deleted" });
    } catch (error) {
      console.error("Error deleting work day", error);
      res.status(500).json({ message: "Unable to delete work day" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
