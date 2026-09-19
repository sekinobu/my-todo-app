"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard, type Task } from "@/components/task-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    key: "todo",
    completed: false,
    title: "未完了",
    accent: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  },
  {
    key: "done",
    completed: true,
    title: "完了済み",
    accent: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
] as const;

type TaskRow = {
  id: string;
  text: string;
  completed: boolean;
  user_id: string;
  comments: { id: string; author_name: string; text: string }[] | null;
};

export function TodoList({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoaded(false);
    setTasks([]);
    const supabase = createClient();
    async function load() {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, text, completed, user_id, comments(id, author_name, text)")
        .eq("user_id", userId)
        .order("position", { ascending: true })
        .order("created_at", { foreignTable: "comments", ascending: true });
      if (error) {
        console.error(error);
      } else if (data) {
        setTasks(
          (data as TaskRow[]).map((row) => ({
            id: row.id,
            text: row.text,
            completed: row.completed,
            userId: row.user_id,
            comments: (row.comments ?? []).map((c) => ({
              id: c.id,
              authorName: c.author_name,
              text: c.text,
            })),
          })),
        );
      }
      setLoaded(true);
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!loaded) return;
    const supabase = createClient();
    const rows = COLUMNS.flatMap((column) =>
      tasks
        .filter((task) => task.completed === column.completed)
        .map((task, index) => ({
          id: task.id,
          user_id: task.userId,
          text: task.text,
          completed: task.completed,
          position: index,
        })),
    );
    if (rows.length === 0) return;
    supabase
      .from("tasks")
      .upsert(rows, { onConflict: "id" })
      .then(({ error }) => {
        if (error) console.error(error);
      });
  }, [tasks, loaded]);

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false, userId, comments: [] },
    ]);
    setInput("");
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    const supabase = createClient();
    supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error(error);
      });
  }

  function addComment(taskId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const commentId = crypto.randomUUID();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              comments: [
                ...task.comments,
                { id: commentId, authorName: userName, text: trimmed },
              ],
            }
          : task,
      ),
    );
    const supabase = createClient();
    supabase
      .from("comments")
      .insert({
        id: commentId,
        task_id: taskId,
        author_name: userName,
        text: trimmed,
      })
      .then(({ error }) => {
        if (error) console.error(error);
      });
  }

  function moveTask(
    draggedId: string,
    targetCompleted: boolean,
    targetTaskId?: string,
  ) {
    if (!draggedId || draggedId === targetTaskId) return;
    setTasks((prev) => {
      const draggedTask = prev.find((task) => task.id === draggedId);
      if (!draggedTask) return prev;
      const rest = prev.filter((task) => task.id !== draggedId);
      const updatedTask = { ...draggedTask, completed: targetCompleted };
      if (targetTaskId) {
        const targetIndex = rest.findIndex(
          (task) => task.id === targetTaskId,
        );
        rest.splice(targetIndex, 0, updatedTask);
        return rest;
      }
      return [...rest, updatedTask];
    });
  }

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
          placeholder="新しいタスクを入力..."
          aria-label="新しいタスク"
        />
        <Button onClick={addTask}>追加</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter(
            (task) =>
              task.userId === userId && task.completed === column.completed,
          );
          return (
            <div
              key={column.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(column.completed);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData("text/plain");
                moveTask(draggedId, column.completed);
                setDragOverColumn(null);
              }}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 transition-colors min-h-[200px]",
                dragOverColumn === column.completed &&
                  "bg-muted/60 border-primary/40",
              )}
            >
              <div className="flex items-center gap-2 px-1">
                <span className={cn("h-2.5 w-2.5 rounded-full", column.accent)} />
                <h2 className="font-semibold text-sm">{column.title}</h2>
                <span
                  className={cn(
                    "ml-auto text-xs font-medium rounded-full px-2 py-0.5",
                    column.badge,
                  )}
                >
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {!loaded ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    読み込み中...
                  </p>
                ) : columnTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    タスクはありません
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isDragging={draggingId === task.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", task.id);
                        setDraggingId(task.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverColumn(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverColumn(column.completed);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const draggedId = e.dataTransfer.getData(
                          "text/plain",
                        );
                        moveTask(draggedId, column.completed, task.id);
                        setDragOverColumn(null);
                      }}
                      onToggle={() => toggleTask(task.id)}
                      onRemove={() => removeTask(task.id)}
                      onAddComment={(text) => addComment(task.id, text)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
