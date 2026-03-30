import type { TaskType } from "@prisma/client";

const typeLabel: Record<TaskType, string> = {
  CONTENT: "今日内容",
  REPLY: "今日待回",
  FOLLOW_UP: "今日跟进"
};

export function TaskCard({
  id,
  type,
  title,
  completed,
  onComplete
}: {
  id: string;
  type: TaskType;
  title: string;
  completed: boolean;
  onComplete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3">
      <div>
        <p className="text-xs text-slate-500">{typeLabel[type]}</p>
        <p className={`text-sm ${completed ? "text-slate-400 line-through" : "text-slate-800"}`}>{title}</p>
      </div>
      <button
        disabled={completed}
        onClick={() => onComplete(id)}
        className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {completed ? "已完成" : "完成"}
      </button>
    </div>
  );
}

