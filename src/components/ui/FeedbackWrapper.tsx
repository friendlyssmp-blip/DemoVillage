import { motion, AnimatePresence } from 'motion/react';
import React from 'react';
import { audioService } from '../../services/audioService';

// AAA Timings
export const TIMING = {
  TAP: 0.1,
  MICRO: 0.15,
  PANEL: 0.3,
};

// AAA Easing (Supercell style)
export const EASING = {
  OUT: [0.22, 1, 0.36, 1] as [number, number, number, number],
  IN: [0.64, 0, 0.78, 0] as [number, number, number, number],
  BOUNCE: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
};

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  soundType?: 'primary' | 'secondary' | 'critical' | 'click';
}

export const GameButton: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled, 
  className, 
  id,
  soundType = 'click'
}) => {
  const handlePress = () => {
    if (!disabled) {
      audioService.play(soundType, { randomized: true });
    } else {
      audioService.play('error', { volume: 0.3 });
    }
  };

  return (
    <motion.button
      id={id}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      onPointerDown={handlePress}
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer active:brightness-90 transition-all duration-75'}`}
    >
      {children}
    </motion.button>
  );
};

export const PanelTransition: React.FC<{ children: React.ReactNode; isOpen: boolean }> = ({ children, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: TIMING.PANEL, ease: EASING.BOUNCE }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const FloatingText: React.FC<{ text: string; color: string; x: number; y: number }> = ({ text, color, x, y }) => {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -80, scale: 1.2 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`fixed z-[100] font-black pointer-events-none text-outline ${color}`}
      style={{ left: x, top: y }}
    >
      {text}
    </motion.div>
  );
};
