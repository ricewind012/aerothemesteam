import { findModuleByExport, type Module } from "@steambrew/client";
import type { FC, ReactNode } from "react";

const exports = Object.values(
	findModuleByExport((e) => e.toString().includes("ContextMenuSeparator")),
) as Module[];

interface MenuGroupProps {
	label: string;
	disabled?: boolean;
	children?: ReactNode;
}

export const MenuGroup: FC<MenuGroupProps> = exports.find((e) =>
	e.toString().includes("...e,bInGamepadUI:"),
);
