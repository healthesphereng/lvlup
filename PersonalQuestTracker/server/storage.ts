import { 
  User, InsertUser, 
  Task, InsertTask, 
  Challenge, InsertChallenge,
  Badge, InsertBadge,
  Category, InsertCategory
} from "@shared/schema";

// Modify the interface with CRUD methods for all entities
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserExp(id: number, exp: number): Promise<User>;
  updateUserLevel(id: number, level: number): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskCompletion(id: number, isCompleted: boolean): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Challenge methods
  getChallenge(id: number): Promise<Challenge | undefined>;
  getChallengesByUserId(userId: number): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallengeProgress(id: number, currentCount: number): Promise<Challenge>;
  updateChallengeCompletion(id: number, isCompleted: boolean): Promise<Challenge>;
  
  // Badge methods
  getBadgesByUserId(userId: number): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private tasks: Map<number, Task>;
  private challenges: Map<number, Challenge>;
  private badges: Map<number, Badge>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private taskIdCounter: number;
  private challengeIdCounter: number;
  private badgeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.tasks = new Map();
    this.challenges = new Map();
    this.badges = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.taskIdCounter = 1;
    this.challengeIdCounter = 1;
    this.badgeIdCounter = 1;
    
    // Add demo user for testing
    this.createUser({
      username: "demo",
      password: "password"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      level: 1,
      exp: 0,
      prestigeLevel: 0
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserExp(id: number, exp: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, exp };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserLevel(id: number, level: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, level };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = { 
      ...insertTask, 
      id,
      isCompleted: false,
      streak: 0,
      lastCompletedAt: null,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTaskCompletion(id: number, isCompleted: boolean): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    let streak = task.streak;
    let lastCompletedAt = task.lastCompletedAt;
    
    if (isCompleted) {
      const now = new Date();
      
      // If task was previously completed and it was completed within the last 24 hours
      if (task.isCompleted && task.lastCompletedAt) {
        const daysSinceLastCompleted = Math.floor(
          (now.getTime() - task.lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastCompleted <= 1) {
          // Maintain or increment streak
          streak = task.streak;
        } else {
          // Reset streak if more than a day has passed
          streak = 1;
        }
      } else {
        // First time completing or reset streak
        streak = 1;
      }
      
      lastCompletedAt = now;
    }
    
    const updatedTask = { 
      ...task, 
      isCompleted, 
      streak,
      lastCompletedAt
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }
  
  // Challenge methods
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }
  
  async getChallengesByUserId(userId: number): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.userId === userId
    );
  }
  
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeIdCounter++;
    const challenge: Challenge = { 
      ...insertChallenge, 
      id,
      currentCount: 0,
      isCompleted: false,
      createdAt: new Date()
    };
    this.challenges.set(id, challenge);
    return challenge;
  }
  
  async updateChallengeProgress(id: number, currentCount: number): Promise<Challenge> {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      throw new Error(`Challenge with id ${id} not found`);
    }
    
    const updatedChallenge = { ...challenge, currentCount };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }
  
  async updateChallengeCompletion(id: number, isCompleted: boolean): Promise<Challenge> {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      throw new Error(`Challenge with id ${id} not found`);
    }
    
    const updatedChallenge = { ...challenge, isCompleted };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }
  
  // Badge methods
  async getBadgesByUserId(userId: number): Promise<Badge[]> {
    return Array.from(this.badges.values()).filter(
      (badge) => badge.userId === userId
    );
  }
  
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const badge: Badge = { 
      ...insertBadge, 
      id,
      createdAt: new Date()
    };
    this.badges.set(id, badge);
    return badge;
  }
}

export const storage = new MemStorage();
