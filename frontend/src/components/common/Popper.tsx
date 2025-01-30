import React, { ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { useZIndex } from "@ly_components/types/common";

// Supported placements
type Placement = "top" | "bottom" | "left" | "right" | "bottom-start" | "bottom-end";

// Props for the enhanced Popper/Popover
export interface PopperProps {
  children: ReactNode;
  open: boolean;
  anchorEl?: HTMLElement | null;
  placement?: Placement;
  disablePortal?: boolean;
  style?: React.CSSProperties;
  modal?: boolean;
  onClose?: () => void;
}

// Styled Backdrop for modal behavior
const Backdrop = styled.div<{ zIndex: number }>(({ zIndex }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0)",
  zIndex: zIndex
})
);

// Styled Popper container
const PopperContainer = styled.div<{ visible: boolean; width: number | string; zIndex: number }>(
  ({ visible, width, zIndex }) => ({
    position: "absolute",
    width: width,
    zIndex: zIndex,
    transition: "opacity 0.2s ease-in-out",
    opacity: 1,
    visibility: visible ? "visible" : "hidden",
  })
);

// 🔥 Unified Popper/Popover Component
export const Popper = ({
  children,
  open,
  anchorEl,
  placement = "bottom-start",
  disablePortal = false,
  style = {},
  modal = false,
  onClose,
}: PopperProps) => {

  const popperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [positionReady, setPositionReady] = useState(false);

  // Calculates the position relative to anchor
  const updatePosition = () => {
    if (anchorEl && popperRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const popperOffsetParent = popperRef.current.offsetParent as HTMLElement;
      const parentRect = popperOffsetParent?.getBoundingClientRect() || { top: 0, left: 0 };
  
      const popperHeight = popperRef.current.offsetHeight;
      const parentHeight = popperOffsetParent?.clientHeight || window.innerHeight;

     // Check if popper would overflow at the bottom of the parent container
     const wouldOverflowBottom = anchorRect.bottom + popperHeight  > window.innerHeight;
  
      let top = 0;
      let left = 0;
  
      const finalPlacement = wouldOverflowBottom && placement.startsWith("bottom") ? "top" : placement;
  
      switch (finalPlacement) {
        case "top":
          top = anchorRect.top - parentRect.top - popperHeight - 25;
          left = anchorRect.left - parentRect.left 
          break;
        case "bottom-start":
          top = anchorRect.bottom - parentRect.top;
          left = anchorRect.left - parentRect.left;
          break;
        case "bottom-end":
          top = anchorRect.bottom - parentRect.top;
          left = anchorRect.right - parentRect.left - popperRef.current.offsetWidth;
          break;
        case "left":
          top = anchorRect.top - parentRect.top + anchorRect.height / 2 - popperRef.current.offsetHeight / 2;
          left = anchorRect.left - parentRect.left - popperRef.current.offsetWidth;
          break;
        case "right":
          top = anchorRect.top - parentRect.top + anchorRect.height / 2 - popperRef.current.offsetHeight / 2;
          left = anchorRect.right - parentRect.left;
          break;
        default:
          top = anchorRect.bottom - parentRect.top;
          left = anchorRect.left - parentRect.left;
          break;
      }
  
      setPosition({ top, left });
      setPositionReady(true);
    }
  };


  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorEl, placement, modal]);

  const { getNextZIndex, resetZIndex } = useZIndex();
  const zIndex = useRef<number>(0);

  useEffect(() => {
    if (open)
      zIndex.current = getNextZIndex();
    return () => resetZIndex(); // Cleanup on unmount
  }, [getNextZIndex, resetZIndex]);

  const handleClose = () => {
   // resetZIndex();
    onClose?.();
  }

  const popperContent = open ? (
    <>
      {modal && <Backdrop onClick={handleClose} zIndex={zIndex.current - 1} />}
      <PopperContainer
        ref={popperRef}
        visible={positionReady}
        width={style.width || 300}
        zIndex={zIndex.current}
        style={{
          ...style,
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {children}
      </PopperContainer>
    </>
  ) : null;

  return disablePortal ? popperContent : ReactDOM.createPortal(popperContent,  document.body);
};



