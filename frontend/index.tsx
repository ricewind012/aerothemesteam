import * as ReactDOM from "react-dom";
import { findModule, Millennium } from "millennium-lib";

import { IconButton } from "./components/iconbutton";
import { CLog } from "./logger";

interface ComponentToRender {
	normalClassName: string;
	className: string;
	component: JSX.Element;
}

interface ComponentForWindow {
	/** Localization token. */
	popupName: string;
	parts: ComponentToRender[];
}

const waitForElement = async (sel, parent = document) =>
	[...(await Millennium.findElement(parent, sel))][0];

export default async function PluginMain() {
	const logger = new CLog("index");
	const classes = {
		supernav: findModule((e) => e.SuperNav),
	};

	const components: ComponentForWindow[] = [
		{
			popupName: "#WindowName_SteamDesktop",
			parts: [
				{
					normalClassName: "supernav_SuperNav",
					className: classes.supernav.SuperNav,
					component: (
						<>
							<IconButton strIconName="some_pc_icon" />
							<IconButton
								strIconName="help"
								onClick={() => {
									const url = urlStore.GetHelpURL();
									SteamClient.System.OpenInSystemBrowser(url);
								}}
							/>
						</>
					),
				},
			],
		},
	];
	for (const { popupName, parts } of components) {
		g_PopupManager.AddPopupCreatedCallback((popup) => {
			const name = LocalizationManager.LocalizeString(popupName);
			if (popup.m_strTitle !== name) {
				return;
			}

			logger.Log("Trying %o for popup %o", popupName, popup.m_strTitle);
			for (const { normalClassName, className, component } of parts) {
				waitForElement(`.${className}`, popup.m_popup.document).then((el) => {
					const div = el.appendChild(document.createElement("div"));
					ReactDOM.render(component, div);
					logger.Log("Got element %o for class %o", el, normalClassName);
				});
			}
		});
	}
}
