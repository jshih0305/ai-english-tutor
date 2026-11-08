// 後端驗證登入：每支需要登入的 API 都要呼叫 getCurrentUser()
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "./mongodb";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySession } from "./session";
import { UserModel } from "@/models/User";

export type CurrentUser = { id: string; email: string; name: string };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** 登入成功後寫入 session cookie */
export async function startSession(userId: string) {
  const token = await signSession(userId);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** 讀 cookie → 驗證 JWT → 確認使用者還存在。沒登入回傳 null */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await verifySession(token);
  if (!userId || !isValidObjectId(userId)) return null;

  await connectDB();
  const user = await UserModel.findById(userId).select("email name").lean();
  if (!user) return null;
  return { id: user._id.toString(), email: user.email, name: user.name };
}

export function unauthorized() {
  return Response.json({ error: "請先登入" }, { status: 401 });
}
