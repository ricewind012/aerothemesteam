import type { FC } from "react";

import { FindModuleExportByString } from "@/shared";

interface AppGameInfoProps {
	collapsible?: boolean;
	expand?: boolean;
	suppressTransition?: boolean;

	// content component props
	/** Compact info. */
	concise?: boolean;
	delayLoad?: boolean;
	details: any;
	overview: any;
}

export const AppGameInfo: FC<AppGameInfoProps> =
	FindModuleExportByString("gameInfoHeight");
