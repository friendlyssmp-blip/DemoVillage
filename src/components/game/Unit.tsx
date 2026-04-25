/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { Sword, Heart } from 'lucide-react';
import { Html } from '@react-three/drei';

export function Unit({ unit }: { unit: any }) {
  // Simple unit visualization
  return (
    <group position={[unit.position[0], 0, unit.position[1]]}>
       {/* Visual Body */}
       <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
          <meshStandardMaterial color={unit.type === 'archer' ? '#4ade80' : unit.type === 'heavy' ? '#f43f5e' : '#3b82f6'} />
       </mesh>

       {/* Health Bar */}
       <Html distanceFactor={10} position={[0, 1.5, 0]}>
          <div className="w-12 h-1.5 bg-black/40 rounded-full border border-white/10 overflow-hidden">
             <div 
               className="h-full bg-emerald-500" 
               style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
             />
          </div>
       </Html>
    </group>
  );
}
