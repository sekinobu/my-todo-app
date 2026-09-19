"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { TodoList } from "@/components/todo-list";
import { LoginScreen } from "@/components/auth/login-screen";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

export default function Home() {
  const { users, currentUser, loaded, login, logout, signUp } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center gap-8 p-4 sm:p-6 pt-10 sm:pt-16">
        {!loaded ? null : !currentUser ? (
          <>
            <h1 className="text-2xl font-bold">Todo App</h1>
            <LoginScreen users={users} onLogin={login} onSignUp={signUp} />
          </>
        ) : (
          <>
            <div className="w-full max-w-4xl flex items-center justify-between">
              <h1 className="text-lg font-semibold">
                ようこそ、{currentUser.name}さん
              </h1>
              <Button variant="outline" size="sm" onClick={logout}>
                ログアウト
              </Button>
            </div>
            <TodoList userId={currentUser.id} userName={currentUser.name} />
          </>
        )}
      </div>
      <footer className="w-full flex items-center justify-center border-t py-6">
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
