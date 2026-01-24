/**
 * Token Animation Component - Animated token graphics
 */
"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import Icon from "./ui/Icon";

export default function TokenAnimation() {
  const [tokens, setTokens] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Create floating tokens
    const newTokens = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setTokens(newTokens);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {tokens.map((token) => (
        <div
          key={token.id}
          className="absolute animate-float"
          style={{
            left: `${token.x}%`,
            top: `${token.y}%`,
            animationDelay: `${token.delay}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <div className="p-2 bg-gradient-to-br from-primary-400/30 to-purple-400/30 rounded-full backdrop-blur-sm">
            <Icon icon={Coins} size="sm" className="text-primary-600" />
          </div>
        </div>
      ))}
    </div>
  );
}

