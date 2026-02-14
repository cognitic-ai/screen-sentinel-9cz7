import ManagedSettingsUI
import ManagedSettings
import UIKit

/// Custom shield configuration that shows when a blocked app is opened.
/// Displays a message explaining that the app is blocked because Claude Code isn't running.
class ClaudeShieldConfigurationProvider: ShieldConfigurationDataSource {

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterial,
            backgroundColor: UIColor.systemBackground,
            icon: UIImage(systemName: "terminal.fill"),
            title: ShieldConfiguration.Label(
                text: "App Blocked",
                color: UIColor.label
            ),
            subtitle: ShieldConfiguration.Label(
                text: "Open Claude Code to unblock this app",
                color: UIColor.secondaryLabel
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "OK",
                color: UIColor.white
            ),
            primaryButtonBackgroundColor: UIColor.systemBlue
        )
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: application)
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterial,
            backgroundColor: UIColor.systemBackground,
            icon: UIImage(systemName: "terminal.fill"),
            title: ShieldConfiguration.Label(
                text: "Site Blocked",
                color: UIColor.label
            ),
            subtitle: ShieldConfiguration.Label(
                text: "Open Claude Code to unblock this site",
                color: UIColor.secondaryLabel
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "OK",
                color: UIColor.white
            ),
            primaryButtonBackgroundColor: UIColor.systemBlue
        )
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: webDomain)
    }
}
