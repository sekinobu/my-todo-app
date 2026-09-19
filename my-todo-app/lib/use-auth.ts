"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type User = {
  id: string;
  name: string;
  email: string;
};

const CURRENT_USER_KEY = "todo-app:current-user-id";

export function useAuth() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data, error } = await supabase
        .from("app_users")
        .select("id, name, email")
        .order("created_at", { ascending: true });
      if (error) {
        console.error(error);
      } else if (data) {
        setUsers(data);
      }
      try {
        setCurrentUserId(window.localStorage.getItem(CURRENT_USER_KEY));
      } catch {
        // ignore unavailable storage
      }
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (currentUserId) {
        window.localStorage.setItem(CURRENT_USER_KEY, currentUserId);
      } else {
        window.localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch {
      // ignore unavailable storage
    }
  }, [currentUserId, loaded]);

  function login(userId: string) {
    setCurrentUserId(userId);
  }

  function logout() {
    setCurrentUserId(null);
  }

  async function signUp(name: string, email: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("app_users")
      .insert({ name, email })
      .select("id, name, email")
      .single();
    if (error || !data) {
      console.error(error);
      return;
    }
    setUsers((prev) => [...prev, data]);
    setCurrentUserId(data.id);
  }

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;

  return { users, currentUser, loaded, login, logout, signUp };
}
