export const k_strGameListChangeEventName = "game-list-change";

export interface GameListChangeEvent {
	appid: number;
}

export function DispatchGameListChange(appid: number) {
	const ev = new CustomEvent<GameListChangeEvent>(
		k_strGameListChangeEventName,
		{
			detail: { appid },
		},
	);
	window.dispatchEvent(ev);
}
