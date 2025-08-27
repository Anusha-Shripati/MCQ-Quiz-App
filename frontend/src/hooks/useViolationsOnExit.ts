import { useEffect } from "react";

export function useViolationOnExit(addViolation: (v: { type: string; details: string }) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Alt + F4
      if (e.altKey && e.key === "F4") {
        e.preventDefault(); // stop default close behavior (some browsers ignore this)
        addViolation({ type: "WINDOW_CLOSE", details: "Attempted to close window using Alt+F4" });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Mark violation when window/tab is being closed
      addViolation({ type: "WINDOW_CLOSE", details: "Attempted to close or refresh window" });

      // Show browser confirmation dialog (optional)
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [addViolation]);
}
