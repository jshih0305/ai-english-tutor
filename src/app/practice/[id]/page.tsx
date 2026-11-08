import { Suspense } from "react";
import { Chat } from "./Chat";

export default function PracticePage({ params }: PageProps<"/practice/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center gap-1.5 text-faint">
          <span className="typing-dot size-2 rounded-full bg-current" />
          <span className="typing-dot size-2 rounded-full bg-current" />
          <span className="typing-dot size-2 rounded-full bg-current" />
        </div>
      }
    >
      {params.then(({ id }) => (
        <Chat id={id} />
      ))}
    </Suspense>
  );
}
