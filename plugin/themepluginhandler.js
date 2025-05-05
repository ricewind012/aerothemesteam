const { App, Millennium, MILLENNIUM_API, PLUGIN_LIST, SP_REACT } =
	window.opener;
const { createElement, Fragment } = SP_REACT;
const { ConfirmModal, showModal, sleep } = MILLENNIUM_API;

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
			strTitle: "Plugin is not installed",
			strDescription: createElement(
				Fragment,
				null,
				"The plugin required for the theme to function as intended is not installed. You can install it ",
				createElement("a", { href: PLUGIN_LINK, target: "_blank" }, "here"),
				".",
			),
			strOKButtonText: "Restart",
			onOK: () => {
				RestartJSContext();
			},
		},
		{
			strTitle: "Plugin is not enabled",
			strDescription:
				"The plugin required for the theme to function as intended is not enabled. Enable it now?",
			strOKButtonText: "Enable",
			onOK: async () => {
				plugins[index].enabled = true;
				await CallCorePluginMethod("update_plugin_status", {
					pluginJson: JSON.stringify(plugins),
				});
				RestartJSContext();
			},
		},
		{
			strTitle: "Plugin error",
			strDescription:
				"It seems like the plugin had an error. Would you like to disable the theme?",
			strOKButtonText: "Disable",
			onOK: async () => {
				await CallCorePluginMethod("cfg.change_theme", {
					theme_name: "__default__",
				});
				RestartJSContext();
			},
		},
	];

	const msgIndex = [
		index === -1,
		!plugins[index]?.enabled,
		!PLUGIN_LIST[INTERNAL_PLUGIN_NAME],
	].findIndex(Boolean);
	if (msgIndex === -1) {
		return;
	}

	ShowConfirmDialog(msgs[msgIndex]);
})();
