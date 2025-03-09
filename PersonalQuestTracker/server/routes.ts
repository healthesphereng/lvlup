import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { calculateLevelFromExp } from "@shared/schema";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertTaskSchema, 
  insertChallengeSchema, 
  insertBadgeSchema,
  insertCategorySchema  
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // ===== AUTH ROUTES =====
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  // ===== USER ROUTES =====
  
  // Get User Profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate level info
      const levelInfo = calculateLevelFromExp(user.exp);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        ...userWithoutPassword,
        ...levelInfo
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  
  // Update User EXP
  app.patch("/api/users/:id/exp", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { exp } = req.body;
      
      if (typeof exp !== 'number') {
        return res.status(400).json({ message: "EXP must be a number" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserExp(userId, exp);
      
      // Calculate new level info
      const levelInfo = calculateLevelFromExp(updatedUser.exp);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({
        ...userWithoutPassword,
        ...levelInfo
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating EXP" });
    }
  });
  
  // Update User Level
  app.patch("/api/users/:id/level", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { level } = req.body;
      
      if (typeof level !== 'number') {
        return res.status(400).json({ message: "Level must be a number" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserLevel(userId, level);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating level" });
    }
  });
  
  // ===== CATEGORY ROUTES =====
  
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  // Create a category
  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating category" });
    }
  });
  
  // ===== TASK ROUTES =====
  
  // Get user's tasks
  app.get("/api/users/:userId/tasks", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tasks = await storage.getTasksByUserId(userId);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  
  // Create a task
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating task" });
    }
  });
  
  // Update task completion status
  app.patch("/api/tasks/:id/complete", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: "Completed must be a boolean" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Update task completion status
      const updatedTask = await storage.updateTaskCompletion(taskId, completed);
      
      // If task is marked as completed, update the user's EXP
      if (completed && !task.isCompleted) {
        const user = await storage.getUser(task.userId);
        if (user) {
          await storage.updateUserExp(task.userId, user.exp + task.expReward);
        }
      }
      
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task" });
    }
  });
  
  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });
  
  // ===== CHALLENGE ROUTES =====
  
  // Get user's challenges
  app.get("/api/users/:userId/challenges", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const challenges = await storage.getChallengesByUserId(userId);
      res.status(200).json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Error fetching challenges" });
    }
  });
  
  // Create a challenge
  app.post("/api/challenges", async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating challenge" });
    }
  });
  
  // Update challenge progress
  app.patch("/api/challenges/:id/progress", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const { currentCount } = req.body;
      
      if (typeof currentCount !== 'number') {
        return res.status(400).json({ message: "Current count must be a number" });
      }
      
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      const updatedChallenge = await storage.updateChallengeProgress(challengeId, currentCount);
      
      // Check if challenge is completed
      if (updatedChallenge.currentCount >= updatedChallenge.requiredCount && !updatedChallenge.isCompleted) {
        // Mark challenge as completed
        await storage.updateChallengeCompletion(challengeId, true);
        
        // Award EXP to user
        const user = await storage.getUser(updatedChallenge.userId);
        if (user) {
          await storage.updateUserExp(updatedChallenge.userId, user.exp + updatedChallenge.expReward);
        }
        
        // Award badge if applicable
        if (updatedChallenge.badgeName) {
          await storage.createBadge({
            name: updatedChallenge.badgeName,
            icon: "award", // default icon
            description: `Completed ${updatedChallenge.title} challenge`,
            userId: updatedChallenge.userId
          });
        }
      }
      
      res.status(200).json(updatedChallenge);
    } catch (error) {
      res.status(500).json({ message: "Error updating challenge progress" });
    }
  });
  
  // ===== BADGE ROUTES =====
  
  // Get user's badges
  app.get("/api/users/:userId/badges", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const badges = await storage.getBadgesByUserId(userId);
      res.status(200).json(badges);
    } catch (error) {
      res.status(500).json({ message: "Error fetching badges" });
    }
  });
  
  // ===== LEADERBOARD ROUTES =====
  
  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Calculate level for each user and sort by level and then by exp
      const leaderboard = users
        .map(user => {
          const { level, currentExp } = calculateLevelFromExp(user.exp);
          const { password, ...userWithoutPassword } = user;
          return {
            ...userWithoutPassword,
            level,
            currentExp
          };
        })
        .sort((a, b) => {
          if (a.level !== b.level) {
            return b.level - a.level;
          }
          return b.currentExp - a.currentExp;
        });
      
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });

  // Initialize default categories if none exist
  try {
    const categories = await storage.getAllCategories();
    if (categories.length === 0) {
      await storage.createCategory({ name: "Health", color: "#4CAF50" });
      await storage.createCategory({ name: "Work", color: "#2196F3" });
      await storage.createCategory({ name: "Learning", color: "#9C27B0" });
      await storage.createCategory({ name: "Mindfulness", color: "#FF9800" });
      await storage.createCategory({ name: "Social", color: "#E91E63" });
    }
  } catch (error) {
    console.error("Error initializing default categories:", error);
  }

  return httpServer;
}
