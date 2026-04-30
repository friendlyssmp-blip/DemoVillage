/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const tapAnimation = {
  whileTap: { scale: 0.94 },
  whileHover: { scale: 1.05 },
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 450,
  damping: 18,
  mass: 0.6
};

export const menuTransition = {
  initial: { opacity: 0, scale: 0.92, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.92, y: 30 },
  transition: { 
    type: "spring" as const,
    stiffness: 350,
    damping: 25
  }
};

export const floatUpAnimation = {
  initial: { opacity: 0, y: 0 },
  animate: { opacity: 1, y: -40 },
  exit: { opacity: 0 },
  transition: { duration: 0.8, ease: "easeOut" as const, type: "tween" as const }
};

export const shakeAnimation = {
  animate: {
    x: [0, -3, 3, -3, 3, 0],
  },
  transition: { duration: 0.2, type: "tween" as const }
};

export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(74, 222, 128, 0)",
      "0 0 20px rgba(74, 222, 128, 0.4)",
      "0 0 0px rgba(74, 222, 128, 0)"
    ]
  },
  transition: { duration: 1.5, repeat: Infinity, type: "tween" as const }
};
