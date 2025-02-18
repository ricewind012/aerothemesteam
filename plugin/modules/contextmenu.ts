import { findModuleByExport, Module } from "@steambrew/client";
import type { FC, ReactNode } from "react";

const exports = Object.values(
	findModuleByExport((e) => e.toString().includes("ContextMenuSeparator")),
) as Module[];

interface ContextMenuProps {
	children: ReactNode;
}

export const ContextMenu: FC<ContextMenuProps> = exports.find((e) =>
	e.toString().includes("bForceDesktopPresentation"),
);

interface ContextMenuItemProps {
	children: ReactNode;
	onSelected: (el: HTMLElement) => void;
}

export const ContextMenuItem: FC<ContextMenuItemProps> = exports.find((e) =>
	e.toString().includes("onDisabledItemSelected"),
);

interface ContextMenuSubMenuItemProps {
	label: string;
	disabled?: boolean;
	children?: ReactNode;
}

export const ContextMenuSubMenuItem: FC<ContextMenuSubMenuItemProps> =
	exports.find((e) => e.toString().includes("...e,bInGamepadUI:"));

export const ContextMenuSeparator: FC = exports.find((e) =>
	e.toString().includes("ContextMenuSeparator"),
);
