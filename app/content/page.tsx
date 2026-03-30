"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

type ContentResult = {
  title: string;
  body: string;
  cta: string;
  compliance: {
    passed: boolean;
    flags: string[];
    disclaimerAdded: boolean;
  };
};

export default function ContentPage() {
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!audience.trim()) {
      setError("请先输入目标客群");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience })
      });
      const data = (await res.json()) as ContentResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="panel space-y-3">
        <h2 className="text-lg font-semibold">AI 内容引擎</h2>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">目标客群</span>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-600"
            placeholder="例如：新移民家庭、有孩子的中产家庭"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <button
            className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-60"
            onClick={generate}
            disabled={loading}
          >
            {loading ? "生成中..." : "生成内容"}
          </button>
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-60"
            onClick={generate}
            disabled={loading || !result}
          >
            {loading ? "重生成中..." : "重新生成"}
          </button>
        </div>
      </div>

      <div className="panel space-y-3">
        <h3 className="text-base font-semibold">生成结果</h3>
        {!result ? (
          <p className="text-sm text-slate-500">输入客群后点击“生成内容”，这里会展示标题、短文案和 CTA。</p>
        ) : (
          <>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">爆款标题建议</p>
                <CopyButton text={result.title} />
              </div>
              <p className="text-sm">{result.title}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">短文案</p>
                <CopyButton text={result.body} />
              </div>
              <p className="text-sm whitespace-pre-wrap">{result.body}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">CTA 行动指令</p>
                <CopyButton text={result.cta} />
              </div>
              <p className="text-sm">{result.cta}</p>
            </div>
          </>
        )}
      </div>

      <div className="panel">
        <h3 className="mb-2 text-base font-semibold">合规提示</h3>
        {!result ? (
          <p className="text-sm text-slate-500">所有输出均会先经过后端合规过滤器。</p>
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

