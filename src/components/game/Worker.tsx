/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';

interface WorkerProps {
  position: THREE.Vector3;
  isWorking?: boolean;
  role?: 'lumberjack' | 'miner' | 'farmer' | 'guard' | 'scientist' | 'trader';
}

export function Worker({ position, isWorking, role }: WorkerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    if (isWorking) {
      if (armsRef.current) {
        armsRef.current.rotation.x = Math.sin(t * 8) * 0.4 - 0.2;
      }
    } else {
      meshRef.current.position.y = Math.sin(t * 2) * 0.02;
    }
  });

  return (
    <group ref={meshRef} position={[position.x, position.y + 0.01, position.z]}>
      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
        <meshStandardMaterial color={role === 'guard' ? '#1a237e' : role === 'scientist' ? '#e1f5fe' : '#ffccaa'} />
      </mesh>
      
      {/* Head */}
      <Sphere args={[0.12, 8, 8]} position={[0, 0.75, 0]} castShadow>
        <meshStandardMaterial color="#ffccaa" />
      </Sphere>

      {/* Guard Helmet */}
      {role === 'guard' && (
        <Sphere args={[0.14, 8, 8]} position={[0, 0.78, 0]} castShadow>
           <meshStandardMaterial color="#455a64" wireframe />
        </Sphere>
      )}

      {/* Arms */}
      <group ref={armsRef} position={[0, 0.55, 0]}>
        <Box args={[0.08, 0.25, 0.08]} position={[0.2, -0.1, 0]} castShadow>
          <meshStandardMaterial color="#ffccaa" />
        </Box>
        <Box args={[0.08, 0.25, 0.08]} position={[-0.2, -0.1, 0]} castShadow>
          <meshStandardMaterial color="#ffccaa" />
        </Box>

        {/* Tools based on Role */}
        {role === 'lumberjack' && (
          <group position={[0.2, -0.25, 0.1]} rotation={[Math.PI/2, 0, 0]}>
             <Cylinder args={[0.015, 0.015, 0.4]}><meshStandardMaterial color="#5d4037" /></Cylinder>
             <Box args={[0.1, 0.15, 0.05]} position={[0, 0.15, 0]}><meshStandardMaterial color="#757575" /></Box>
          </group>
        )}
        {role === 'miner' && (
           <group position={[0.2, -0.25, 0.1]} rotation={[Math.PI/2, 0, 0]}>
              <Cylinder args={[0.015, 0.015, 0.4]}><meshStandardMaterial color="#424242" /></Cylinder>
              <Box args={[0.2, 0.05, 0.05]} position={[0, 0.15, 0]}><meshStandardMaterial color="#9e9e9e" /></Box>
           </group>
        )}
        {role === 'farmer' && (
           <group position={[0.2, -0.25, 0.1]} rotation={[Math.PI/2, 0, 0]}>
              <Cylinder args={[0.01, 0.01, 0.5]}><meshStandardMaterial color="#3e2723" /></Cylinder>
              <Box args={[0.15, 0.02, 0.15]} position={[0, 0.2, 0]}><meshStandardMaterial color="#8bc34a" /></Box>
           </group>
        )}
        {role === 'guard' && (
           <group position={[0.2, -0.25, 0.1]} rotation={[Math.PI/2, 0, 0]}>
              <Cylinder args={[0.015, 0.015, 0.5]}><meshStandardMaterial color="#90a4ae" /></Cylinder>
              <Box args={[0.1, 0.3, 0.02]} position={[0, 0.2, 0]} rotation={[0, 0, 0.5]}><meshStandardMaterial color="#b0bec5" /></Box>
           </group>
        )}
        {role === 'scientist' && (
           <group position={[0.2, -0.25, 0.1]} rotation={[0, 0, 0]}>
              <Cylinder args={[0.05, 0.05, 0.2]} position={[0, 0.1, 0]}><meshStandardMaterial color="#03a9f4" transparent opacity={0.7} /></Cylinder>
           </group>
        )}
        {role === 'trader' && (
           <group position={[0.2, -0.25, 0.1]} rotation={[0, 0.2, 0]}>
              <Box args={[0.2, 0.2, 0.2]} position={[0, 0.1, 0]}><meshStandardMaterial color="#ffc107" /></Box>
           </group>
        )}
      </group>

      {/* Backpack/Resources */}
      {role !== 'guard' && (
        <Box args={[0.2, 0.3, 0.1]} position={[0, 0.4, -0.1]}>
           <meshStandardMaterial color="#5d4037" />
        </Box>
      )}
    </group>
  );
}
