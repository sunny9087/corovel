"use client";

import { useEffect, useState } from "react";

interface AnimatedPointsProps {
  points: number;
  className?: string;
}

export default function AnimatedPoints({ points, className = "" }: AnimatedPointsProps) {
  const [displayPoints, setDisplayPoints] = useState(points);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (points !== displayPoints) {
      setIsAnimating(true);
      const diff = points - displayPoints;
      const steps = 10;
      const stepSize = diff / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayPoints(points);
          setIsAnimating(false);
          clearInterval(interval);
        } else {
          setDisplayPoints(Math.floor(displayPoints + stepSize * currentStep));
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [points, displayPoints]);

  return (
    <span className={`${isAnimating ? "points-pop" : ""} ${className}`}>
      {displayPoints.toLocaleString()}
    </span>
  );
}
