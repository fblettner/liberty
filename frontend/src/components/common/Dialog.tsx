/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import React, { Fragment, ReactNode, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import ReactDOM from "react-dom";
import { DefaultZIndex } from "@ly_components/types/common";

interface DialogProps {
    open: boolean;
    onClose?: () => void;
    children: ReactNode;
    maxWidth?: string;
    disableBackdropClick?: boolean;
    closeOnEsc?: boolean;
    scroll?: "paper" | "body";
}

// Track the number of opened dialogs to adjust z-index
let dialogCount = 0;

// Dynamic z-index calculation
const getZIndex = () => DefaultZIndex.Dialog + dialogCount * 10;

// Styled Backdrop
const Backdrop = styled.div<{ open: boolean; zIndex: number }>(({ open, zIndex }) => ({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: zIndex,
    display: open ? "block" : "none",
    opacity: open ? 1 : 0,
    transition: "opacity 225ms cubic-bezier(0.4, 0, 0.2, 1)",
}));

// Dialog Container
const DialogContainer = styled.div<{ scroll: "paper" | "body"; zIndex: number }>(({ theme, scroll, zIndex }) => ({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: scroll === "body" ? "flex-start" : "center",
    overflowY: scroll === "body" ? "auto" : "hidden",
    zIndex: zIndex + 1,
    outline: "0",
    padding: scroll === "body" ? "16px" : "0",
    boxSizing: "border-box",

}));

// Dialog Paper
const DialogPaper = styled.div<{ maxWidth: string }>(({ theme, maxWidth }) => ({
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    boxShadow: theme.shadows[5],
    overflow: "hidden",
    maxWidth: maxWidth,
    width: "100%",
    animation: "fadeIn 0.3s ease-in-out",
    "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(-20px)" },
        to: { opacity: 1, transform: "translateY(0)" },
    },
}));

const FocusTrapSentinel = styled.div`
  width: 0;
  height: 0;
  overflow: hidden;
  position: absolute;
`;

const dialogRoot = document.getElementById("dialog-root") || (() => {
    const root = document.createElement("div");
    root.id = "dialog-root";
    document.body.appendChild(root);
    return root;
})();

export function Dialog(props: DialogProps) {
    const { open, onClose, children, maxWidth = "600px", disableBackdropClick, closeOnEsc, scroll = "paper" } = props;
    const dialogRef = useRef<HTMLDivElement>(null);
    const dialogZIndex = useRef<number>(getZIndex());

    // Increment z-index on mount
    useEffect(() => {
        if (open) {
            dialogCount++;
            dialogZIndex.current = getZIndex();
        }
        return () => {
            dialogCount = Math.max(dialogCount - 1, 0);
        };
    }, [open]);

    // Close on ESC key press
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape" && open && closeOnEsc) {
                onClose?.();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [open, closeOnEsc, onClose]);

    useEffect(() => {
        if (open && dialogRef.current) {
            dialogRef.current.focus();
        }
    }, [open]);

    const handleBackdropClick = () => {
        if (!disableBackdropClick) {
            onClose?.();
        }
    };

    return ReactDOM.createPortal(
        <Fragment>
            <Backdrop open={open} onClick={handleBackdropClick} zIndex={dialogZIndex.current} />
            {open && (
                <DialogContainer
                    scroll={scroll}
                    zIndex={dialogZIndex.current + 1}
                    onClick={(e) => e.stopPropagation()}
                    role="presentation"
                >
                    <FocusTrapSentinel tabIndex={0} />
                    <DialogPaper
                        maxWidth={maxWidth}
                        role="dialog"
                        aria-modal="true"
                        ref={dialogRef}
                        tabIndex={-1}
                    >
                        {children}
                    </DialogPaper>
                    <FocusTrapSentinel tabIndex={0} />
                </DialogContainer>
            )}
        </Fragment>,
        dialogRoot
    );
}