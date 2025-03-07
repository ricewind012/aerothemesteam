import { ModalPosition, showModal } from "@steambrew/client";
import { Component } from "react";

import {
	RibbonButton,
	RibbonContainer,
	RibbonSection,
} from "../../components/ribbon";
import { GetMainPopupWindow } from "../../shared";

import {
	type GameListChangeEvent,
	GAME_LIST_CHANGE_EVENT_NAME,
} from "../../events/gamelistchange";
import {
	ESuperNavTab,
	GetESuperNavTabFromSetting,
	TAB_CHANGE_EVENT_NAME,
	TabChangeEvent,
} from "../../events/tabchange";

import { AppGameInfo } from "../../modules/appgameinfo";
import { BIsChinaLauncher, Config } from "../../modules/config";
import { CKioskModeManager } from "../../modules/kioskmodemgr";
import {
	EParentalFeature,
	CParentalFeaturesManager,
} from "../../modules/parentalfeatures";

import { FavoriteButton } from "./favoritebutton";
import { ActionButton } from "./actionbutton";
import { Localize } from "../../modules/localization";

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
			label: "#AppDetails_Links_Store",
			icon: "steam",
			url: urlStore.BuildStoreAppURL(unDemoAppID, "primarylinks"),
		},
		bAvailableContentOnStore && {
			label: "#AppDetails_Links_DLC",
			icon: "steam",
			url: urlStore.BuildStoreAppDlcURL(actual_appid, "primarylinks"),
		},
		!bIsChinaLauncher && {
			label: "#AppDetails_Links_Community",
			icon: "community",
			link: "GameHub",
		},
		bPointsShopAvailable && {
			label: "#AppDetails_Links_PointsShop",
			icon: "points",
			url: urlStore.BuildAppPointsShopURL(actual_appid),
		},
		!bIsChinaLauncher && {
			label: "#AppDetails_Link_Discussions",
			icon: "discussions",
			link: "GameHubDiscussions",
		},
		!bIsChinaLauncher && {
			label: "#AppDetails_Link_Guides",
			icon: "guide",
			link: "GameHubGuides",
		},
		bWorkshopVisible && {
			label: "#AppDetails_Link_Workshop",
			icon: "community",
			link: "SteamWorkshopPage",
		},
		bCommunityMarketPresence && {
			label: "#AppDetails_Link_Market",
			icon: "community",
			link: "CommunityMarketApp",
		},
		!CKioskModeManager.BKioskModeLocked() && {
			label: "#AppDetails_Link_Support",
			icon: "help",
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
				popupWidth: 800,
				popupHeight: 500,
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

		console.warn("EVENT", this.state, ev.detail);
		this.setState({ appid, tab, ...ev.detail });
	}

	componentDidMount() {
		const events = [GAME_LIST_CHANGE_EVENT_NAME, TAB_CHANGE_EVENT_NAME];
		for (const event of events) {
			window.addEventListener(event, (ev) => {
				this.OnWindowEvent(ev);
			});
		}
	}

	render() {
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
