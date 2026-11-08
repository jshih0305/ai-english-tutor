// GET  /api/conversations — 我的練習紀錄列表
// POST /api/conversations — 選好場景後建立一場新練習，並由 AI 先開口
import { Types } from "mongoose";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getTutorReply } from "@/lib/openai";
import { getScenario } from "@/lib/scenarios";
import { ConversationModel } from "@/models/Conversation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await connectDB();
  // 只查自己的；不整包撈訊息，只算數量、取最後一句當預覽
  // （aggregate 不會自動轉型，userId 要自己轉成 ObjectId）
  const list = await ConversationModel.aggregate([
    { $match: { userId: new Types.ObjectId(user.id) } },
    { $sort: { updatedAt: -1 } },
    { $limit: 100 },
    {
      $project: {
        title: 1,
        scenario: 1,
        level: 1,
        correctionCount: 1,
        createdAt: 1,
        updatedAt: 1,
        messageCount: { $size: "$messages" },
        lastMessage: { $ifNull: [{ $arrayElemAt: ["$messages.content", -1] }, ""] },
      },
    },
  ]);

  return Response.json({
    conversations: list.map(({ _id, ...c }) => ({ id: String(_id), ...c })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const scenario = getScenario(body.scenario);
  if (!scenario) {
    return Response.json({ error: "未知的場景" }, { status: 400 });
  }
  const level = ["beginner", "intermediate", "advanced"].includes(body.level)
    ? body.level
    : "intermediate";

  try {
    await connectDB();
    const opening = await getTutorReply(scenario, level, []);
    const conv = await ConversationModel.create({
      userId: user.id,
      title: `${scenario.emoji} ${scenario.label}`,
      scenario: scenario.id,
      level,
      messages: [{ role: "assistant", content: opening }],
    });
    return Response.json({ id: conv._id.toString() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
