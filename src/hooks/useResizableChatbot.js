import { useState, useEffect, useRef, useCallback } from "react";

export function useResizableChatbot(defaultPercentage = 30, storageKey = "chatbot_width_percentage") {
  const [widthPercent, setWidthPercent] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 20 && parsed <= 60) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading chatbot width from localStorage:", e);
    }
    return defaultPercentage;
  });

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const widthPercentRef = useRef(widthPercent);

  // Sync ref with state
  useEffect(() => {
    widthPercentRef.current = widthPercent;
  }, [widthPercent]);

  const startDrag = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Temporarily disable text selection and override cursor during dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    }
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [isDragging]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pixelWidth = rect.right - e.clientX;
      let percentage = (pixelWidth / rect.width) * 100;

      if (percentage < 20) percentage = 20;
      if (percentage > 60) percentage = 60;

      setWidthPercent(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(storageKey, widthPercentRef.current.toString());
      } catch (e) {
        console.error("Error saving chatbot width to localStorage:", e);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    const handleTouchMove = (e) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const pixelWidth = rect.right - touch.clientX;
      let percentage = (pixelWidth / rect.width) * 100;

      if (percentage < 20) percentage = 20;
      if (percentage > 60) percentage = 60;

      setWidthPercent(percentage);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(storageKey, widthPercentRef.current.toString());
      } catch (e) {
        console.error("Error saving chatbot width to localStorage:", e);
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, storageKey]);

  return {
    widthPercent,
    isDragging,
    handleMouseDown: startDrag,
    containerRef,
  };
}
