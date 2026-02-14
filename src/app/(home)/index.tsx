import { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Alert,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import * as AC from "@bacons/apple-colors";
import StatusCard from "@/components/status-card";
import ActionButton from "@/components/action-button";
import SectionHeader from "@/components/section-header";
import { useScreenTime } from "@/hooks/use-screen-time";

export default function DashboardRoute() {
  const {
    authStatus,
    blockingStatus,
    monitoringStatus,
    isClaudeRunning,
    loading,
    isAvailable,
    requestAuth,
    selectApps,
    blockApps,
    unblockApps,
    startMonitoring,
    stopMonitoring,
    setClaudeStatus,
    refresh,
  } = useScreenTime();

  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleAction = useCallback(
    async (key: string, action: () => Promise<any>) => {
      setActionLoading(key);
      try {
        await action();
      } catch (e: any) {
        Alert.alert("Error", e.message ?? "Something went wrong");
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const isAuthorized = authStatus === "approved";
  const hasSelectedApps = blockingStatus.selectedAppCount > 0;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}
    >
      {/* Hero Status */}
      <View
        style={{
          alignItems: "center",
          paddingVertical: 24,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: (
              blockingStatus.isBlocking ? AC.systemRed : isClaudeRunning ? AC.systemGreen : AC.systemOrange
            ) as any,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 20px ${
              blockingStatus.isBlocking
                ? "rgba(255,59,48,0.3)"
                : isClaudeRunning
                  ? "rgba(52,199,89,0.3)"
                  : "rgba(255,149,0,0.3)"
            }`,
          }}
        >
          {process.env.EXPO_OS === "ios" ? (
            <Image
              source={
                blockingStatus.isBlocking
                  ? "sf:shield.slash.fill"
                  : "sf:shield.checkered"
              }
              style={{ fontSize: 36, color: "white" } as any}
            />
          ) : (
            <Text style={{ fontSize: 36 }}>
              {blockingStatus.isBlocking ? "🛡️" : "✅"}
            </Text>
          )}
        </View>
        <Text
          selectable
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: AC.label as any,
          }}
        >
          {blockingStatus.isBlocking
            ? "Apps Blocked"
            : isClaudeRunning
              ? "Apps Unblocked"
              : "Standby"}
        </Text>
        <Text
          selectable
          style={{
            fontSize: 15,
            color: AC.secondaryLabel as any,
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          {blockingStatus.isBlocking
            ? `${blockingStatus.blockedAppCount} app${blockingStatus.blockedAppCount !== 1 ? "s" : ""} blocked. Open Claude Code to unblock.`
            : isClaudeRunning
              ? "Claude Code is running. All apps are accessible."
              : "Configure apps to block when Claude Code isn't running."}
        </Text>
      </View>

      {/* Status Cards */}
      <View style={{ gap: 8 }}>
        <SectionHeader title="Status" />
        <View style={{ gap: 10 }}>
          <StatusCard
            title="Screen Time"
            subtitle={
              !isAvailable
                ? "Not available on this device"
                : isAuthorized
                  ? "Authorized"
                  : "Tap to authorize"
            }
            icon="shield.lefthalf.filled"
            iconColor={AC.systemBlue as string}
            status={!isAvailable ? "warning" : isAuthorized ? "active" : "inactive"}
            onPress={
              !isAvailable || isAuthorized
                ? undefined
                : () => handleAction("auth", requestAuth)
            }
          />
          <StatusCard
            title="Claude Code"
            subtitle={isClaudeRunning ? "Running" : "Not detected"}
            icon="terminal.fill"
            iconColor={AC.systemPurple as string}
            status={isClaudeRunning ? "active" : "inactive"}
          />
          <StatusCard
            title="Monitoring"
            subtitle={
              monitoringStatus.isMonitoring
                ? `Checking every ${monitoringStatus.intervalMinutes}min`
                : "Inactive"
            }
            icon="clock.arrow.circlepath"
            iconColor={AC.systemOrange as string}
            status={monitoringStatus.isMonitoring ? "active" : "inactive"}
          />
        </View>
      </View>

      {/* Actions */}
      {isAvailable && (
        <View style={{ gap: 8 }}>
          <SectionHeader
            title="Actions"
            subtitle={
              !isAuthorized
                ? "Authorize Screen Time first"
                : undefined
            }
          />
          <View style={{ gap: 10 }}>
            {!isAuthorized ? (
              <ActionButton
                title="Authorize Screen Time"
                onPress={() => handleAction("auth", requestAuth)}
                loading={actionLoading === "auth"}
              />
            ) : (
              <>
                <ActionButton
                  title={
                    hasSelectedApps
                      ? `Change Apps (${blockingStatus.selectedAppCount} selected)`
                      : "Select Apps to Block"
                  }
                  onPress={() => handleAction("pick", selectApps)}
                  loading={actionLoading === "pick"}
                  variant="primary"
                />

                {hasSelectedApps && !blockingStatus.isBlocking && (
                  <ActionButton
                    title="Block Selected Apps Now"
                    onPress={() => handleAction("block", blockApps)}
                    loading={actionLoading === "block"}
                    variant="destructive"
                  />
                )}

                {blockingStatus.isBlocking && (
                  <ActionButton
                    title="Unblock All Apps"
                    onPress={() => handleAction("unblock", unblockApps)}
                    loading={actionLoading === "unblock"}
                    variant="secondary"
                  />
                )}

                {hasSelectedApps && (
                  <>
                    {!monitoringStatus.isMonitoring ? (
                      <ActionButton
                        title="Start Auto-Monitoring"
                        onPress={() =>
                          handleAction("monitor", () => startMonitoring(5))
                        }
                        loading={actionLoading === "monitor"}
                        variant="secondary"
                      />
                    ) : (
                      <ActionButton
                        title="Stop Monitoring"
                        onPress={() =>
                          handleAction("stopMonitor", stopMonitoring)
                        }
                        loading={actionLoading === "stopMonitor"}
                        variant="secondary"
                      />
                    )}
                  </>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* Simulate Claude Code toggle (for testing) */}
      <View style={{ gap: 8 }}>
        <SectionHeader
          title="Debug"
          subtitle="Simulate Claude Code status for testing"
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <ActionButton
              title="Claude: ON"
              onPress={() => handleAction("claude-on", () => setClaudeStatus(true))}
              loading={actionLoading === "claude-on"}
              variant={isClaudeRunning ? "primary" : "secondary"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ActionButton
              title="Claude: OFF"
              onPress={() =>
                handleAction("claude-off", () => setClaudeStatus(false))
              }
              loading={actionLoading === "claude-off"}
              variant={!isClaudeRunning ? "destructive" : "secondary"}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
