import { User, Member, Diamond, InsertUser, InsertMember, InsertDiamond } from "@shared/schema";
import { Store } from "express-session";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMembers(userId: number): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  getDiamonds(userId: number, memberId?: number): Promise<Diamond[]>;
  createDiamond(diamond: InsertDiamond): Promise<Diamond>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  sessionStore: Store;
}