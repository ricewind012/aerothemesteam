import { findModuleExport } from "@steambrew/client";

interface KioskModeManager {
	m_bLocked: boolean;
	m_bEnabledForLocalTesting: boolean;

	BKioskModeEnabled(): boolean;
	BKioskModeLocked(): boolean;
	BKioskModeUnlock(): boolean;
	BHasKioskModeFeatureBlock(): boolean;
	BHasKioskModeRouteBlock(): boolean;
	KioskModeLock(): void;
}

export const CKioskModeManager: KioskModeManager = findModuleExport(
	(e) => e.BKioskModeLocked,
);
