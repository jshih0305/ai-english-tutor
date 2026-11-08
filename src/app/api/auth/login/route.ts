// POST /api/auth/login
import { startSession, verifyPassword } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return Response.json({ error: "請輸入 Email 和密碼" }, { status: 400 });

  try {
    await connectDB();
    const user = await UserModel.findOne({ email }).lean();
    // 帳號不存在或密碼錯都回一樣的訊息，不透露哪個 Email 有註冊
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json({ error: "Email 或密碼錯誤" }, { status: 401 });
    }
    await startSession(user._id.toString());
    return Response.json({ user: { id: user._id.toString(), email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "登入失敗，請稍後再試" }, { status: 500 });
  }
}
