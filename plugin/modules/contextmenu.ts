import type { FC, PropsWithChildren } from "react";

import { FindModuleExportByString } from "@/shared";

interface MenuGroupProps extends PropsWithChildren {
	label: string;
	disabled?: boolean;
}

export const MenuGroup: FC<MenuGroupProps> =
	FindModuleExportByString("...e,bInGamepadUI:");
