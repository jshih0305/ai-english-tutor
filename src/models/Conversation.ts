import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * 一場英文練習的完整對話紀錄。
 * 訊息直接內嵌在對話裡（一場對話的訊息量不會超過 MongoDB 16MB 文件上限），
 * 讀取整場對話只要一次查詢。
 */

const MessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    // 這則使用者訊息是否被產生了糾錯（方便前端標記，不用另外查 Correction）
    hasCorrection: { type: Boolean, default: false },
    // 若這則訊息是使用者採用糾錯建議後重新送出的，指向那筆 Correction
    fromCorrection: { type: Schema.Types.ObjectId, ref: "Correction", default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true } // 每則訊息有自己的 _id，Correction 用它對應
);

const ConversationSchema = new Schema(
  {
    // 這場練習屬於哪個使用者（所有查詢都要帶這個條件）
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "新的練習" },
    // 練習情境，例如 "餐廳點餐"、"工作面試"、"自由聊天"
    scenario: { type: String, default: "free-talk" },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    messages: { type: [MessageSchema], default: [] },
    // 統計欄位，結束練習時更新
    correctionCount: { type: Number, default: 0 },
    appliedCorrectionCount: { type: Number, default: 0 },
    // 練習結束後 AI 給的整體回饋
    summary: { type: String, default: "" },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true } // createdAt = 開始時間, updatedAt
);

ConversationSchema.index({ userId: 1, createdAt: -1 });

export type Conversation = InferSchemaType<typeof ConversationSchema>;
export type Message = InferSchemaType<typeof MessageSchema>;

// 開發時改 schema 後 hot reload，要把舊的 model 移除才會套用新欄位
if (models.Conversation) deleteModel("Conversation");

export const ConversationModel: Model<Conversation> = model<Conversation>(
  "Conversation",
  ConversationSchema
);
