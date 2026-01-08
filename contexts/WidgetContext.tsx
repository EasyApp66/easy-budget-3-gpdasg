
import * as React from "react";
import { createContext, useCallback, useContext } from "react";
import { Platform } from "react-native";

// Conditionally import iOS-specific module
let ExtensionStorage: any = null;
if (Platform.OS === "ios") {
  try {
    const appleTargets = require("@bacons/apple-targets");
    ExtensionStorage = appleTargets.ExtensionStorage;
  } catch (error) {
    console.warn("@bacons/apple-targets not available, widget features disabled");
  }
}

// Initialize storage with your group ID (only on iOS)
let storage: any = null;
if (Platform.OS === "ios" && ExtensionStorage) {
  try {
    storage = new ExtensionStorage("group.com.anonymous.Natively");
  } catch (error) {
    console.warn("Failed to initialize ExtensionStorage:", error);
  }
}

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Update widget state whenever what we want to show changes
  React.useEffect(() => {
    // Only attempt widget operations on iOS with proper setup
    if (Platform.OS === "ios" && ExtensionStorage && storage) {
      try {
        // set widget_state to null if we want to reset the widget
        // storage.set("widget_state", null);

        // Refresh widget
        ExtensionStorage.reloadWidget();
      } catch (error) {
        console.warn("Failed to reload widget:", error);
      }
    }
  }, []);

  const refreshWidget = useCallback(() => {
    if (Platform.OS === "ios" && ExtensionStorage) {
      try {
        ExtensionStorage.reloadWidget();
      } catch (error) {
        console.warn("Failed to refresh widget:", error);
      }
    }
  }, []);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
