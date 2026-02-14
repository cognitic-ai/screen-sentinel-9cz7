import UIKit
import SwiftUI
import FamilyControls

/// A UIKit view controller that hosts the SwiftUI FamilyActivityPicker.
/// It listens for a notification from the Expo module and presents the picker modally.
class FamilyActivityPickerViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(showPicker),
            name: NSNotification.Name("ShowFamilyActivityPicker"),
            object: nil
        )
    }

    @objc func showPicker() {
        let selection = AppSelectionStore.shared.selection ?? FamilyActivitySelection()

        let pickerView = FamilyActivityPickerView(selection: selection) { newSelection in
            AppSelectionStore.shared.selection = newSelection
            self.dismiss(animated: true)

            // Post notification that selection changed
            NotificationCenter.default.post(
                name: NSNotification.Name("FamilyActivitySelectionChanged"),
                object: nil,
                userInfo: ["count": newSelection.applicationTokens.count]
            )
        }

        let hostingController = UIHostingController(rootView: pickerView)
        hostingController.modalPresentationStyle = .formSheet

        if let topVC = Self.topViewController() {
            topVC.present(hostingController, animated: true)
        }
    }

    static func topViewController(
        base: UIViewController? = UIApplication.shared
            .connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first(where: { $0.isKeyWindow })?.rootViewController
    ) -> UIViewController? {
        if let nav = base as? UINavigationController {
            return topViewController(base: nav.visibleViewController)
        }
        if let tab = base as? UITabBarController, let selected = tab.selectedViewController {
            return topViewController(base: selected)
        }
        if let presented = base?.presentedViewController {
            return topViewController(base: presented)
        }
        return base
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - SwiftUI Picker Wrapper

struct FamilyActivityPickerView: View {
    @State var selection: FamilyActivitySelection
    let onComplete: (FamilyActivitySelection) -> Void

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .navigationTitle("Select Apps to Block")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Done") {
                            onComplete(selection)
                        }
                    }
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            onComplete(selection)
                        }
                    }
                }
        }
    }
}
