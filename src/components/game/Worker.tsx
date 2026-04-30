/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface WorkerProps {
  position: THREE.Vector3;
  isWorking?: boolean;
  role?: 'lumberjack' | 'miner' | 'farmer' | 'guard' | 'scientist' | 'trader';
}

export function Worker({ position, isWorking, role }: WorkerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);
  const { cameraPosition } = useGameStore();

  const lastPos = useRef(new THREE.Vector3().copy(position));
  const walkingAlpha = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Performance optimization: Entity Culling
    const dx = position.x - state.camera.position.x;
    const dy = position.y - state.camera.position.y;
    const dz = position.z - state.camera.position.z;
    const distSq = dx*dx + dy*dy + dz*dz;
    if (distSq > 2500) return; 

    const t = state.clock.getElapsedTime();

    // Walking detection
    const moveDist = position.distanceTo(lastPos.current);
    const isWalking = moveDist > 0.001;
    walkingAlpha.current = THREE.MathUtils.lerp(walkingAlpha.current, isWalking ? 1 : 0, 0.1);
    lastPos.current.copy(position);

    if (isWorking) {
      if (armsRef.current) {
        armsRef.current.rotation.x = Math.sin(t * 12) * 0.6 - 0.4;
      }
      meshRef.current.rotation.z = Math.sin(t * 12) * 0.08;
      // Working bounce
      meshRef.current.position.y = (position.y + 0.01) + Math.abs(Math.sin(t * 12)) * 0.02;
    } else {
      // Breathing / Idle (Slower and more natural)
      const breathing = Math.sin(t * 1.5) * 0.015;
      meshRef.current.scale.set(1 + breathing, 1 + breathing, 1 + breathing);
      
      if (isWalking) {
        const walkFreq = 14;
        meshRef.current.rotation.x = (Math.sin(t * walkFreq) * 0.1) + 0.1; // Lean forward + bob
        meshRef.current.rotation.z = Math.sin(t * walkFreq * 0.5) * 0.08; // Side wobble
        // Walk bounce
        meshRef.current.position.y = (position.y + 0.01) + Math.abs(Math.sin(t * walkFreq)) * 0.08;
      } else {
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position.y + 0.01, 0.1);
      }
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
