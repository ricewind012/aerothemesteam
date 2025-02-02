export const GAME_LIST_CHANGE_EVENT_NAME = "game-list-change";

export interface GameListChangeEvent {
	appid: number;
}

export function DispatchGameListChange(appid: number) {
	const ev = new CustomEvent<GameListChangeEvent>(GAME_LIST_CHANGE_EVENT_NAME, {
		detail: { appid },
	});
	window.dispatchEvent(ev);
}
