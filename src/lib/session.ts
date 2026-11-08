// 登入狀態：把 userId 簽成 JWT，放在 httpOnly cookie。
// 這個檔案不碰資料庫，proxy.ts 也會用到。
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("請在 .env.local 設定 AUTH_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/** 驗證 token，成功回傳 userId，失敗（過期、被竄改）回傳 null */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true, // 前端 JS 讀不到，避免被 XSS 偷走
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
