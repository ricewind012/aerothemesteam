import {
	type ClassModule,
	findClassModule,
	Millennium,
} from "@steambrew/client";

export const classes = {
	appactionbutton: findClassModule(
		(e) => e.StreamingContextMenuItem,
	) as ClassModule,
	gamelistbar: findClassModule((e) => e.GameListHomeAndSearch) as ClassModule,
	gamelistdropdown: findClassModule((e) => e.ScrollToTop) as ClassModule,
	jumplist: findClassModule((e) => e.JumpListItemText) as ClassModule,
	menu: findClassModule((e) => e.MenuWrapper) as ClassModule,
	steamdesktop: findClassModule((e) => e.FocusBar) as ClassModule,
	supernav: findClassModule((e) => e.SuperNav) as ClassModule,
	titlebarcontrols: findClassModule((e) => e.BranchBar) as ClassModule,
};

export const BuildClassName = (vecClasses: string[]) =>
	vecClasses.filter(Boolean).join(" ");

export const GetMainPopupWindow = () =>
	g_PopupManager.GetExistingPopup("SP Desktop_uid0").m_popup;

export const WaitForElement = async (sel: string, parent = document) =>
	[...(await Millennium.findElement(parent, sel))][0];
