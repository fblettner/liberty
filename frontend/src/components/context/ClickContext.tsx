import React, { createContext, useContext, useRef } from "react";

interface ClickContextProps {
    addIgnoreElement: (element: HTMLElement) => void;
    removeIgnoreElement: (element: HTMLElement) => void;
    isClickInsideIgnored: (target: HTMLElement | null) => boolean; // Expose this method
}

const ClickContext = createContext<ClickContextProps | null>(null);

export const ClickProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ignoreElements = useRef<Set<HTMLElement>>(new Set());

    const addIgnoreElement = (element: HTMLElement) => {
        ignoreElements.current.add(element);
    };

    const removeIgnoreElement = (element: HTMLElement) => {
        ignoreElements.current.delete(element);
    };

    const isClickInsideIgnored = (target: HTMLElement | null): boolean => {
        console.log(ignoreElements.current);
        for (const element of ignoreElements.current) {
            if (element.contains(target)) {
                return true;
            }
        }
        return false;
    };

    return (
        <ClickContext.Provider value={{ addIgnoreElement, removeIgnoreElement, isClickInsideIgnored }}>
            {children}
        </ClickContext.Provider>
    );
};

export const useClickContext = () => {
    const context = useContext(ClickContext);
    if (!context) {
        throw new Error("useClickContext must be used within a ClickProvider");
    }
    return context;
};