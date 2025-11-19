import type { Module } from "@steambrew/client";

import { FindModuleExportByString } from "@/shared";

const exports: Module[] = Object.values(
	FindModuleExportByString("BIsAppBlocked()"),
);

/**
 * There are more, but these are the ones {@link GetAppAction} uses.
 */
export type AppAction_t =
	| "BorrowApp"
	| "Cancel"
	| "Connect"
	| "Download"
	| "Install"
	| "Launch"
	| "Pause"
	| "Play"
	| "PlayMusic"
	| "PreLoad"
	| "PurchaseApp"
	| "Resume"
	| "ResumeGameInProgress"
	| "Stop"
	| "Stream"
	| "Uninstall"
	| "Update";

type PerClientData_t = "local" | "mostavailable" | "selected";

export const GetAppAction: (
	pWindowInstance: any,
	pOverview: any,
	ePerClientData?: PerClientData_t,
) => AppAction_t | null = exports.find((e) =>
	e.toString?.().includes("BIsAppBlocked()"),
);

export const GetCallbackForAppAction: (
	eAction: AppAction_t,
	pOverview: any,
	ePerClientData: PerClientData_t,
	eLaunchSource: number, // ELaunchSource
	wnd?: Window,
) => () => void = exports.find((e) => e.toString().includes("Local-only app"));
