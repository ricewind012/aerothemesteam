import { findModuleExport } from "@steambrew/client";
import type { FC, ReactNode } from "react";

interface ContextMenuProps {
	children: ReactNode;
}

export const ContextMenu: FC<ContextMenuProps> = findModuleExport((e) =>
	e.toString().includes("bForceDesktopPresentation"),
);

interface ContextMenuItemProps {
	children: ReactNode;
	onSelected: (el: HTMLElement) => void;
}

export const ContextMenuItem: FC<ContextMenuItemProps> = findModuleExport((e) =>
	e.toString().includes("onDisabledItemSelected"),
);

export const ContextMenuSeparator: FC = findModuleExport((e) =>
	e.toString().includes("ContextMenuSeparator"),
);
