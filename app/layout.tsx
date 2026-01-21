"use client";

import { AuthProvider, useAuth } from '../components/AuthProvider';

function WorkspaceDisplay() {
  const { workspace } = useAuth();

  if (!workspace || !workspace.team_name) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 12,
      right: 12,
      backgroundColor: '#4A154B',
      color: 'white',
      padding: '6px 12px',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: '600',
      zIndex: 9999,
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    }}>
      {workspace.team_name}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WorkspaceDisplay />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
