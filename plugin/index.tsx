import { render } from "react-dom";
import { sleep } from "@steambrew/client";

import * as parts from "./parts";
import { CLog } from "./logger";
import { classes, WaitForElement } from "./shared";
import type { SteamPopup } from "./types/normal";

import { DispatchTabChange } from "./events/tabchange";
import { DispatchGameListChange } from "./events/gamelistchange";

interface ComponentToRender {
	/**
	 * Steam component name whose class names are found in {@link classes}.
	 */
	steamComponent: keyof typeof classes;

	/**
	 * Steam component's class name to use for rendering the plugin component.
	 */
	componentClassName: string;

	/**
	 * The plugin component.
	 */
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

const logger = new CLog("index");
const url = (() => {
	const script = document.querySelector(
		`script[src*="aerothemesteam"]`,
	) as HTMLScriptElement;
	const { href } = new URL(script.src);

	return href.replace(/\.millennium\/Dist\/index.js$/, "");
})();

/**
 * Replacement function to avoid JSON modules because of localization - it's
 * easier to just create 1 file instead of doing the same thing, then typing an
 * import somewhere here, checking if it works, and so on.
 */
const ImportJSON = async (path: string) =>
	(await fetch(`${url}/${path}`)).json();

async function InitLocalization() {
	const lang = await SteamClient.Settings.GetCurrentLanguage();
	const tokens = await ImportJSON(`locales/${lang}.json`).catch(() => {
		logger.Warn("No %o locale, reverting to English", lang);
		return ImportJSON(`locales/english.json`);
	});

	LocalizationManager.AddTokens(tokens);
}

/**
 * Like `CPopupManager.AddPopupCreatedCallback`, but account for existing popups
 * and is specifically for one popup.
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
		if (popup.m_strName !== popupName) {
			return;
		}

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
	const store = uiStore;
	const orig = store.SetGameListSelection;
	const doc = popup.m_popup.document.documentElement;

	store.SetGameListSelection = async function (section: string, appid: number) {
		const app = appStore.GetAppOverviewByAppID(appid);
		const iconFilePath = urlStore.BuildCachedLibraryAssetURL(
			appid,
			`${app.icon_hash}.jpg`,
		);
		const url = app.icon_data
			? `data:image/${app.icon_data_format};base64,${app.icon_data}`
			: iconFilePath;

		DispatchGameListChange(appid);
		doc.style.setProperty("--library_game-icon", `url("${url}")`);
		doc.style.setProperty("--library_game-name", `"${app.display_name}"`);

		return orig.call(this, section, appid);
	};
}

/**
 * Watches for supernav's active tab changes.
 */
async function AddSuperNavEvents(popup: SteamPopup) {
	const doc = popup.m_popup.document;
	const container = await WaitForElement(`.${classes.supernav.SuperNav}`, doc);
	const sel = classes.supernav.Selected;
	const observer = new MutationObserver(() => {
		const children = [...container.children];
		const tab = children.findIndex((e) => e.classList.contains(sel));

		// Account for the browser navigation arrows
		DispatchTabChange(tab - 2);
	});

	observer.observe(container, {
		attributes: true,
		attributeFilter: ["class"],
		subtree: true,
	});
}

export default async function PluginMain() {
	await InitLocalization();
	// Wait until services load to prevent early access to modal manager
	await App.WaitForServicesInitialized();
	// Load(ing!) correctly... no API yet? so go with a global
	globalThis.aerothemesteamPluginLoading = true;
	// TODO: shitty workaround for millennium ui rerender
	await sleep(1_000);

	const components: ComponentForWindow[] = [
		{
			popupName: "#WindowName_SteamDesktop",
			parts: [
				{
					steamComponent: "gamelistbar",
					componentClassName: "Container",
					component: <parts.GameListBar />,
				},
				{
					steamComponent: "steamdesktop",
					componentClassName: "OuterFrame",
					component: <parts.SteamDesktop />,
				},
				{
					steamComponent: "supernav",
					componentClassName: "SuperNav",
					component: <parts.SuperNav />,
				},
				{
					steamComponent: "titlebarcontrols",
					componentClassName: "TitleBarControls",
					component: <parts.TitleBarControls />,
				},
			],
		},
	];
	for (const { popupName, parts } of components) {
		const name = LocalizationManager.LocalizeString(popupName);
		const onPopupCreated = (popup: SteamPopup) => {
			const doc = popup.m_popup.document;

			for (const token of LOC_TOKENS) {
				const localized = LocalizationManager.LocalizeString(`#${token}`);
				doc.documentElement.style.setProperty(`--${token}`, `'${localized}'`);
			}

			if (popup.m_strTitle !== name) {
				return;
			}

			logger.Log("Trying %o for popup %o", popupName, popup.m_strTitle);
			for (const { steamComponent, componentClassName, component } of parts) {
				const className = classes[steamComponent][componentClassName];
				WaitForElement(`.${className}`, doc).then((el) => {
					const div = el.appendChild(doc.createElement("div"));
					div.className = "part";
					// Hide if not themed by anything
					div.style.display = "none";
					render(component, div);

					logger.Log("%s: finished", steamComponent);
				});
			}
		};

		AddPopupCreatedCallback(MAIN_WINDOW_NAME, onPopupCreated);
	}

	AddPopupCreatedCallback(MAIN_WINDOW_NAME, PatchUIStore);
	AddPopupCreatedCallback(MAIN_WINDOW_NAME, AddSuperNavEvents);
}
