"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  connections: number[];
}

export default function AnimatedNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create nodes
    const nodes: Node[] = [];
    const nodeCount = 40;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: i,
        x: Math.random() * canvas.width / 2,
        y: Math.random() * canvas.height / 2,
        size: Math.random() * 5 + 4,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        connections: [],
      });
    }

      // Create connections (growing network effect)
      nodes.forEach((node, i) => {
        const connections: number[] = [];
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = Math.sqrt(
            Math.pow(node.x - nodes[j].x, 2) + Math.pow(node.y - nodes[j].y, 2)
          );
          if (distance < 180 && Math.random() > 0.65) {
            connections.push(j);
          }
        }
        node.connections = connections;
      });

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

      // Update node positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width / 2) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height / 2) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width / 2, node.x));
        node.y = Math.max(0, Math.min(canvas.height / 2, node.y));
      });

      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach((targetId) => {
          const target = nodes[targetId];
          const distance = Math.sqrt(
            Math.pow(node.x - target.x, 2) + Math.pow(node.y - target.y, 2)
          );
          const opacity = Math.max(0, 1 - distance / 180);
          
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      });

      // Draw nodes with pulsing glow
      nodes.forEach((node, index) => {
        const pulse = Math.sin(Date.now() / 1000 + index) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        
        // Outer glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(99, 102, 241, 0.6)";
        ctx.fillStyle = `rgba(99, 102, 241, ${0.9 * pulse})`;
        ctx.fill();
        
        // Inner highlight
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(node.x - node.size * 0.3, node.y - node.size * 0.3, node.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [mounted]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
