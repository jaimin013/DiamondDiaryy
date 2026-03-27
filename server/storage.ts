import { IStorage } from "./types";
import {
  users,
  members,
  diamonds,
  diamondPrices,
  workDays,
  User,
  Member,
  Diamond,
  WorkDay,
  InsertUser,
  InsertMember,
  InsertDiamond,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { and, eq } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

export class DBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return await db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();
  }

  async createUser(user: InsertUser): Promise<User> {
    db.insert(users).values(user).run();
    const created = await this.getUserByUsername(user.username);
    if (!created) throw new Error("Failed to create user");
    return created;
  }

  async getMembers(userId: number): Promise<Member[]> {
    return await db
      .select()
      .from(members)
      .where(eq(members.userId, userId))
      .all();
  }

  async getMember(id: number): Promise<Member | undefined> {
    return await db.select().from(members).where(eq(members.id, id)).get();
  }

  async getDiamond(id: number): Promise<Diamond | undefined> {
    return await db.select().from(diamonds).where(eq(diamonds.id, id)).get();
  }

  async createMember(member: InsertMember): Promise<Member> {
    console.log("Creating member with data:", member);
    const result = db.insert(members).values(member).returning().all();
    console.log("Inserted result:", result);
    const created = result[0];
    console.log("Created:", created);
    if (!created) throw new Error("Failed to create member");
    return created;
  }

  async updateMember(id: number, data: Partial<Member>): Promise<Member> {
    await db.update(members).set(data).where(eq(members.id, id));
    const updated = await this.getMember(id);
    if (!updated) throw new Error("Member not found");
    return updated;
  }

  async deleteMember(id: number): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  async getDiamonds(userId: number, memberId?: number): Promise<Diamond[]> {
    if (memberId !== undefined) {
      // CRITICAL: Always filter by BOTH userId and memberId for data isolation
      console.log(
        "getDiamonds - Fetching for userId:",
        userId,
        "memberId:",
        memberId,
      );

      const result = await db
        .select()
        .from(diamonds)
        .where(
          and(eq(diamonds.userId, userId), eq(diamonds.memberId, memberId)),
        )
        .all();

      // Validate result - ensure all belong to correct member
      const invalid = result.filter(
        (d) => d.memberId !== memberId || d.userId !== userId,
      );
      if (invalid.length > 0) {
        console.error("CRITICAL DATA ISOLATION ERROR:", invalid);
      }

      console.log("getDiamonds returning", result.length, "diamonds");
      return result;
    }

    console.log("getDiamonds - Fetching all for userId:", userId);
    return await db
      .select()
      .from(diamonds)
      .where(eq(diamonds.userId, userId))
      .all();
  }

  async createDiamond(diamond: InsertDiamond): Promise<Diamond> {
    const result = db.insert(diamonds).values(diamond).returning().all();
    const created = result[0];
    if (!created) throw new Error("Failed to create diamond");
    return created;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    await db.update(users).set(data).where(eq(users.id, id));
    const updated = await this.getUser(id);
    if (!updated) throw new Error("User not found");
    return updated;
  }

  // Diamond Price methods
  async getDiamondPrices(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(diamondPrices)
      .where(eq(diamondPrices.userId, userId))
      .all();
  }

  async getDiamondPrice(id: number): Promise<any | undefined> {
    return await db
      .select()
      .from(diamondPrices)
      .where(eq(diamondPrices.id, id))
      .get();
  }

  async createDiamondPrice(price: any): Promise<any> {
    const result = db.insert(diamondPrices).values(price).returning().all();
    const created = result[0];
    if (!created) throw new Error("Failed to create diamond price");
    return created;
  }

  async updateDiamondPrice(id: number, data: Partial<any>): Promise<any> {
    await db.update(diamondPrices).set(data).where(eq(diamondPrices.id, id));
    const updated = await this.getDiamondPrice(id);
    if (!updated) throw new Error("Diamond price not found");
    return updated;
  }

  async deleteDiamondPrice(id: number): Promise<void> {
    await db.delete(diamondPrices).where(eq(diamondPrices.id, id));
  }

  // Work Day methods
  async getWorkDays(
    userId: number,
    memberId: number,
    monthYear?: string,
  ): Promise<WorkDay[]> {
    const allDays = await db
      .select()
      .from(workDays)
      .where(and(eq(workDays.userId, userId), eq(workDays.memberId, memberId)))
      .all();

    if (monthYear) {
      // Filter work days for a specific month, format: YYYY-MM
      return allDays.filter((day: WorkDay) => day.date.startsWith(monthYear));
    }
    return allDays;
  }

  async getWorkDay(id: number): Promise<WorkDay | undefined> {
    return await db.select().from(workDays).where(eq(workDays.id, id)).get();
  }

  async createOrUpdateWorkDay(
    userId: number,
    memberId: number,
    date: string,
    isWorkDay: boolean,
  ): Promise<WorkDay> {
    // Check if work day already exists for this date
    const existing = await db
      .select()
      .from(workDays)
      .where(
        and(
          eq(workDays.userId, userId),
          eq(workDays.memberId, memberId),
          eq(workDays.date, date),
        ),
      )
      .get();

    if (existing) {
      // Update existing
      await db
        .update(workDays)
        .set({ isWorkDay: isWorkDay ? "true" : "false" })
        .where(eq(workDays.id, existing.id));
      const updated = await this.getWorkDay(existing.id);
      if (!updated) throw new Error("Work day not found");
      return updated;
    } else {
      // Create new
      const result = db
        .insert(workDays)
        .values({
          userId,
          memberId,
          date,
          isWorkDay: isWorkDay ? "true" : "false",
        })
        .returning()
        .all();
      const created = result[0];
      if (!created) throw new Error("Failed to create work day");
      return created;
    }
  }

  async deleteWorkDay(id: number): Promise<void> {
    await db.delete(workDays).where(eq(workDays.id, id));
  }
}

export const storage = new DBStorage();
