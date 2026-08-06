"use client";

import React, { useEffect, useRef, useState } from "react";

interface CursorGlowProps {
  /** Size of the glow sphere in pixels. Default: 500 */
  size?: number;
  /** Blur radius in pixels. Default: 140 */
  blur?: number;
  /** Opacity of the glow (0.15 to 0.25 recommended). Default: 0.2 */
  opacity?: number;
  /** Interpolation factor for smooth trailing (0.01 to 0.1). Default: 0.08 */
  ease?: number;
  /** Primary purple color (#7C3AED). Default: "#7C3AED" */
  colorFrom?: string;
  /** Secondary purple color (#A855F7). Default: "#A855F7" */
  colorTo?: string;
}

export const CursorGlow: React.FC<CursorGlowProps> = ({
  size = 500,
  blur = 140,
  opacity = 0.2,
  ease = 0.08,
  colorFrom = "#7C3AED",
  colorTo = "#A855F7",
}) => {
  const glowRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: -size, y: -size });
  const currentPos = useRef({ x: -size, y: -size });
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isCoarsePointer || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, ease);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, ease);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${
          currentPos.current.x - size / 2
        }px, ${currentPos.current.y - size / 2}px, 0)`;
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animFrameId);
    };
  }, [isMobile, ease, size, isVisible]);

  if (isMobile) return null;

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className={`pointer-events-none fixed top-0 left-0 z-30 rounded-full transition-opacity duration-500 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        filter: `blur(${blur}px)`,
        mixBlendMode: "screen",
        background: `radial-gradient(circle, ${colorFrom} 0%, ${colorTo} 45%, transparent 70%)`,
        opacity: isVisible ? opacity : 0,
        willChange: "transform",
      }}
    />
  );
};

export default CursorGlow;
