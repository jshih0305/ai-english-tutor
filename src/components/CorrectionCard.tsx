import { CheckIcon, PenIcon, SparkleIcon } from "./icons";
import type { CorrectionDTO } from "@/lib/corrections";

const ISSUE_LABEL: Record<string, string> = {
  grammar: "文法",
  vocabulary: "單字",
  spelling: "拼字",
  "word-choice": "用字",
  naturalness: "自然度",
  other: "其他",
};

export function CorrectionCard({ correction }: { correction: CorrectionDTO }) {
  if (correction.kind === "grammar") return <GrammarCard c={correction} />;
  return <BetterAnswerCard c={correction} />;
}

function Label({ icon, children, className }: { icon: React.ReactNode; children: React.ReactNode; className: string }) {
  return (
    <p className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`}>
      {icon}
      {children}
    </p>
  );
}

function GrammarCard({ c }: { c: CorrectionDTO }) {
  if (c.isCorrect) {
    return (
      <div className="rounded-2xl border border-ok-line bg-ok-bg px-4 py-3.5 text-sm">
        <Label icon={<CheckIcon />} className="text-ok-fg">
          文法正確
        </Label>
        {c.explanation && <p className="mt-1.5 leading-relaxed text-fg/80">{c.explanation}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-warn-line bg-warn-bg px-4 py-4 text-sm">
      <Label icon={<PenIcon />} className="text-warn-fg">
        文法糾正
      </Label>
      <p className="mt-2.5 text-[15px] font-medium leading-relaxed text-fg">{c.corrected}</p>
      {c.explanation && <p className="mt-1.5 leading-relaxed text-muted">{c.explanation}</p>}

      {c.issues.length > 0 && (
        <ul className="mt-4 space-y-3 border-t border-warn-line pt-4">
          {c.issues.map((issue, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 h-fit shrink-0 rounded-md border border-warn-line bg-surface/60 px-1.5 py-0.5 text-[11px] font-medium text-warn-fg">
                {ISSUE_LABEL[issue.type] ?? issue.type}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  {issue.original && (
                    <span className="text-danger line-through decoration-danger/50">{issue.original}</span>
                  )}
                  <span className="text-faint">→</span>
                  <span className="font-medium text-ok-fg">{issue.corrected}</span>
                </p>
                {issue.explanation && <p className="mt-1 leading-relaxed text-muted">{issue.explanation}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BetterAnswerCard({ c }: { c: CorrectionDTO }) {
  return (
    <div className="rounded-2xl border border-tip-line bg-tip-bg px-4 py-4 text-sm">
      <Label icon={<SparkleIcon />} className="text-tip-fg">
        更好的完整回答
      </Label>
      <p className="mt-2.5 text-[15px] font-medium leading-relaxed text-fg">{c.corrected}</p>
      {c.explanation && <p className="mt-1.5 leading-relaxed text-muted">{c.explanation}</p>}

      {c.alternatives.length > 0 && (
        <div className="mt-4 border-t border-tip-line pt-4">
          <p className="text-xs font-medium text-faint">其他說法</p>
          <ul className="mt-2 space-y-2">
            {c.alternatives.map((alt, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed text-fg/90">
                <span className="mt-[0.55em] size-1 shrink-0 rounded-full bg-tip-fg" />
                {alt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
