"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/metric-card";

type Metrics = {
  leadCount: number;
  replyRate: number;
  bookedCount: number;
  complianceRate: number;
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/metrics");
        const json = (await res.json()) as Metrics;
        setMetrics(json);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !metrics) {
    return <div className="panel">加载中...</div>;
  }

  return (
    <section className="grid gap-3 md:grid-cols-4">
      <MetricCard label="线索量" value={metrics.leadCount} />
      <MetricCard label="回复率" value={`${metrics.replyRate}%`} />
      <MetricCard label="预约数" value={metrics.bookedCount} />
      <MetricCard label="合规达标率" value={`${metrics.complianceRate}%`} />
    </section>
  );
}

