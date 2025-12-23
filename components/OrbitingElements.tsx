"use client";

import { useEffect, useRef, useState } from "react";

export default function OrbitingElements() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const elementsRef = useRef<Array<{
    id: number;
    size: number;
    radius: number;
    speed: number;
    angle: number;
    emoji: string;
  }>>([]);

  useEffect(() => {
    setMounted(true);
    
    if (!containerRef.current) return;

    const elements = [
      { id: 1, size: 50, radius: 120, speed: 0.5, angle: 0, emoji: "✅" },
      { id: 2, size: 50, radius: 120, speed: 0.7, angle: 60, emoji: "🔥" },
      { id: 3, size: 50, radius: 120, speed: 0.6, angle: 120, emoji: "📊" },
      { id: 4, size: 50, radius: 120, speed: 0.8, angle: 180, emoji: "🎯" },
      { id: 5, size: 50, radius: 120, speed: 0.65, angle: 240, emoji: "⚡" },
      { id: 6, size: 50, radius: 120, speed: 0.75, angle: 300, emoji: "💪" },
      { id: 7, size: 60, radius: 180, speed: 0.4, angle: 30, emoji: "👤" },
      { id: 8, size: 60, radius: 180, speed: 0.55, angle: 90, emoji: "👤" },
      { id: 9, size: 60, radius: 180, speed: 0.45, angle: 150, emoji: "👤" },
      { id: 10, size: 60, radius: 180, speed: 0.6, angle: 210, emoji: "👤" },
      { id: 11, size: 60, radius: 180, speed: 0.5, angle: 270, emoji: "👤" },
      { id: 12, size: 60, radius: 180, speed: 0.65, angle: 330, emoji: "👤" },
    ];

    elementsRef.current = elements;

    const centerX = 200;
    const centerY = 200;
    let animationId: number;

    const animate = () => {
      if (!containerRef.current) return;

      elementsRef.current.forEach((element) => {
        element.angle += element.speed;
        const radian = (element.angle * Math.PI) / 180;
        const x = centerX + Math.cos(radian) * element.radius - element.size / 2;
        const y = centerY + Math.sin(radian) * element.radius - element.size / 2;

        const el = document.getElementById(`orbit-${element.id}`);
        if (el) {
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    // Initialize positions
    elements.forEach((element) => {
      const radian = (element.angle * Math.PI) / 180;
      const x = centerX + Math.cos(radian) * element.radius - element.size / 2;
      const y = centerY + Math.sin(radian) * element.radius - element.size / 2;
      const el = document.getElementById(`orbit-${element.id}`);
      if (el) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
      }
    });

    // Start animation after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      animate();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mounted]);

  return (
    <div className="relative w-[400px] h-[400px] mx-auto" ref={containerRef}>
      {/* Central Text */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center">
          <div className="text-6xl md:text-7xl font-bold gradient-text mb-2 animate-pulse-glow">10k+</div>
          <div className="text-xl md:text-2xl text-[#6B7280] font-medium">Active Users</div>
        </div>
      </div>

      {/* Orbiting Elements */}
      {elementsRef.current.length > 0 ? elementsRef.current.map((item) => (
        <div
          key={item.id}
          id={`orbit-${item.id}`}
          className={`absolute rounded-full bg-white shadow-xl flex items-center justify-center text-2xl md:text-3xl transition-all duration-300 hover:scale-110 ${
            item.radius === 180 ? "ring-2 ring-[#6366F1]/30" : "ring-2 ring-[#22D3EE]/30"
          }`}
          style={{
            width: `${item.size}px`,
            height: `${item.size}px`,
            left: "0px",
            top: "0px",
          }}
        >
          {item.emoji}
        </div>
      )) : (
        // Fallback while mounting
        <>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((id) => (
            <div
              key={id}
              id={`orbit-${id}`}
              className="absolute rounded-full bg-white shadow-xl flex items-center justify-center text-2xl md:text-3xl"
              style={{
                width: id <= 6 ? "50px" : "60px",
                height: id <= 6 ? "50px" : "60px",
                left: "0px",
                top: "0px",
              }}
            >
              {id <= 6 ? ["✅", "🔥", "📊", "🎯", "⚡", "💪"][id - 1] : "👤"}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
