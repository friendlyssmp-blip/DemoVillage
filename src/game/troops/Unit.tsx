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
          <meshStandardMaterial color={
            unit.type === 'archer' ? '#4ade80' : 
            unit.type === 'tank' ? '#f43f5e' : 
            unit.type === 'scout' ? '#fbbf24' : 
            '#3b82f6'
          } />
       </mesh>

       {/* Carry visual for scouts or weapons for others */}
       {unit.type === 'archer' && (
         <mesh position={[0, 0.6, 0.2]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.2, 0.03, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#5d4037" />
         </mesh>
       )}

       {unit.type === 'tank' && (
         <mesh position={[0, 0.4, 0.2]}>
            <boxGeometry args={[0.4, 0.1, 0.1]} />
            <meshStandardMaterial color="#212121" />
         </mesh>
       )}

       {/* Health Bar - Only show when damaged to save performance */}
       {unit.health < unit.maxHealth && (
         <Html distanceFactor={10} position={[0, 1.5, 0]}>
            <div className="w-12 h-1.5 bg-black/40 rounded-full border border-white/10 overflow-hidden">
               <div 
                 className="h-full bg-emerald-500" 
                 style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
               />
            </div>
         </Html>
       )}
    </group>
  );
}
