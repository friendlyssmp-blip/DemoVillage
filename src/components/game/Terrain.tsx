/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Box, Sphere, Cylinder, Float } from '@react-three/drei';

export function Terrain() {
  const gridSize = useGameStore(state => state.gridSize);
  const selectBuilding = useGameStore(state => state.selectBuilding);
  const selectObject = useGameStore(state => state.selectObject);

  const deselect = () => {
    selectBuilding(null);
    selectObject(null);
  };

  return (
    <group>
      {/* Ground Plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.02, 0]} 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          deselect();
        }}
      >
        <planeGeometry args={[gridSize + 40, gridSize + 40]} />
        <meshStandardMaterial color="#33691e" />
      </mesh>

      {/* Grassy sub-layer */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          deselect();
        }}
      >
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial color="#558b2f" />
      </mesh>

      {/* Isometric Style Grid */}
      <gridHelper 
        args={[gridSize, gridSize, "#ffffff", "#ffffff"]} 
        position={[0, 0, 0]} 
      />
    </group>
  );
}
