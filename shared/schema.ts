import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  language: text("language").default("en"),
  notificationTime: text("notification_time").default("07:00"),
  notificationsEnabled: text("notifications_enabled").default("true"),
});

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  serialNumber: text("serial_number").notNull(),
  name: text("name").notNull(),
});

export const diamonds = sqliteTable("diamonds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  memberId: integer("member_id").notNull(),
  date: text("date").notNull(),
  weightFrom: real("weight_from").notNull(),
  weightTo: real("weight_to").notNull(),
  price: real("price").notNull(),
  quantity: real("quantity").notNull(),
  total: real("total").notNull(),
});

export const diamondPrices = sqliteTable("diamond_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  weightFrom: real("weight_from").notNull(),
  weightTo: real("weight_to").notNull(),
  price: real("price").notNull(),
});

export const workDays = sqliteTable("work_days", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  memberId: integer("member_id").notNull(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  isWorkDay: text("is_work_day").notNull().default("true"), // "true" or "false"
});

// Create base schemas
export const insertUserSchema = createInsertSchema(users);
export const insertMemberSchema = createInsertSchema(members);
export const addMemberSchema = insertMemberSchema
  .omit({ userId: true })
  .extend({
    serialNumber: z
      .string()
      .min(1, "Member ID is required")
      .min(2, "Member ID must be at least 2 characters")
      .max(50, "Member ID must be at most 50 characters"),
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
  });
export const insertDiamondPriceSchema = createInsertSchema(diamondPrices);
export const addDiamondPriceSchema = insertDiamondPriceSchema
  .omit({ userId: true })
  .extend({
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be at most 50 characters"),
    weightFrom: z.number().min(0, "Weight from must be positive"),
    weightTo: z.number().min(0, "Weight to must be positive"),
    price: z.number().min(0, "Price must be positive"),
  });

// Registration schema with proper validation
export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(100, "Email must be at most 100 characters"),
  language: z.string().optional().default("en"),
  notificationTime: z.string().optional().default("07:00"),
  notificationsEnabled: z.string().optional().default("true"),
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
const baseDiamondSchema = createInsertSchema(diamonds);

// Extend diamond schema with custom validation
export const insertDiamondSchema = baseDiamondSchema.extend({
  weightFrom: z.number().min(0, "Weight must be positive"),
  weightTo: z.number().min(0, "Weight must be positive"),
  price: z.number().min(0, "Price must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  total: z.number().min(0, "Total must be positive"),
});

export const insertWeightFilterSchema = z.object({
  ranges: z.array(
    z.object({
      from: z.number().min(0),
      to: z.number().min(0),
      price: z.number().min(0),
    }),
  ),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertDiamond = z.infer<typeof insertDiamondSchema>;
export type User = typeof users.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Diamond = typeof diamonds.$inferSelect;
export type WorkDay = typeof workDays.$inferSelect;

export const insertWorkDaySchema = createInsertSchema(workDays);
export const addWorkDaySchema = insertWorkDaySchema
  .omit({ userId: true })
  .extend({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    isWorkDay: z.boolean(),
  });
