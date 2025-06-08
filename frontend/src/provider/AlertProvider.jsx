// In AlertProvider.jsx
import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.jsx";
import { XCircle } from "lucide-react";

const AlertContext = createContext(null);

export function AlertProvider({ children, position = "top-right" }) {
  const [alerts, setAlerts] = useState([]);

  // Updated position classes with center options
  const positionClasses = {
    "top-right": "fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md",
    "top-left": "fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-md",
    "top-center": "fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-md",
    "bottom-right": "fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md",
    "bottom-left": "fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-md",
    "bottom-center": "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-md",
  };

  // Animation classes based on position
  const getAnimationClass = (pos) => {
    if (pos.includes("right")) {
      return "animate-in fade-in slide-in-from-right duration-300";
    } else if (pos.includes("left")) {
      return "animate-in fade-in slide-in-from-left duration-300";
    } else if (pos.includes("top") && !pos.includes("center")) {
      return "animate-in fade-in slide-in-from-top duration-300";
    } else if (pos.includes("bottom") && !pos.includes("center")) {
      return "animate-in fade-in slide-in-from-bottom duration-300";
    } else {
      return "animate-in fade-in zoom-in duration-300";
    }
  };

  const showAlert = useCallback(({
    title,
    description,
    variant = "default",
    duration = 5000,
    icon = null
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert = { id, title, description, variant, icon };

    setAlerts(prev => [...prev, newAlert]);

    if (duration) {
      setTimeout(() => {
        dismissAlert(id);
      }, duration);
    }

    return id;
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, dismissAlert }}>
      {children}
      <div className={positionClasses[position] || positionClasses["top-right"]}>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            className={`relative ${getAnimationClass(position)}`}
          >
            {alert.icon}
            <AlertTitle className="text-lg font-bold">{alert.title}</AlertTitle>
            <AlertDescription>
              {alert.description}
            </AlertDescription>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/80"
              aria-label="Close alert"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </Alert>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

// Rest of the file remains the same

// Custom hook to use the alert context
export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }

  // Helper functions for common alert types
  return {
    ...context,
    success: (props) => context.showAlert({
      variant: "default",
      ...props
    }),
    error: (props) => context.showAlert({
      variant: "destructive",
      ...props
    }),
  };
}