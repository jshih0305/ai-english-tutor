import Link from "next/link";
import {
  ArrowRightIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  LogoMark,
  PenIcon,
  SparkleIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SCENARIOS } from "@/lib/scenarios";
import { LandingNav } from "./LandingNav";

export default function Landing() {
  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Scenarios />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grain pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted shadow-[var(--shadow-soft)]">
            <span className="size-1.5 rounded-full bg-ok-fg" />
            8 種生活場景 · 即時糾錯
          </p>
          <h1 className="mt-6 text-[1.95rem] font-semibold leading-[1.15] tracking-tight min-[400px]:text-[2.2rem] sm:text-[3.4rem]">
            開口說英文，
            <br />
            <span className="whitespace-nowrap">
              從一場
              <span className="font-display text-[1.12em] font-normal italic text-accent"> real </span>
              對話開始。
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            AI 扮演服務生、面試官、同事或朋友跟你聊天。每說一句都能一鍵
            <span className="text-fg">糾正文法</span>、看
            <span className="text-fg">更完整的說法</span>，練過的每一場都幫你留著。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-accent-fg shadow-[var(--shadow-lift)] transition hover:bg-accent-hover"
            >
              免費註冊，開始練習
              <ArrowRightIcon className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-line-strong px-6 py-3.5 font-medium transition hover:bg-surface"
            >
              我已經有帳號
            </Link>
          </div>
          <p className="mt-5 text-sm text-faint">不用下載、不用信用卡，打開瀏覽器就能練。</p>
        </div>

        <HeroDemo />
      </div>
    </section>
  );
}

// 產品畫面示意（靜態）
function HeroDemo() {
  return (
    <div className="relative animate-rise [animation-delay:120ms]">
      <div className="absolute -inset-4 -z-10 rotate-2 rounded-[2rem] border border-line bg-surface-2/60" />
      <div className="overflow-hidden rounded-[1.6rem] border border-line bg-surface shadow-[var(--shadow-lift)]">
        <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-lg">🍽️</span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">點餐</p>
            <p className="text-xs text-faint">服務生 Mia · 初級</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-ok-fg">
            <span className="size-1.5 rounded-full bg-ok-fg" />
            練習中
          </span>
        </div>

        <div className="space-y-4 px-5 py-6">
          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-surface-2 px-4 py-2.5 text-[15px] leading-relaxed">
            Hi there! Welcome in. What can I get started for you today?
          </div>

          <div className="flex flex-col items-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-accent-fg">
              I want a hamburger and coke, and no onion please.
            </div>
            <div className="mt-2 flex gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-warn-line bg-warn-bg px-2.5 py-1 text-[11px] font-medium text-warn-fg">
                <PenIcon /> 糾正文法
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
                <SparkleIcon /> 更好完整回答
              </span>
            </div>
          </div>

          <div className="ml-auto max-w-[92%] rounded-2xl border border-warn-line bg-warn-bg p-4 text-sm">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-warn-fg">
              <PenIcon /> 文法糾正
            </p>
            <p className="mt-2 text-[15px] font-medium">
              I&apos;d like a hamburger and a Coke, with no onions, please.
            </p>
            <div className="mt-3 space-y-1.5 border-t border-warn-line pt-3 text-[13px]">
              <p>
                <span className="text-danger line-through decoration-danger/50">a coke</span>
                <span className="mx-1.5 text-faint">→</span>
                <span className="font-medium text-ok-fg">a Coke</span>
                <span className="ml-2 text-muted">可數名詞要加冠詞</span>
              </p>
              <p>
                <span className="text-danger line-through decoration-danger/50">no onion</span>
                <span className="mx-1.5 text-faint">→</span>
                <span className="font-medium text-ok-fg">no onions</span>
                <span className="ml-2 text-muted">泛指要用複數</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-1 text-faint">
            <span className="typing-dot size-1.5 rounded-full bg-current" />
            <span className="typing-dot size-1.5 rounded-full bg-current" />
            <span className="typing-dot size-1.5 rounded-full bg-current" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- How it works ---------------- */

const STEPS = [
  {
    n: "01",
    title: "選一個場景",
    body: "點餐、面試、機場、會議…挑你最常遇到的情境，再選初級、中級或高級。",
  },
  {
    n: "02",
    title: "AI 先開口，你來回答",
    body: "AI 會用角色的口吻問你問題，你用英文打字回答，就像真的在對話。",
  },
  {
    n: "03",
    title: "一鍵糾錯，下次講更好",
    body: "每一句都能看文法哪裡錯、為什麼錯，以及母語者會怎麼更完整地說。",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <SectionHeading eyebrow="How it works" title="三個步驟，把英文練成反射" />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-surface p-8">
              <span className="font-display text-5xl italic text-faint">{s.n}</span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Features ---------------- */

function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-surface-2/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <SectionHeading eyebrow="Features" title="不只陪你聊，還告訴你怎麼講更好" />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <FeatureCard
            icon={<PenIcon />}
            tone="warn"
            title="糾正文法"
            body="抓出時態、冠詞、單複數等錯誤，逐一標出錯在哪、改成什麼，附上中文解釋。"
          >
            <p className="text-sm">
              <span className="text-danger line-through decoration-danger/50">I go</span>
              <span className="mx-1.5 text-faint">→</span>
              <span className="font-medium text-ok-fg">I went</span>
            </p>
            <p className="mt-1 text-xs text-muted">yesterday 是過去時間，動詞要用過去式</p>
          </FeatureCard>

          <FeatureCard
            icon={<SparkleIcon />}
            tone="tip"
            title="更好的完整回答"
            body="保留你的意思，改寫成更自然、更完整的說法，還有兩種替代講法可以學。"
          >
            <p className="text-sm leading-relaxed">
              &ldquo;I&apos;ve been working at a software company for three years, where I&apos;m responsible for…&rdquo;
            </p>
          </FeatureCard>

          <FeatureCard
            icon={<ClockIcon />}
            tone="accent"
            title="練習紀錄"
            body="每一場對話、每一筆糾錯都存在你的帳號，隨時回來複習，只有你看得到。"
          >
            <div className="space-y-1.5 text-sm">
              <p className="flex justify-between">
                <span>💼 面試</span>
                <span className="text-faint">12 則 · 4 筆糾錯</span>
              </p>
              <p className="flex justify-between">
                <span>✈️ 機場</span>
                <span className="text-faint">8 則 · 2 筆糾錯</span>
              </p>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

const TONES = {
  warn: "bg-warn-bg text-warn-fg border-warn-line",
  tip: "bg-tip-bg text-tip-fg border-tip-line",
  accent: "bg-accent-soft text-accent border-accent-line",
};

function FeatureCard({
  icon,
  tone,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-3xl border border-line bg-surface p-7 shadow-[var(--shadow-soft)]">
      <span className={`flex size-11 items-center justify-center rounded-2xl border text-xl ${TONES[tone]}`}>
        {icon}
      </span>
      <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 flex-1 leading-relaxed text-muted">{body}</p>
      <div className="mt-6 rounded-2xl border border-line bg-bg p-4">{children}</div>
    </div>
  );
}

/* ---------------- Scenarios ---------------- */

function Scenarios() {
  return (
    <section id="scenarios" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <SectionHeading eyebrow="Scenarios" title="8 種場景，對應你真正會遇到的時刻" />
        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
          {SCENARIOS.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              <span className="text-3xl">{s.emoji}</span>
              <p className="mt-4 font-semibold">{s.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.description}</p>
              <p className="mt-3 text-xs text-faint">{s.character}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA & footer ---------------- */

function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-fg px-6 py-16 text-center text-bg sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[700px] -translate-x-1/2 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative">
          <ChatIcon className="mx-auto text-3xl opacity-60" />
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            下一句英文，
            <span className="font-display font-normal italic"> say it better.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg opacity-70">註冊只要 30 秒。今天就從一場五分鐘的對話開始。</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-bg px-7 py-3.5 font-medium text-fg transition hover:opacity-90"
            >
              免費註冊
              <ArrowRightIcon className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm opacity-70">
            {["8 種生活場景", "文法即時糾正", "練習紀錄完整保存"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckIcon /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-faint sm:flex-row sm:px-6">
        <span className="flex items-center gap-2">
          <LogoMark className="size-6 text-[15px]" />
          AI 英文家教
        </span>
        <span className="sm:ml-auto">© {2026} AI 英文家教</span>
        <ThemeToggle />
      </div>
    </footer>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-display text-lg italic text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
