import { findModule, Millennium } from "millennium-lib";

export interface PartComponentProps {
	wnd: Window;
}

export const classes = {
	gamelistbar: findModule((e) => e.GameListHomeAndSearch),
	gamelistdropdown: findModule((e) => e.ScrollToTop),
	supernav: findModule((e) => e.SuperNav),
};

export const waitForElement = async (sel: string, parent = document) =>
	[...(await Millennium.findElement(parent, sel))][0];
