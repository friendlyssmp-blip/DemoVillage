/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '../store/useGameStore';

const CHUNK_SIZE = 40;

// Deterministic random based on chunk coords
const random = (s: number) => {
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

export function MapObjects() {
  const mapObjects = useGameStore((state) => state.mapObjects);
  const visibleChunks = useGameStore((state) => state.visibleChunks);
  const selectObject = useGameStore((state) => state.selectObject);
  const selectedObjectId = useGameStore((state) => state.selectedObjectId);
  
  const treeMeshRef = useRef<THREE.InstancedMesh>(null);
  const foliageMeshRef = useRef<THREE.InstancedMesh>(null);
  const rockMeshRef = useRef<THREE.InstancedMesh>(null);
  const bushMeshRef = useRef<THREE.InstancedMesh>(null);

  // Filter store objects by visible chunks
  const objects = useMemo(() => {
    return mapObjects.filter(obj => {
      const cx = Math.floor(obj.position[0] / CHUNK_SIZE);
      const cz = Math.floor(obj.position[1] / CHUNK_SIZE);
      return visibleChunks.includes(`${cx},${cz}`);
    });
  }, [mapObjects, visibleChunks]);

  useEffect(() => {
    if (!treeMeshRef.current || !foliageMeshRef.current || !rockMeshRef.current || !bushMeshRef.current) return;

    const trees = objects.filter(o => o.type === 'tree');
    const rocks = objects.filter(o => o.type === 'rock');
    const bushes = objects.filter(o => o.type === 'bush');

    treeMeshRef.current.count = trees.length;
    foliageMeshRef.current.count = trees.length;
    rockMeshRef.current.count = rocks.length;
    bushMeshRef.current.count = bushes.length;

    trees.forEach((obj, i) => {
      const scale = obj.scale || 1;
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(obj.position[0], 0, obj.position[1]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (obj.position[0] + obj.position[1]) * 10, 0)),
        new THREE.Vector3(scale, scale, scale)
      );
      treeMeshRef.current!.setMatrixAt(i, matrix);
      
      // Variations in foliage color
      const hueShift = (random(obj.position[0] + obj.position[1]) - 0.5) * 0.1;
      const treeColor = new THREE.Color('#14532d').offsetHSL(hueShift, 0, 0);
      foliageMeshRef.current!.setColorAt(i, treeColor);
      
      // Position foliage above trunk
      const foliageMatrix = matrix.clone();
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const s = new THREE.Vector3();
      foliageMatrix.decompose(pos, quat, s);
      pos.y += 1.2 * s.y;
      foliageMatrix.compose(pos, quat, s.multiplyScalar(1.4));
      foliageMeshRef.current!.setMatrixAt(i, foliageMatrix);
    });

    rocks.forEach((obj, i) => {
      const scale = obj.scale || 1;
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(obj.position[0], 0.2, obj.position[1]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(
          random(obj.position[0]) * Math.PI, 
          random(obj.position[1]) * Math.PI, 
          random(obj.position[0] + obj.position[1]) * Math.PI
        )),
        new THREE.Vector3(scale, scale, scale)
      );
      rockMeshRef.current!.setMatrixAt(i, matrix);
      
      const rockHue = 0.5 + (random(obj.position[0]) * 0.1);
      const rockColor = new THREE.Color().setHSL(0, 0, rockHue);
      rockMeshRef.current!.setColorAt(i, rockColor);
    });

    bushes.forEach((obj, i) => {
      const scale = obj.scale || 1;
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(obj.position[0], 0, obj.position[1]),
        new THREE.Quaternion(),
        new THREE.Vector3(scale * 0.8, scale * 0.8, scale * 0.8)
      );
      bushMeshRef.current!.setMatrixAt(i, matrix);
    });

    treeMeshRef.current.instanceMatrix.needsUpdate = true;
    foliageMeshRef.current.instanceMatrix.needsUpdate = true;
    rockMeshRef.current.instanceMatrix.needsUpdate = true;
    bushMeshRef.current.instanceMatrix.needsUpdate = true;
    
    if (foliageMeshRef.current.instanceColor) foliageMeshRef.current.instanceColor.needsUpdate = true;
    if (rockMeshRef.current.instanceColor) rockMeshRef.current.instanceColor.needsUpdate = true;
  }, [objects]);

  return (
    <group>
      {selectedObjectId && (
        <group>
          {objects.filter(obj => obj.id === selectedObjectId).map(obj => (
            <group key={`sel-${obj.id}`} position={[obj.position[0], 0.1, obj.position[1]]}>
               <mesh rotation={[-Math.PI/2, 0, 0]}>
                  <ringGeometry args={[1.5 * (obj.scale || 1), 1.7 * (obj.scale || 1), 32]} />
                  <meshStandardMaterial color="#22d3ee" transparent opacity={0.6} emissive="#22d3ee" emissiveIntensity={2} />
               </mesh>
               <Html position={[0, 4 * (obj.scale || 1), 0]} center>
                  <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
                     <div className="glass-panel px-4 py-2 bg-brand-600/90 border border-brand-400/40 rounded-[20px] shadow-2xl flex items-center gap-2 tech-border">
                        <span className="text-[10px] font-black text-white uppercase italic tracking-widest font-display">REMOVE</span>
                        <div className="flex items-center gap-1.5 bg-yellow-400/20 px-2 py-0.5 rounded-full border border-yellow-400/40">
                           <span className="text-[10px] font-black text-yellow-400 font-mono">-{obj.removalCost}</span>
                           <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        </div>
                     </div>
                  </div>
               </Html>
            </group>
          ))}
        </group>
      )}

      {/* Trees Trunk Instanced */}
      <instancedMesh 
        ref={treeMeshRef} 
        args={[undefined, undefined, 1000]}
        onPointerDown={(e) => {
          e.stopPropagation();
          const trees = objects.filter(o => o.type === 'tree');
          if (e.instanceId !== undefined && trees[e.instanceId]) {
            selectObject(trees[e.instanceId].id);
          }
        }}
      >
        <cylinderGeometry args={[0.08, 0.12, 2.2, 5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={1} />
      </instancedMesh>

      {/* Trees Foliage Instanced (Cones for better look) */}
      <instancedMesh 
        ref={foliageMeshRef} 
        args={[undefined, undefined, 1000]}
      >
        <coneGeometry args={[1, 2.5, 5]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>

      {/* Rocks Instanced */}
      <instancedMesh 
        ref={rockMeshRef} 
        args={[undefined, undefined, 1000]}
        onPointerDown={(e) => {
          e.stopPropagation();
          const rocks = objects.filter(o => o.type === 'rock');
          if (e.instanceId !== undefined && rocks[e.instanceId]) {
            selectObject(rocks[e.instanceId].id);
          }
        }}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.7} metalness={0.2} />
      </instancedMesh>

      {/* Bushes Instanced */}
      <instancedMesh 
        ref={bushMeshRef} 
        args={[undefined, undefined, 1000]}
        onPointerDown={(e) => {
          e.stopPropagation();
          const bushes = objects.filter(o => o.type === 'bush');
          if (e.instanceId !== undefined && bushes[e.instanceId]) {
            selectObject(bushes[e.instanceId].id);
          }
        }}
      >
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

