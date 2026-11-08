// GET  /api/conversations/:id — 取得整場對話（只能看自己的）
// POST /api/conversations/:id — 使用者送出一句英文，回傳 AI 的回應
import { isValidObjectId } from "mongoose";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { correctionToClient } from "@/lib/corrections";
import { connectDB } from "@/lib/mongodb";
import { getTutorReply } from "@/lib/openai";
import { getScenario } from "@/lib/scenarios";
import { ConversationModel } from "@/models/Conversation";
import { CorrectionModel } from "@/models/Correction";

type Ctx = RouteContext<"/api/conversations/[id]">;

// 別人的對話一律回 404（不透露這個 id 是否存在）
const notFound = () => Response.json({ error: "找不到對話" }, { status: 404 });

function toClient(m: { _id?: unknown; role: string; content: string; createdAt?: Date | null }) {
  return { id: String(m._id), role: m.role, content: m.content, createdAt: m.createdAt };
}

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return notFound();

  await connectDB();
  const conv = await ConversationModel.findOne({ _id: id, userId: user.id }).lean();
  if (!conv) return notFound();

  const scenario = getScenario(conv.scenario);
  const corrections = await CorrectionModel.find({ conversationId: conv._id, userId: user.id }).lean();
  return Response.json({
    id: conv._id.toString(),
    title: conv.title,
    scenario: conv.scenario,
    scenarioLabel: scenario?.label ?? conv.scenario,
    level: conv.level,
    status: conv.status,
    createdAt: conv.createdAt,
    messages: conv.messages.map(toClient),
    corrections: corrections.map(correctionToClient),
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return notFound();

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) return Response.json({ error: "請輸入內容" }, { status: 400 });
  if (content.length > 1000) return Response.json({ error: "內容太長（上限 1000 字）" }, { status: 400 });

  try {
    await connectDB();
    const conv = await ConversationModel.findOne({ _id: id, userId: user.id });
    if (!conv) return notFound();
    const scenario = getScenario(conv.scenario);
    if (!scenario) return Response.json({ error: "未知的場景" }, { status: 400 });

    const history = [
      ...conv.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content },
    ];
    const reply = await getTutorReply(scenario, conv.level, history);

    // AI 成功回應後才一起寫入，避免只存到半組對話
    conv.messages.push({ role: "user", content }, { role: "assistant", content: reply });
    await conv.save();

    const [userMsg, aiMsg] = conv.messages.slice(-2);
    return Response.json({ userMessage: toClient(userMsg), reply: toClient(aiMsg) });
  } catch (err) {
    console.error(err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
