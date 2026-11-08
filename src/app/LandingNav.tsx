"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";

// 介紹頁導覽列：已登入的人看到「進入練習」，沒登入看到登入 / 註冊
export function LandingNav() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setLoggedIn(r.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-semibold tracking-tight">AI 英文家教</span>
        </Link>

        <nav className="ml-8 hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#how" className="transition hover:text-fg">
            怎麼練
          </a>
          <a href="#features" className="transition hover:text-fg">
            功能
          </a>
          <a href="#scenarios" className="transition hover:text-fg">
            場景
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          {loggedIn ? (
            <Link
              href="/practice"
              className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition hover:opacity-90"
            >
              進入練習
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm text-muted transition hover:text-fg">
                登入
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition hover:opacity-90"
              >
                免費註冊
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
