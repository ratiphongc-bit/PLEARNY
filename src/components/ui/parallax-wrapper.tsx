"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useEffect } from "react";

interface ParallaxWrapperProps {
  children: ReactNode;
  depth: number; // Positive values move WITH mouse, negative values move AGAINST mouse. Higher absolute value = more movement.
  className?: string;
}

export function ParallaxWrapper({ children, depth, className }: ParallaxWrapperProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // Map the mouse position to a translation based on depth
  const x = useTransform(smoothX, [-0.5, 0.5], [-depth * 20, depth * 20]);
  const y = useTransform(smoothY, [-0.5, 0.5], [-depth * 20, depth * 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position between -0.5 and 0.5
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
