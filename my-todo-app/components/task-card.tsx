"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Comment = {
  id: string;
  authorName: string;
  text: string;
};

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
  comments: Comment[];
};

export function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onToggle,
  onRemove,
  onAddComment,
}: {
  task: Task;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onToggle: () => void;
  onRemove: () => void;
  onAddComment: (text: string) => void;
}) {
  const [commentInput, setCommentInput] = useState("");

  function submitComment() {
    if (!commentInput.trim()) return;
    onAddComment(commentInput);
    setCommentInput("");
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "group flex flex-col gap-2.5 rounded-lg border bg-card px-3 py-2.5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all",
        task.completed && "bg-muted/50 border-muted",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggle}
          aria-label={task.completed ? "未完了に戻す" : "完了にする"}
        />
        <span
          className={cn(
            "flex-1 text-sm break-all",
            task.completed && "line-through text-muted-foreground",
          )}
        >
          {task.text}
        </span>
        <button
          onClick={onRemove}
          aria-label="削除"
          className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 border-t pt-2">
        {task.comments.length === 0 ? (
          <p className="text-xs text-muted-foreground">コメントはありません</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {task.comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-md bg-muted/60 px-2 py-1.5 text-xs break-all"
              >
                <span className="font-medium">{comment.authorName}</span>
                <span className="text-muted-foreground">
                  {" "}
                  {comment.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div
          className="flex gap-1.5"
          onMouseDown={(e) => e.stopPropagation()}
          draggable={false}
        >
          <Input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitComment();
            }}
            placeholder="コメントを追加..."
            aria-label="コメントを追加"
            className="h-7 text-xs"
          />
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={submitComment}
          >
            追加
          </Button>
        </div>
      </div>
    </div>
  );
}
