import React, { createContext, useContext } from "react";

const PortalContext = createContext<HTMLElement | null>(null);

export const PortalProvider: React.FC<{ container: HTMLElement; children: React.ReactNode }> = ({
  container,
  children,
}) => {
  return <PortalContext.Provider value={container}>{children}</PortalContext.Provider>;
};

export const usePortalContainer = () => {
  return useContext(PortalContext);
};