const { App, Millennium, MILLENNIUM_API, SP_REACT } = window.opener;
const { createElement, Fragment } = SP_REACT;
const { ConfirmModal, showModal } = MILLENNIUM_API;

const INTERNAL_PLUGIN_NAME = "aerothemesteam_plugin";
const PLUGIN_LINK = "https://steambrew.app/plugin?id=dc691b7d877b";

/**
 * @param {string} method
 * @param {Record<string, string>} kwargs
 */
function CallCorePluginMethod(method, kwargs) {
	return Millennium.callServerMethod("core", method, kwargs);
}

function RestartJSContext() {
	SteamClient.Browser.RestartJSContext();
}

function Link(props) {
	const { href, text } = props;
	const target = href.startsWith("https://") ? "_blank" : "";

	return createElement("a", { href, target }, text);
}

/**
 * @note Text is not localized in case of a plugin error and duplicating code
 * @param {import("@steambrew/client").ConfirmModalProps} props
 */
function ShowConfirmDialog(props) {
	showModal(createElement(ConfirmModal, props), window, {
		strTitle: props.strTitle,
	});
}

/**
 * This file handles the plugin installation making it easier to find, install
 * and enable, since people won't ever learn to read. You can't access
 * Millennium settings without the plugin for now anyway.
 *
 * Runs on the main window as themes can't(?) inject into SharedJSContext.
 */
(async () => {
	// Wait for complete app startup to prevent early access to modal manager
	await App.WaitForServicesInitialized();

	// FIX your shit
	const plugins = JSON.parse(
		await CallCorePluginMethod("find_all_plugins"),
	).map((e) => ({ ...e, plugin_name: e.data.name }));
	const index = plugins.findIndex((e) => e.data.name === INTERNAL_PLUGIN_NAME);

	/** @type {import("@steambrew/client").ConfirmModalProps[]} */
	const msgs = [
		{
			onOK: () => {
				RestartJSContext();
			},
			strDescription: createElement(
				Fragment,
				null,
				"The plugin required for the theme to function as intended is not installed. You can install it ",
				Link({ href: PLUGIN_LINK, text: "here" }),
				". ",
				createElement("br", null),
				Link({
					href: "steam://millennium/settings/plugins",
					text: "Go to Millennium plugins",
				}),
			),
			strOKButtonText: "Restart",
			strTitle: "Plugin is not installed",
		},
		{
			onOK: async () => {
				plugins[index].enabled = true;
				await CallCorePluginMethod("ChangePluginStatus", {
					pluginJson: JSON.stringify(plugins),
				});
				RestartJSContext();
			},
			strDescription:
				"The plugin required for the theme to function as intended is not enabled. Enable it now?",
			strOKButtonText: "Enable",
			strTitle: "Plugin is not enabled",
		},
		{
			onOK: async () => {
				await CallCorePluginMethod("theme_config.change_theme", {
					theme_name: "default",
				});
				RestartJSContext();
			},
			strDescription:
				"It seems like the plugin had an error. Would you like to disable the theme?",
			strOKButtonText: "Disable",
			strTitle: "Plugin error",
		},
	];

	const msgIndex = [
		index === -1,
		!plugins[index]?.enabled,
		index !== -1 && !globalThis.opener.aerothemesteamPluginLoading,
	].findIndex(Boolean);
	if (msgIndex === -1) {
		return;
	}

	ShowConfirmDialog(msgs[msgIndex]);
})();
