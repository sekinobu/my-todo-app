"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/use-auth";

export function LoginScreen({
  users,
  onLogin,
  onSignUp,
}: {
  users: User[];
  onLogin: (userId: string) => void;
  onSignUp: (name: string, email: string) => void | Promise<void>;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!selectedUserId && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;
    onLogin(selectedUserId);
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSignUp(name.trim(), email.trim());
  }

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold">Todo App</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "login" ? "ログインしてください" : "新規登録"}
        </p>
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-select">ユーザー</Label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={!selectedUserId}>
            ログイン
          </Button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="text-sm text-primary hover:underline"
          >
            新規登録はこちら
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-name">名前</Label>
            <Input
              id="signup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田花子"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-email">メールアドレス</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <Button type="submit">新規登録</Button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="text-sm text-primary hover:underline"
          >
            ログイン画面に戻る
          </button>
        </form>
      )}
    </div>
  );
}
