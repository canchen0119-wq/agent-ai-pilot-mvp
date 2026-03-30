import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { ToastProvider } from "@/components/toast";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Agent AI-Pilot (MVP 1.0)",
  description: "保险经纪人的单人版每日助手"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ToastProvider>
          <main className="app-shell">
            <header className="mb-4">
              <h1 className="text-2xl font-semibold text-brand-900">Agent AI-Pilot (MVP 1.0)</h1>
              <p className="text-sm text-slate-600">每天只看这一个系统，知道该发什么、回谁、跟进谁。</p>
            </header>
            <Nav />
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
