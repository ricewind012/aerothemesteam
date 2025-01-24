import { cloneElement } from "react";
import { render } from "react-dom";

import * as parts from "./parts";
import { CLog } from "./logger";
import { classes, waitForElement } from "./shared";
import type { SteamPopup } from "./types/sharedjscontext/normal";
import type { GameListChangeEvent } from "./gamelistchangeevent";

declare global {
	const appStore: any;
	const appDetailsStore: any;
	const badgeStore: any;
	const collectionStore: any;
	const MainWindowBrowserManager: any;
	const SteamUIStore: any;
	const StoreItemCache: any;
	const uiStore: any;
	const urlStore: any;
}

interface ComponentToRender {
	normalClassName: string;
	className: string;
	component: JSX.Element;
}

interface ComponentForWindow {
	/** Popup title. */
	popupName: string;
	parts: ComponentToRender[];
}

/** Localization tokens to add for each window. */
const LOC_TOKENS = ["GameList_View_Collections"];

/** Internal main window name. */
const MAIN_WINDOW_NAME = "SP Desktop_uid0";

/**
 * Safe version of `CPopupManager.AddPopupCreatedCallback`.
 */
function AddPopupCreatedCallback(
	popupName: string,
	callback: (popup: SteamPopup) => void,
) {
	const popup = g_PopupManager.GetExistingPopup(popupName);
	if (popup) {
		callback(popup);
		return;
	}

	g_PopupManager.AddPopupCreatedCallback((popup) => {
		callback(popup);

		// Only apply once
		g_PopupManager.m_rgPopupCreatedCallbacks =
			g_PopupManager.m_rgPopupCreatedCallbacks.filter((e) => e !== callback);
	});
}

/**
 * Intercepts the function that's called upon a selected game change in the library.
 */
function PatchUIStore(popup: SteamPopup) {
	if (popup.m_strName !== MAIN_WINDOW_NAME) {
		return;
	}

	const store = uiStore;
	const orig = store.SetGameListSelection;
	const logger = new CLog("PatchUIStore");
	const doc = popup.m_popup.document.documentElement;

	store.SetGameListSelection = async function (section: string, appId: number) {
		const ev = new CustomEvent<GameListChangeEvent>("game-list-change", {
			detail: { appid: appId },
		});
		window.dispatchEvent(ev);

		const app = appStore.GetAppOverviewByAppID(appId);
		const iconFilePath = urlStore.BuildCachedLibraryAssetURL(
			appId,
			`${app.icon_hash}.jpg`,
		);
		const url = app.icon_data
			? `data:image/${app.icon_data_format};base64,${app.icon_data}`
			: iconFilePath;

		doc.style.setProperty("--library_game-icon", `url("${url}")`);
		doc.style.setProperty("--library_game-name", `"${app.display_name}"`);
		logger.Log("Called CUIStore.SetGameListSelection(%o, %s)", section, appId);

		return orig.call(this, section, appId);
	};
}

export default async function PluginMain() {
	const logger = new CLog("index");

	const components: ComponentForWindow[] = [
		{
			popupName: "#WindowName_SteamDesktop",
			parts: [
				{
					normalClassName: "gamelistbar_Container",
					className: classes.gamelistbar.Container,
					// @ts-ignore fuck off
					component: <parts.GameListBar />,
				},
				{
					normalClassName: "steamdesktop_OuterFrame",
					className: classes.steamdesktop.OuterFrame,
					// @ts-ignore fuck off
					component: <parts.SteamDesktop />,
				},
				{
					normalClassName: "titlebarcontrols_TitleBarControls",
					className: classes.titlebarcontrols.TitleBarControls,
					// @ts-ignore fuck off
					component: <parts.TitleBarControls />,
				},
			],
		},
	];
	for (const { popupName, parts } of components) {
		const name = LocalizationManager.LocalizeString(popupName);
		const onPopupCreated = (popup: SteamPopup) => {
			const doc = popup.m_popup.document;
			const wnd = popup.m_popup;

			for (const token of LOC_TOKENS) {
				const localized = LocalizationManager.LocalizeString(`#${token}`);
				doc.documentElement.style.setProperty(`--${token}`, `'${localized}'`);
			}

			if (popup.m_strTitle !== name) {
				return;
			}

			logger.Log("Trying %o for popup %o", popupName, popup.m_strTitle);
			for (const { normalClassName, className, component } of parts) {
				waitForElement(`.${className}`, doc).then((el) => {
					const div = el.appendChild(doc.createElement("div"));
					// Some props aren't defined yet, so clone the element
					const clonedComponent = cloneElement(component, { wnd });

					div.className = "part";
					render(clonedComponent, div);
					logger.Log("%s: finished", normalClassName);
				});
			}
		};

		AddPopupCreatedCallback(MAIN_WINDOW_NAME, onPopupCreated);
	}

	AddPopupCreatedCallback(MAIN_WINDOW_NAME, PatchUIStore);
}
