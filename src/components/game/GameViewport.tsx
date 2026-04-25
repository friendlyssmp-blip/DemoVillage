/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect, useState } from 'react';
import { useThree, useFrame, Canvas } from '@react-three/fiber';
import { MapControls, Sky, Stars, ContactShadows, Environment, Float, Cloud } from '@react-three/drei';
import { useGameStore, MAP_ZONES } from '../../store/useGameStore';
import { Terrain } from './Terrain';
import { Building } from './Building';
import { Unit } from './Unit';
import { Worker } from './Worker';
import { MapObjects } from './MapObjects';
import { BuildingPlacement } from './BuildingPlacement';
import * as THREE from 'three';

function WeatherEffects() {
  const weather = useGameStore(state => state.weather);

  return (
    <group>
      {weather === 'rainy' && (
         <Float speed={10} rotationIntensity={0} floatIntensity={0}>
            {Array.from({ length: 50 }).map((_, i) => (
              <mesh key={i} position={[Math.random() * 40 - 20, Math.random() * 10 + 5, Math.random() * 40 - 20]}>
                <boxGeometry args={[0.02, 0.5, 0.02]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.4} />
              </mesh>
            ))}
         </Float>
      )}
      {weather === 'snowy' && (
         <Float speed={2} rotationIntensity={2} floatIntensity={2}>
            {Array.from({ length: 100 }).map((_, i) => (
              <mesh key={i} position={[Math.random() * 40 - 20, Math.random() * 10 + 5, Math.random() * 40 - 20]}>
                <sphereGeometry args={[0.05, 4, 4]} />
                <meshStandardMaterial color="white" />
              </mesh>
            ))}
         </Float>
      )}
      {(weather === 'stormy' || weather === 'rainy') && (
        <group>
           <Cloud opacity={0.5} speed={0.4} segments={20} position={[0, 15, 0]} color="#444444" />
        </group>
      )}
      {weather === 'stormy' && (
        <Float speed={20} floatIntensity={0} rotationIntensity={0}>
           <pointLight intensity={Math.random() > 0.95 ? 100 : 0} position={[Math.random() * 20 - 10, 10, Math.random() * 20 - 10]} color="#ffffff" />
        </Float>
      )}
    </group>
  );
}

function GlobalLighting() {
  const timeOfDay = useGameStore(state => state.timeOfDay);
  const weather = useGameStore(state => state.weather);
  const { scene } = useThree();

  // Smoothing lighting transitions
  const isNight = timeOfDay < 5 || timeOfDay > 19;
  const sunIntensity = isNight ? 0.2 : timeOfDay < 7 || timeOfDay > 17 ? 0.6 : 1.2;
  
  const angle = (timeOfDay / 24) * Math.PI * 2;
  const sunPosition: [number, number, number] = [
    Math.cos(angle) * 50,
    Math.sin(angle) * 50,
    10
  ];

  const skyColor = new THREE.Color();
  if (timeOfDay < 5 || timeOfDay > 20) skyColor.set('#050510');
  else if (timeOfDay < 7) skyColor.lerpColors(new THREE.Color('#050510'), new THREE.Color('#ff7733'), (timeOfDay - 5) / 2);
  else if (timeOfDay < 17) skyColor.set('#87ceeb');
  else skyColor.lerpColors(new THREE.Color('#87ceeb'), new THREE.Color('#ff3300'), (timeOfDay - 17) / 3);

  useEffect(() => {
    scene.background = skyColor;
    const fogColor = skyColor.clone().multiplyScalar(0.8);
    scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.015);
  }, [timeOfDay, weather, scene]);

  return (
    <>
      <Sky 
        distance={450000} 
        sunPosition={sunPosition} 
        inclination={0} 
        azimuth={0.25} 
        mieCoefficient={weather === 'stormy' ? 0.1 : 0.005}
        turbidity={weather === 'stormy' ? 20 : 0.1}
      />
      {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      
      <ambientLight intensity={isNight ? 0.2 : 0.5} />
      <directionalLight
        position={sunPosition}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      
      {isNight && (
        <directionalLight 
          position={[-sunPosition[0], sunPosition[1], -sunPosition[2]]} 
          intensity={0.15} 
          color="#aaaaff" 
        />
      )}
    </>
  );
}

function ZonesVisualizer() {
  const unlockedZones = useGameStore(state => state.unlockedZones);
  
  return (
    <group>
      {MAP_ZONES.map(zone => {
        const isUnlocked = unlockedZones.includes(zone.id);
        const { x, z } = zone.bounds;
        const width = x[1] - x[0];
        const depth = z[1] - z[0];
        const center: [number, number, number] = [(x[1] + x[0]) / 2, 0.01, (z[1] + z[0]) / 2];

        return (
          <mesh key={zone.id} position={center} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial 
              color={isUnlocked ? "#ffffff" : "#ff0000"} 
              transparent 
              opacity={isUnlocked ? 0.02 : 0.1} 
              wireframe={!isUnlocked}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function GameViewport({ menuMode = false, combatMode = false }: { menuMode?: boolean, combatMode?: boolean }) {
  const { 
    buildings, enemyBuildings, npcs, selectedBuildingId, tick, movingBuildingId, 
    isPlacementMode, isCameraLocked, combatStatus, isPaused
  } = useGameStore();

  useEffect(() => {
    let lastTime = performance.now();
    const frame = (time: number) => {
      const delta = Math.min(time - lastTime, 100);
      if (!isPaused) tick(delta);
      lastTime = time;
      requestAnimationFrame(frame);
    };
    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [tick, isPaused]);

  const showControls = !isCameraLocked && !movingBuildingId && !isPlacementMode && !menuMode && combatStatus !== 'searching' && combatStatus !== 'attacking' && !isPaused;
  const activeBuildings = combatMode ? enemyBuildings : buildings;

  return (
    <div className="w-full h-full bg-[#050510]">
      <Canvas 
        shadows 
        camera={{ position: [25, 25, 25], fov: 40 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Suspense fallback={null}>
          <InteractionManager />
          <GlobalLighting />
          {(menuMode || combatStatus === 'searching') && <MenuCameraControls />}
          
          <WeatherEffects />
          <Terrain />
          <MapObjects />
          <ZonesVisualizer />
          <BuildingPlacement />

          {activeBuildings.map((b) => (
            <group key={b.id}>
              {movingBuildingId === b.id ? (
                <MovingBuilding building={b} />
              ) : (
                <Building
                  id={b.id}
                  typeId={b.typeId}
                  level={b.level}
                  position={b.position}
                  rotation={b.rotation}
                  progress={b.progress}
                  isSelected={selectedBuildingId === b.id}
                  health={b.health}
                  maxHealth={b.maxHealth}
                />
              )}
            </group>
          ))}

          {useGameStore.getState().units.map(unit => (
             <Unit key={unit.id} unit={unit} />
          ))}

          {npcs.filter(n => n.buildingId !== movingBuildingId).map((n) => (
            <Worker 
              key={n.id}
              position={new THREE.Vector3(...n.position)} 
              isWorking={true}
              role={n.role}
            />
          ))}

          <ContactShadows resolution={1024} scale={40} blur={2} opacity={0.2} far={15} color="#000000" />
          
          <MapControls 
            makeDefault 
            enabled={showControls}
            enableDamping
            dampingFactor={0.05}
            screenSpacePanning={false}
            minDistance={5}
            maxDistance={80}
            maxPolarAngle={Math.PI / 2.5}
            minPolarAngle={Math.PI / 8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function MenuCameraControls() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.1;
    camera.position.x = Math.cos(t) * 40;
    camera.position.z = Math.sin(t) * 40;
    camera.position.y = 25;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function MovingBuilding({ building }: { building: any }) {
  const [position, setPosition] = useState<[number, number]>(building.position);
  const { raycaster, mouse, camera } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const point = new THREE.Vector3();
  const checkPlacement = useGameStore(state => state.checkPlacement);
  const buildings = useGameStore(state => state.buildings);
  const npcs = useGameStore(state => state.npcs);

  useFrame(() => {
    raycaster.setFromCamera(mouse, camera);
    if (raycaster.ray.intersectPlane(plane, point)) {
      const x = Math.round(point.x);
      const z = Math.round(point.z);
      if (x !== position[0] || z !== position[1]) {
        setPosition([x, z]);
      }
    }
  });

  const { isNear, isOverlap } = checkPlacement(position, building.id);
  
  // Detect merge target
  const mergeTarget = buildings.find(b => {
    if (b.id === building.id) return false;
    const dx = b.position[0] - position[0];
    const dz = b.position[1] - position[1];
    const dist = Math.sqrt(dx*dx + dz*dz);
    return dist < 1.5 && b.typeId === building.typeId && b.level === building.level && !b.isConstructing;
  });

  const isValid = (isNear && !isOverlap) || mergeTarget;

  // Filter NPCs for this building and calculate relative positions
  const myNpcs = npcs.filter(n => n.buildingId === building.id);

  return (
    <group position={[position[0], 0, position[1]]}>
      <Building
        id={building.id}
        typeId={building.typeId}
        level={building.level}
        position={[0, 0]} // Relative to group
        rotation={building.rotation}
        progress={building.progress}
        isSelected={true}
      />
      
      {myNpcs.map(n => (
        <Worker
          key={n.id}
          position={new THREE.Vector3(
            n.position[0] - building.position[0],
            n.position[1],
            n.position[2] - building.position[1]
          )}
          isWorking={true}
          role={n.role}
        />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial 
          color={mergeTarget ? "#00ffff" : (isValid ? "#00ff00" : "#ff0000")} 
          transparent 
          opacity={mergeTarget ? 0.6 : 0.3} 
        />
      </mesh>
    </group>
  );
}

function InteractionManager() {
  const { raycaster, mouse, camera } = useThree();
  const { 
    movingBuildingId, confirmMove, mergeBuildings, buildings, 
    combatStatus, deployUnit, viewMode, selectedCombatUnit, isPaused 
  } = useGameStore();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const point = new THREE.Vector3();

  useEffect(() => {
    const handleUp = () => {
      if (isPaused) return;
      if (movingBuildingId) {
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(plane, point)) {
          const targetPos: [number, number] = [Math.round(point.x), Math.round(point.z)];
          const movingBuilding = buildings.find(b => b.id === movingBuildingId);
          
          if (!movingBuilding) return;

          // Check for merge target first
          const mergeTarget = buildings.find(b => {
             if (b.id === movingBuildingId) return false;
             const dx = b.position[0] - targetPos[0];
             const dz = b.position[1] - targetPos[1];
             const dist = Math.sqrt(dx*dx + dz*dz);
             return dist < 1.5 && b.typeId === movingBuilding.typeId && b.level === movingBuilding.level && !b.isConstructing;
          });

          if (mergeTarget) {
            mergeBuildings(mergeTarget.id, movingBuildingId);
          } else {
            confirmMove(targetPos);
          }
        }
      }
    };

    const handleDown = (e: any) => {
       if (isPaused) return;
       if (e.button !== 0) return;
       
       if (viewMode === 'fighting' && combatStatus === 'attacking') {
          raycaster.setFromCamera(mouse, camera);
          if (raycaster.ray.intersectPlane(plane, point)) {
             // Border deployment: must be > 15 units away from center
             const dist = Math.sqrt(point.x*point.x + point.z*point.z);
             if (dist > 15) {
                deployUnit(selectedCombatUnit, [point.x, point.z]);
             }
          }
       }
    };

    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointerdown', handleDown);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointerdown', handleDown);
    };
  }, [movingBuildingId, raycaster, mouse, camera, confirmMove, mergeBuildings, buildings, combatStatus, deployUnit, viewMode, selectedCombatUnit]);

  return null;
}
