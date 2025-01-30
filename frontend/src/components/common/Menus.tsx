import React, { forwardRef, ReactNode, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { createPortal } from "react-dom";
import { Div } from "@ly_components/styles/Div";
import { LYArrowRightIcon, LYReactIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { DefaultZIndex } from "@ly_components/types/common";

// Props for the Menu
interface MenuProps {
  open: boolean;
  anchorEl?: HTMLElement | null | undefined;
  anchorPosition?: { top: number; left: number };
  onClose?: () => void;
  children: ReactNode;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  zIndex?: number;
  preventBrowserContextMenu?: boolean;
}

// Styled Menu Container
export const StyledMenu = styled(Div)<{ zIndex: number }>(({ theme, zIndex }) => ({
  position: "absolute",
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "12px",
  padding: theme.spacing(1),
  minWidth: "120px",
  zIndex: zIndex,
  outline: "none",
}));

// Position utility
const getPosition = (anchorEl: HTMLElement | null | undefined, placement: MenuProps["placement"], anchorPosition: { top: number; left: number } | undefined) => {
  if (anchorPosition) {
    return anchorPosition;
  } else
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      switch (placement) {
        case "bottom-end":
          return { top: rect.bottom + window.scrollY, left: rect.right - 200 + window.scrollX };
        case "top-start":
          return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
        case "top-end":
          return { top: rect.top + window.scrollY, left: rect.right + window.scrollX };
        case "bottom-start":
        default:
          return { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX };
      }
    }
};

// 🌟 Custom Menu Component
export const Menu = forwardRef<HTMLDivElement, MenuProps>((params, ref) => {
  const {
    open,
    anchorEl,
    anchorPosition,
    onClose,
    children,
    placement = "bottom-start",
    zIndex = DefaultZIndex.Menus,
    preventBrowserContextMenu = false,
    ...props
  } = params;

  const handleContextMenu = (event: MouseEvent) => {
    if (preventBrowserContextMenu) {
      event.preventDefault();
    }
  };

  // Close on outside click or ESC
  useEffect(() => {
    if (!open) return;


    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onClose) {
          onClose();
        }
      }
    };

    // Use 'pointerdown' for better mobile support
    document.addEventListener("keydown", handleEsc);
    document.addEventListener("contextmenu", handleContextMenu); // Add global listener


    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [open, anchorEl, onClose]);



  if (!open || (!anchorEl && !anchorPosition)) return null;

  const { top, left } = getPosition(anchorEl, placement, anchorPosition) ?? { top: 0, left: 0 };

  return createPortal(
    <StyledMenu
      ref={ref}
      className="custom-menu"
      style={{ top, left }}
      zIndex={zIndex}
      {...props}
    >
      {children}
    </StyledMenu>,
    document.body
  );
});

interface MenuItemProps {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  startIcon?: ReactNode | React.ElementType;
}


// Styled Icon Wrapper for padding and alignment
const IconWrapper = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing(1.5), // Add space between icon and text
}));

// Helper function to render icons
const renderIcon = (icon: ReactNode | React.ElementType) => {
  if (!icon) return null;
  return <LYReactIcon icon={icon as React.ElementType} size={LYIconSize.small} />;
};

// Styled Menu Item
export const StyledMenuItem = styled(Div)(({ theme }) => ({
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  transition: "background-color 0.2s",
  fontSize: "14px",
  "&:hover": {
    background: theme.background.default,
    borderRadius: "12px",
  },
}));

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>((props, ref) => {
  const { onClick, children, startIcon } = props;

  return (
    <StyledMenuItem ref={ref} onClick={onClick}>
      {startIcon && <IconWrapper>{renderIcon(startIcon)}</IconWrapper>}
      {children}
    </StyledMenuItem>
  );
});

// Props for SubMenu
interface SubMenuProps {
  label: string;
  children: ReactNode;
  startIcon?: ReactNode | React.ElementType;
}

// SubMenu Component
export const SubMenu: React.FC<SubMenuProps> = ({ label, children, startIcon }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div
      ref={anchorRef}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onClick={(e) => e.stopPropagation()}  // 🚀 Prevent closing parent menu
    >
      <StyledMenuItem>
        {startIcon && <IconWrapper>{renderIcon(startIcon)}</IconWrapper>}
        {label}
        <LYReactIcon icon={LYArrowRightIcon} />
      </StyledMenuItem>

      <Menu
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        placement="top-end"
      >
        {children}
      </Menu>
    </div>
  );
};
