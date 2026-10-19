import { Suspense } from "react";
import { UnloopApp } from "../components/UnloopApp";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-zinc-500 text-sm">
          Loading Unloop...
        </div>
      }
    >
      <UnloopApp />
    </Suspense>
  );
}
