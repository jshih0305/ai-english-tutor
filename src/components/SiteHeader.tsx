"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import { api } from "@/lib/api-client";

type User = { id: string; email: string; name: string };

const NAV = [
  { href: "/practice", label: "開始練習" },
  { href: "/history", label: "練習紀錄" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api<{ user: User }>("/api/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="mr-2 flex items-center gap-2.5 sm:mr-4">
          <LogoMark />
          <span className="hidden font-semibold tracking-tight sm:inline">AI 英文家教</span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm transition sm:px-3 ${
                  active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          {user && (
            <span className="hidden items-center gap-2 text-sm text-muted md:flex">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[8rem] truncate">{user.name}</span>
            </span>
          )}
          <button
            onClick={logout}
            className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-fg sm:px-3"
          >
            登出
          </button>
        </div>
      </div>
    </header>
  );
}
