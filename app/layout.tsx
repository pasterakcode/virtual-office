"use client";

import { AuthProvider, useAuth } from '../components/AuthProvider';
import { UIProvider } from '../components/UIProvider';
import SidePanel from "../components/SidePanel";
import { useUI } from "../components/UIProvider";

function WorkspaceDisplay() {
  const { workspace } = useAuth();
  const { openPanel } = useUI();

  if (!workspace || !workspace.team_name) return null;

  return (
    <div
      onClick={() => openPanel("slackUsers")}
      style={{
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
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
      }}
      title="Open workspace users"
    >
      🏢 {workspace.team_name}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider>
            <WorkspaceDisplay />
            {children}
            {/* tu później podpinamy SidePanel */}
              <SidePanel />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
