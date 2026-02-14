import { View, Text } from "react-native";
import * as AC from "@bacons/apple-colors";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={{ gap: 2, paddingHorizontal: 4 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: AC.secondaryLabel as any,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: 13,
            color: AC.tertiaryLabel as any,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
