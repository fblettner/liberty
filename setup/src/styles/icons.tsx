/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import {
  MdMenu, MdMenuOpen, MdDashboard, MdLightMode, MdDarkMode, MdSmartToy, MdNotifications, MdLogout, MdAccountCircle, MdClose, MdFullscreen,
  MdFullscreenExit, MdSearch, MdAdd, MdEdit, MdArrowDownward, MdArrowRight,
  MdExpandLess,
  MdExpandMore,
  MdAttachFile,
  MdSettings,
  MdLocalLibrary,
  MdLink,
  MdSave,
  MdCancel,
  MdThumbUp,
  MdThumbDownOffAlt,
  MdRemove,
  MdMoreVert,
  MdCopyAll,
  MdHelp,
  MdContentCopy,
  MdDelete,
  MdCheck,
  MdClear,
  MdArrowCircleUp,
  MdArrowCircleDown,
  MdPlayCircleOutline,
  MdColorLens,
  MdCloudUpload,
  MdArrowCircleRight,
  MdResetTv,
  MdRestartAlt,
  MdRestore,
  MdContentPaste,
  MdAutoAwesome,
  MdViewColumn,
  MdDensitySmall,
  MdDensityMedium,
  MdDensityLarge,
  MdFilterList,
  MdDownload,
  MdUpload,
  MdInfoOutline,
  MdEditRoad,
  MdFilterAlt,
  MdAccountTree,
  MdTableView,
  MdRefresh,
  MdFormatListBulleted,
  MdArrowLeft,
  MdArrowUpward,
  MdUnfoldMore,
  MdGroup,
  MdPushPin,
  MdVisibilityOff,
  MdGroupOff,
  MdWarning,
  MdInfo,
  MdError
} from "react-icons/md";
import { FaDatabase, FaWind, FaCodeBranch, FaBox, FaBug, FaChartLine, FaFile, FaNetworkWired, FaUserLock, FaTelegram, FaFileExcel, FaFilePdf, FaFileCsv, FaCircleChevronDown, FaCircleChevronUp, FaCircleChevronRight } from "react-icons/fa6";
import { EStandardColor, getThemeColor, LYIconSize } from "@ly_utils/commonUtils";
import { Div } from "@ly_components/styles/Div";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";


// Material Icons
export const LYMenuIcon = MdMenu;
export const LYMenuOpenIcon = MdMenuOpen;
export const LYLightModeIcon = MdLightMode;
export const LYDarkModeIcon = MdDarkMode;
export const LYSmartToyIcon = MdSmartToy;
export const LYNotificationsIcon = MdNotifications;
export const LYLogoutIcon = MdLogout;
export const LYAccountCircleIcon = MdAccountCircle;
export const LYArrowCircleUpIcon = MdArrowCircleUp;
export const LYArrowCircleDownIcon = MdArrowCircleDown;
export const LYArrowCircleRightIcon = MdArrowCircleRight;
export const LYPlayCircleOutlineIcon = MdPlayCircleOutline;
export const LYCloseIcon = MdClose;
export const LYWarningIcon = MdWarning;
export const LYInfoIcon = MdInfo;
export const LYErrorIcon = MdError;
export const LYSuccessIcon = MdCheck;
export const LYDashboardIcon = MdDashboard;
export const LYFullscreenIcon = MdFullscreen
export const LYFullscreenExitIcon = MdFullscreenExit
export const LYSearchIcon = MdSearch
export const LYAddIcon = MdAdd
export const LYEditIcon = MdEdit
export const LYContentCopyIcon = MdContentCopy;
export const LYContentPasteIcon = MdContentPaste;
export const LYDeleteIcon = MdDelete;
export const LYClearIcon = MdClear;
export const LYSaveIcon = MdSave
export const LYCancelIcon = MdCancel
export const LYHelpIcon = MdHelp;
export const LYArrowDownwardIcon = MdArrowDownward
export const LYArrowUpwardIcon = MdArrowUpward
export const LYArrowRightIcon = MdArrowRight
export const LYArrowLeftIcon = MdArrowLeft
export const LYMenusExpandLessIcon = MdExpandLess;
export const LYMenusExpandMoreIcon = MdExpandMore;
export const LYAttachFileIcon = MdAttachFile
export const LYLocalLibraryIcon = MdLocalLibrary;
export const LYSettingsIcon = MdSettings;
export const LYLinkIcon = MdLink;
export const LYThumbUpIcon = MdThumbUp;
export const LYThumbDownOffIcon = MdThumbDownOffAlt;
export const LYMinimizeIcon = MdRemove;
export const LYMaximizeIcon = MdAdd;
export const LYMoreVertIcon = MdMoreVert
export const LYCopyIcon = MdCopyAll;
export const LYCheckIcon = MdCheck;
export const LYColorLensIcon = MdColorLens;
export const LYCloudUploadIcon = MdCloudUpload;
export const LYResetIcon = MdRestartAlt
export const LYRestoreIcon = MdRestore
export const LYAutoAwesomeIcon = MdAutoAwesome;
export const LYViewColumnIcon = MdViewColumn;
export const LYDensitySmallIcon = MdDensitySmall;
export const LYDensityMediumIcon = MdDensityMedium;
export const LYDensityLargeIcon = MdDensityLarge;
export const LYFilterListIcon = MdFilterList;
export const LYFilterClearIcon = MdClear
export const LYDownloadIcon = MdDownload;
export const LYUploadIcon = MdUpload;
export const LYInfoOutlinedIcon = MdInfoOutline;
export const LYEditRoadIcon = MdEditRoad;
export const LYFilterAltIcon = MdFilterAlt;
export const LYAccountTreeIcon = MdAccountTree;
export const LYTableViewIcon = MdTableView;
export const LYListIcon = MdFormatListBulleted;
export const LYRefreshIcon = MdRefresh;
export const LYUnfoldMoreIcon = MdUnfoldMore;
export const LYGroupIcon = MdGroup;
export const LYGroupOffIcon = MdGroupOff;
export const LYPushPinIcon = MdPushPin;
export const LYVisibilityOffIcon = MdVisibilityOff;

// Font Awesome Icons
export const LYDatabaseIcon = FaDatabase;
export const LYAirflowIcon = FaWind;
export const LYGitIcon = FaCodeBranch;
export const LYPortainerIcon = FaBox;
export const LYLogsIcon = FaFile;
export const LYSocketIcon = FaNetworkWired;
export const LYBugIcon = FaBug;
export const LYChartIcon = FaChartLine;
export const LYIdentityIcon = FaUserLock;
export const LYTelegramIcon = FaTelegram
export const LYExcelIcon = FaFileExcel;
export const LYPDFIcon = FaFilePdf;
export const LYCSVIcon = FaFileCsv;
export const LYChevronDownIcon = FaCircleChevronDown;
export const LYChevronUpIcon = FaCircleChevronUp
export const LYChevronRightIcon = FaCircleChevronRight;

// Variant Icons
export const variantIcons = {
  success: LYSuccessIcon,
  error: LYErrorIcon,
  warning: LYWarningIcon,
  info: LYInfoIcon,
};

interface ReactIconProps {
  icon: React.ElementType;
  size?: string | number;
  color?: EStandardColor | string;
  className?: string;
}

// Styled Icon to handle color and size
const StyledIcon = styled.span<{ color: string; size: string | number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ size }) => size};
  color: ${({ color }) => color};
`;

// LYReactIcon Component
export function LYReactIcon(params: ReactIconProps) {
  const { icon: Icon, size = LYIconSize.medium, color = EStandardColor.primary, className } = params;
  const theme = useTheme();
  const resolvedColor = color === "inherit" ? "inherit" : getThemeColor(theme, color);
  const resolvedSize = typeof size === "number" ? `${size}px` : size;
  return (
    <StyledIcon color={resolvedColor} size={resolvedSize} className={className}>
      <Icon />
    </StyledIcon>
  );
};

interface LYLogoIconProps {
  width?: string | number;
  height?: string | number;
}

const StyledSVG = styled.svg<{ width?: string | number; height?: string | number }>`
  width: ${({ width }) => width || "1em"};
  height: ${({ height }) => height || "1em"};
  display: inline-block;
  vertical-align: middle;
`;

// Custom LY Logo Icon
export function LYLogoIcon(params: LYLogoIconProps) {
  const { width, height } = params;
  return (
    <StyledSVG
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={width}
      height={height}
    >
      <defs>
        <linearGradient id="a" x1="210.277" x2="418.619" y1="545.779" y2="545.779">
          <stop offset="0" stopColor="#0f2027" />
          <stop offset="1" stopColor="#2c5364" />
        </linearGradient>
        <linearGradient id="b" x1="233.545" x2="395.351" y1="545.779" y2="545.779">
          <stop offset="0" stopColor="#2c5364" />
          <stop offset="1" stopColor="#0f2027" />
        </linearGradient>
      </defs>

      <g transform="matrix(2.34169 0 0 2.33011 -485.417 -1023.441)">
        <ellipse
          cx="314.45"
          cy="545.78"
          rx="104.17"
          ry="104.49"
          fill="url(#a)"
        />
        <ellipse
          cx="314.45"
          cy="545.78"
          rx="97.27"
          ry="97.75"
          fill="#fff"
        />
      </g>

      <g transform="matrix(2.34169 0 0 2.33011 -485.417 -1023.441)">
        <circle cx="314.45" cy="545.78" r="80.9" fill="url(#b)" />
        <text
          x="264.368"
          y="573.521"
          fill="#fff"
          fontFamily="ChalkboardSE-Regular"
          fontSize="104"
          style={{
            whiteSpace: "pre",
          }}
        >
          {"Ly"}
        </text>
      </g>
    </StyledSVG>
  );
};



