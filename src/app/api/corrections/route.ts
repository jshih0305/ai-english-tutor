// GET /api/corrections?kind=grammar|better-answer — 我所有的糾錯紀錄（跨對話）
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { correctionToClient } from "@/lib/corrections";
import { connectDB } from "@/lib/mongodb";
import { ConversationModel } from "@/models/Conversation";
import { CorrectionModel } from "@/models/Correction";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const kind = new URL(req.url).searchParams.get("kind");
  const filter: Record<string, unknown> = { userId: user.id };
  if (kind === "grammar" || kind === "better-answer") filter.kind = kind;

  await connectDB();
  const corrections = await CorrectionModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();

  // 附上所屬對話的標題（也只查自己的）
  const convs = await ConversationModel.find({
    _id: { $in: [...new Set(corrections.map((c) => String(c.conversationId)))] },
    userId: user.id,
  })
    .select("title")
    .lean();
  const titles = new Map(convs.map((c) => [c._id.toString(), c.title]));

  return Response.json({
    corrections: corrections.map((c) => ({
      ...correctionToClient(c),
      conversationTitle: titles.get(String(c.conversationId)) ?? "",
    })),
  });
}
