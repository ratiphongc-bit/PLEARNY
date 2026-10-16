"use client";

import { motion, type MotionProps } from "framer-motion";
import { ReactNode } from "react";
import confetti from "canvas-confetti";

interface InteractiveObjectProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  withParticles?: boolean;
  idleAnimation?: MotionProps["animate"];
}

export function InteractiveObject({
  children,
  className,
  onClick,
  withParticles = false,
  idleAnimation,
}: InteractiveObjectProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (withParticles) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 25,
        spread: 70,
        origin: { x, y },
        colors: ["#fcd34d", "#fef3c7", "#c4b5fd", "#ffffff"],
        disableForReducedMotion: true,
        zIndex: 9999,
      });
    }
    onClick?.();
  };

  const idleTransition = idleAnimation
    ? { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
    : undefined;

  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.93 }}
      animate={idleAnimation}
      transition={idleTransition}
      onClick={handleClick}
    >
      {children}
    </motion.div>
  );
}
