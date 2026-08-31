"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AdminSessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  status?: string | null;
  avatar?: string | null;
};

type AdminSessionContextValue = {
  user: AdminSessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function AdminSessionProvider({
  children,
  skip = false,
  initialUser = null,
}: {
  children: React.ReactNode;
  skip?: boolean;
  initialUser?: AdminSessionUser | null;
}) {
  const [user, setUser] = useState<AdminSessionUser | null>(initialUser);
  const [loading, setLoading] = useState(!skip && !initialUser);

  const refresh = useCallback(async () => {
    if (skip) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const json = await response.json().catch(() => null);
      if (!json || typeof json !== "object") {
        setUser(null);
        return;
      }
      setUser({
        id: typeof json.id === "string" ? json.id : "",
        name: typeof json.name === "string" ? json.name : null,
        email: typeof json.email === "string" ? json.email : null,
        role: typeof json.role === "string" ? json.role : null,
        status: typeof json.status === "string" ? json.status : null,
        avatar: typeof json.avatar === "string" ? json.avatar : null,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    if (skip) {
      setUser(null);
      setLoading(false);
      return;
    }
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
      return;
    }
    void refresh();
  }, [initialUser, refresh, skip]);

  const value = useMemo<AdminSessionContextValue>(
    () => ({
      user,
      loading,
      refresh,
    }),
    [loading, refresh, user]
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return context;
}
