import { useState, useEffect, useCallback } from "react";

// Dynamic import that resolves to the native module on iOS,
// or a mock on other platforms.
const isNative = process.env.EXPO_OS === "ios";

type BlockingStatus = {
  isBlocking: boolean;
  blockedAppCount: number;
  selectedAppCount: number;
};

type MonitoringStatus = {
  isMonitoring: boolean;
  intervalMinutes: number;
};

type ScreenTimeState = {
  authStatus: string;
  blockingStatus: BlockingStatus;
  monitoringStatus: MonitoringStatus;
  isClaudeRunning: boolean;
  loading: boolean;
};

const defaultState: ScreenTimeState = {
  authStatus: "notDetermined",
  blockingStatus: {
    isBlocking: false,
    blockedAppCount: 0,
    selectedAppCount: 0,
  },
  monitoringStatus: { isMonitoring: false, intervalMinutes: 5 },
  isClaudeRunning: false,
  loading: true,
};

let ScreenTime: typeof import("../../modules/screen-time/src") | null = null;

if (isNative) {
  try {
    ScreenTime = require("../../modules/screen-time/src");
  } catch {
    ScreenTime = null;
  }
}

export function useScreenTime() {
  const [state, setState] = useState<ScreenTimeState>(defaultState);

  const refresh = useCallback(async () => {
    if (!ScreenTime) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    try {
      const [authStatus, blockingStatus, monitoringStatus, isClaudeRunning] =
        await Promise.all([
          ScreenTime.getAuthorizationStatus(),
          ScreenTime.getBlockingStatus(),
          ScreenTime.getMonitoringStatus(),
          ScreenTime.checkClaudeCodeRunning(),
        ]);

      setState({
        authStatus,
        blockingStatus,
        monitoringStatus,
        isClaudeRunning,
        loading: false,
      });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
    // Poll every 5 seconds to keep UI in sync
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const requestAuth = useCallback(async () => {
    if (!ScreenTime) return "unsupported";
    const result = await ScreenTime.requestAuthorization();
    await refresh();
    return result;
  }, [refresh]);

  const selectApps = useCallback(async () => {
    if (!ScreenTime) return false;
    const result = await ScreenTime.showAppPicker();
    // Wait a moment for the picker to close, then refresh
    setTimeout(refresh, 1000);
    return result;
  }, [refresh]);

  const blockApps = useCallback(async () => {
    if (!ScreenTime) return false;
    const result = await ScreenTime.blockSelectedApps();
    await refresh();
    return result;
  }, [refresh]);

  const unblockApps = useCallback(async () => {
    if (!ScreenTime) return false;
    const result = await ScreenTime.unblockAllApps();
    await refresh();
    return result;
  }, [refresh]);

  const startMonitoring = useCallback(
    async (intervalMinutes = 5) => {
      if (!ScreenTime) return false;
      const result = await ScreenTime.startMonitoring(intervalMinutes);
      await refresh();
      return result;
    },
    [refresh]
  );

  const stopMonitoring = useCallback(async () => {
    if (!ScreenTime) return false;
    const result = await ScreenTime.stopMonitoring();
    await refresh();
    return result;
  }, [refresh]);

  const setClaudeStatus = useCallback(
    async (isRunning: boolean) => {
      if (!ScreenTime) return;
      await ScreenTime.setClaudeCodeStatus(isRunning);
      await refresh();
    },
    [refresh]
  );

  return {
    ...state,
    isAvailable: isNative && ScreenTime !== null,
    requestAuth,
    selectApps,
    blockApps,
    unblockApps,
    startMonitoring,
    stopMonitoring,
    setClaudeStatus,
    refresh,
  };
}
