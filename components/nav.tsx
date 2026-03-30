"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "今日工作台" },
  { href: "/content", label: "内容引擎" },
  { href: "/chat", label: "沟通助手" },
  { href: "/leads", label: "线索管理" },
  { href: "/metrics", label: "数据看板" }
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 overflow-x-auto">
      <ul className="flex min-w-max gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "inline-flex rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

