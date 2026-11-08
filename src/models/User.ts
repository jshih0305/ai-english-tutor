import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // bcrypt 雜湊後的密碼，永遠不存明碼、也不回傳給前端
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema>;

// 開發時改 schema 後 hot reload，要把舊的 model 移除才會套用新欄位
if (models.User) deleteModel("User");

export const UserModel: Model<User> = model<User>("User", UserSchema);
