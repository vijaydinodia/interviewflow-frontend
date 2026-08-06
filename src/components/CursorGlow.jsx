"use client";

import { useState, useEffect } from "react";

export default function CursorGlow() {
  // 1. Simple state to store current mouse X and Y position
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 2. Function to update position state when mouse moves
    const handleMouseMove = (event) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    // 3. Add mouse move event listener
    window.addEventListener("mousemove", handleMouseMove);

    // 4. Cleanup listener when page closes or component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {/* 5. Glowing purple circle following mouse */}
      <div
        className="pointer-events-none absolute w-[400px] h-[400px] rounded-full blur-[120px] transition-transform duration-300 ease-out"
        style={{
          left: `${position.x - 200}px`,
          top: `${position.y - 200}px`,
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 70%)",
        }}
      />
    </div>
  );
}
