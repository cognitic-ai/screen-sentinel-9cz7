import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import * as AC from "@bacons/apple-colors";

type StatusCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  status: "active" | "inactive" | "warning";
  onPress?: () => void;
};

const statusColors = {
  active: AC.systemGreen,
  inactive: AC.systemRed,
  warning: AC.systemOrange,
} as const;

export default function StatusCard({
  title,
  subtitle,
  icon,
  iconColor,
  status,
  onPress,
}: StatusCardProps) {
  const statusColor = statusColors[status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: AC.secondarySystemGroupedBackground as any,
        borderRadius: 16,
        borderCurve: "continuous",
        padding: 16,
        gap: 12,
        opacity: pressed && onPress ? 0.7 : 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              borderCurve: "continuous",
              backgroundColor: iconColor + "18",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {process.env.EXPO_OS === "ios" ? (
              <Image
                source={`sf:${icon}`}
                style={{ fontSize: 20, color: iconColor } as any}
              />
            ) : (
              <Text style={{ fontSize: 20 }}>
                {icon === "shield.lefthalf.filled" ? "🛡️" : icon === "terminal.fill" ? "💻" : "⏱️"}
              </Text>
            )}
          </View>
          <View style={{ gap: 2 }}>
            <Text
              selectable
              style={{
                fontSize: 17,
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
              }}
            >
              {subtitle}
            </Text>
          </View>
        </View>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: statusColor as any,
            boxShadow: `0 0 6px ${statusColor}`,
          }}
        />
      </View>
    </Pressable>
  );
}
