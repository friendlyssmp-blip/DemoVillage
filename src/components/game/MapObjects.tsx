/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cylinder, Cone, Sphere, Box } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';

export function MapObjects() {
  const mapObjects = useGameStore((state) => state.mapObjects);
  const selectObject = useGameStore((state) => state.selectObject);
  const selectedObjectId = useGameStore((state) => state.selectedObjectId);

  return (
    <group>
      {mapObjects.map((obj) => (
        <group 
          key={obj.id} 
          position={[obj.position[0], 0, obj.position[1]]}
        >
          <group 
            position={[0, 0.01, 0]}
            onClick={(e) => {
              e.stopPropagation();
              selectObject(obj.id);
            }}
          >
            {obj.type === 'tree' ? (
              <group>
                 {/* Trunk */}
                 <Cylinder args={[0.2, 0.3, 1.5]} position={[0, 0.75, 0]}>
                    <meshStandardMaterial color="#5d4037" />
                 </Cylinder>
                 {/* Leaves */}
                 <Cone args={[0.8, 1.5, 8]} position={[0, 1.8, 0]}>
                    <meshStandardMaterial color="#2e7d32" />
                 </Cone>
                 <Cone args={[0.6, 1.2, 8]} position={[0, 2.5, 0]}>
                    <meshStandardMaterial color="#388e3c" />
                 </Cone>
              </group>
            ) : (
              <group>
                 <Sphere args={[0.7, 8, 8]} position={[0, 0.3, 0]} scale={[1, 0.7, 1.2]}>
                    <meshStandardMaterial color="#757575" />
                 </Sphere>
                 <Sphere args={[0.4, 8, 8]} position={[0.4, 0.2, -0.3]} scale={[1.2, 0.8, 1]}>
                    <meshStandardMaterial color="#9e9e9e" />
                 </Sphere>
              </group>
            )}
          </group>

          {selectedObjectId === obj.id && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <ringGeometry args={[1, 1.2, 32]} />
              <meshStandardMaterial color="#ffff00" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
