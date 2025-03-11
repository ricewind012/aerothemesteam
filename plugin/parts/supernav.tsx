import {
	findModuleByExport,
	findModuleExport,
	showContextMenu,
	showModal,
} from "@steambrew/client";
import { Component } from "react";

import { IconButton } from "../components/iconbutton";
import { classes, GetMainPopupWindow, WaitForElement } from "../shared";

import { BIsChinaLauncher, Config } from "../modules/config";
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSubMenuItem,
} from "../modules/contextmenu";
import { CKioskModeManager } from "../modules/kioskmodemgr";
import { Localize } from "../modules/localization";
import {
	CParentalFeaturesManager,
	EParentalFeature,
} from "../modules/parentalfeatures";
import { ToolTip } from "../modules/tooltip";
import { CVRStore } from "../modules/vrstore";

enum EPersonaState {
	Offline,
	Online,
	Busy,
	Away,
	Snooze,
	LookingToTrade,
	LookingToPlay,
	Invisible,
	Max,
}

const bIsChinaLauncher = BIsChinaLauncher(Config.LAUNCHER_TYPE);
const bIsLinux = Config.PLATFORM === "linux";
const bIsOSX = Config.PLATFORM === "macos";
const strSteamRootMenuTitle = bIsOSX ? "#Menu_Account" : "#Menu_Steam";

const ActivateRetailDialog = findModuleExport((e) =>
	e.toString().includes("#Activate_SubscriptionSuccess_Headline"),
);
const ShowBackupAppsDialog: (wnd: Window) => void = findModuleExport((e) =>
	e.toString().includes("#BackupApps_Title"),
);

interface RootMenuEntry {
	checked?: boolean;
	name: string;
	steamURL?: string;
	onClick?: () => void;
	parentalFeature?: EParentalFeature;
	visible?: boolean;
}

function BuildSteamRootMenuEntries(): RootMenuEntry[] {
	const some_enum_fn: () => boolean = findModuleExport(
		(e) =>
			typeof e === "function" && e.toString().includes("CLOUD_GAMING_PLATFORM"),
	);

	const bIsOfflineMode = App.BIsOfflineMode();
	const bIsSecureComputer = loginStore.secureComputer;
	const bSomeEnumCheck = some_enum_fn();
	const bKioskModeLocked = CKioskModeManager.BKioskModeLocked();

	return [
		{
			name: "#Menu_ChangeAccount",
			steamURL: "steam://changeuser",
			visible: bIsSecureComputer,
		},
		{ name: "#Menu_SignOut", steamURL: "steam://signout" },
		{
			name: "#Menu_GoOnline",
			onClick: () => {
				SteamClient.User.GoOnline();
			},
			visible: !bSomeEnumCheck && bIsOfflineMode,
		},
		{
			name: "#Menu_GoOffline",
			onClick: () => {
				SteamClient.User.GoOffline();
			},
			visible: !bSomeEnumCheck && !bIsOfflineMode,
		},
		{ name: "Separator1", visible: !bIsOSX },
		{
			name: "#Menu_CheckForSteamUpdates",
			steamURL: "steam://checkforupdates",
			visible: !bIsOSX,
		},
		{ name: "Separator2" },
		{
			name: "#Menu_BackupRestore",
			onClick: () => {
				const wnd = GetMainPopupWindow();
				ShowBackupAppsDialog(wnd);
			},
		},
		{
			name: "Separator3",
			parentalFeature: EParentalFeature.Max,
			visible: !bIsOSX,
		},
		{
			name: "#Menu_Settings",
			steamURL: "steam://settings",
			parentalFeature: bKioskModeLocked
				? EParentalFeature.Max
				: EParentalFeature.Invalid,
			visible: !bIsOSX,
		},
		{
			name: "Separator4",
			parentalFeature: EParentalFeature.Max,
			visible: !bIsOSX,
		},
		{ name: "#Menu_Exit", steamURL: "steam://exit", visible: !bIsOSX },
	];
}

const RUN_VR_URL = "steam://run/250820";

const exports = Object.values(
	findModuleByExport((e) => e.toString().includes(RUN_VR_URL)),
);

const StartVR = exports.find((e) =>
	e.toString().includes(RUN_VR_URL),
) as () => void;
const QuitVR = exports.find((e) =>
	e.toString().includes("QuitAllVR"),
) as () => void;

function BuildViewRootMenuEntries(): RootMenuEntry[] {
	const bIsVRHMDPresent = CVRStore.IsVRHMDPresent;
	const bIsSteamVRRunning = CVRStore.IsSteamVRRunning;
	const [bSmallMode] = settingsStore.GetClientSetting("small_mode");

	return [
		{
			name: "#Menu_Library",
			steamURL: "steam://open/library/view/home",
		},
		{
			name: "#Menu_HiddenGames",
			steamURL: "steam://open/library/collection/hidden",
		},
		{
			name: "#Menu_Soundtracks",
			steamURL: "steam://open/library/view/soundtracks",
			visible: !bIsChinaLauncher,
		},
		{ name: "#Menu_Downloads", steamURL: "steam://open/downloads" },
		{ name: "Separator1" },
		{
			name: "#Menu_SmallMode",
			steamURL: "steam://open/minigameslist",
			visible: !bIsOSX && !bSmallMode,
		},
		{
			name: "#Menu_LargeMode",
			steamURL: "steam://open/largegameslist",
			visible: !bIsOSX && bSmallMode,
		},
		{
			name: "#Menu_BigPictureMode",
			steamURL: "steam://open/bigpicture",
			visible: !bIsChinaLauncher,
		},
		{ name: "Separator2", visible: bIsVRHMDPresent && !bIsChinaLauncher },
		{
			name: "#Menu_StartVR",
			onClick: StartVR,
			visible: bIsVRHMDPresent && !bIsSteamVRRunning && !bIsChinaLauncher,
		},
		{
			name: "#Menu_ExitVR",
			onClick: QuitVR,
			visible: bIsVRHMDPresent && bIsSteamVRRunning && !bIsChinaLauncher,
		},
		{ name: "Separator3" },
		{
			name: "#Menu_FriendsChat",
			steamURL: "steam://open/friends",
			parentalFeature: EParentalFeature.Friends,
		},
		{
			name: "#Menu_Players",
			steamURL: "steam://friends/players",
			parentalFeature: EParentalFeature.Friends,
		},
		{
			name: "#Menu_Servers",
			steamURL: "steam://open/servers",
			visible: !bIsChinaLauncher,
		},
		{
			name: "#Menu_Inventory",
			steamURL: "steam://open/inventory",
			visible: !bIsChinaLauncher,
		},
		{
			name: "#Menu_NewForYou",
			steamURL: "steam://open/newforyou",
			visible: !bIsChinaLauncher,
		},
		{ name: "Separator4" },
		// _New
		{ name: "#Menu_Screenshots", steamURL: "steam://open/screenshots" },
	];
}

function BuildFriendsRootMenuEntries(): RootMenuEntry[] {
	const ePersonaState: EPersonaState =
		g_FriendsUIApp.m_FriendStore.m_eUserPersonaState;
	const vecOnlineFriends = g_FriendsUIApp.m_FriendStore.all_friends.filter(
		(e) => e.m_persona.m_ePersonaState !== EPersonaState.Offline,
	);

	return [
		{
			name: Localize("#Menu_ViewFriendsList", vecOnlineFriends.length),
			steamURL: "steam://open/friends",
		},
		{ name: "Separator1" },
		{ name: "#Menu_AddFriend", steamURL: "steam://friends/add" },
		{
			name: "#Menu_EditProfile",
			steamURL: "steam://url/SteamIDEditPage",
		},
		{ name: "Separator2" },
		{
			checked: ePersonaState === EPersonaState.Online,
			name: "#Menu_Status_Online",
			steamURL: "steam://friends/status/online",
		},
		{
			checked: ePersonaState === EPersonaState.Away,
			name: "#Menu_Status_Away",
			steamURL: "steam://friends/status/away",
		},
		{
			checked: ePersonaState === EPersonaState.Invisible,
			name: "#Menu_Status_Invisible",
			steamURL: "steam://friends/status/invisible",
		},
		{
			checked: ePersonaState === EPersonaState.Offline,
			name: "#Menu_Status_Offline",
			steamURL: "steam://friends/status/offline",
		},
	];
}

function BuildGamesRootMenuEntries(): RootMenuEntry[] {
	return [
		{
			name: "#Menu_ViewLibrary",
			steamURL: "steam://open/library/view/home",
		},
		{ name: "Separator1" },
		{
			name: "#Menu_ActivateRetail",
			onClick: () => {
				const wnd = GetMainPopupWindow();
				showModal(<ActivateRetailDialog />, wnd, {
					bForcePopOut: true,
				});
			},
		},
		{
			name: "#Menu_RedeemWallet",
			steamURL: "steam://url/RedeemWalletVoucher",
			parentalFeature: EParentalFeature.Store,
		},
		{
			name: "#Menu_ManageGifts",
			steamURL: "steam://url/ManageGiftsPage",
			parentalFeature: EParentalFeature.Store,
		},
		{
			name: "#Menu_AddNonSteam",
			steamURL: "steam://open/addnonsteamgame",
		},
	];
}

function BuildHelpRootMenuEntries(): RootMenuEntry[] {
	return [
		{ name: "#Menu_Support", steamURL: "steam://url/HelpFrontPage" },
		{ name: "Separator1" },
		{
			name: "#Menu_PrivacyPolicy",
			steamURL: "steam://url/PrivacyPolicy",
		},
		{
			name: "#Menu_LegalInfo",
			steamURL: "steam://url/LegalInformation",
			visible: !bIsChinaLauncher,
		},
		{
			name: bIsChinaLauncher ? "#Menu_SSA_China" : "#Menu_SSA",
			steamURL: "steam://url/SSA",
		},
		{ name: "Separator2" },
		{
			name: "#Menu_SystemReport",
			steamURL: "steam://open/systemreport",
			visible: Config.ON_STEAMOS || bIsLinux,
		},
		{ name: "#Menu_SystemInfo", steamURL: "steam://open/systeminfo" },
		{
			name: "#Menu_SRSI_Diagnostics",
			steamURL: "steam://open/runtimeinfo",
			visible: bIsLinux,
		},
		{ name: "Separator3" },
		{ name: "#Menu_About", steamURL: "steam://open/about" },
	];
}

export class SuperNav extends Component {
	/** ref */
	m_elSuperNav: Element | null = null;

	async onClick() {
		if (!this.m_elSuperNav) {
			const wnd = GetMainPopupWindow();
			this.m_elSuperNav = await WaitForElement(
				`.${classes.supernav.SuperNav}`,
				wnd.document,
			);
		}

		/**
		 * The original functions are stolen, since the responsible webpack
		 * module returns the entire menu bar.
		 */
		const pEntries: Record<string, RootMenuEntry[]> = {
			[strSteamRootMenuTitle]: BuildSteamRootMenuEntries(),
			"#Menu_View": BuildViewRootMenuEntries(),
			"#Menu_Friends": BuildFriendsRootMenuEntries(),
			"#Menu_Games": BuildGamesRootMenuEntries(),
			"#Menu_Help": BuildHelpRootMenuEntries(),
		};

		showContextMenu(
			<ContextMenu>
				{Object.entries(pEntries).map(([token, entries]) => (
					<ContextMenuSubMenuItem label={Localize(token)}>
						{entries
							.filter(
								(e) =>
									(e.visible ?? true) &&
									!CParentalFeaturesManager.BIsFeatureBlocked(
										e.parentalFeature,
									),
							)
							.map((e) => {
								const { checked, name, onClick, steamURL } = e;
								if (name.startsWith("Separator")) {
									return <ContextMenuSeparator />;
								}

								const text = Localize(name);
								const onClickFallback = () => {
									SteamClient.URL.ExecuteSteamURL(steamURL);
								};

								return (
									<ContextMenuItem onSelected={onClick || onClickFallback}>
										<>
											{checked && <span className={classes.jumplist.Icon} />}
											{text}
										</>
									</ContextMenuItem>
								);
							})}
					</ContextMenuSubMenuItem>
				))}
			</ContextMenu>,
			this.m_elSuperNav,
			// @ts-ignore
			{
				// Make it appear above the browser view
				bForcePopup: true,
				bOverlapHorizontal: true,
			},
		);
	}

	render() {
		return (
			<ToolTip direction="bottom" toolTipContent={strSteamRootMenuTitle}>
				<IconButton name="steam" onClick={() => this.onClick()} />
			</ToolTip>
		);
	}
}
