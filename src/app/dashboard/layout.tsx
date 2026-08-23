import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <span className="w-7 h-7 rounded-xl bg-zinc-900 flex items-center justify-center"><Dumbbell className="w-3.5 h-3.5 text-lime-400" /></span>
              TrainerBoard
              <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse hidden sm:inline-block" />
            </Link>
            <nav className="hidden sm:flex gap-1 text-sm">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-full bg-zinc-900 text-white font-medium">Dashboard</Link>
              <span className="px-3 py-1.5 text-zinc-400">Clients • Workouts • Today</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-zinc-500">Free: 3 clients • <Link href="/#pricing" className="underline font-medium">Upgrade $19</Link></span>
            <Link href="/" className="text-sm border px-4 py-1.5 rounded-full hover:bg-zinc-50 font-medium">Home</Link>
          </div>
        </div>
      </header>
      <div className="flex-1 bg-zinc-50">{children}</div>
    </div>
  );
}
