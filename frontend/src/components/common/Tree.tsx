import React, { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { alpha } from '@ly_components/types/common';
import { LYArrowDownwardIcon, LYArrowRightIcon, LYChevronDownIcon, LYChevronRightIcon, LYMenusExpandLessIcon, LYMenusExpandMoreIcon, LYReactIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";

interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
}

interface TreeProps {
  nodes: TreeNode[];
  onDoubleClick?: (event: React.MouseEvent, node: TreeNode) => void;
  onMouseDown?: (event: React.MouseEvent, node: TreeNode) => void;
  onTouchStart?: (event: React.TouchEvent, node: TreeNode) => void;
  onTouchEnd?: () => void;
}

// Tree Item Styles
const TreeItemWrapper = styled.div<{ isLeaf?: boolean }>(({ theme, isLeaf }) => ({
    color: theme.palette.text.primary,

    padding: theme.spacing(0.5),
    paddingLeft: isLeaf ? theme.spacing(2) : theme.spacing(1),
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    [`&:hover`]: {
      background: alpha(theme.palette.primary.main, 0.1),
    },
    [`& span.label`]: {
        fontSize: "0.8rem",
        fontWeight: 500,
      },
    [`& .iconContainer`]: {
      marginRight: theme.spacing(1),
      borderRadius: "50%",
      color: theme.palette.primary.main,
      padding: theme.spacing(0.5),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  }));

const TreeItemGroup = styled.div(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderLeft: `1px dashed ${theme.palette.divider}`,
  paddingLeft: theme.spacing(1),
}));

const TreeItem: React.FC<{
    node: TreeNode;
    isExpanded: boolean;
    toggleExpand: () => void;
    onDoubleClick?: (event: React.MouseEvent, node: TreeNode) => void;
    onMouseDown?: (event: React.MouseEvent, node: TreeNode) => void;
    onTouchStart?: (event: React.TouchEvent, node: TreeNode) => void;
    onTouchEnd?: () => void;
  }> = ({
    node,
    isExpanded,
    toggleExpand,
    onDoubleClick,
    onMouseDown,
    onTouchStart,
    onTouchEnd,
  }) => {
    const isLeaf = !node.children || node.children.length === 0;
  
    return (
      <>
        <TreeItemWrapper
          isLeaf={isLeaf}
          onDoubleClick={(e) => onDoubleClick?.(e, node)}
          onMouseDown={(e) => onMouseDown?.(e, node)}
          onTouchStart={(e) => onTouchStart?.(e, node)}
          onTouchEnd={(e) => onTouchEnd?.()}
          data-id={node.id}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
        >
          {!isLeaf && (
            <div className="iconContainer">
              {isExpanded 
                ? <LYReactIcon icon={LYChevronDownIcon}  size={LYIconSize.small} color="inherit" /> 
                : <LYReactIcon icon={LYChevronRightIcon} size={LYIconSize.small} color="inherit" />}
            </div>
          )}
          <span className="label">{node.label}</span>
        </TreeItemWrapper>
      </>
    );
  };
// Tree Component
export const Tree: React.FC<TreeProps> = ({
    nodes,
    onDoubleClick,
    onMouseDown,
    onTouchStart,
    onTouchEnd,
  }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(new Set());
  
    const toggleExpand = useCallback(
      (id: string | number) => {
        setExpandedNodes((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
            newSet.delete(id); // Collapse if already expanded
          } else {
            newSet.add(id); // Expand
          }
          return newSet;
        });
      },
      [setExpandedNodes]
    );
  
    const renderNodes = useCallback(
      (nodes: TreeNode[]) =>
        nodes.map((node) => {
          const isExpanded = expandedNodes.has(node.id);
  
          return (
            <div key={node.id}>
              <TreeItem
                node={node}
                isExpanded={isExpanded}
                toggleExpand={() => toggleExpand(node.id)}
                onDoubleClick={onDoubleClick}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              />
              {isExpanded && node.children && (
                <TreeItemGroup>{renderNodes(node.children)}</TreeItemGroup>
              )}
            </div>
          );
        }),
      [expandedNodes, onDoubleClick, onMouseDown, onTouchStart, onTouchEnd, toggleExpand]
    );
  
    return <div>{renderNodes(nodes)}</div>;
  };