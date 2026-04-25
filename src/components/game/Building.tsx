/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Box, Cylinder, Sphere, Text, Float, Html } from '@react-three/drei';
import { useGameStore, BUILDING_TYPES } from '../../store/useGameStore';
import { motion } from 'motion/react';

interface BuildingProps {
  id: string;
  typeId: string;
  level: number;
  position: [number, number];
  rotation: number;
  progress: number;
  isSelected: boolean;
  health?: number;
  maxHealth?: number;
}

export function Building({ id, typeId, level, position, rotation, progress, isSelected, health, maxHealth }: BuildingProps) {
  const selectBuilding = useGameStore((state) => state.selectBuilding);
  const isEditMode = useGameStore((state) => state.isEditMode);
  const startMoving = useGameStore((state) => state.startMoving);
  const movingBuildingId = useGameStore((state) => state.movingBuildingId);
  const type = BUILDING_TYPES[typeId as keyof typeof BUILDING_TYPES];
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isEditMode) {
      if (movingBuildingId === null) {
        startMoving(id);
      }
    } else {
      selectBuilding(id);
    }
  };

  const viewMode = useGameStore((state) => state.viewMode);
  const isConstructing = progress < 1;
  const isEnemy = id.startsWith('enemy-');

  // Labels should only be visible when in active gameplay views
  const showLabels = (viewMode === 'playing' || viewMode === 'fighting');

  const renderModel = () => {
    // Construction Phases
    if (progress < 1) {
      return (
        <group>
          {/* Foundation Phase (0 - 0.33) */}
          <Box args={[1.6, 0.1, 1.6]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color="#555555" />
          </Box>
          
          {/* Framework Phase (0.33 - 0.66) */}
          {progress > 0.33 && (
            <group>
              <Box args={[0.1, 1.5 * ((progress - 0.33) / 0.67), 0.1]} position={[0.7, 0.75 * ((progress - 0.33) / 0.33), 0.7]}>
                <meshStandardMaterial color="#8b4513" />
              </Box>
              <Box args={[0.1, 1.5 * ((progress - 0.33) / 0.67), 0.1]} position={[-0.7, 0.75 * ((progress - 0.33) / 0.33), -0.7]}>
                <meshStandardMaterial color="#8b4513" />
              </Box>
              <Box args={[0.1, 1.5 * ((progress - 0.33) / 0.67), 0.1]} position={[0.7, 0.75 * ((progress - 0.33) / 0.33), -0.7]}>
                <meshStandardMaterial color="#8b4513" />
              </Box>
              <Box args={[0.1, 1.5 * ((progress - 0.33) / 0.67), 0.1]} position={[-0.7, 0.75 * ((progress - 0.33) / 0.33), 0.7]}>
                <meshStandardMaterial color="#8b4513" />
              </Box>
            </group>
          )}

          {/* Scaffolding Wrap */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.7, 0]}>
             <boxGeometry args={[1.7, 1.7, 1.4]} />
             <meshStandardMaterial color="#8b4513" wireframe />
          </mesh>
        </group>
      );
    }

    const baseScale = type.size || 1;
    const levelScale = (1 + (Math.log2(level) * 0.15)) * (baseScale / 2); // Visible growth and base footprint scaling

    switch (type.model) {
      case 'townhall':
        return (
          <group scale={levelScale}>
            <Box args={[2.2, 1.8, 2.2]} position={[0, 0.9, 0]} castShadow>
              <meshStandardMaterial color="#d7ccc8" />
            </Box>
            <Box args={[2.5, 0.6, 2.5]} position={[0, 2.1, 0]} castShadow>
              <meshStandardMaterial color="#5d4037" />
            </Box>
            <Box args={[0.8, 1.2, 0.8]} position={[0, 3, 0]} castShadow>
               <meshStandardMaterial color="#a1887f" />
            </Box>
            <Box args={[1, 0.2, 1]} position={[0, 3.6, 0]} rotation={[0, 0.78, 0]}>
               <meshStandardMaterial color="#8d6e63" />
            </Box>
          </group>
        );
      case 'lumberjack':
        return (
          <group scale={levelScale}>
             <Box args={[1.5, 1.2, 1.5]} position={[0, 0.6, 0]} castShadow>
                <meshStandardMaterial color="#8d6e63" />
             </Box>
             <Box args={[1.7, 0.4, 1.7]} position={[0, 1.3, 0]} rotation={[0.1, 0, 0]} castShadow>
                <meshStandardMaterial color="#4e342e" />
             </Box>
             <Cylinder args={[0.4, 0.4, 0.8]} position={[1, 0.4, 0]} rotation={[Math.PI/2, 0, 0]}>
                <meshStandardMaterial color="#3e2723" />
             </Cylinder>
          </group>
        );
      case 'quarry':
        return (
          <group scale={levelScale}>
            <Box args={[1.8, 1.2, 1.8]} position={[0, 0.6, 0]} castShadow>
              <meshStandardMaterial color="#9e9e9e" />
            </Box>
            <Box args={[0.6, 0.6, 0.6]} position={[0.7, 1.4, 0]} rotation={[0.5, 0.5, 0.5]} castShadow>
               <meshStandardMaterial color="#424242" />
            </Box>
            <Box args={[2, 0.2, 2]} position={[0, 1.1, 0]}>
               <meshStandardMaterial color="#616161" />
            </Box>
          </group>
        );
      case 'farm':
        return (
          <group scale={levelScale}>
            <Box args={[2, 0.1, 2]} position={[0, 0.05, 0]} receiveShadow>
              <meshStandardMaterial color="#689f38" />
            </Box>
            <Box args={[0.8, 1.5, 1.2]} position={[-0.5, 0.75, 0]} castShadow>
               <meshStandardMaterial color="#a1887f" />
            </Box>
            <Box args={[1, 0.2, 1.4]} position={[-0.5, 1.6, 0]} rotation={[0.2, 0, 0]}>
               <meshStandardMaterial color="#5d4037" />
            </Box>
            {[-0.6, 0, 0.6].map((x) => 
               [0.4, 0.7].map((z) => (
                 <Cylinder key={`${x}-${z}`} args={[0.05, 0.05, 0.6]} position={[x + 0.5, 0.3, z]}>
                    <meshStandardMaterial color="#c0ca33" />
                 </Cylinder>
               ))
            )}
          </group>
        );
      case 'market':
        return (
          <group scale={levelScale}>
             <Box args={[2, 0.2, 2]} position={[0, 0.1, 0]}>
                <meshStandardMaterial color="#bdbdbd" />
             </Box>
             <Box args={[1.4, 1, 1.4]} position={[0, 0.6, 0]} castShadow>
                <meshStandardMaterial color="#ffccbc" />
             </Box>
             <Box args={[1.8, 0.2, 1.8]} position={[0, 1.1, 0]} rotation={[0.05, 0, 0]}>
                <meshStandardMaterial color="#e64a19" />
             </Box>
          </group>
        );
      case 'storage':
        return (
          <group scale={levelScale}>
            {/* Main Warehouse Structure */}
            <Box args={[1.8, 1.4, 1.8]} position={[0, 0.7, 0]} castShadow>
               <meshStandardMaterial color="#5d4037" />
            </Box>
            {/* Roof */}
            <Box args={[2, 0.3, 2]} position={[0, 1.5, 0]} rotation={[0.05, 0, 0]}>
               <meshStandardMaterial color="#212121" />
            </Box>
            {/* Decorative Crates */}
            <group position={[0.6, 0.3, 0.6]}>
               <Box args={[0.5, 0.5, 0.5]} position={[0, 0, 0]} castShadow>
                  <meshStandardMaterial color="#8b4513" />
               </Box>
               <Box args={[0.4, 0.4, 0.4]} position={[-0.2, 0.5, -0.1]} rotation={[0, 0.5, 0]} castShadow>
                  <meshStandardMaterial color="#a1887f" />
               </Box>
            </group>
            {/* Stone Stack */}
            <group position={[-0.7, 0.2, 0.5]}>
               <Sphere args={[0.25, 8, 8]} position={[0, 0, 0]}>
                  <meshStandardMaterial color="#757575" />
               </Sphere>
               <Sphere args={[0.2, 8, 8]} position={[0.2, 0, 0.2]}>
                  <meshStandardMaterial color="#9e9e9e" />
               </Sphere>
               <Sphere args={[0.22, 8, 8]} position={[0.1, 0.3, 0.1]}>
                  <meshStandardMaterial color="#616161" />
               </Sphere>
            </group>
            {/* Doorway */}
            <Box args={[0.6, 0.9, 0.1]} position={[0, 0.45, 0.91]}>
               <meshStandardMaterial color="#3e2723" />
            </Box>
            {/* Level indicator containers */}
            {level > 1 && (
              <group position={[0, 1.65, 0]}>
                 <Box args={[0.4, 0.2, 0.4]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#ffd700" />
                 </Box>
              </group>
            )}
          </group>
        );
      case 'barracks':
         return (
           <group scale={levelScale}>
             <Box args={[2, 1.5, 2]} position={[0, 0.75, 0]} castShadow>
                <meshStandardMaterial color="#37474f" />
             </Box>
             <Box args={[2.2, 0.4, 2.2]} position={[0, 1.7, 0]}>
                <meshStandardMaterial color="#263238" />
             </Box>
             <Box args={[0.4, 2, 0.4]} position={[1.1, 1, 1.1]} castShadow>
                <meshStandardMaterial color="#546e7a" />
             </Box>
             <Box args={[0.4, 2, 0.4]} position={[-1.1, 1, -1.1]} castShadow>
                <meshStandardMaterial color="#546e7a" />
             </Box>
           </group>
         );
      case 'lab':
         return (
           <group scale={levelScale}>
             <Cylinder args={[1.2, 1.4, 1.8, 16]} position={[0, 0.9, 0]} castShadow>
                <meshStandardMaterial color="#90caf9" />
             </Cylinder>
             <Cylinder args={[0.4, 0.4, 0.6]} position={[0, 2.1, 0]} castShadow>
                <meshStandardMaterial color="#64b5f6" />
             </Cylinder>
             <Box args={[0.3, 2, 0.3]} position={[0.8, 1, 0]} rotation={[0, 0, 0.2]}>
                <meshStandardMaterial color="#1976d2" />
             </Box>
           </group>
         );
      case 'factory':
         return (
           <group scale={levelScale}>
             <Box args={[2.5, 1.5, 3]} position={[0, 0.75, 0]} castShadow>
                <meshStandardMaterial color="#546e7a" />
             </Box>
             <Cylinder args={[0.3, 0.4, 2]} position={[-0.8, 2, -1]} castShadow>
                <meshStandardMaterial color="#263238" />
             </Cylinder>
             <Cylinder args={[0.3, 0.4, 2.5]} position={[0.8, 2.2, -1]} castShadow>
                <meshStandardMaterial color="#263238" />
             </Cylinder>
             <Box args={[1.2, 0.8, 0.2]} position={[0, 0.4, 1.51]}>
                <meshStandardMaterial color="#cfd8dc" />
             </Box>
           </group>
         );
      default:
        return <Box args={[1, 1, 1]}><meshStandardMaterial color="magenta" /></Box>;
    }
  };

  return (
    <group 
      position={[position[0], 0, position[1]]} 
      rotation={[0, rotation, 0]} 
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group position={[0, 0.01, 0]}>
        {renderModel()}
      </group>
      
      {!isConstructing && showLabels && (
        <Html position={[0, 3 + (level * 0.1), 0]} center>
          <div className="flex flex-col items-center gap-1 w-24 pointer-events-none select-none">
            <div className={`bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border ${isSelected ? 'border-cyan-400' : 'border-white/20'} flex items-center gap-2 shadow-2xl transition-all`}>
              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 blur-[2px]' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">Nv{level}</span>
            </div>
          </div>
        </Html>
      )}

      {isConstructing && showLabels && (
         <Html position={[0, 2.5, 0]} center>
            <div className="w-20 h-2 bg-black/60 rounded-full overflow-hidden border border-white/20 p-0.5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress * 100}%` }}
                 className="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
               />
            </div>
         </Html>
      )}

      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <planeGeometry args={[(type.size || 1) + 1, (type.size || 1) + 1]} />
          <meshStandardMaterial 
            color={isSelected ? "#22d3ee" : "#ffffff"} 
            transparent 
            opacity={0.15} 
            emissive={isSelected ? "#22d3ee" : "#ffffff"}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {isEnemy && showLabels && health !== undefined && maxHealth !== undefined && health < maxHealth && (
        <Html distanceFactor={15} position={[0, 4, 0]} center>
           <div className="w-20 h-2 bg-black/60 rounded-full border border-white/20 overflow-hidden shadow-2xl p-0.5">
              <div 
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${(health / maxHealth) * 100}%` }}
              />
           </div>
        </Html>
      )}
    </group>
  );
}
