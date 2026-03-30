"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TaskCard } from "@/components/task-card";
import { useToast } from "@/components/toast";

type Task = {
  id: string;
  type: "CONTENT" | "REPLY" | "FOLLOW_UP";
  title: string;
  completed: boolean;
};

type DashboardResponse = {
  summary: {
    contentCount: number;
    replyCount: number;
    followUpCount: number;
    totalTasks: number;
    completedTasks: number;
    executionRate: number;
  };
  tasks: Task[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = (await res.json()) as DashboardResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function completeTask(id: string) {
    const prev = data;
    if (!prev) return;
    setData({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === id ? { ...task, completed: true } : task))
    });
    await fetch(`/api/tasks/${id}/complete`, { method: "POST" });
    showToast("任务已标记完成");
    await fetchDashboard();
  }

  if (loading || !data) {
    return <div className="panel">加载中...</div>;
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="panel">
          <p className="text-sm text-slate-500">今日内容</p>
          <p className="mt-1 text-2xl font-semibold">{data.summary.contentCount} 条</p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-500">今日待回</p>
          <p className="mt-1 text-2xl font-semibold">{data.summary.replyCount} 人</p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-500">今日跟进</p>
          <p className="mt-1 text-2xl font-semibold">{data.summary.followUpCount} 人</p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-500">今日执行率</p>
          <p className="mt-1 text-2xl font-semibold text-brand-700">{data.summary.executionRate}%</p>
        </div>
      </div>

      <div className="panel space-y-3">
        <h2 className="text-lg font-semibold">今日任务清单</h2>
        {data.tasks.length === 0 ? (
          <p className="text-sm text-slate-500">今天没有待办任务，做得很棒。</p>
        ) : (
          data.tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              type={task.type}
              title={task.title}
              completed={task.completed}
              onComplete={completeTask}
            />
          ))
        )}
      </div>

      <div className="panel">
        <h2 className="mb-3 text-lg font-semibold">快捷入口</h2>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-md bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700" href="/content">
            去生成内容
          </Link>
          <Link className="rounded-md bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700" href="/chat">
            去沟通助手
          </Link>
          <Link className="rounded-md bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700" href="/leads">
            去线索管理
          </Link>
          <Link className="rounded-md bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700" href="/metrics">
            去看数据
          </Link>
        </div>
      </div>
    </section>
  );
}

