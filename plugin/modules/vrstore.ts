import { findModuleExport } from "@steambrew/client";

interface VRStore {
	get IsSteamVRRunning(): boolean;
	get IsVRHMDPresent(): boolean;
}

export const CVRStore: VRStore = findModuleExport((e) => e.OnVRModeChanged);
