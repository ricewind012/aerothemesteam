import { Component } from "react";

import { classes, type PartComponentProps } from "../shared";

import { Localize } from "../modules/localization";

interface GameListBarState {
	text: string;
}

export class GameListBar extends Component<
	PartComponentProps,
	GameListBarState
> {
	observer: MutationObserver;
	state = {
		text: "#Theme_GameListBar_NoFilters",
	};

	componentDidMount() {
		const filterButtonsContainer = this.props.wnd.document.querySelector(
			`.${classes.gamelistdropdown.ViewFiltersBar}`,
		);
		const isButtonSelected = (button: Element) =>
			button?.classList.contains(classes.gamelistdropdown.Active);
		const getButton = (sel: string) =>
			filterButtonsContainer.querySelector(sel)?.parentElement;

		const mutationCallback = () => {
			const linuxButton = getButton(".SVGIcon_LinuxLogo2");
			const recentActivityButton = getButton(".SVGIcon_SortBy");
			const readyToPlayButton = getButton(".SVGIcon_ReadyToPlay");
			const linuxSelected = isButtonSelected(linuxButton);
			const readyToPlaySelected = isButtonSelected(readyToPlayButton);
			const recentActivitySelected = isButtonSelected(recentActivityButton);

			const text = (() => {
				switch (true) {
					case recentActivitySelected && linuxSelected && readyToPlaySelected:
						return "#Theme_GameListBar_SortRecentActivityOnLinuxAndReadyToPlay";
					case recentActivitySelected && linuxSelected:
						return "#Theme_GameListBar_SortRecentActivityOnLinux";
					case recentActivitySelected && readyToPlaySelected:
						return "#Theme_GameListBar_SortRecentActivityReadyToPlay";
					case linuxSelected && readyToPlaySelected:
						return "#Theme_GameListBar_OnlyLinuxAndInstalled";
					case recentActivitySelected:
						return "#Theme_GameListBar_SortRecentActivity";
					case linuxSelected:
						return "#Theme_GameListBar_OnlyLinux";
					case readyToPlaySelected:
						return "#Theme_GameListBar_OnlyReadyToPlay";
					default:
						return "#Theme_GameListBar_NoFilters";
				}
			})();
			this.setState({ text });
		};

		mutationCallback();
		this.observer = new MutationObserver(mutationCallback);
		this.observer.observe(filterButtonsContainer, {
			attributeFilter: ["class"],
			attributes: true,
			subtree: true,
		});
	}

	componentWillUnmount() {
		this.observer.disconnect();
	}

	render() {
		const text = Localize(this.state.text);

		return <div className="game-list-filter-status">{text}</div>;
	}
}
