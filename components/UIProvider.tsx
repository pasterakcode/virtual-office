"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PanelType = "slackUsers" | "admin" | null;

const UIContext = createContext<{
  activePanel: PanelType;
  openPanel: (p: PanelType) => void;
  closePanel: () => void;
}>({
  activePanel: null,
  openPanel: () => {},
  closePanel: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  return (
    <UIContext.Provider
      value={{
        activePanel,
        openPanel: setActivePanel,
        closePanel: () => setActivePanel(null),
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
