"use client";

import React from "react";
import AdminPanel from "./AdminPanel";
import { useAuth } from "./AuthProvider";

export default function ClientAdminPanel() {
  const auth = useAuth();

  return <AdminPanel user={auth.user} loading={auth.loading} workspace={auth.workspace} />;
}
