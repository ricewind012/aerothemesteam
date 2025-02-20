import { showContextMenu, sleep } from "@steambrew/client";

import { RibbonButton, RibbonGameSectionButton } from "../../components/ribbon";
import { classes, GetMainPopupWindow } from "../../shared";

import {
	GetAppAction,
	GetCallbackForAppAction,
	type AppAction_t,
} from "../../modules/appactions";
import { Config } from "../../modules/config";
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuSeparator,
} from "../../modules/contextmenu";
import { CheckIcon } from "../../modules/icons";
import { Localize } from "../../modules/localization";
import { GetAppMobileCategories } from "../../modules/remoteplay";

type MobileCategory_t = "generic" | "mobile" | "phone" | "tablet" | "tv";

const k_ELaunchSource_2ftLibraryDetails = 100;

const mapCategoryLocTokens: Record<MobileCategory_t, string[]> = {
	generic: [
		"#StreamingClient_AnotherDevice",
		"#StreamingClient_LinkDesc_Generic",
	],
	phone: ["#StreamingClient_Phone", "#StreamingClient_LinkDesc_Specific_Phone"],
	tablet: [
		"#StreamingClient_TabletDevice",
		"#StreamingClient_LinkDesc_Specific_Tablet",
	],
	tv: ["#StreamingClient_TV", "#StreamingClient_LinkDesc_Specific_TV"],
	mobile: [
		"#StreamingClient_MobileDevice",
		"#StreamingClient_LinkDesc_Specific_Mobile",
	],
};

function StreamingContextMenu({ overview, onStreamingTargetSelected }) {
	const bInGamepadUI = Config.IN_GAMEPADUI;
	const bHasMobileCategories =
		!bInGamepadUI && GetAppMobileCategories(overview).length > 0;
	const onRemotePlayItemSelected = () => {
		MainWindowBrowserManager.ShowURL(
			`${Config.STORE_BASE_URL}remoteplay#anywhere_how`,
		);
	};

	return (
		<>
			<ContextMenu>
				{overview.per_client_data.map((e) => (
					<StreamingClientContextMenuItem
						key={e.clientid}
						pClient={e}
						bIsLocalClient={overview.BIsPerClientDataLocal(e)}
						bSelected={overview.selected_clientid === e.clientid}
						onSelected={(t) => onStreamingTargetSelected(e, t)}
					/>
				))}
			</ContextMenu>
			{bHasMobileCategories && (
				<div>
					<ContextMenuSeparator />
					<RemotePlayAnywhereContextMenuItem
						overview={overview}
						onSelected={onRemotePlayItemSelected}
					/>
				</div>
			)}
		</>
	);
}

function StreamingClientContextMenuItem({
	pClient,
	bIsLocalClient,
	bSelected,
	onSelected,
}) {
	let text = Localize("#StreamingClient_StreamFrom", pClient.client_name);
	if (bIsLocalClient) {
		text = Config.ON_DECK
			? Localize("#StreamingClient_Select_ThisSteamDeck")
			: Localize("#StreamingClient_Select_ThisMachine");
	}

	return (
		<StreamingContextMenuItem onSelected={onSelected}>
			<>
				{bSelected && <CheckIcon />} {text}
			</>
		</StreamingContextMenuItem>
	);
}

const StreamingContextMenuItem = (props) => (
	<ContextMenuItem
		{...props}
		className={classes.appactionbutton.StreamingContextMenuItem}
	/>
);

function RemotePlayAnywhereContextMenuItem({ overview, onSelected }) {
	const vecCategories = GetAppMobileCategories(overview);
	if (vecCategories.length === 0) {
		return null;
	}

	const eCategory: MobileCategory_t = (() => {
		switch (vecCategories.length) {
			case 1:
				return vecCategories[0];
			case 2:
				return "mobile";
			default:
				return "generic";
		}
	})();
	const [strDeviceToken, strLinkDescToken] = mapCategoryLocTokens[eCategory];
	const strDevice = Localize(strDeviceToken);
	const strLinkDesc = Localize(strLinkDescToken);

	return (
		<StreamingContextMenuItem onSelected={onSelected}>
			<div>
				<div>{strDevice}</div>
				<div className={classes.appactionbutton.RemotePlayAnywhereDescription}>
					{strLinkDesc}
				</div>
			</div>
		</StreamingContextMenuItem>
	);
}

interface ActionButtonState {
	action: AppAction_t;
	icon: string;
}

export class ActionButton extends RibbonGameSectionButton<ActionButtonState> {
	/** ref */
	m_elButton: HTMLElement | null;
	state: ActionButtonState = {
		action: "Play",
		icon: "play",
	};

	GetAppAction() {
		return GetAppAction(
			SteamUIStore.ActiveWindowInstance,
			this.GetAppOverview(),
			"selected",
		);
	}

	GetAppOverview() {
		const { appid } = this.props;
		return appStore.GetAppOverviewByAppID(appid);
	}

	GetIcon(eAction: AppAction_t) {
		switch (eAction) {
			case "Cancel":
			case "Pause":
			case "Stop":
				return "cancel";
			case "Download":
			case "Install":
				return "download";
			case "Play":
			case "Launch":
			case "Stream":
			case "Connect":
				return "play";
			case "Update":
				return "update";
		}
	}

	GetLocToken() {
		const eAction = this.GetAppAction();
		return `#GameAction_${eAction}`;
	}

	SetState() {
		const action = this.GetAppAction();
		const icon = this.GetIcon(action);

		this.setState({ action, icon });
	}

	/**
	 * @todo Need a better way, but this works well enough, fuck you
	 */
	async OnGameAction() {
		await sleep(250);

		this.SetState();
	}

	OnStreamingTargetSelected(client) {
		const { appid } = this.props;

		SteamClient.Apps.SetStreamingClientForApp(appid, client.clientid);
	}

	OnArrowClick() {
		const overview = this.GetAppOverview();

		if (!this.m_elButton) {
			const wnd = GetMainPopupWindow();
			const strElementID = this.GetLocToken().replace("#", "");

			this.m_elButton = wnd.document.getElementById(strElementID);
		}

		showContextMenu(
			<StreamingContextMenu
				overview={overview}
				onStreamingTargetSelected={(e) => this.OnStreamingTargetSelected(e)}
			/>,
			this.m_elButton,
			// @ts-ignore
			{
				bOverlapHorizontal: true,
			},
		);
	}

	onClick() {
		const overview = this.GetAppOverview();
		const callback = GetCallbackForAppAction(
			this.GetAppAction(),
			overview,
			"selected",
			k_ELaunchSource_2ftLibraryDetails,
		);

		callback();
		this.SetState();
	}

	componentDidMount() {
		this.SetState();
		SteamClient.Apps.RegisterForGameActionStart(() => this.OnGameAction());
		SteamClient.Apps.RegisterForGameActionEnd(() => this.OnGameAction());
	}

	render() {
		const eAction = this.GetAppAction();
		const icon = this.GetIcon(eAction);
		const strToken = this.GetLocToken();

		return (
			<RibbonButton
				disabled={!eAction}
				icon={icon}
				text={strToken}
				vertical
				onClick={() => this.onClick()}
				onArrowClick={() => this.OnArrowClick()}
			/>
		);
	}
}
