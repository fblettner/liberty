import { DefaultZIndex, ZIndexContext } from "@ly_components/types/common";
import React, { useRef } from "react";


export const ZIndexProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const currentZIndex = useRef(DefaultZIndex.Modal);
  const activePopups = useRef(0);

  const getNextZIndex = () => {
    activePopups.current += 1;
    currentZIndex.current += 2;
    return currentZIndex.current;
  };

  const resetZIndex = () => {
    if (activePopups.current > 0)
      activePopups.current -= 1;
    if (activePopups.current === 0) {
      currentZIndex.current = DefaultZIndex.Modal;
    }
  };

  return (
    <ZIndexContext.Provider value={{ getNextZIndex, resetZIndex }}>
      {children}
    </ZIndexContext.Provider>
  );
};
