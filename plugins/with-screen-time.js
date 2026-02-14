const {
  withEntitlementsPlist,
  withInfoPlist,
} = require("expo/config-plugins");

/**
 * Expo Config Plugin for Screen Time APIs.
 *
 * Adds required entitlements:
 * - com.apple.developer.family-controls (FamilyControls)
 *
 * Adds required Info.plist keys:
 * - NSFamilyControlsUsageDescription
 *
 * Note: DeviceActivity Monitor Extension and ShieldConfiguration Extension
 * must be added as separate targets via EAS Build or Xcode.
 */
function withScreenTime(config, props = {}) {
  const usageDescription =
    props.familyControlsUsageDescription ||
    "This app uses Screen Time to block distracting apps when Claude Code is not running.";

  // Add FamilyControls entitlement
  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.family-controls"] = true;
    return config;
  });

  // Add usage description
  config = withInfoPlist(config, (config) => {
    config.modResults["NSFamilyControlsUsageDescription"] = usageDescription;
    return config;
  });

  return config;
}

module.exports = withScreenTime;
