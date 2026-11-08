"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { api } from "@/lib/api-client";
import { SCENARIOS } from "@/lib/scenarios";

const LEVELS = [
  { id: "beginner", label: "初級", hint: "簡單句、慢慢來" },
  { id: "intermediate", label: "中級", hint: "日常對話流暢度" },
  { id: "advanced", label: "高級", hint: "道地用語與細節" },
];

export function ScenarioPicker() {
  const router = useRouter();
  const [level, setLevel] = useState("intermediate");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function start(scenarioId: string) {
    setLoadingId(scenarioId);
    setError("");
    try {
      const data = await api<{ id: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ scenario: scenarioId, level }),
      });
      router.push(`/practice/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setLoadingId(null);
    }
  }

  const busy = loadingId !== null;

  return (
    <div>
      {/* 程度 */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-muted">你的程度</p>
        <div className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-line bg-surface p-1 sm:w-auto">
          {LEVELS.map((l) => {
            const active = level === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                disabled={busy}
                className={`rounded-xl px-4 py-2 text-left transition sm:min-w-32 ${
                  active ? "bg-fg text-bg" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <span className="block text-sm font-semibold">{l.label}</span>
                <span className={`hidden text-[11px] sm:block ${active ? "opacity-70" : "text-faint"}`}>{l.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {/* 場景 */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SCENARIOS.map((s, i) => {
          const loading = loadingId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => start(s.id)}
              disabled={busy}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`group relative flex animate-rise flex-col rounded-2xl border bg-surface p-5 text-left shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)] disabled:cursor-default disabled:hover:translate-y-0 ${
                loading ? "border-accent ring-4 ring-accent-soft" : "border-line"
              } ${busy && !loading ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-2xl transition group-hover:scale-105">
                  {s.emoji}
                </span>
                <span
                  className={`flex size-8 items-center justify-center rounded-full text-sm transition ${
                    loading
                      ? "bg-accent text-accent-fg"
                      : "text-faint group-hover:bg-fg group-hover:text-bg"
                  }`}
                >
                  {loading ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <ArrowRightIcon />
                  )}
                </span>
              </div>
              <span className="mt-5 text-lg font-semibold tracking-tight">{s.label}</span>
              <span className="mt-1 text-sm leading-relaxed text-muted">{s.description}</span>
              <span className="mt-4 border-t border-line pt-3 text-xs text-faint">
                {loading ? "AI 正在準備開場…" : `對話角色 · ${s.character}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
