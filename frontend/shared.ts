import { findClassModule, Millennium, type ClassModule } from "millennium-lib";
import { Component } from "react";

export interface PartComponentProps {
	wnd: Window;
}

// biome-ignore lint/complexity/noBannedTypes: KILL YOURSELF
export class PartComponentBase<S = {}, P = {}> extends Component<
	PartComponentProps & P,
	S
> {}

export const classes = {
	appactionbutton: findClassModule(
		(e) => e.StreamingContextMenuItem,
	) as ClassModule,
	gamelistbar: findClassModule((e) => e.GameListHomeAndSearch) as ClassModule,
	gamelistdropdown: findClassModule((e) => e.ScrollToTop) as ClassModule,
	steamdesktop: findClassModule((e) => e.FocusBar) as ClassModule,
	titlebarcontrols: findClassModule((e) => e.BranchBar) as ClassModule,
};

export const BuildClassName = (vecClasses: string[]) =>
	vecClasses.filter(Boolean).join(" ");
export const waitForElement = async (sel: string, parent = document) =>
	[...(await Millennium.findElement(parent, sel))][0];
