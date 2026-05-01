/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore, BUILDING_TYPES } from '../../store/useGameStore';
import { gameService } from '../../services/gameService';
import { motion } from 'framer-motion-3d';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

export function BuildingPlacement() {
  const { isPlacementMode, placementTypeId, checkPlacement } = useGameStore();
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [lastPlacedPos, setLastPlacedPos] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  
  const { raycaster, mouse, camera } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const point = new THREE.Vector3();

  useFrame(() => {
    if (!isPlacementMode) return;
    raycaster.setFromCamera(mouse, camera);
    if (raycaster.ray.intersectPlane(plane, point)) {
      const x = Math.round(point.x);
      const z = Math.round(point.z);
      if (x !== position[0] || z !== position[1]) {
        setPosition([x, z]);
      }
    }

    // Continuous placement for walls/torches
    if (isDragging && (placementTypeId === 'wall' || placementTypeId === 'torch')) {
      const type = BUILDING_TYPES[placementTypeId as keyof typeof BUILDING_TYPES];
      const { isNear, isOverlap } = checkPlacement(position);
      const posKey = `${position[0]},${position[1]}`;
      
      if (isNear && !isOverlap && posKey !== lastPlacedPos) {
        gameService.placeBuilding(placementTypeId, position);
        setLastPlacedPos(posKey);
      }
    }
  });

  if (!isPlacementMode || !placementTypeId) return null;

  const type = BUILDING_TYPES[placementTypeId as keyof typeof BUILDING_TYPES];
  const { isNear, isOverlap } = checkPlacement(position);
  const isValid = isNear && !isOverlap;

  return (
    <motion.group 
      animate={{ x: position[0], z: position[1], scale: isValid ? 1 : 1.05 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      position={[position[0], 0, position[1]]}
      onPointerDown={(e) => {
        e.stopPropagation();
        setIsDragging(true);
        if (isValid) {
           gameService.placeBuilding(placementTypeId, position);
           setLastPlacedPos(`${position[0]},${position[1]}`);
        }
      }}
      onPointerUp={() => setIsDragging(false)}
      onPointerOut={() => setIsDragging(false)}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[type.size || 1, type.size || 1]} />
        <motion.meshStandardMaterial 
          animate={{ 
            opacity: isValid ? [0.2, 0.6, 0.2] : [0.7, 0.1, 0.7],
            emissiveIntensity: isValid ? [0.1, 0.4, 0.1] : [0.5, 0, 0.5]
          }}
          transition={{ duration: isValid ? 1.5 : 0.3, repeat: Infinity }}
          color={isValid ? "#22c55e" : "#ef4444"} 
          emissive={isValid ? "#22c55e" : "#ef4444"}
          transparent 
        />
      </mesh>
      
      {/* Ghost Model */}
      <group position={[0, 0.01, 0]}>
         <Box args={[(type.size || 1) * 0.9, 0.5, (type.size || 1) * 0.9]} position={[0, 0.25, 0]}>
            <motion.meshStandardMaterial 
              animate={{ 
                opacity: [0.3, 0.4, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              color={isValid ? "#4ade80" : "#f87171"} 
              transparent 
              wireframe
            />
         </Box>
      </group>

      {!isNear && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
           <ringGeometry args={[14.8, 15, 64]} />
           <meshStandardMaterial color="#ff0000" transparent opacity={0.2} />
        </mesh>
      )}
    </motion.group>
  );
}
