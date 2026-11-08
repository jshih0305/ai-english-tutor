"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CorrectionCard } from "@/components/CorrectionCard";
import { ArrowLeftIcon, ArrowUpIcon, ClockIcon, PenIcon, SparkleIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/lib/api-client";
import type { CorrectionDTO, CorrectionKind } from "@/lib/corrections";
import { getScenario } from "@/lib/scenarios";

type Message = { id: string; role: "user" | "assistant" | "system"; content: string };
type ConversationData = {
  title: string;
  scenario: string;
  level: string;
  messages: Message[];
  corrections: CorrectionDTO[];
};

const key = (messageId: string, kind: CorrectionKind) => `${messageId}:${kind}`;

const ACTIONS: { kind: CorrectionKind; label: string; Icon: typeof PenIcon; activeClass: string }[] = [
  {
    kind: "grammar",
    label: "糾正文法",
    Icon: PenIcon,
    activeClass: "border-warn-line bg-warn-bg text-warn-fg",
  },
  {
    kind: "better-answer",
    label: "更好完整回答",
    Icon: SparkleIcon,
    activeClass: "border-tip-line bg-tip-bg text-tip-fg",
  },
];

const LEVEL_LABEL: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "高級",
};

export function Chat({ id }: { id: string }) {
  const [conv, setConv] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  // 糾錯結果，key = `${messageId}:${kind}`
  const [corrections, setCorrections] = useState<Record<string, CorrectionDTO>>({});
  // 目前展開中的結果
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api<ConversationData>(`/api/conversations/${id}`)
      .then((data) => {
        setConv(data);
        setMessages(data.messages);
        // 之前按過的結果先存起來，按鈕再按就直接展開
        const map: Record<string, CorrectionDTO> = {};
        for (const c of data.corrections) map[key(c.messageId, c.kind)] = c;
        setCorrections(map);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  // 只有新訊息進來時才捲到底，展開糾錯結果時不要亂跳
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  // 輸入框隨內容長高（最多約 5 行）
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  async function runAction(messageId: string, kind: CorrectionKind) {
    const k = key(messageId, kind);
    // 已經有結果：切換展開 / 收合
    if (corrections[k]) {
      setOpen((prev) => ({ ...prev, [k]: !prev[k] }));
      return;
    }
    if (loading[k]) return;

    setLoading((prev) => ({ ...prev, [k]: true }));
    setActionError((prev) => ({ ...prev, [k]: "" }));
    try {
      const data = await api<{ correction: CorrectionDTO }>(
        `/api/conversations/${id}/messages/${messageId}/${kind}`,
        { method: "POST" }
      );
      setCorrections((prev) => ({ ...prev, [k]: data.correction }));
      setOpen((prev) => ({ ...prev, [k]: true }));
    } catch (err) {
      setActionError((prev) => ({ ...prev, [k]: (err as Error).message }));
    } finally {
      setLoading((prev) => ({ ...prev, [k]: false }));
    }
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    // 先把使用者訊息顯示出來
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content }]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const data = await api<{ userMessage: Message; reply: Message }>(`/api/conversations/${id}`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        data.userMessage,
        data.reply,
      ]);
    } catch (err) {
      // 失敗就把訊息退回輸入框，讓使用者可以重送
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(content);
      setError((err as Error).message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  // Enter 送出、Shift+Enter 換行；中文輸入法選字中按 Enter 不送出
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  if (!conv && error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-danger">{error}</p>
        <Link href="/practice" className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg">
          回到場景選擇
        </Link>
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="flex flex-1 items-center justify-center gap-1.5 text-faint">
        <span className="typing-dot size-2 rounded-full bg-current" />
        <span className="typing-dot size-2 rounded-full bg-current" />
        <span className="typing-dot size-2 rounded-full bg-current" />
      </div>
    );
  }

  const scenario = getScenario(conv.scenario);
  const avatar = scenario?.emoji ?? "💬";
  const userTurns = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex h-dvh flex-col">
      {/* 頂部列 */}
      <header className="z-20 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-3 sm:px-5">
          <Link
            href="/practice"
            aria-label="換場景"
            title="換場景"
            className="flex size-9 items-center justify-center rounded-full text-lg text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <ArrowLeftIcon />
          </Link>
          <span className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-xl">
            {avatar}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <h1 className="truncate font-semibold">{scenario?.label ?? conv.title}</h1>
            <p className="truncate text-xs text-faint">
              {scenario?.character ?? "AI 家教"} · {LEVEL_LABEL[conv.level] ?? conv.level}
            </p>
          </div>
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            href="/history"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <ClockIcon />
            <span className="hidden sm:inline">練習紀錄</span>
          </Link>
        </div>
      </header>

      {/* 對話 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-8 sm:px-6">
          <div className="mb-8 rounded-2xl border border-dashed border-line-strong px-5 py-4 text-center text-sm text-muted">
            <span className="font-medium text-fg">{scenario?.description ?? conv.title}</span>
            <span className="mx-2 text-faint">·</span>
            試著用完整的句子回答，每句下面都可以按「糾正文法」或「更好完整回答」
          </div>

          <div className="space-y-6">
            {messages.map((m) => {
              const isUser = m.role === "user";
              const canAnalyze = isUser && !m.id.startsWith("temp-");

              if (!isUser) {
                return (
                  <div key={m.id} className="flex animate-pop gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-base">
                      {avatar}
                    </span>
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed shadow-[var(--shadow-soft)]">
                      {m.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className="flex animate-pop flex-col items-end">
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-accent px-4 py-3 text-[15px] leading-relaxed text-accent-fg ${
                      canAnalyze ? "" : "opacity-70"
                    }`}
                  >
                    {m.content}
                  </div>

                  {canAnalyze && (
                    <>
                      <div className="mt-2 flex gap-1.5">
                        {ACTIONS.map((a) => {
                          const k = key(m.id, a.kind);
                          const active = open[k];
                          const done = !!corrections[k];
                          return (
                            <button
                              key={a.kind}
                              onClick={() => runAction(m.id, a.kind)}
                              disabled={loading[k]}
                              aria-expanded={active}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-wait ${
                                active
                                  ? a.activeClass
                                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg"
                              }`}
                            >
                              {loading[k] ? (
                                <span className="size-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                              ) : (
                                <a.Icon />
                              )}
                              {loading[k] ? "分析中…" : a.label}
                              {done && !active && !loading[k] && (
                                <span className="size-1.5 rounded-full bg-current opacity-60" aria-label="已有結果" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {ACTIONS.map((a) => {
                        const k = key(m.id, a.kind);
                        if (actionError[k]) {
                          return (
                            <p
                              key={a.kind}
                              className="mt-2 max-w-[90%] rounded-xl bg-danger-bg px-3 py-2 text-xs text-danger"
                            >
                              {a.label}失敗：{actionError[k]}
                            </p>
                          );
                        }
                        if (!open[k] || !corrections[k]) return null;
                        return (
                          <div key={a.kind} className="mt-3 w-full max-w-[92%] animate-pop sm:max-w-[85%]">
                            <CorrectionCard correction={corrections[k]} />
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}

            {sending && (
              <div className="flex animate-pop gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-base">
                  {avatar}
                </span>
                <div
                  className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-4 text-faint"
                  aria-label="AI 正在輸入"
                >
                  <span className="typing-dot size-1.5 rounded-full bg-current" />
                  <span className="typing-dot size-1.5 rounded-full bg-current" />
                  <span className="typing-dot size-1.5 rounded-full bg-current" />
                </div>
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* 輸入區 */}
      <div className="border-t border-line/70 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
          {error && <p className="mb-2 rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
          <form
            onSubmit={send}
            className="flex items-end gap-2 rounded-[1.4rem] border border-line bg-surface p-1.5 pl-4 shadow-[var(--shadow-soft)] transition focus-within:border-accent-line focus-within:ring-4 focus-within:ring-accent-soft"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="用英文回答…"
              maxLength={1000}
              rows={1}
              autoFocus
              className="max-h-36 flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed outline-none placeholder:text-faint"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="送出"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg text-accent-fg transition hover:bg-accent-hover disabled:bg-surface-2 disabled:text-faint"
            >
              <ArrowUpIcon />
            </button>
          </form>
          <p className="mt-2 hidden text-center text-[11px] text-faint sm:block">
            Enter 送出 · Shift + Enter 換行 · 已回答 {userTurns} 句
          </p>
        </div>
      </div>
    </div>
  );
}
