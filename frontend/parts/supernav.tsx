import { IconButton } from "../components/iconbutton";

export const SuperNav = () => (
	<>
		<IconButton strIconName="some_pc_icon" />
		<IconButton
			strIconName="help"
			onClick={() => {
				const url = urlStore.GetHelpURL();
				SteamClient.System.OpenInSystemBrowser(url);
			}}
		/>
	</>
);
