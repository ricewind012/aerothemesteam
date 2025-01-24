import { findModuleExport } from "millennium-lib";
import type { FC, ReactNode } from "react";

interface HoverPositionProps {
	/**
	 * HoverAboveModal
	 */
	bTopmost: boolean;
	/**
	 * @default "right"
	 */
	direction: "left" | "right" | "top" | "bottom" | "overlay" | "overlay-center";
	/**
	 * @default 10
	 */
	nAllowOffscreenPx: number;
	/**
	 * @default 0.5
	 */
	nBodyAlignment: number;
	/**
	 * @default 8
	 */
	nBodyDistance: number;
	nMaxLateralMoveOnScreen: number;
}

interface ToolTipProps extends Partial<HoverPositionProps> {
	bDisabled?: boolean;
	bNavStop?: boolean;
	children: ReactNode;
	/**
	 * Tooltip **container** class name.
	 * @default "tool-tip-source"
	 */
	className?: string;
	/**
	 * @default 300
	 */
	nDelayShowMS?: number;
	/**
	 * Additional tooltip **hover position** container class name.
	 */
	strTooltipClassname?: string;
	toolTipContent: ReactNode;
}

export const ToolTip: FC<ToolTipProps> = findModuleExport((e) =>
	e.toString().includes("tool-tip-source"),
);
