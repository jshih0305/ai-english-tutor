"use client";

import { useSyncExternalStore } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";
import { THEME_EVENT, readThemePref, setThemePref, type ThemePref } from "@/lib/theme";

function subscribe(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb); // 其他分頁改了也同步
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const OPTIONS: { value: ThemePref; label: string; Icon: typeof SunIcon }[] = [
  { value: "light", label: "淺色", Icon: SunIcon },
  { value: "system", label: "跟隨系統", Icon: MonitorIcon },
  { value: "dark", label: "深色", Icon: MoonIcon },
];

export function ThemeToggle({ className = "" }: { className?: string }) {
  const pref = useSyncExternalStore(subscribe, readThemePref, () => "system" as ThemePref);

  return (
    <div
      role="radiogroup"
      aria-label="顯示主題"
      className={`inline-flex items-center rounded-full border border-line bg-surface p-0.5 ${className}`}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = pref === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setThemePref(value)}
            className={`flex size-7 items-center justify-center rounded-full text-[15px] transition ${
              active ? "bg-surface-2 text-fg shadow-[var(--shadow-soft)]" : "text-faint hover:text-fg"
            }`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
