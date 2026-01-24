/**
 * Gradient Mesh Background - Animated gradient blobs
 */
"use client";

import { useEffect, useRef } from "react";

export default function GradientMesh() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blobs = container.querySelectorAll(".gradient-blob");
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      blobs.forEach((blob, index) => {
        const element = blob as HTMLElement;
        const speed = 0.5 + index * 0.2;
        const x = Math.sin(time * speed) * 50;
        const y = Math.cos(time * speed * 1.3) * 50;
        
        element.style.transform = `translate(${x}px, ${y}px) scale(${1 + Math.sin(time * speed * 2) * 0.2})`;
        element.style.opacity = `${0.3 + Math.sin(time * speed) * 0.2}`;
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
      <div
        className="gradient-blob absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
          top: "10%",
          left: "10%",
          transition: "all 0.3s ease-out",
        }}
      />
      <div
        className="gradient-blob absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
          top: "50%",
          right: "10%",
          transition: "all 0.3s ease-out",
        }}
      />
      <div
        className="gradient-blob absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)",
          bottom: "10%",
          left: "50%",
          transition: "all 0.3s ease-out",
        }}
      />
      <div
        className="gradient-blob absolute w-80 h-80 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
          top: "30%",
          left: "60%",
          transition: "all 0.3s ease-out",
        }}
      />
    </div>
  );
}

