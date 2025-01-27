import { findModuleExport } from "@steambrew/client";

/**
 * Replaces `%1$s`, `%2$s`, etc. in a localization string with provided arguments.
 */
export const Localize: (strToken: string, ...args: string[]) => string =
	findModuleExport((m) => m.toString().includes("LocalizeString(e);return"));
