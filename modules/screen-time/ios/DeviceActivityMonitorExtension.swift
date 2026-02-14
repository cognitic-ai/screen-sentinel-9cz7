import DeviceActivity
import ManagedSettings
import FamilyControls
import Foundation

/// DeviceActivity Monitor Extension callback handler.
/// This runs in a separate process and checks Claude Code status on interval events.
/// When DeviceActivity schedule fires, it checks the shared UserDefaults for Claude Code
/// running state and applies/removes shields accordingly.
class ClaudeCodeActivityMonitor: DeviceActivityMonitor {

    let store = ManagedSettingsStore()
    let defaults = UserDefaults(suiteName: "group.com.screensentinel.shared")!
    let selectionKey = "familyActivitySelection"
    let claudeStatusKey = "claudeCodeRunning"

    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        evaluateAndApplyShields()
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        evaluateAndApplyShields()
    }

    override func intervalWillStartWarning(for activity: DeviceActivityName) {
        super.intervalWillStartWarning(for: activity)
        evaluateAndApplyShields()
    }

    override func intervalWillEndWarning(for activity: DeviceActivityName) {
        super.intervalWillEndWarning(for: activity)
        evaluateAndApplyShields()
    }

    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)
        evaluateAndApplyShields()
    }

    // MARK: - Core Logic

    private func evaluateAndApplyShields() {
        let isClaudeRunning = defaults.bool(forKey: claudeStatusKey)

        if isClaudeRunning {
            // Claude Code is running, remove all shields
            store.shield.applications = nil
            store.shield.applicationCategories = nil
            store.shield.webDomains = nil
            store.shield.webDomainCategories = nil
        } else {
            // Claude Code is NOT running, apply shields to selected apps
            guard let data = defaults.data(forKey: selectionKey),
                  let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) else {
                return
            }

            if !selection.applicationTokens.isEmpty {
                store.shield.applications = selection.applicationTokens
            }
            if !selection.categoryTokens.isEmpty {
                store.shield.applicationCategories = ShieldSettings.ActivityCategoryPolicy<Application>.specific(selection.categoryTokens)
                store.shield.webDomainCategories = ShieldSettings.ActivityCategoryPolicy<WebDomain>.specific(selection.categoryTokens)
            }
            if !selection.webDomainTokens.isEmpty {
                store.shield.webDomains = selection.webDomainTokens
            }
        }
    }
}
