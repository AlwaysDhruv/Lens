import React, { createContext, useContext, useState } from "react";

const SellerLayoutContext = createContext();

export function SellerLayoutProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  return (
    <SellerLayoutContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, toggleSidebar }}>
      {children}
    </SellerLayoutContext.Provider>
  );
}

export const useSellerLayout = () => useContext(SellerLayoutContext);
