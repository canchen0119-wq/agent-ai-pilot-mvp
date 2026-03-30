"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

type ChatResult = {
  reply: string;
  compliance: {
    passed: boolean;
    flags: string[];
    disclaimerAdded: boolean;
  };
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"soft" | "push">("soft");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResult | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!message.trim()) {
      setError("请先粘贴客户原话");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerMessage: message, mode })
      });
      const data = (await res.json()) as ChatResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="panel space-y-3">
        <h2 className="text-lg font-semibold">AI 沟通助手</h2>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">客户原话</span>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-600"
            placeholder="把客户原话粘贴在这里..."
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">模式选择</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "soft" | "push")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-600 md:w-56"
          >
            <option value="soft">温和模式</option>
            <option value="push">推进模式</option>
          </select>
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-60"
          onClick={generate}
          disabled={loading}
        >
          {loading ? "生成中..." : "生成回复"}
        </button>
      </div>

      <div className="panel space-y-3">
        <h3 className="text-base font-semibold">建议回复</h3>
        {!result ? (
          <p className="text-sm text-slate-500">生成后可直接复制发送给客户。</p>
        ) : (
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-slate-500">输出文案</p>
              <CopyButton text={result.reply} />
            </div>
            <p className="whitespace-pre-wrap text-sm">{result.reply}</p>
          </div>
        )}
      </div>

      <div className="panel">
        <h3 className="mb-2 text-base font-semibold">合规说明</h3>
        {!result ? (
          <p className="text-sm text-slate-500">系统会自动拦截夸大承诺、官方冒充等高风险表达。</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-700">
            <li>{result.compliance.flags.length ? "已自动优化为合规表达" : "本次输出未命中高风险词"}</li>
            <li>{result.compliance.disclaimerAdded ? "已追加免责声明" : "无需追加免责声明"}</li>
          </ul>
        )}
      </div>
    </section>
  );
}

