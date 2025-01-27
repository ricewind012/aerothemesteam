import { findModuleExport } from "@steambrew/client";
import type { FC } from "react";

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

export const AppGameInfo: FC<AppGameInfoProps> = findModuleExport((e) =>
	e.toString().includes("gameInfoHeight"),
);
