import { SiteHeader } from "@/components/SiteHeader";
import { History } from "./History";

export default function HistoryPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <History />
      </main>
    </>
  );
}
