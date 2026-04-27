/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function InstancedWorkers() {
  const npcs = useGameStore(state => state.npcs);
  const visibleChunks = useGameStore(state => state.visibleChunks);
  const movingBuildingId = useGameStore(state => state.movingBuildingId);
  const CHUNK_SIZE = 40;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const headMeshRef = useRef<THREE.InstancedMesh>(null);

  const culledNpcs = useMemo(() => npcs.filter(n => {
    if (n.buildingId === movingBuildingId) return false;
    const cx = Math.floor(n.position[0] / CHUNK_SIZE);
    const cz = Math.floor(n.position[2] / CHUNK_SIZE);
    return visibleChunks.includes(`${cx},${cz}`);
  }), [npcs, visibleChunks, movingBuildingId]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || !headMeshRef.current) return;
    
    const t = state.clock.getElapsedTime();

    culledNpcs.forEach((npc, i) => {
      // Body
      dummy.position.set(npc.position[0], npc.position[1] + 0.35, npc.position[2]);
      dummy.scale.set(1, 1, 1);
      
      // Basic "walking/working" animation
      const animY = Math.sin(t * 8 + i) * 0.05;
      dummy.position.y += animY;
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Head
      dummy.position.set(npc.position[0], npc.position[1] + 0.75 + animY, npc.position[2]);
      dummy.updateMatrix();
      headMeshRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Color adjustment based on role
      let color = new THREE.Color('#ffccaa');
      if (npc.role === 'guard') color.set('#1a237e');
      else if (npc.role === 'scientist') color.set('#e1f5fe');
      
      meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.count = culledNpcs.length;
    headMeshRef.current.count = culledNpcs.length;
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    headMeshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {/* Bodies */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, 100]} castShadow>
        <capsuleGeometry args={[0.15, 0.3, 2, 4]} />
        <meshStandardMaterial />
      </instancedMesh>
      
      {/* Heads */}
      <instancedMesh ref={headMeshRef} args={[undefined, undefined, 100]} castShadow>
        <sphereGeometry args={[0.12, 4, 4]} />
        <meshStandardMaterial color="#ffccaa" />
      </instancedMesh>
    </group>
  );
}
