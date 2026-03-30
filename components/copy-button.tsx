"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

export function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  return (
    <button
      className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 disabled:opacity-50"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await navigator.clipboard.writeText(text);
          showToast("复制成功");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "复制中..." : label}
    </button>
  );
}

