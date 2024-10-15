import { Component } from "react";

import { classes, type PartComponentProps } from "../shared";

interface GameListBarState {
	text: string;
}

export class GameListBar extends Component<
	PartComponentProps,
	GameListBarState
> {
	observer: MutationObserver;
	state = {
		text: "No filters",
	};

	componentDidMount() {
		const filterButtonsContainer = this.props.wnd.document.querySelector(
			`.${classes.gamelistdropdown.ViewFiltersBar}`,
		);
		const isButtonSelected = (button: Element) =>
			button.classList.contains(classes.gamelistdropdown.Active);
		const getButton = (sel: string) =>
			filterButtonsContainer.querySelector(sel)?.parentElement;

		const mutationCallback = () => {
			const linuxButton = getButton(".SVGIcon_LinuxLogo2");
			const recentActivityButton = getButton(".SVGIcon_SortBy");
			const readyToPlayButton = getButton(".SVGIcon_ReadyToPlay");
			const linuxSelected = isButtonSelected(linuxButton);
			const readyToPlaySelected = isButtonSelected(readyToPlayButton);

			// pls
			let text = "No filters";
			if (readyToPlaySelected) text = "Showing only Ready to Play games";
			if (linuxSelected) {
				text = "Showing only Linux-ready games";
				if (readyToPlaySelected) text = "Showing installed Linux-ready games";
			}
			if (isButtonSelected(recentActivityButton)) {
				text = "Sorting games by recent activity";

				if (linuxSelected) {
					text += " that run on Linux";
					if (readyToPlaySelected) text += " and Ready to Play";
				} else if (readyToPlaySelected) text += " that are Ready to Play";
			}
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
		return <div className="game-list-filter-status">{this.state.text}</div>;
	}
}
