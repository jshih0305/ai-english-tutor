import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * 每一次使用者按下「糾正文法」或「更好完整回答」產生的結果。
 * 獨立成一個 collection，之後可以跨對話查詢（例如「我最常犯的文法錯誤」）。
 * 同一則訊息、同一種 kind 只會有一筆（重複按會直接回傳舊的結果，不再打 OpenAI）。
 */

// 文法糾錯裡的每一個錯誤點
const IssueSchema = new Schema(
  {
    original: { type: String, default: "" }, // 錯的片段
    corrected: { type: String, default: "" }, // 改好的片段
    type: {
      type: String,
      enum: ["grammar", "vocabulary", "spelling", "word-choice", "naturalness", "other"],
      default: "grammar",
    },
    explanation: { type: String, default: "" }, // 中文解說
  },
  { _id: false }
);

const CorrectionSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    // 對應 Conversation.messages 裡那則使用者訊息的 _id
    messageId: { type: Schema.Types.ObjectId, required: true },
    // 這筆糾錯屬於哪個使用者（所有查詢都要帶這個條件）
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // grammar = 糾正文法、better-answer = 更好完整回答
    kind: {
      type: String,
      enum: ["grammar", "better-answer"],
      required: true,
    },

    // 使用者原本寫的句子
    original: { type: String, required: true },
    // 當時 AI 問的問題（給之後複習時看上下文）
    context: { type: String, default: "" },
    // grammar：修正後的整句；better-answer：更好的完整回答
    corrected: { type: String, required: true },
    // 文法是否完全正確（只有 grammar 用）
    isCorrect: { type: Boolean, default: false },
    // 整體中文解說
    explanation: { type: String, default: "" },
    // 每個錯誤點（只有 grammar 用）
    issues: { type: [IssueSchema], default: [] },
    // 其他替代說法（只有 better-answer 用）
    alternatives: { type: [String], default: [] },

    // ---- 使用者是否採用這個建議（之後做「採用並重新送出」時用） ----
    applied: { type: Boolean, default: false },
    appliedAt: { type: Date, default: null },
    // 採用後重新送出的那則訊息 _id
    appliedMessageId: { type: Schema.Types.ObjectId, default: null },
    // 使用者對建議的回饋（之後做 👍/👎 用）
    feedback: {
      type: String,
      enum: ["helpful", "not-helpful", null],
      default: null,
    },
  },
  { timestamps: true }
);

CorrectionSchema.index({ messageId: 1, kind: 1 }, { unique: true });
CorrectionSchema.index({ userId: 1, createdAt: -1 });

export type Correction = InferSchemaType<typeof CorrectionSchema>;

// 開發時改 schema 後 hot reload，要把舊的 model 移除才會套用新欄位
if (models.Correction) deleteModel("Correction");

export const CorrectionModel: Model<Correction> = model<Correction>("Correction", CorrectionSchema);
