import { SiteHeader } from "@/components/SiteHeader";
import { ScenarioPicker } from "./ScenarioPicker";

export default function PracticeHome() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <header className="mb-10 max-w-2xl animate-rise">
          <p className="text-sm font-medium text-accent">New session</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            今天想練哪一種<span className="font-display text-[1.15em] font-normal italic"> conversation</span>？
          </h1>
          <p className="mt-3 text-muted">選好程度和場景，AI 會扮演對應的角色，先開口問你第一個問題。</p>
        </header>
        <ScenarioPicker />
      </main>
    </>
  );
}
