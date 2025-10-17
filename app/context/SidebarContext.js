"use client";

import { createContext, useState, useContext } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMini, setSidebarMini] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMini = () => setSidebarMini(!sidebarMini);

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        sidebarMini,
        toggleSidebar,
        toggleMini,
        closeSidebar: () => setSidebarOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
