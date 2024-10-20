import { cloneElement } from "react";
import { render } from "react-dom";

import * as parts from "./parts";
import { CLog } from "./logger";
import { classes, waitForElement } from "./shared";
import type { SteamPopup } from "./types/sharedjscontext/normal";

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
					normalClassName: "supernav_SuperNav",
					className: classes.supernav.SuperNav,
					component: <parts.SuperNav />,
				},
			],
		},
	];
	for (const { popupName, parts } of components) {
		const onPopupCreated = (popup: SteamPopup) => {
			const doc = popup.m_popup.document;
			const wnd = popup.m_popup;

			for (const token of LOC_TOKENS) {
				const localized = LocalizationManager.LocalizeString(`#${token}`);
				doc.documentElement.style.setProperty(`--${token}`, `'${localized}'`);
			}

			const name = LocalizationManager.LocalizeIfToken(popupName);
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

		const popup = g_PopupManager.GetExistingPopup(popupName);
		if (popup) {
			onPopupCreated(popup);
			continue;
		}

		g_PopupManager.AddPopupCreatedCallback(onPopupCreated);
	}
}
