/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Box, Cylinder, Sphere, Text, Float, Html, Cone } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, BUILDING_TYPES } from '../../store/useGameStore';
import { motion as motion3d } from 'framer-motion-3d';
import { motion } from 'motion/react';
import { springTransition } from '../../lib/animations';

interface BuildingProps {
// ...
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
  const state = useGameStore(useShallow((s) => ({
    selectBuilding: s.selectBuilding,
    isEditMode: s.isEditMode,
    startMoving: s.startMoving,
    movingBuildingId: s.movingBuildingId,
    viewMode: s.viewMode,
    isResearchOpen: s.isResearchOpen,
    isQuestsOpen: s.isQuestsOpen,
    isZonesOpen: s.isZonesOpen,
    isPaused: s.isPaused,
    isAnyMenuOpen: s.isAnyMenuOpen
  })));

  const {
    selectBuilding, isEditMode, startMoving, movingBuildingId,
    viewMode, isResearchOpen, isQuestsOpen, isZonesOpen, isPaused, isAnyMenuOpen
  } = state;

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

  const isConstructing = progress < 1;
  const isEnemy = id.startsWith('enemy-');

  const showLabels = (viewMode === 'playing' || viewMode === 'fighting') && 
                     !isAnyMenuOpen() && !isEditMode;

  const finalModel = React.useMemo(() => {
    const baseScale = type.size || 1;
    const levelScale = (1 + (Math.log2(level) * 0.15)) * (baseScale / 2);

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
            <Box args={[1.8, 1.4, 1.8]} position={[0, 0.7, 0]} castShadow>
               <meshStandardMaterial color="#5d4037" />
            </Box>
            <Box args={[2, 0.3, 2]} position={[0, 1.5, 0]} rotation={[0.05, 0, 0]}>
               <meshStandardMaterial color="#212121" />
            </Box>
            <group position={[0.6, 0.3, 0.6]}>
               <Box args={[0.5, 0.5, 0.5]} position={[0, 0, 0]} castShadow>
                  <meshStandardMaterial color="#8b4513" />
               </Box>
               <Box args={[0.4, 0.4, 0.4]} position={[-0.2, 0.5, -0.1]} rotation={[0, 0.5, 0]} castShadow>
                  <meshStandardMaterial color="#a1887f" />
               </Box>
            </group>
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
            <Box args={[0.6, 0.9, 0.1]} position={[0, 0.45, 0.91]}>
               <meshStandardMaterial color="#3e2723" />
            </Box>
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
      case 'goblin_hut':
        return (
          <group scale={levelScale}>
            <Box args={[1.5, 1, 1.5]} position={[0, 0.5, 0]} castShadow>
               <meshStandardMaterial color="#3e2723" />
            </Box>
            <Cone args={[1.2, 1.5, 4]} position={[0, 1.75, 0]} castShadow>
               <meshStandardMaterial color="#2e7d32" />
            </Cone>
            <Box args={[0.4, 0.6, 0.1]} position={[0, 0.3, 0.76]}>
               <meshStandardMaterial color="#1b5e20" />
            </Box>
            {/* Small spear */}
            <Cylinder args={[0.02, 0.02, 1.5]} position={[0.8, 0.75, 0.8]} rotation={[0, 0, 0.1]}>
               <meshStandardMaterial color="#4e342e" />
            </Cylinder>
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
      case 'tower':
         return (
           <group scale={levelScale}>
             <Box args={[1.2, 3, 1.2]} position={[0, 1.5, 0]} castShadow>
                <meshStandardMaterial color="#37474f" />
             </Box>
             <Box args={[1.6, 0.4, 1.6]} position={[0, 3.2, 0]}>
                <meshStandardMaterial color="#263238" />
             </Box>
             {/* Battlements */}
             {[[-0.7, -0.7], [0.7, -0.7], [0.7, 0.7], [-0.7, 0.7]].map((pos, i) => (
               <Box key={i} args={[0.3, 0.4, 0.3]} position={[pos[0], 3.4, pos[1]]}>
                 <meshStandardMaterial color="#263238" />
               </Box>
             ))}
             {/* Archer inside */}
             <group position={[0, 3.4, 0]}>
                <Sphere args={[0.2, 8, 8]} position={[0, 0, 0]}>
                   <meshStandardMaterial color="#4ade80" />
                </Sphere>
                <Box args={[0.4, 0.1, 0.05]} position={[0, -0.1, 0.2]}>
                   <meshStandardMaterial color="#5d4037" />
                </Box>
             </group>
           </group>
         );
      case 'mortar':
         return (
           <group scale={levelScale}>
              <Cylinder args={[1.5, 1.6, 0.5, 16]} position={[0, 0.25, 0]}>
                 <meshStandardMaterial color="#263238" />
              </Cylinder>
              <group rotation={[Math.PI / 4, 0, 0]}>
                 <Cylinder args={[0.6, 0.6, 2, 16]} position={[0, 1, 0]}>
                    <meshStandardMaterial color="#37474f" />
                 </Cylinder>
                 <Box args={[0.2, 1.8, 0.1]} position={[0, 1, 0.6]}>
                    <meshStandardMaterial color="#c62828" />
                 </Box>
              </group>
           </group>
         );
      case 'trap':
         return (
           <group scale={levelScale}>
              <Box args={[0.8, 0.1, 0.8]} position={[0, 0.05, 0]}>
                 <meshStandardMaterial 
                   color="#455a64" 
                   transparent={isEnemy} 
                   opacity={isEnemy ? 0.2 : 0.8} 
                 />
              </Box>
              <Sphere args={[0.3, 0.3, 0.3]} position={[0, 0.15, 0]}>
                 <meshStandardMaterial color="#c62828" transparent={isEnemy} opacity={isEnemy ? 0.1 : 1} />
              </Sphere>
           </group>
         );
      case 'wall':
         const wallColors = ['#8d6e63', '#5d4037', '#9e9e9e', '#546e7a', '#263238'];
         const color = wallColors[Math.min(level - 1, wallColors.length - 1)];
         return (
           <group scale={levelScale}>
             <Box args={[1, 1.2, 1]} position={[0, 0.6, 0]} castShadow>
                <meshStandardMaterial color={color} roughness={0.8} />
             </Box>
             {level >= 3 && (
                <Box args={[1.1, 0.2, 1.1]} position={[0, 1.2, 0]}>
                   <meshStandardMaterial color="#424242" />
                </Box>
             )}
             {/* Decorative spikes for wood level */}
             {level < 3 && (
                <group position={[0, 1.2, 0]}>
                   <Cone args={[0.1, 0.3, 4]} position={[-0.3, 0.1, -0.3]} rotation={[0, 0, 0]}>
                      <meshStandardMaterial color="#3e2723" />
                   </Cone>
                   <Cone args={[0.1, 0.3, 4]} position={[0.3, 0.1, 0.3]} rotation={[0, 0, 0]}>
                      <meshStandardMaterial color="#3e2723" />
                   </Cone>
                </group>
             )}
           </group>
         );
      case 'torch':
         return (
           <group scale={levelScale}>
             {/* Main Pole - Low Poly */}
             <Cylinder args={[0.04, 0.06, 2.0, 5]} position={[0, 1, 0]} castShadow>
                <meshStandardMaterial color="#3d2b1f" roughness={1} />
             </Cylinder>
             
             {/* Fire Visualization - Highly Optimized */}
             <group position={[0, 2.1, 0]}>
               <Float speed={8} rotationIntensity={0.1} floatIntensity={0.4}>
                 {/* Single Core Flame */}
                 <Sphere args={[0.12, 6, 6]} scale={[1, 1.4, 1]}>
                    <meshStandardMaterial 
                      color="#ff5722" 
                      emissive="#ff5722" 
                      emissiveIntensity={12} 
                      toneMapped={false}
                    />
                 </Sphere>
               </Float>

               {/* Very Cheap Light - No Shadows */}
               <pointLight 
                 color="#ff8f00" 
                 intensity={15 * (1 + (level - 1) * 0.5)} 
                 distance={8 + level * 2} 
                 decay={1.5}
               />
             </group>
           </group>
         );
      default:
        return <Box args={[1, 1, 1]}><meshStandardMaterial color="magenta" /></Box>;
    }
  }, [type, level]); // Progress removed from dependency array

  const constructionModel = React.useMemo(() => {
    if (progress >= 1) return null;
    
    // Scaffolding and phase updates using scale/position to avoid geometry disposal
    const frameHeight = 1.5;
    const progressFactor = Math.min(1, Math.max(0, (progress - 0.33) / 0.67));

    return (
      <group>
        {/* Foundation Phase (0 - 0.33) */}
        <Box args={[1.6, 0.1, 1.6]} position={[0, 0.05, 0]}>
          <meshStandardMaterial color="#555555" />
        </Box>
        
        {/* Framework Phase (0.33 - 1.0) */}
        {progress > 0.33 && (
          <group>
            {[
              [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7]
            ].map(([px, pz], idx) => (
              <Box 
                key={idx}
                args={[0.1, frameHeight, 0.1]} 
                position={[px, (frameHeight * progressFactor) / 2, pz]}
                scale={[1, progressFactor, 1]}
              >
                <meshStandardMaterial color="#8b4513" />
              </Box>
            ))}
          </group>
        )}

        {/* Scaffolding Wrap */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.7, 0]}>
           <boxGeometry args={[1.7, 1.7, 1.4]} />
           <meshStandardMaterial color="#8b4513" wireframe />
        </mesh>
      </group>
    );
  }, [progress]);

  const model = isConstructing ? constructionModel : finalModel;

  return (
    <motion3d.group 
      position={[position[0], 0, position[1]]} 
      rotation={[0, rotation, 0]} 
      initial={{ scale: 0, y: 8, rotateY: rotation + 0.5 }}
      animate={{ scale: 1, y: 0, rotateY: rotation }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 0.8
      }}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <motion3d.group 
        position={[0, 0.01, 0]}
        animate={{
          scale: (isSelected || hovered) ? 1.05 : 1
        }}
        transition={springTransition}
      >
        {model}
      </motion3d.group>
      
      {isConstructing && showLabels && (
        <Html position={[0, 4.5, 0]} center>
          <div className="flex flex-col items-center gap-2 w-36 pointer-events-none select-none">
            <div className="flex items-center gap-3 px-4 py-2 bg-brand-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] tech-border animate-float">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-brand-400 uppercase tracking-[0.3em] font-mono leading-none mb-1">
                  CORE PROTOCOL
                </span>
                <span className="text-[10px] font-black text-white uppercase italic tracking-[0.1em] font-display leading-none">
                  INITIALIZING...
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[12px] font-black text-white font-mono leading-none">{Math.floor(progress * 100)}%</span>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse mt-1" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-900/80 rounded-full border border-white/5 overflow-hidden shadow-2xl p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-300 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              />
            </div>
          </div>
        </Html>
      )}

      {!isConstructing && showLabels && (
        <Html position={[0, 3.5 + (level * 0.1), 0]} center>
          <div className="flex flex-col items-center gap-1 w-24 pointer-events-none select-none">
            <div className={`glass-panel px-4 py-1.5 rounded-[12px] border ${isSelected ? 'border-brand-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-white/10 shadow-xl'} flex items-center gap-3 backdrop-blur-3xl transition-all tech-border`}>
              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand-400 shadow-[0_0_8px_white]' : 'bg-brand-300'} animate-pulse`} />
              <span className="text-[11px] font-black text-white uppercase italic tracking-tighter font-display">Lv{level}</span>
            </div>
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
    </motion3d.group>
  );
}
