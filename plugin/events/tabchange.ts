export const TAB_CHANGE_EVENT_NAME = "tab-change";

export enum ESuperNavTab {
	Store,
	Library,
	Community,
	Profile,
	Console,
	Max,
}

export interface TabChangeEvent {
	tab: ESuperNavTab;
}

export function DispatchTabChange(tab: ESuperNavTab) {
	const ev = new CustomEvent<TabChangeEvent>(TAB_CHANGE_EVENT_NAME, {
		detail: { tab },
	});
	window.dispatchEvent(ev);
}

type ClientTabSetting_t =
	| "store"
	| "news"
	| "library"
	| "community"
	| "friendactivity"
	| "profile"
	| "console";

export function GetESuperNavTabFromSetting(tab: ClientTabSetting_t) {
	switch (tab) {
		case "store":
		case "news":
			return ESuperNavTab.Store;
		case "library":
			return ESuperNavTab.Library;
		case "community":
		case "friendactivity":
			return ESuperNavTab.Community;
		case "profile":
			return ESuperNavTab.Profile;
		case "console":
			return ESuperNavTab.Console;
	}
}
