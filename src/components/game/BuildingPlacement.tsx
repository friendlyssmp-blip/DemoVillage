/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore, BUILDING_TYPES } from '../../store/useGameStore';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function BuildingPlacement() {
  const { isPlacementMode, placementTypeId, placeBuilding, checkPlacement } = useGameStore();
  const [position, setPosition] = useState<[number, number]>([0, 0]);
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
  });

  if (!isPlacementMode || !placementTypeId) return null;

  const { isNear, isOverlap } = checkPlacement(position);
  const isValid = isNear && !isOverlap;

  return (
    <group 
      position={[position[0], 0, position[1]]}
      onClick={(e) => {
        e.stopPropagation();
        if (isValid) {
           placeBuilding(placementTypeId, position);
        }
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial 
          color={isValid ? "#00ff00" : "#ff0000"} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
      
      {/* Ghost Model */}
      <group position={[0, 0.01, 0]}>
         <Box args={[1.5, 1, 1.5]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color={isValid ? "#00ff00" : "#ff0000"} transparent opacity={0.4} />
         </Box>
      </group>

      {!isNear && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
           <ringGeometry args={[14.8, 15, 64]} />
           <meshStandardMaterial color="#ff0000" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  );
}
