import { ModalPosition, showModal } from "@steambrew/client";
import { Component } from "react";

import {
	RibbonButton,
	RibbonContainer,
	RibbonSection,
} from "@/components/ribbon";
import {
	GAME_LIST_CHANGE_EVENT_NAME,
	type GameListChangeEvent,
} from "@/events/gamelistchange";
import {
	ESuperNavTab,
	GetESuperNavTabFromSetting,
	TAB_CHANGE_EVENT_NAME,
	type TabChangeEvent,
} from "@/events/tabchange";
import { AppGameInfo } from "@/modules/appgameinfo";
import { BIsChinaLauncher, Config } from "@/modules/config";
import { CKioskModeManager } from "@/modules/kioskmodemgr";
import { Localize } from "@/modules/localization";
import {
	CParentalFeaturesManager,
	EParentalFeature,
} from "@/modules/parentalfeatures";
import { GetMainPopupWindow } from "@/shared";

import { ActionButton } from "./actionbutton";
import { FavoriteButton } from "./favoritebutton";

const k_EAppType_Demo = 8;

interface LibraryLink {
	label: string;
	icon: string;
	link?: string;
	url?: string;
}

/**
 * Gets available links (ones below the game image) for an app.
 *
 * Stolen from `appdetailsprimarylinkssection`, since the original returns a
 * React component.
 */
function GetAppLinks(appid: number) {
	const overview = appStore.GetAppOverviewByAppID(appid);
	const { details } = appDetailsStore.GetAppData(appid);

	const bIsModOrShortcut = overview.BIsModOrShortcut();
	if (bIsModOrShortcut) {
		return [];
	}

	// ty valve
	const bAvailableContentOnStore = details?.bAvailableContentOnStore;
	const bCommunityMarketPresence = details?.bCommunityMarketPresence;
	const bWorkshopVisible = details?.bWorkshopVisible;

	const { app_type: eAppType, optional_parent_app_id: unParentAppID } =
		overview;
	const bIsDemo = eAppType === k_EAppType_Demo;
	const actual_appid =
		bIsDemo && unParentAppID ? unParentAppID : overview.appid;

	const badge = badgeStore.GetBadgeData(actual_appid);
	const store_item = StoreItemCache.GetApp(actual_appid);
	const unDemoAppID =
		bIsDemo && store_item?.HasDemoStandaloneStorePage()
			? overview.appid
			: actual_appid;
	const bIsChinaLauncher = BIsChinaLauncher(Config.LAUNCHER_TYPE);
	const bPointsShopAvailable = !bIsChinaLauncher && badge.rgCards; //?.length > 0;

	const vecLinks: LibraryLink[] = [
		{
			icon: "steam",
			label: "#AppDetails_Links_Store",
			url: urlStore.BuildStoreAppURL(unDemoAppID, "primarylinks"),
		},
		bAvailableContentOnStore && {
			icon: "steam",
			label: "#AppDetails_Links_DLC",
			url: urlStore.BuildStoreAppDlcURL(actual_appid, "primarylinks"),
		},
		!bIsChinaLauncher && {
			icon: "community",
			label: "#AppDetails_Links_Community",
			link: "GameHub",
		},
		bPointsShopAvailable && {
			icon: "points",
			label: "#AppDetails_Links_PointsShop",
			url: urlStore.BuildAppPointsShopURL(actual_appid),
		},
		!bIsChinaLauncher && {
			icon: "discussions",
			label: "#AppDetails_Link_Discussions",
			link: "GameHubDiscussions",
		},
		!bIsChinaLauncher && {
			icon: "guide",
			label: "#AppDetails_Link_Guides",
			link: "GameHubGuides",
		},
		bWorkshopVisible && {
			icon: "community",
			label: "#AppDetails_Link_Workshop",
			link: "SteamWorkshopPage",
		},
		bCommunityMarketPresence && {
			icon: "community",
			label: "#AppDetails_Link_Market",
			link: "CommunityMarketApp",
		},
		!CKioskModeManager.BKioskModeLocked() && {
			icon: "help",
			label: "#AppDetails_Link_Support",
			link: "HelpAppPage",
		},
	];

	return vecLinks.filter(Boolean);
}

function GetAccountEntries() {
	const { strAccountBalance, strAccountName } = App.GetCurrentUser();
	const { secureComputer } = loginStore;

	return [
		{
			feature: EParentalFeature.Profile,
			icon: "info",
			text: "#Menu_ViewMyProfile",
			url: "steam://url/SteamIDMyProfile",
		},
		{
			args: [strAccountName],
			feature: EParentalFeature.Max,
			icon: "info",
			text: "#Menu_ViewMyAccount",
			url: "steam://url/StoreAccount",
		},
		{
			feature: EParentalFeature.Max,
			icon: "steam",
			text: "#Menu_StorePreferences",
			url: "steam://url/SteamPreferences",
		},
		{
			args: [strAccountBalance],
			feature: EParentalFeature.Store,
			icon: "steam",
			text: "#Menu_ViewMyWallet",
			url: "steam://url/StoreAddFundsPage",
		},
		{
			disabled: !secureComputer,
			icon: "update",
			text: "#Menu_ChangeAccount",
			url: "steam://changeuser",
		},
		{ icon: "nav-back", text: "#Menu_Logout", url: "steam://signout" },
	];
}

function GetDefaltTabState() {
	const [eDefaultTab] = settingsStore.GetClientSetting("start_page");
	return GetESuperNavTabFromSetting(eDefaultTab);
}

interface SteamDesktopState {
	appid: number;
	tab: ESuperNavTab;
}

export class SteamDesktop extends Component<{}, SteamDesktopState> {
	state = {
		appid: -1,
		tab: GetDefaltTabState(),
	};

	OnManageButtonClick() {
		const { appid } = this.state;

		SteamClient.Apps.OpenAppSettingsDialog(appid, "");
	}

	OnDetailsButtonClick() {
		const { appid } = this.state;
		const overview = appStore.GetAppOverviewByAppID(appid);
		const { details } = appDetailsStore.GetAppData(appid);
		const wnd = GetMainPopupWindow();

		showModal(
			<ModalPosition>
				<AppGameInfo expand={true} overview={overview} details={details} />
			</ModalPosition>,
			wnd,
			{
				popupHeight: 500,
				popupWidth: 800,
				strTitle: Localize("#AppDetails_Tab_GameInfo"),
			},
		);
	}

	OnGoBackButtonClick() {
		MainWindowBrowserManager.m_browser.GoBack();
	}

	OnGoForwardButtonClick() {
		MainWindowBrowserManager.m_browser.GoForward();
	}

	OnReloadButtonClick() {
		MainWindowBrowserManager.m_browser.Reload();
	}

	OnWindowEvent(ev: CustomEventInit<GameListChangeEvent & TabChangeEvent>) {
		const { appid, tab } = this.state;
		if (appid === ev.detail.appid || tab === ev.detail.tab) {
			return;
		}

		this.setState({ appid, tab, ...ev.detail });
	}

	override componentDidMount() {
		const events = [GAME_LIST_CHANGE_EVENT_NAME, TAB_CHANGE_EVENT_NAME];
		for (const event of events) {
			window.addEventListener(event, (ev) => {
				this.OnWindowEvent(ev);
			});
		}
	}

	override render() {
		const { appid, tab } = this.state;
		if (tab === ESuperNavTab.Library && appid === -1) {
			return <RibbonContainer />;
		}

		const accountSection = GetAccountEntries().map((e) => {
			const { args, icon, feature, text, url } = e;
			const onClick = () => {
				SteamClient.URL.ExecuteSteamURL(url);
			};
			const disabled =
				e.disabled || CParentalFeaturesManager.BIsFeatureBlocked(feature);

			return (
				<RibbonButton
					args={args}
					icon={icon}
					disabled={disabled}
					text={text}
					onClick={onClick}
				/>
			);
		});
		const browserSection = (
			<RibbonSection title="#Theme_RibbonSection_Browser">
				<RibbonButton
					icon="nav-back"
					text="Go back"
					onClick={this.OnGoBackButtonClick}
				/>
				<RibbonButton
					icon="nav-forward"
					text="Go forward"
					onClick={this.OnGoForwardButtonClick}
				/>
				<RibbonButton
					icon="update"
					text="Reload"
					onClick={this.OnReloadButtonClick}
				/>
			</RibbonSection>
		);

		switch (tab) {
			case ESuperNavTab.Library: {
				const links = GetAppLinks(appid).map((e) => {
					const { label, icon, link, url } = e;
					const dest = link ? urlStore.ResolveURL(link, appid) : url;
					const onClick = () => {
						MainWindowBrowserManager.ShowURL(dest);
					};

					return <RibbonButton icon={icon} text={label} onClick={onClick} />;
				});

				return (
					<RibbonContainer>
						<RibbonSection title="#Theme_RibbonSection_Game">
							<ActionButton appid={appid} />
							<RibbonButton
								icon="manage"
								text="#GameAction_Manage"
								onClick={() => this.OnManageButtonClick()}
							/>
							<RibbonButton
								icon="details"
								text="#GameAction_ViewDetails"
								onClick={() => this.OnDetailsButtonClick()}
							/>
							<FavoriteButton appid={appid} />
						</RibbonSection>
						{links.length > 0 && (
							<RibbonSection title="#Theme_RibbonSection_Links">
								{links}
							</RibbonSection>
						)}
					</RibbonContainer>
				);
			}

			case ESuperNavTab.Console:
				return <RibbonContainer />;

			// Browser
			default:
				return (
					<RibbonContainer>
						{browserSection}
						{tab === ESuperNavTab.Profile && (
							<RibbonSection title="#Theme_RibbonSection_Account">
								{accountSection}
							</RibbonSection>
						)}
					</RibbonContainer>
				);
		}
	}
}
