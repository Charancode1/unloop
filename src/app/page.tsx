import { Suspense } from "react";
import { UnloopApp } from "../components/UnloopApp";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] text-slate-500 dark:bg-[#090a0f] dark:text-zinc-500 flex items-center justify-center text-sm">
          Loading Unloop...
        </div>
      }
    >
      <UnloopApp />
    </Suspense>
  );
}
