"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";

type Lead = {
  id: string;
  name: string;
  phone?: string | null;
  source?: string | null;
  stage: "NEW" | "CONTACTED" | "FOLLOWING" | "BOOKED" | "CLOSED";
  createdAt: string;
  lastContactAt?: string | null;
  booked: boolean;
  needsReply: boolean;
  replied: boolean;
  recommendation: string;
  recommendationType: "DAY1" | "DAY3" | "DAY7" | "NONE";
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const json = (await res.json()) as { leads: Lead[] };
      setLeads(json.leads);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  async function createLead() {
    if (!name.trim()) {
      setError("姓名不能为空");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, source })
      });
      setName("");
      setPhone("");
      setSource("");
      showToast("线索已新增");
      await fetchLeads();
    } finally {
      setSaving(false);
    }
  }

  async function updateLead(id: string, patch: Record<string, unknown>) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    await fetchLeads();
  }

  return (
    <section className="space-y-4">
      <div className="panel space-y-3">
        <h2 className="text-lg font-semibold">新增线索</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-600"
            placeholder="姓名（必填）"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-600"
            placeholder="联系方式（可选）"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-600"
            placeholder="来源（可选）"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-60"
          onClick={createLead}
          disabled={saving}
        >
          {saving ? "保存中..." : "新增线索"}
        </button>
      </div>

      <div className="panel">
        <h2 className="mb-3 text-lg font-semibold">线索列表</h2>
        {loading ? (
          <p className="text-sm text-slate-500">加载中...</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-slate-500">暂无线索，先添加一条开始跟进。</p>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-slate-500">
                      {lead.phone || "无联系方式"} | {lead.source || "未标注来源"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                      value={lead.stage}
                      onChange={(e) => updateLead(lead.id, { stage: e.target.value })}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="FOLLOWING">FOLLOWING</option>
                      <option value="BOOKED">BOOKED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                    <button
                      className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                      onClick={() =>
                        updateLead(lead.id, {
                          needsReply: !lead.needsReply,
                          replied: lead.needsReply ? true : lead.replied
                        })
                      }
                    >
                      {lead.needsReply ? "标记已回复" : "标记待回复"}
                    </button>
                    <button
                      className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                      onClick={() => updateLead(lead.id, { booked: !lead.booked })}
                    >
                      {lead.booked ? "取消预约成功" : "标记预约成功"}
                    </button>
                    <button
                      className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                      onClick={() => updateLead(lead.id, { lastContactAt: new Date().toISOString() })}
                    >
                      已跟进
                    </button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-4">
                  <p>当前阶段：{lead.stage}</p>
                  <p>推荐动作：{lead.recommendationType === "NONE" ? "无" : lead.recommendationType}</p>
                  <p>建议文本：{lead.recommendation}</p>
                  <p>最近跟进：{lead.lastContactAt ? new Date(lead.lastContactAt).toLocaleDateString() : "暂无"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

