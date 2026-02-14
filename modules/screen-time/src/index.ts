import { NativeModule, requireNativeModule } from "expo-modules-core";

declare class ScreenTimeModuleType extends NativeModule {
  requestAuthorization(): Promise<string>;
  getAuthorizationStatus(): Promise<string>;
  showAppPicker(): Promise<boolean>;
  blockSelectedApps(): Promise<boolean>;
  unblockAllApps(): Promise<boolean>;
  getBlockingStatus(): Promise<{
    isBlocking: boolean;
    blockedAppCount: number;
    selectedAppCount: number;
  }>;
  startMonitoring(intervalMinutes: number): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  getMonitoringStatus(): Promise<{
    isMonitoring: boolean;
    intervalMinutes: number;
  }>;
  checkClaudeCodeRunning(): Promise<boolean>;
  setClaudeCodeStatus(isRunning: boolean): Promise<void>;
}

const ScreenTimeModule =
  requireNativeModule<ScreenTimeModuleType>("ScreenTimeModule");

export async function requestAuthorization(): Promise<string> {
  return await ScreenTimeModule.requestAuthorization();
}

export async function getAuthorizationStatus(): Promise<string> {
  return await ScreenTimeModule.getAuthorizationStatus();
}

export async function showAppPicker(): Promise<boolean> {
  return await ScreenTimeModule.showAppPicker();
}

export async function blockSelectedApps(): Promise<boolean> {
  return await ScreenTimeModule.blockSelectedApps();
}

export async function unblockAllApps(): Promise<boolean> {
  return await ScreenTimeModule.unblockAllApps();
}

export async function getBlockingStatus(): Promise<{
  isBlocking: boolean;
  blockedAppCount: number;
  selectedAppCount: number;
}> {
  return await ScreenTimeModule.getBlockingStatus();
}

export async function startMonitoring(
  intervalMinutes: number
): Promise<boolean> {
  return await ScreenTimeModule.startMonitoring(intervalMinutes);
}

export async function stopMonitoring(): Promise<boolean> {
  return await ScreenTimeModule.stopMonitoring();
}

export async function getMonitoringStatus(): Promise<{
  isMonitoring: boolean;
  intervalMinutes: number;
}> {
  return await ScreenTimeModule.getMonitoringStatus();
}

export async function checkClaudeCodeRunning(): Promise<boolean> {
  return await ScreenTimeModule.checkClaudeCodeRunning();
}

export async function setClaudeCodeStatus(isRunning: boolean): Promise<void> {
  return await ScreenTimeModule.setClaudeCodeStatus(isRunning);
}
