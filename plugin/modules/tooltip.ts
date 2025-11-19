import type { FC, PropsWithChildren, ReactNode } from "react";

import { FindModuleExportByString } from "@/shared";

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

interface ToolTipProps extends Partial<HoverPositionProps>, PropsWithChildren {
	bDisabled?: boolean;
	bNavStop?: boolean;

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

export const ToolTip: FC<ToolTipProps> =
	FindModuleExportByString("tool-tip-source");
