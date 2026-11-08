"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, LogoMark, PenIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import { api } from "@/lib/api-client";

// 只允許站內路徑，避免 ?next=https://壞網站 這種開放式轉址
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/practice";
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-accent-line focus:ring-4 focus:ring-accent-soft";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(isRegister ? { email, password, name } : { email, password }),
      });
      // 整頁跳轉，讓 proxy 和各頁面都拿到新的登入狀態
      window.location.href = next;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  const otherHref = `${isRegister ? "/login" : "/register"}${
    next !== "/practice" ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      {/* 左：品牌面板（大螢幕才顯示） */}
      <aside className="relative hidden overflow-hidden bg-fg text-bg lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-32 -top-32 size-[480px] rounded-full bg-accent/40 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <LogoMark inverted />
          <span className="font-semibold tracking-tight">AI 英文家教</span>
        </Link>

        <div className="relative max-w-md">
          <p className="font-display text-5xl leading-[1.1] italic">&ldquo;I go to school yesterday.&rdquo;</p>
          <div className="mt-6 rounded-2xl border border-bg/15 bg-bg/5 p-5 backdrop-blur">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-60">
              <PenIcon /> 文法糾正
            </p>
            <p className="mt-2 text-lg">
              I <span className="underline decoration-accent decoration-2 underline-offset-4">went</span> to school
              yesterday.
            </p>
            <p className="mt-1 text-sm opacity-60">yesterday 是過去時間，動詞要用過去式。</p>
          </div>
          <p className="mt-8 opacity-60">每一句都知道怎麼講得更好。</p>
        </div>

        <p className="relative text-sm opacity-40">© 2026 AI 英文家教</p>
      </aside>

      {/* 右：表單 */}
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 lg:invisible">
            <LogoMark />
            <span className="font-semibold tracking-tight">AI 英文家教</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm animate-rise">
            <h1 className="text-3xl font-semibold tracking-tight">{isRegister ? "建立你的帳號" : "歡迎回來"}</h1>
            <p className="mt-2 text-muted">
              {isRegister ? "30 秒完成註冊，馬上開始第一場英文對話。" : "登入後繼續你的英文練習。"}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {isRegister && (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">暱稱</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={30}
                    autoComplete="nickname"
                    placeholder="想讓 AI 怎麼稱呼你"
                    className={inputClass}
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
                  密碼
                  {isRegister && <span className="text-xs font-normal text-faint">至少 8 個字元</span>}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isRegister ? 8 : undefined}
                  maxLength={72}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className={inputClass}
                />
              </label>

              {error && (
                <p className="rounded-xl border border-danger/25 bg-danger-bg px-4 py-3 text-sm text-danger">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-accent-fg transition hover:bg-accent-hover disabled:opacity-60"
              >
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    {isRegister ? "註冊並開始練習" : "登入"}
                    <ArrowRightIcon className="transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              {isRegister ? "已經有帳號了？" : "還沒有帳號？"}
              <Link href={otherHref} className="ml-1 font-medium text-accent hover:underline">
                {isRegister ? "登入" : "免費註冊"}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
