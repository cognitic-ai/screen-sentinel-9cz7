import { ThemeProvider } from "@/components/theme-provider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Tabs as WebTabs } from "expo-router/tabs";
import { Platform } from "react-native";

export default function Layout() {
  return (
    <ThemeProvider>
      {process.env.EXPO_OS === "web" ? (
        <WebTabsLayout />
      ) : (
        <NativeTabsLayout />
      )}
    </ThemeProvider>
  );
}

function WebTabsLayout() {
  return (
    <WebTabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <WebTabs.Screen
        name="(home)"
        options={{
          title: "Dashboard",
          tabBarIcon: (props) => <MaterialIcons {...props} name="shield" />,
        }}
      />
      <WebTabs.Screen
        name="(settings)"
        options={{
          title: "Settings",
          tabBarIcon: (props) => <MaterialIcons {...props} name="settings" />,
        }}
      />
    </WebTabs>
  );
}

function NativeTabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          {...Platform.select({
            ios: {
              sf: {
                default: "shield.lefthalf.filled",
                selected: "shield.lefthalf.filled",
              },
            },
            default: {
              src: (
                <NativeTabs.Trigger.VectorIcon
                  family={MaterialIcons}
                  name="shield"
                />
              ),
            },
          })}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          {...Platform.select({
            ios: {
              sf: { default: "gearshape", selected: "gearshape.fill" },
            },
            default: {
              src: (
                <NativeTabs.Trigger.VectorIcon
                  family={MaterialIcons}
                  name="settings"
                />
              ),
            },
          })}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
