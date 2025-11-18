import { RibbonButton, RibbonGameSectionButton } from "@/components/ribbon";

interface FavoriteButtonState {
	text: string;
}

// TODO: its text doesn't update... but ActionButton does
export class FavoriteButton extends RibbonGameSectionButton<FavoriteButtonState> {
	state: FavoriteButtonState = {
		text: "#GameAction_AddToFavorites",
	};

	BIsFavorite() {
		const { appid } = this.props;
		return collectionStore.BIsFavorite(appid);
	}

	ToggleAppFavorite() {
		const { appid } = this.props;
		const favorite = this.BIsFavorite();

		collectionStore.SetAppsAsFavorite([appid], !favorite);
	}

	SetFavorite() {
		const favorite = this.BIsFavorite();
		const text = favorite
			? "#GameAction_RemoveFromFavorites"
			: "#GameAction_AddToFavorites";

		this.setState({ text });
	}

	OnClick() {
		this.ToggleAppFavorite();
		this.SetFavorite();
	}

	override componentDidMount() {
		this.SetFavorite();
	}

	override render() {
		const { text } = this.state;

		return (
			<RibbonButton icon="star" text={text} onClick={() => this.OnClick()} />
		);
	}
}
