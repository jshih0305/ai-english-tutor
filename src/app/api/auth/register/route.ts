// POST /api/auth/register — 註冊並直接登入
import { hashPassword, startSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!EMAIL_RE.test(email)) return Response.json({ error: "Email 格式不正確" }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "密碼至少 8 個字元" }, { status: 400 });
  if (password.length > 72) return Response.json({ error: "密碼最多 72 個字元" }, { status: 400 });
  if (!name || name.length > 30) return Response.json({ error: "請輸入暱稱（30 字以內）" }, { status: 400 });

  try {
    await connectDB();
    if (await UserModel.exists({ email })) {
      return Response.json({ error: "這個 Email 已經註冊過了" }, { status: 409 });
    }
    const user = await UserModel.create({ email, name, passwordHash: await hashPassword(password) });
    await startSession(user._id.toString());
    return Response.json({ user: { id: user._id.toString(), email, name } }, { status: 201 });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return Response.json({ error: "這個 Email 已經註冊過了" }, { status: 409 });
    }
    console.error(err);
    return Response.json({ error: "註冊失敗，請稍後再試" }, { status: 500 });
  }
}
