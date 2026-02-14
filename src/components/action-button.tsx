import { Pressable, Text, ActivityIndicator } from "react-native";
import * as AC from "@bacons/apple-colors";

type ActionButtonProps = {
  title: string;
  icon?: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "destructive";
  loading?: boolean;
  disabled?: boolean;
};

export default function ActionButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: ActionButtonProps) {
  const bgColor =
    variant === "primary"
      ? AC.systemBlue
      : variant === "destructive"
        ? AC.systemRed
        : "transparent";

  const textColor =
    variant === "secondary" ? AC.systemBlue : "white";

  const borderColor =
    variant === "secondary" ? AC.systemBlue : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: bgColor as any,
        borderRadius: 14,
        borderCurve: "continuous",
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        opacity: (pressed || disabled) ? 0.6 : 1,
        borderWidth: variant === "secondary" ? 1.5 : 0,
        borderColor: borderColor as any,
      })}
    >
      {loading ? (
        <ActivityIndicator color={textColor as any} />
      ) : (
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: textColor as any,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
