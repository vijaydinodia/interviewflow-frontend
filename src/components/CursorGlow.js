"use client";

import { useState, useEffect } from "react";

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
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
