import { findModuleExport } from "@steambrew/client";

export const CheckIcon = findModuleExport((e) =>
	e.toString().includes("SVGIcon_Check"),
);
