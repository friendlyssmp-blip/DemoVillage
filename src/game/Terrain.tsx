/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Box, Sphere, Cylinder, Float } from '@react-three/drei';

export function Terrain() {
  const visibleChunks = useGameStore(state => state.visibleChunks);
  const selectBuilding = useGameStore(state => state.selectBuilding);
  const selectObject = useGameStore(state => state.selectObject);
  const CHUNK_SIZE = 40;

  const deselect = () => {
    selectBuilding(null);
    selectObject(null);
  };

  const isPlacementMode = useGameStore(state => state.isPlacementMode);
  const isEditMode = useGameStore(state => state.isEditMode);
  const showGrid = isPlacementMode || isEditMode;

  return (
    <group>
      {visibleChunks.map(chunkKey => {
        const [cx, cz] = chunkKey.split(',').map(Number);
        const x = cx * CHUNK_SIZE + CHUNK_SIZE / 2;
        const z = cz * CHUNK_SIZE + CHUNK_SIZE / 2;
        
        return (
          <group key={chunkKey} position={[x - CHUNK_SIZE/2, 0, z - CHUNK_SIZE/2]}>
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.02, 0]} 
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                deselect();
              }}
            >
              <planeGeometry args={[CHUNK_SIZE, CHUNK_SIZE]} />
              <meshStandardMaterial color={(cx + cz) % 2 === 0 ? "#33691e" : "#558b2f"} />
            </mesh>
            
            {showGrid && (
              <gridHelper 
                args={[CHUNK_SIZE, 10, "#ffffff", "#ffffff"]} 
                position={[0, 0.001, 0]} 
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
