import { findModuleExport } from "millennium-lib";

/**
 * Global configuration constants.
 * Populated by GetWebUIConfig on websites.
 * Library fills most fields: some in the URL passed from newlibrarypage.cpp, some in CURLStore.Init,
 * and some in SteamLibrary.InitConfig directly. Some it skips - be sure to test.
 */
export const Config = findModuleExport((e) => e.LAUNCHER_TYPE);

enum ELauncherType {
	Default,
	PerfectWorld,
	Nexon,
	CmdLine,
	CSGO,
	ClientUI,
	Headless,
	SteamChina,
	SingleApp,
	Max,
}

//
// Returns whether the specified launchr type is a "china launcher" for the purposes of
// features like anti addiction. This includes steam china, the steam china government review
// launcher, and the pw csgo and pw dota2 launchers.
//
export const BIsChinaLauncher: (eLauncherType: ELauncherType) => boolean =
	findModuleExport((e) => e.toString().includes("case 4:case 1:case 7:"));
