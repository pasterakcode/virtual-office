"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email?: string;
}

interface Workspace {
  team_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  workspace: Workspace | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  workspace: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. POBIERZ SESJĘ SUPABASE (JEDYNE ŹRÓDŁO PRAWDY)
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2. NASŁUCHUJ ZMIAN AUTH (LOGIN / LOGOUT)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. WORKSPACE – fetchujemy DOPIERO gdy user istnieje
  useEffect(() => {
    if (!user) {
      setWorkspace(null);
      return;
    }

    fetch("/api/slack/workspace")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setWorkspace(data ? { team_name: data.team_name } : null);
      })
      .catch(() => setWorkspace(null));
  }, [user]);

  // Added console log for user and loading state
  console.log("[AuthProvider] user:", user);
  console.log("[AuthProvider] loading:", loading);

  return (
    <AuthContext.Provider value={{ user, loading, workspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
