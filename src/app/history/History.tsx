"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CorrectionCard } from "@/components/CorrectionCard";
import { ArrowRightIcon, ChatIcon, PenIcon, SparkleIcon } from "@/components/icons";
import { api } from "@/lib/api-client";
import type { CorrectionDTO, CorrectionKind } from "@/lib/corrections";
import { getScenario } from "@/lib/scenarios";

type ConversationItem = {
  id: string;
  title: string;
  scenario: string;
  level: string;
  messageCount: number;
  correctionCount: number;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
};

type CorrectionItem = CorrectionDTO & { conversationTitle: string };

const LEVEL_LABEL: Record<string, string> = { beginner: "初級", intermediate: "中級", advanced: "高級" };

const formatDate = (d: string | Date | undefined) =>
  d
    ? new Date(d).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

const TABS = [
  { id: "conversations", label: "對話紀錄" },
  { id: "corrections", label: "糾錯紀錄" },
] as const;

export function History() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("conversations");

  return (
    <div>
      <header className="animate-rise">
        <p className="text-sm font-medium text-accent">History</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">練習紀錄</h1>
        <p className="mt-2 text-muted">回顧練過的每一場對話，和每一次被糾正的地方。</p>
      </header>

      <div className="mt-8 inline-flex rounded-full border border-line bg-surface p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm transition ${
              tab === t.id ? "bg-fg font-medium text-bg" : "text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">{tab === "conversations" ? <ConversationList /> : <CorrectionList />}</div>
    </div>
  );
}

function ConversationList() {
  const [items, setItems] = useState<ConversationItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ conversations: ConversationItem[] }>("/api/conversations")
      .then((d) => setItems(d.conversations))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorText text={error} />;
  if (!items) return <Skeleton />;
  if (items.length === 0) {
    return (
      <Empty icon={<ChatIcon />} title="還沒有練習紀錄" body="選一個場景，開始你的第一場英文對話吧。">
        <Link
          href="/practice"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-90"
        >
          開始練習 <ArrowRightIcon />
        </Link>
      </Empty>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((c, i) => {
        const s = getScenario(c.scenario);
        return (
          <li key={c.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
            <Link
              href={`/practice/${c.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-line-strong hover:shadow-[var(--shadow-soft)] sm:p-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-2xl">
                {s?.emoji ?? "💬"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{s?.label ?? c.title}</span>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
                    {LEVEL_LABEL[c.level] ?? c.level}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-faint">{formatDate(c.updatedAt)}</span>
                </div>
                <p className="mt-1 truncate text-sm text-muted">{c.lastMessage}</p>
                <p className="mt-2 flex gap-3 text-xs text-faint">
                  <span>{c.messageCount} 則訊息</span>
                  <span>{c.correctionCount} 筆糾錯</span>
                </p>
              </div>
              <ArrowRightIcon className="hidden shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-fg sm:block" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const FILTERS: { id: CorrectionKind | "all"; label: string; Icon?: typeof PenIcon }[] = [
  { id: "all", label: "全部" },
  { id: "grammar", label: "文法", Icon: PenIcon },
  { id: "better-answer", label: "更好回答", Icon: SparkleIcon },
];

function CorrectionList() {
  const [filter, setFilter] = useState<CorrectionKind | "all">("all");
  const [items, setItems] = useState<CorrectionItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const qs = filter === "all" ? "" : `?kind=${filter}`;
    api<{ corrections: CorrectionItem[] }>(`/api/corrections${qs}`)
      .then((d) => {
        setItems(d.corrections);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [filter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              setItems(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
              filter === f.id
                ? "border-accent-line bg-accent-soft font-medium text-accent"
                : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            {f.Icon && <f.Icon />}
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorText text={error} />
      ) : !items ? (
        <Skeleton />
      ) : items.length === 0 ? (
        <Empty
          icon={<PenIcon />}
          title="還沒有糾錯紀錄"
          body="在對話中按「糾正文法」或「更好完整回答」，結果就會整理在這裡。"
        />
      ) : (
        <ul className="space-y-4">
          {items.map((c, i) => (
            <li
              key={c.id}
              className="animate-rise rounded-2xl border border-line bg-surface p-5"
              style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
            >
              <div className="flex items-center gap-2 text-xs text-faint">
                <Link
                  href={`/practice/${c.conversationId}`}
                  className="inline-flex items-center gap-1 font-medium text-muted transition hover:text-accent"
                >
                  {c.conversationTitle || "對話"} <ArrowRightIcon />
                </Link>
                <span className="ml-auto">{formatDate(c.createdAt)}</span>
              </div>
              {c.context && (
                <p className="mt-3 border-l-2 border-line pl-3 text-sm leading-relaxed text-muted">{c.context}</p>
              )}
              <p className="mt-3 text-[15px] leading-relaxed">
                <span className="mr-2 text-xs font-medium text-faint">我說</span>
                {c.original}
              </p>
              <div className="mt-4">
                <CorrectionCard correction={c} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Skeleton = () => (
  <div className="space-y-3" aria-label="載入中">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-24 animate-pulse rounded-2xl border border-line bg-surface" />
    ))}
  </div>
);

const ErrorText = ({ text }: { text: string }) => (
  <p className="rounded-2xl border border-danger/25 bg-danger-bg px-5 py-4 text-center text-danger">{text}</p>
);

const Empty = ({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) => (
  <div className="rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center">
    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-xl text-muted">
      {icon}
    </span>
    <p className="mt-5 font-semibold">{title}</p>
    <p className="mt-1 text-sm text-muted">{body}</p>
    {children}
  </div>
);
