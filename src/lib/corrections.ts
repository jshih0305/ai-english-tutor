// 「糾正文法」「更好完整回答」兩支 API 共用的流程
import { isValidObjectId } from "mongoose";
import { getCurrentUser, unauthorized } from "./auth";
import { connectDB } from "./mongodb";
import { checkGrammar, suggestBetterAnswer } from "./openai";
import { getScenario } from "./scenarios";
import { ConversationModel } from "@/models/Conversation";
import { CorrectionModel, type Correction } from "@/models/Correction";

export type CorrectionKind = "grammar" | "better-answer";

type CorrectionDoc = Correction & { _id: unknown; createdAt?: Date };

/** 轉成回傳給前端的格式 */
export function correctionToClient(c: CorrectionDoc) {
  return {
    id: String(c._id),
    conversationId: String(c.conversationId),
    messageId: String(c.messageId),
    createdAt: c.createdAt,
    context: c.context,
    kind: c.kind,
    original: c.original,
    corrected: c.corrected,
    isCorrect: c.isCorrect,
    explanation: c.explanation,
    issues: c.issues,
    alternatives: c.alternatives,
  };
}

export type CorrectionDTO = ReturnType<typeof correctionToClient>;

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function handleCorrection(kind: CorrectionKind, conversationId: string, messageId: string) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (!isValidObjectId(conversationId) || !isValidObjectId(messageId)) {
    return jsonError("找不到訊息", 404);
  }

  try {
    await connectDB();

    // 先確認這場對話是自己的，別人的一律當作不存在
    const conv = await ConversationModel.findOne({ _id: conversationId, userId: user.id });
    if (!conv) return jsonError("找不到對話", 404);

    // 已經按過就直接回傳，不重複打 OpenAI
    const existing = await CorrectionModel.findOne({ messageId, kind, userId: user.id }).lean();
    if (existing) return Response.json({ correction: correctionToClient(existing) });

    const idx = conv.messages.findIndex((m) => String(m._id) === messageId);
    const message = conv.messages[idx];
    if (!message) return jsonError("找不到訊息", 404);
    if (message.role !== "user") return jsonError("只能檢查自己說的話", 400);

    // 上下文：這句話之前 AI 最後問的那一句
    const context =
      conv.messages
        .slice(0, idx)
        .reverse()
        .find((m) => m.role === "assistant")?.content ?? "";

    let fields: Partial<Correction>;
    if (kind === "grammar") {
      const r = await checkGrammar(message.content, context);
      fields = {
        corrected: r.corrected,
        isCorrect: r.isCorrect,
        explanation: r.explanation,
        issues: r.issues as Correction["issues"],
      };
    } else {
      const scenario = getScenario(conv.scenario);
      if (!scenario) return jsonError("未知的場景", 400);
      const r = await suggestBetterAnswer(message.content, context, scenario, conv.level);
      fields = {
        corrected: r.betterAnswer,
        explanation: r.explanation,
        alternatives: r.alternatives,
      };
    }

    let correction;
    try {
      correction = await CorrectionModel.create({
        conversationId: conv._id,
        messageId: message._id,
        userId: user.id,
        kind,
        original: message.content,
        context,
        ...fields,
      });
    } catch (err) {
      // 同時按兩次：另一個請求已經先存好了，回傳那一筆
      if ((err as { code?: number }).code === 11000) {
        const dup = await CorrectionModel.findOne({ messageId, kind, userId: user.id }).lean();
        if (dup) return Response.json({ correction: correctionToClient(dup) });
      }
      throw err;
    }

    // 更新對話上的標記與統計
    await ConversationModel.updateOne(
      { _id: conv._id, "messages._id": message._id },
      { $set: { "messages.$.hasCorrection": true }, $inc: { correctionCount: 1 } }
    );

    return Response.json({ correction: correctionToClient(correction.toObject()) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return jsonError((err as Error).message, 500);
  }
}
