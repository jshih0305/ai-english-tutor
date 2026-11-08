// POST /api/conversations/:id/messages/:messageId/better-answer — 給這句話一個更好、更完整的回答
import { handleCorrection } from "@/lib/corrections";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/conversations/[id]/messages/[messageId]/better-answer">
) {
  const { id, messageId } = await ctx.params;
  return handleCorrection("better-answer", id, messageId);
}
