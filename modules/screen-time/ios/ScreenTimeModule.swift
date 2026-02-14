import ExpoModulesCore
import FamilyControls
import ManagedSettings
import DeviceActivity
import Foundation

// MARK: - App Selection Storage
/// Persists the user's FamilyActivitySelection so we can re-apply shields and schedule monitoring.
class AppSelectionStore {
    static let shared = AppSelectionStore()

    private let defaults = UserDefaults(suiteName: "group.com.screensentinel.shared")!
    private let selectionKey = "familyActivitySelection"
    private let claudeStatusKey = "claudeCodeRunning"

    var selection: FamilyActivitySelection? {
        get {
            guard let data = defaults.data(forKey: selectionKey) else { return nil }
            return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        }
        set {
            if let value = newValue, let data = try? JSONEncoder().encode(value) {
                defaults.set(data, forKey: selectionKey)
            } else {
                defaults.removeObject(forKey: selectionKey)
            }
        }
    }

    var isClaudeCodeRunning: Bool {
        get { defaults.bool(forKey: claudeStatusKey) }
        set { defaults.set(newValue, forKey: claudeStatusKey) }
    }
}

// MARK: - Managed Settings Store
/// Manages the ManagedSettingsStore for applying/removing app shields.
class ShieldManager {
    static let shared = ShieldManager()

    let store = ManagedSettingsStore()

    func blockApps(selection: FamilyActivitySelection) {
        // Apply application shields
        store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
        // Apply category shields
        store.shield.applicationCategories = selection.categoryTokens.isEmpty
            ? nil
            : ShieldSettings.ActivityCategoryPolicy<Application>.specific(selection.categoryTokens)
        // Also shield web domains if any
        store.shield.webDomains = selection.webDomainTokens.isEmpty ? nil : selection.webDomainTokens
        store.shield.webDomainCategories = selection.categoryTokens.isEmpty
            ? nil
            : ShieldSettings.ActivityCategoryPolicy<WebDomain>.specific(selection.categoryTokens)
    }

    func unblockAll() {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        store.shield.webDomains = nil
        store.shield.webDomainCategories = nil
    }

    var isBlocking: Bool {
        return store.shield.applications != nil || store.shield.applicationCategories != nil
    }

    var blockedAppCount: Int {
        return (store.shield.applications?.count ?? 0)
    }
}

// MARK: - Device Activity Monitor
/// Schedules a DeviceActivityMonitor that periodically checks if Claude Code is running.
/// When Claude Code stops, the shield is applied. When it starts, shields are removed.
class ActivityScheduler {
    static let shared = ActivityScheduler()

    let center = DeviceActivityCenter()
    let activityName = DeviceActivityName("claudeCodeCheck")

    var isMonitoring: Bool = false
    var intervalMinutes: Int = 5

    func startMonitoring(intervalMinutes: Int) throws {
        self.intervalMinutes = intervalMinutes

        // Create a schedule that repeats
        let now = Calendar.current.dateComponents([.hour, .minute, .second], from: Date())

        let schedule = DeviceActivitySchedule(
            intervalStart: DateComponents(hour: 0, minute: 0, second: 0),
            intervalEnd: DateComponents(hour: 23, minute: 59, second: 59),
            repeats: true
        )

        try center.startMonitoring(activityName, during: schedule)
        isMonitoring = true
    }

    func stopMonitoring() {
        center.stopMonitoring([activityName])
        isMonitoring = false
    }
}

// MARK: - Expo Module
public class ScreenTimeModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ScreenTimeModule")

        // MARK: Authorization

        AsyncFunction("requestAuthorization") { () -> String in
            if #available(iOS 16.0, *) {
                do {
                    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                    return "approved"
                } catch {
                    return "denied"
                }
            } else {
                return "unsupported"
            }
        }

        AsyncFunction("getAuthorizationStatus") { () -> String in
            if #available(iOS 16.0, *) {
                switch AuthorizationCenter.shared.authorizationStatus {
                case .approved:
                    return "approved"
                case .denied:
                    return "denied"
                case .notDetermined:
                    return "notDetermined"
                @unknown default:
                    return "unknown"
                }
            } else {
                return "unsupported"
            }
        }

        // MARK: App Picker (FamilyActivityPicker)

        AsyncFunction("showAppPicker") { () -> Bool in
            // The FamilyActivityPicker must be shown via SwiftUI.
            // We post a notification that our SwiftUI view controller listens for.
            await MainActor.run {
                NotificationCenter.default.post(
                    name: NSNotification.Name("ShowFamilyActivityPicker"),
                    object: nil
                )
            }
            return true
        }

        // MARK: Blocking

        AsyncFunction("blockSelectedApps") { () -> Bool in
            guard let selection = AppSelectionStore.shared.selection else {
                return false
            }
            ShieldManager.shared.blockApps(selection: selection)
            return true
        }

        AsyncFunction("unblockAllApps") { () -> Bool in
            ShieldManager.shared.unblockAll()
            return true
        }

        AsyncFunction("getBlockingStatus") { () -> [String: Any] in
            let selectedCount = AppSelectionStore.shared.selection?.applicationTokens.count ?? 0
            return [
                "isBlocking": ShieldManager.shared.isBlocking,
                "blockedAppCount": ShieldManager.shared.blockedAppCount,
                "selectedAppCount": selectedCount
            ]
        }

        // MARK: Monitoring

        AsyncFunction("startMonitoring") { (intervalMinutes: Int) -> Bool in
            do {
                try ActivityScheduler.shared.startMonitoring(intervalMinutes: intervalMinutes)
                return true
            } catch {
                return false
            }
        }

        AsyncFunction("stopMonitoring") { () -> Bool in
            ActivityScheduler.shared.stopMonitoring()
            return true
        }

        AsyncFunction("getMonitoringStatus") { () -> [String: Any] in
            return [
                "isMonitoring": ActivityScheduler.shared.isMonitoring,
                "intervalMinutes": ActivityScheduler.shared.intervalMinutes
            ]
        }

        // MARK: Claude Code Status

        AsyncFunction("checkClaudeCodeRunning") { () -> Bool in
            return AppSelectionStore.shared.isClaudeCodeRunning
        }

        AsyncFunction("setClaudeCodeStatus") { (isRunning: Bool) in
            AppSelectionStore.shared.isClaudeCodeRunning = isRunning

            // When Claude Code status changes, update shields accordingly
            if isRunning {
                // Claude Code is running → remove shields
                ShieldManager.shared.unblockAll()
            } else {
                // Claude Code is not running → apply shields
                if let selection = AppSelectionStore.shared.selection {
                    ShieldManager.shared.blockApps(selection: selection)
                }
            }
        }
    }
}
