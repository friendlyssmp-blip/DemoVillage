/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

const CHUNK_SIZE = 40;

// Deterministic random based on chunk coords
const random = (s: number) => {
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

export function MapObjects() {
  const visibleChunks = useGameStore((state) => state.visibleChunks);
  const selectObject = useGameStore((state) => state.selectObject);
  const selectedObjectId = useGameStore((state) => state.selectedObjectId);
  
  const treeMeshRef = useRef<THREE.InstancedMesh>(null);
  const rockMeshRef = useRef<THREE.InstancedMesh>(null);

  // Generate deterministic objects for visible chunks
  const objects = useMemo(() => {
    const list: Array<{ type: 'tree' | 'rock', matrix: THREE.Matrix4, id: string }> = [];
    
    visibleChunks.forEach(chunkKey => {
      const [cx, cz] = chunkKey.split(',').map(Number);
      const seed = cx * 1000 + cz;
      const count = Math.floor(random(seed) * 8) + 4;

      for (let i = 0; i < count; i++) {
        const objSeed = seed + i * 23;
        const r = random(objSeed);
        const type = r > 0.6 ? 'tree' : 'rock';
        const posX = cx * CHUNK_SIZE + (random(objSeed + 1) - 0.5) * CHUNK_SIZE;
        const posZ = cz * CHUNK_SIZE + (random(objSeed + 2) - 0.5) * CHUNK_SIZE;
        const scale = 0.8 + random(objSeed + 3) * 0.4;
        
        const matrix = new THREE.Matrix4();
        matrix.compose(
          new THREE.Vector3(posX, 0, posZ),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, random(objSeed + 4) * Math.PI * 2, 0)),
          new THREE.Vector3(scale, scale, scale)
        );
        
        list.push({ type, matrix, id: `chunk-${chunkKey}-obj-${i}` });
      }
    });

    return list;
  }, [visibleChunks]);

  useEffect(() => {
    if (!treeMeshRef.current || !rockMeshRef.current) return;

    const trees = objects.filter(o => o.type === 'tree');
    const rocks = objects.filter(o => o.type === 'rock');

    treeMeshRef.current.count = trees.length;
    rockMeshRef.current.count = rocks.length;

    trees.forEach((obj, i) => treeMeshRef.current!.setMatrixAt(i, obj.matrix));
    rocks.forEach((obj, i) => rockMeshRef.current!.setMatrixAt(i, obj.matrix));

    treeMeshRef.current.instanceMatrix.needsUpdate = true;
    rockMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [objects]);

  return (
    <group>
      {/* Selection Ring - For instanced objects we still need a way to show selection */}
      {selectedObjectId && selectedObjectId.startsWith('chunk-') && (
        <group>
            {/* Logic to find selected object position would go here, 
                for now we keep it simple since we can't easily position a single ring relative to instance matrix without work */}
        </group>
      )}

      {/* Trees Instanced */}
      <instancedMesh 
        ref={treeMeshRef} 
        args={[undefined, undefined, 500]}
        onPointerDown={(e) => {
          e.stopPropagation();
          const trees = objects.filter(o => o.type === 'tree');
          if (e.instanceId !== undefined && trees[e.instanceId]) {
            selectObject(trees[e.instanceId].id);
          }
        }}
      >
        <cylinderGeometry args={[0.3, 0.4, 3, 6]} />
        <meshStandardMaterial color="#2e7d32" />
      </instancedMesh>

      {/* Rocks Instanced */}
      <instancedMesh 
        ref={rockMeshRef} 
        args={[undefined, undefined, 500]}
        onPointerDown={(e) => {
          e.stopPropagation();
          const rocks = objects.filter(o => o.type === 'rock');
          if (e.instanceId !== undefined && rocks[e.instanceId]) {
            selectObject(rocks[e.instanceId].id);
          }
        }}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial color="#757575" />
      </instancedMesh>
    </group>
  );
}

