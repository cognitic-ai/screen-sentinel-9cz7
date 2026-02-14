import { View, Text } from "react-native";
import * as AC from "@bacons/apple-colors";

type InfoRowProps = {
  label: string;
  value: string;
  valueColor?: string;
};

export default function InfoRow({ label, value, valueColor }: InfoRowProps) {
  return (
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
      <Text
        selectable
        style={{
          fontSize: 15,
          color: AC.label as any,
        }}
      >
        {label}
      </Text>
      <Text
        selectable
        style={{
          fontSize: 15,
          fontWeight: "500",
          color: (valueColor ?? AC.secondaryLabel) as any,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
    </View>
  );
}
