import { findModuleExport } from "millennium-lib";

export const GetAppMobileCategories: (
	overview: any,
) => Array<"phone" | "tablet"> = findModuleExport((e) =>
	e.toString().includes("of e.store_category"),
);
