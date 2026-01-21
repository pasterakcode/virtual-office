// Modify AuthProvider to also fetch workspace info from Supabase and provide it in context alongside user
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email?: string;
  // add other user properties if needed
}

interface Workspace {
  team_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  workspace: Workspace | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, workspace: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    async function fetchUserAndWorkspace() {
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          const json = await res.json();
          setUser(json.user ?? null);
          // Also fetch workspace info from supabase
          const wsRes = await fetch('/api/slack/workspace');
          if (wsRes.ok) {
            const wsJson = await wsRes.json();
            setWorkspace({ team_name: wsJson.team_name });
          } else {
            setWorkspace(null);
          }
        } else {
          setUser(null);
          setWorkspace(null);
        }
      } catch {
        setUser(null);
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndWorkspace();
  }, []);

  return <AuthContext.Provider value={{ user, loading, workspace }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
