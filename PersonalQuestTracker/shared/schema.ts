import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  level: integer("level").notNull().default(1),
  exp: integer("exp").notNull().default(0),
  prestigeLevel: integer("prestige_level").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Category model for task categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories);

// Task model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  expReward: integer("exp_reward").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  streak: integer("streak").notNull().default(0),
  lastCompletedAt: timestamp("last_completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  userId: true,
  categoryId: true,
  expReward: true,
});

// Challenge model
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredCount: integer("required_count").notNull(),
  currentCount: integer("current_count").notNull().default(0),
  expReward: integer("exp_reward").notNull(),
  badgeName: text("badge_name"),
  userId: integer("user_id").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  requiredCount: true,
  expReward: true,
  badgeName: true,
  userId: true,
});

// Badge/Achievement model
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  icon: true,
  description: true,
  userId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

// Level calculation functions
export function calculateExpForNextLevel(currentLevel: number): number {
  // Exponential formula: 100 * (level ^ 1.5)
  return Math.floor(100 * Math.pow(currentLevel, 1.5));
}

export function calculateLevelFromExp(totalExp: number): number {
  let level = 1;
  let expNeeded = calculateExpForNextLevel(level);
  let remainingExp = totalExp;

  while (remainingExp >= expNeeded) {
    remainingExp -= expNeeded;
    level++;
    expNeeded = calculateExpForNextLevel(level);
  }

  return {
    level,
    currentExp: remainingExp,
    expForNextLevel: expNeeded
  };
}
