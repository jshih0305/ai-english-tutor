// POST /api/conversations/:id/messages/:messageId/grammar — 糾正這句話的文法
import { handleCorrection } from "@/lib/corrections";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/conversations/[id]/messages/[messageId]/grammar">
) {
  const { id, messageId } = await ctx.params;
  return handleCorrection("grammar", id, messageId);
}
