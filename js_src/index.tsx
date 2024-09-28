import "./globals.js";
import { IconButton } from "./components/iconbutton.js";
import { CLog } from "./logger.js";

// TODO: refactor to use SharedJSContext

interface ComponentToRender {
	normalClassName: string;
	className: string;
	component: JSX.Element;
}

const { SteamClient: SteamClient_Main, urlStore } = window.opener;

function waitForElement(selector: string, parent = document): Promise<Element> {
	return new Promise((resolve) => {
		const el = parent.querySelector(selector);
		if (el) {
			resolve(el);
		}

		const observer = new MutationObserver(() => {
			const el = parent.querySelector(selector);
			if (!el) {
				return;
			}

			resolve(el);
			observer.disconnect();
		});

		observer.observe(document.body, {
			subtree: true,
			childList: true,
		});
	});
}

const { Log } = new CLog("index");
// trying not to use steam's shit, so use the class map instead
const classes = JSON.parse(
	await (
		await fetch(
			"https://steamloopback.host/skins/aerothemesteam/class_map.json",
		)
	).text(),
);

const components: ComponentToRender[] = [
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
						SteamClient_Main.System.OpenInSystemBrowser(url);
					}}
				/>
			</>
		),
	},
];
for (const { normalClassName, className, component } of components) {
	const el = await waitForElement(`.${className}`);
	const div = el.appendChild(document.createElement("div"));

	// @ts-ignore ts(2686) because ts is retarded
	ReactDOM.render(component, div);
	Log("Got element %o for class %o", el, normalClassName);
}
