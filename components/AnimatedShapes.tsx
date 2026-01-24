/**
 * Animated Shapes - Geometric shapes with animations
 */
"use client";

import { useEffect, useRef } from "react";

export default function AnimatedShapes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let time = 0;

    const shapes = container.querySelectorAll(".animated-shape");

    const animate = () => {
      time += 0.01;

      shapes.forEach((shape, index) => {
        const element = shape as HTMLElement;
        const speed = 0.3 + index * 0.1;
        const radius = 100 + index * 50;
        const x = Math.cos(time * speed) * radius;
        const y = Math.sin(time * speed * 1.5) * radius;
        const rotation = time * speed * 30;

        element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
        element.style.opacity = `${0.2 + Math.sin(time * speed) * 0.1}`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Hexagons */}
      <div
        className="animated-shape absolute top-20 left-20 w-32 h-32"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))",
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          filter: "blur(1px)",
        }}
      />
      <div
        className="animated-shape absolute top-40 right-32 w-24 h-24"
        style={{
          background: "linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(99, 102, 241, 0.2))",
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          filter: "blur(1px)",
        }}
      />
      
      {/* Circles with patterns */}
      <div
        className="animated-shape absolute bottom-32 left-1/4 w-40 h-40 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
          border: "2px solid rgba(139, 92, 246, 0.3)",
        }}
      />
      <div
        className="animated-shape absolute top-1/3 right-1/4 w-28 h-28 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)",
          border: "2px solid rgba(34, 211, 238, 0.3)",
        }}
      />

      {/* Triangles */}
      <div
        className="animated-shape absolute bottom-20 right-20 w-36 h-36"
        style={{
          background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))",
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          filter: "blur(1px)",
        }}
      />
    </div>
  );
}

