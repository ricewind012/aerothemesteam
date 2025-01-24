import { IconButton } from "../components/iconbutton";
import { PartComponentBase } from "../shared";

import { Localize } from "../modules/localization";
import { ToolTip } from "../modules/tooltip";

export class TitleBarControls extends PartComponentBase {
	render() {
		const content = Localize("#Menu_Support");
		const url = urlStore.GetHelpURL();
		const onClick = () => {
			SteamClient.System.OpenInSystemBrowser(url);
		};

		return (
			<ToolTip bNavStop={true} direction="bottom" toolTipContent={content}>
				<IconButton name="help" onClick={onClick} />
			</ToolTip>
		);
	}
}
