import { Component } from "react";

import { IconButton } from "@/components/iconbutton";
import { Localize } from "@/modules/localization";
import { ToolTip } from "@/modules/tooltip";

export class TitleBarControls extends Component {
	override render() {
		const text = Localize("#Menu_Support");
		const url = urlStore.GetHelpURL();
		const onClick = () => {
			SteamClient.System.OpenInSystemBrowser(url);
		};

		return (
			<ToolTip direction="bottom" toolTipContent={text}>
				<IconButton name="help" onClick={onClick} />
			</ToolTip>
		);
	}
}
