import { findModuleByExport, showModal } from "@steambrew/client";

import { PartComponentBase } from "../../shared";
import {
	k_GameListChangeEventName,
	type GameListChangeEvent,
} from "../../gamelistchangeevent";

import { BIsChinaLauncher, Config } from "../../modules/config";
import { CKioskModeManager } from "../../modules/kioskmodemgr";
import { AppGameInfo } from "../../modules/appgameinfo";

import { RibbonButton, RibbonContainer, RibbonSection } from "./ribbon";
import { FavoriteButton } from "./favoritebutton";
import { ActionButton } from "./actionbutton";

const k_EAppType_Demo = 8;

interface StoreItemDataRequest {
	include_assets: boolean;
	include_release: boolean;
	include_platforms: boolean;
	include_all_purchase_options: boolean;
	include_screenshots: boolean;
	include_trailers: boolean;
	include_ratings: boolean;
	include_tag_count: boolean;
	include_reviews: boolean;
	include_basic_info: boolean;
	include_supported_languages: boolean;
	include_full_description: boolean;
	include_included_items: boolean;
	include_assets_without_overrides: boolean;
	apply_user_filters: boolean;
	include_links: boolean;
}

const some_hard_to_get_fn: (
	unAppID: number,
	param1: StoreItemDataRequest,
	param2: any,
) => any[] = (() => {
	const mod = findModuleByExport((e) =>
		e.toString?.().includes("useStoreItemCache: unmounting"),
	);
	// there are 2 of these, but the first one is correct
	const key = Object.keys(mod).find((func) =>
		mod[func].toString().match(/^function \w\(e,t,r\){return \w\(e,0,t,r\)}$/),
	);

	return mod[key];
})();

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
	const bIsDemo = k_EAppType_Demo === eAppType;
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
			icon: "store",
			url: urlStore.BuildStoreAppURL(unDemoAppID, "primarylinks"),
		},
		bAvailableContentOnStore && {
			label: "#AppDetails_Links_DLC",
			icon: "store",
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

interface SteamDesktopState {
	appid: number;
}

export class SteamDesktop extends PartComponentBase<SteamDesktopState> {
	state = { appid: -1 };

	OnManageButtonClick() {
		const { appid } = this.state;

		SteamClient.Apps.OpenAppSettingsDialog(appid, "");
	}

	OnDetailsButtonClick() {
		const { appid } = this.state;
		const overview = appStore.GetAppOverviewByAppID(appid);
		const { details } = appDetailsStore.GetAppData(appid);

		showModal(
			<AppGameInfo expand={true} overview={overview} details={details} />,
			this.props.wnd,
		);
	}

	OnGameListChangeEvent(ev: CustomEventInit<GameListChangeEvent>) {
		this.setState({ ...ev.detail });
	}

	componentDidMount() {
		window.addEventListener(k_GameListChangeEventName, (ev) => {
			this.OnGameListChangeEvent(ev);
		});
	}

	// TODO: i bet this doesn't actually work
	componentWillUnmount() {
		window.removeEventListener(k_GameListChangeEventName, (ev) => {
			this.OnGameListChangeEvent(ev);
		});
	}

	render() {
		const { appid } = this.state;
		if (appid === -1) {
			return <RibbonContainer />;
		}

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
				<RibbonSection title="Game">
					<ActionButton wnd={this.props.wnd} appid={appid} />
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
					<FavoriteButton wnd={this.props.wnd} appid={appid} />
				</RibbonSection>
				{links.length > 0 && (
					<RibbonSection title="Links">{links}</RibbonSection>
				)}
			</RibbonContainer>
		);
	}
}
