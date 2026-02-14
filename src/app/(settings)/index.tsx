import { ScrollView, View, Text, Switch, Alert } from "react-native";
import * as AC from "@bacons/apple-colors";
import { Image } from "expo-image";
import SectionHeader from "@/components/section-header";
import InfoRow from "@/components/info-row";
import ActionButton from "@/components/action-button";
import { useScreenTime } from "@/hooks/use-screen-time";
import { useState, useCallback } from "react";

export default function SettingsRoute() {
  const {
    authStatus,
    blockingStatus,
    monitoringStatus,
    isClaudeRunning,
    isAvailable,
    startMonitoring,
    stopMonitoring,
    unblockApps,
  } = useScreenTime();

  const [autoMonitor, setAutoMonitor] = useState(monitoringStatus.isMonitoring);

  const handleToggleMonitoring = useCallback(
    async (value: boolean) => {
      setAutoMonitor(value);
      try {
        if (value) {
          await startMonitoring(5);
        } else {
          await stopMonitoring();
        }
      } catch {
        setAutoMonitor(!value);
        Alert.alert("Error", "Failed to change monitoring status.");
      }
    },
    [startMonitoring, stopMonitoring]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}
    >
      {/* App Info */}
      <View style={{ alignItems: "center", paddingVertical: 16, gap: 8 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            borderCurve: "continuous",
            backgroundColor: AC.systemBlue as any,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,122,255,0.3)",
          }}
        >
          {process.env.EXPO_OS === "ios" ? (
            <Image
              source="sf:shield.lefthalf.filled"
              style={{ fontSize: 30, color: "white" } as any}
            />
          ) : (
            <Text style={{ fontSize: 30 }}>🛡️</Text>
          )}
        </View>
        <Text
          selectable
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: AC.label as any,
          }}
        >
          Screen Sentinel
        </Text>
        <Text
          selectable
          style={{
            fontSize: 13,
            color: AC.tertiaryLabel as any,
          }}
        >
          v1.0.0
        </Text>
      </View>

      {/* Status Info */}
      <View style={{ gap: 8 }}>
        <SectionHeader title="System Status" />
        <View style={{ gap: 6 }}>
          <InfoRow
            label="Screen Time API"
            value={isAvailable ? "Available" : "Not Available"}
            valueColor={
              isAvailable
                ? (AC.systemGreen as string)
                : (AC.systemRed as string)
            }
          />
          <InfoRow
            label="Authorization"
            value={
              authStatus === "approved"
                ? "Approved"
                : authStatus === "denied"
                  ? "Denied"
                  : "Not Determined"
            }
            valueColor={
              authStatus === "approved"
                ? (AC.systemGreen as string)
                : (AC.systemRed as string)
            }
          />
          <InfoRow
            label="Claude Code"
            value={isClaudeRunning ? "Running" : "Not Running"}
            valueColor={
              isClaudeRunning
                ? (AC.systemGreen as string)
                : (AC.systemOrange as string)
            }
          />
          <InfoRow
            label="Blocked Apps"
            value={String(blockingStatus.blockedAppCount)}
          />
          <InfoRow
            label="Selected Apps"
            value={String(blockingStatus.selectedAppCount)}
          />
        </View>
      </View>

      {/* Monitoring Settings */}
      <View style={{ gap: 8 }}>
        <SectionHeader
          title="Monitoring"
          subtitle="Automatically checks if Claude Code is running"
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: AC.secondarySystemGroupedBackground as any,
            borderRadius: 12,
            borderCurve: "continuous",
          }}
        >
          <View style={{ gap: 2 }}>
            <Text
              style={{
                fontSize: 15,
                color: AC.label as any,
              }}
            >
              Auto-Monitor
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: AC.secondaryLabel as any,
              }}
            >
              Check every 5 minutes
            </Text>
          </View>
          <Switch
            value={autoMonitor}
            onValueChange={handleToggleMonitoring}
            trackColor={{
              false: AC.systemGray4 as string,
              true: AC.systemGreen as string,
            }}
          />
        </View>
      </View>

      {/* How It Works */}
      <View style={{ gap: 8 }}>
        <SectionHeader title="How It Works" />
        <View
          style={{
            backgroundColor: AC.secondarySystemGroupedBackground as any,
            borderRadius: 16,
            borderCurve: "continuous",
            padding: 16,
            gap: 16,
          }}
        >
          <HowItWorksStep
            number="1"
            title="Select Apps"
            description="Choose which apps to block (like X and Instagram) using the FamilyActivityPicker."
          />
          <HowItWorksStep
            number="2"
            title="Start Monitoring"
            description="The app monitors whether Claude Code is running in the background."
          />
          <HowItWorksStep
            number="3"
            title="Auto Block/Unblock"
            description="When Claude Code stops, selected apps get shielded. When it starts, shields are removed."
          />
          <HowItWorksStep
            number="4"
            title="Shield Screen"
            description='Blocked apps show a "Open Claude Code" shield overlay using the ManagedSettingsUI framework.'
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={{ gap: 8 }}>
        <SectionHeader title="Danger Zone" />
        <ActionButton
          title="Remove All Blocks"
          onPress={() => {
            Alert.alert(
              "Remove All Blocks",
              "This will unblock all apps and stop monitoring. Are you sure?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: async () => {
                    await unblockApps();
                    await stopMonitoring();
                  },
                },
              ]
            );
          }}
          variant="destructive"
        />
      </View>
    </ScrollView>
  );
}

function HowItWorksStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: AC.systemBlue as any,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "white",
            fontVariant: ["tabular-nums"],
          }}
        >
          {number}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          selectable
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: AC.label as any,
          }}
        >
          {title}
        </Text>
        <Text
          selectable
          style={{
            fontSize: 13,
            color: AC.secondaryLabel as any,
            lineHeight: 18,
          }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}
