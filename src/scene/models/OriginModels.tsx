import { Line } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { AnnotationMarkers } from '../Specimens';
import {
  clipArray,
  materialColor,
  useAnimationClock,
  type SpecimenModelProps,
} from '../SpecimenCommon';

type MaterialProps = {
  model: SpecimenModelProps;
  clippingPlanes: THREE.Plane[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transmission?: number;
  wireframe?: boolean;
};

function StandardMaterial({
  model,
  clippingPlanes,
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  roughness = 0.55,
  metalness = 0.1,
  opacity = 1,
  wireframe,
}: MaterialProps) {
  return (
    <meshStandardMaterial
      color={materialColor(color, model.silhouette)}
      emissive={model.silhouette ? '#000000' : emissive}
      emissiveIntensity={model.silhouette ? 0 : emissiveIntensity}
      roughness={roughness}
      metalness={metalness}
      transparent={opacity < 1}
      opacity={model.silhouette ? 1 : opacity}
      wireframe={wireframe ?? model.wireframe}
      clippingPlanes={clippingPlanes}
      side={THREE.DoubleSide}
    />
  );
}

function PhysicalMaterial({
  model,
  clippingPlanes,
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  roughness = 0.22,
  metalness = 0.04,
  opacity = 0.82,
  transmission = 0.28,
  wireframe,
}: MaterialProps) {
  return (
    <meshPhysicalMaterial
      color={materialColor(color, model.silhouette)}
      emissive={model.silhouette ? '#000000' : emissive}
      emissiveIntensity={model.silhouette ? 0 : emissiveIntensity}
      roughness={roughness}
      metalness={metalness}
      transmission={model.silhouette ? 0 : transmission}
      thickness={1.15}
      transparent
      opacity={model.silhouette ? 1 : opacity}
      wireframe={wireframe ?? model.wireframe}
      clippingPlanes={clippingPlanes}
      side={THREE.DoubleSide}
    />
  );
}

function measurementHandler(props: SpecimenModelProps) {
  return (event: ThreeEvent<PointerEvent>) => {
    if (!props.measurementMode) return;
    event.stopPropagation();
    props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
  };
}

function Markers(props: SpecimenModelProps) {
  return (
    <AnnotationMarkers
      record={props.record}
      layers={props.layers}
      selectedAnnotationId={props.selectedAnnotationId}
      onSelectAnnotation={props.onSelectAnnotation}
    />
  );
}

function sphereRibbon(
  radius: number,
  latitude: number,
  phase: number,
  turns = 1,
): Array<[number, number, number]> {
  return Array.from({ length: 96 }, (_, index) => {
    const t = index / 95;
    const theta = t * Math.PI * 2 * turns + phase;
    const localLatitude = latitude + Math.sin(theta * 2 + phase) * 0.08;
    const horizontalRadius = Math.cos(localLatitude) * radius;
    return [
      Math.cos(theta) * horizontalRadius,
      Math.sin(localLatitude) * radius,
      Math.sin(theta) * horizontalRadius,
    ];
  });
}

export function MotherModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const eggCorona = useRef<THREE.Group>(null);
  const runeStorms = useRef<THREE.Group>(null);
  const codeTrees = useRef<THREE.Group>(null);
  const genesisCore = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  const veinPaths = useMemo(
    () => [
      sphereRibbon(3.64, -0.78, 0.2, 1),
      sphereRibbon(3.65, -0.38, 1.1, 1),
      sphereRibbon(3.66, 0.02, 2.4, 1),
      sphereRibbon(3.65, 0.4, 0.7, 1),
      sphereRibbon(3.64, 0.76, 1.8, 1),
      sphereRibbon(3.67, 0, 0.3, 2),
      sphereRibbon(3.67, 0.18, 2.1, 2),
    ],
    [],
  );

  const treeStations = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const latitude = -0.8 + (index % 6) * 0.31;
        const longitude = index * 2.399963;
        const radius = 3.7;
        const horizontalRadius = Math.cos(latitude) * radius;
        return {
          position: [
            Math.cos(longitude) * horizontalRadius,
            Math.sin(latitude) * radius,
            Math.sin(longitude) * horizontalRadius,
          ] as [number, number, number],
          rotation: [latitude, -longitude + Math.PI / 2, -latitude * 0.45] as [number, number, number],
          scale: 0.34 + (index % 4) * 0.07,
        };
      }),
    [],
  );

  const eggStations = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const angle = (index / 14) * Math.PI * 2;
        const radius = 5.2 + (index % 3) * 0.22;
        return {
          position: [
            Math.cos(angle) * radius,
            Math.sin(angle * 2) * 0.38,
            Math.sin(angle) * radius,
          ] as [number, number, number],
          rotation: [angle * 0.4, angle, angle * 0.7] as [number, number, number],
          scale: 0.35 + (index % 3) * 0.05,
        };
      }),
    [],
  );

  useFrame(() => {
    const t = elapsed.current;
    const genesis = props.animation.name === 'Codepulse Genesis Surge';
    const orbit = props.animation.name === 'Egg Corona Orbit';

    if (root.current) {
      root.current.rotation.y = t * (genesis ? 0.08 : 0.025);
      root.current.rotation.z = Math.sin(t * 0.16) * 0.025;
    }

    if (eggCorona.current) {
      eggCorona.current.rotation.y = t * (orbit ? 0.5 : 0.12);
      eggCorona.current.rotation.z = Math.sin(t * 0.28) * 0.12;
      eggCorona.current.children.forEach((child, index) => {
        child.rotation.y = t * (0.35 + index * 0.015);
        child.rotation.z = -t * (0.2 + index * 0.01);
      });
    }

    if (runeStorms.current) {
      runeStorms.current.rotation.x = t * (genesis ? 0.22 : 0.06);
      runeStorms.current.rotation.z = -t * (genesis ? 0.18 : 0.04);
      runeStorms.current.children.forEach((child, index) => {
        const pulse = 1 + Math.sin(t * (genesis ? 4.2 : 1.3) + index) * (genesis ? 0.12 : 0.035);
        child.scale.setScalar(pulse);
      });
    }

    if (codeTrees.current) {
      codeTrees.current.children.forEach((child, index) => {
        child.rotation.z = Math.sin(t * 0.7 + index * 0.8) * 0.08;
      });
    }

    if (genesisCore.current) {
      const pulse = 1 + Math.sin(t * (genesis ? 4.8 : 1.4)) * (genesis ? 0.18 : 0.045);
      genesisCore.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[3.58, 6]} />
            <PhysicalMaterial
              model={props}
              clippingPlanes={clippingPlanes}
              color="#102c33"
              emissive="#0b6b74"
              emissiveIntensity={0.34}
              roughness={0.42}
              metalness={0.08}
              transmission={0.08}
              opacity={0.96}
            />
          </mesh>

          {veinPaths.map((points, index) => (
            <Line
              key={index}
              points={points}
              color={index % 3 === 0 ? '#7ff2dc' : index % 3 === 1 ? '#49b6d0' : '#8eb6ff'}
              lineWidth={1.5 + (index % 2) * 0.4}
              transparent
              opacity={props.silhouette ? 0 : 0.72}
             clippingPlanes={clippingPlanes} />
          ))}

          <group ref={codeTrees}>
            {treeStations.map((station, index) => (
              <group
                key={index}
                position={station.position}
                rotation={station.rotation}
                scale={station.scale}
              >
                <mesh position={[0, 0.48, 0]} scale={[0.12, 0.8, 0.12]}>
                  <cylinderGeometry args={[1, 1.3, 1, 7]} />
                  <StandardMaterial
                    model={props}
                    clippingPlanes={clippingPlanes}
                    color="#183e3a"
                    emissive="#2aa786"
                    emissiveIntensity={0.38}
                    roughness={0.68}
                  />
                </mesh>
                {[0.55, 0.95, 1.32].map((height, branchIndex) => (
                  <group key={height} position={[0, height, 0]} rotation={[0, branchIndex * 1.9 + index, 0]}>
                    <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.65]} scale={[0.07, 0.48, 0.07]}>
                      <cylinderGeometry args={[1, 1.2, 1, 6]} />
                      <StandardMaterial
                        model={props}
                        clippingPlanes={clippingPlanes}
                        color="#206456"
                        emissive="#55d0aa"
                        emissiveIntensity={0.48}
                        roughness={0.52}
                      />
                    </mesh>
                    <mesh position={[-0.3, 0.08, 0]} rotation={[0, 0, 0.65]} scale={[0.07, 0.45, 0.07]}>
                      <cylinderGeometry args={[1, 1.2, 1, 6]} />
                      <StandardMaterial
                        model={props}
                        clippingPlanes={clippingPlanes}
                        color="#245d65"
                        emissive="#58bed5"
                        emissiveIntensity={0.42}
                        roughness={0.54}
                      />
                    </mesh>
                  </group>
                ))}
              </group>
            ))}
          </group>

          <group ref={eggCorona}>
            {eggStations.map((station, index) => (
              <group
                key={index}
                position={station.position}
                rotation={station.rotation}
                scale={station.scale}
              >
                <mesh>
                  <icosahedronGeometry args={[1, 2]} />
                  <PhysicalMaterial
                    model={props}
                    clippingPlanes={clippingPlanes}
                    color={index % 2 ? '#a5d8cf' : '#96b8df'}
                    emissive={index % 2 ? '#4cbfa5' : '#547fc4'}
                    emissiveIntensity={0.82}
                    roughness={0.12}
                    transmission={0.36}
                    opacity={0.82}
                  />
                </mesh>
                <mesh scale={[0.46, 0.72, 0.46]}>
                  <octahedronGeometry args={[1, 1]} />
                  <StandardMaterial
                    model={props}
                    clippingPlanes={clippingPlanes}
                    color="#173f50"
                    emissive="#53d8c2"
                    emissiveIntensity={0.94}
                    roughness={0.18}
                  />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      )}

      {props.layers.structure && (
        <group>
          {[3.05, 2.48, 1.9].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.48, index * 0.72, index * 0.33]}>
              <icosahedronGeometry args={[radius, 3]} />
              <StandardMaterial
                model={props}
                clippingPlanes={clippingPlanes}
                color={index === 0 ? '#4f7b7c' : index === 1 ? '#55708c' : '#74658a'}
                emissive={index === 0 ? '#2b8f87' : '#395e87'}
                emissiveIntensity={0.26}
                roughness={0.4}
                metalness={0.24}
                opacity={0.28}
                wireframe
              />
            </mesh>
          ))}

          {Array.from({ length: 12 }, (_, index) => {
            const angle = (index / 12) * Math.PI * 2;
            return (
              <Line
                key={index}
                points={[
                  [Math.cos(angle) * 0.9, Math.sin(angle * 2) * 0.2, Math.sin(angle) * 0.9],
                  [Math.cos(angle) * 3.2, Math.sin(angle * 2) * 0.7, Math.sin(angle) * 3.2],
                ]}
                color={index % 2 ? '#638ca2' : '#6cae9d'}
                lineWidth={1.1}
                transparent
                opacity={0.42}
               clippingPlanes={clippingPlanes} />
            );
          })}
        </group>
      )}

      {props.layers.internal && (
        <group>
          <mesh ref={genesisCore}>
            <icosahedronGeometry args={[1.32, 4]} />
            <PhysicalMaterial
              model={props}
              clippingPlanes={clippingPlanes}
              color="#c6f3db"
              emissive="#66f0c4"
              emissiveIntensity={1.45}
              roughness={0.08}
              transmission={0.4}
              opacity={0.9}
            />
          </mesh>

          {[1.62, 2.02, 2.42].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.8, index * 0.55, index * 0.92]}>
              <torusGeometry args={[radius, 0.11 - index * 0.015, 10, 72]} />
              <PhysicalMaterial
                model={props}
                clippingPlanes={clippingPlanes}
                color={index % 2 ? '#7ec7dd' : '#91d9b9'}
                emissive={index % 2 ? '#3b8fb6' : '#3fa67f'}
                emissiveIntensity={0.72}
                roughness={0.14}
                transmission={0.2}
                opacity={0.72}
              />
            </mesh>
          ))}

          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.62]}>
            <torusGeometry args={[1.05, 0.34, 18, 64]} />
            <PhysicalMaterial
              model={props}
              clippingPlanes={clippingPlanes}
              color="#d8efe3"
              emissive="#5ba990"
              emissiveIntensity={0.62}
              roughness={0.12}
              transmission={0.5}
              opacity={0.62}
            />
          </mesh>
        </group>
      )}

      {props.layers.functional && (
        <group ref={runeStorms}>
          {[4.15, 5.2, 6.25].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.72, index * 0.41, index * 0.93]}>
              <torusGeometry args={[radius, 0.045, 8, 108]} />
              <meshBasicMaterial
                color={props.silhouette ? '#000000' : index % 2 ? '#69d2bd' : '#679bd4'}
                transparent
                opacity={0.34 - index * 0.06}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}

          {Array.from({ length: 16 }, (_, index) => {
            const angle = (index / 16) * Math.PI * 2;
            const elevation = -2.2 + (index % 5) * 1.1;
            return (
              <Line
                key={index}
                points={[
                  [Math.cos(angle) * 3.2, elevation * 0.35, Math.sin(angle) * 3.2],
                  [Math.cos(angle) * 6.8, elevation, Math.sin(angle) * 6.8],
                ]}
                color={index % 3 === 0 ? '#8bf0c8' : index % 3 === 1 ? '#6bbbd8' : '#9a8eda'}
                lineWidth={1.2}
                transparent
                opacity={0.36}
               clippingPlanes={clippingPlanes} />
            );
          })}
        </group>
      )}

      <Markers {...props} />
    </group>
  );
}

function eggSpiral(radius: number, phase: number): Array<[number, number, number]> {
  return Array.from({ length: 180 }, (_, index) => {
    const t = index / 179;
    const theta = t * Math.PI * 12 + phase;
    const latitude = -1.12 + t * 2.24 + Math.sin(theta * 0.5) * 0.035;
    const horizontalRadius = Math.cos(latitude) * radius;
    return [
      Math.cos(theta) * horizontalRadius,
      Math.sin(latitude) * radius,
      Math.sin(theta) * horizontalRadius,
    ];
  });
}

export function TheEggModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const spirals = useRef<THREE.Group>(null);
  const embryo = useRef<THREE.Group>(null);
  const shield = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  const spiralPaths = useMemo(
    () => [eggSpiral(2.92, 0), eggSpiral(3.01, Math.PI * 0.67), eggSpiral(3.08, Math.PI * 1.31)],
    [],
  );

  const embryoNodes = useMemo(
    () =>
      Array.from({ length: 17 }, (_, index) => {
        const angle = index * 2.399963;
        const radius = 0.35 + (index % 5) * 0.29;
        return {
          position: [
            Math.cos(angle) * radius,
            Math.sin(angle * 1.7) * (0.3 + (index % 4) * 0.16),
            Math.sin(angle) * radius,
          ] as [number, number, number],
          scale: 0.16 + (index % 3) * 0.07,
        };
      }),
    [],
  );

  const anchorPaths = useMemo(
    () =>
      Array.from({ length: 8 }, (_, path) =>
        Array.from({ length: 48 }, (_, index) => {
          const t = index / 47;
          const angle = path * (Math.PI / 4) + Math.sin(t * Math.PI * 2 + path) * 0.2;
          const radius = 3.1 + t * 3.4;
          return [
            Math.cos(angle) * radius,
            -2.7 - t * 1.35 + Math.sin(t * Math.PI * 3 + path) * 0.16,
            Math.sin(angle) * radius,
          ] as [number, number, number];
        }),
      ),
    [],
  );

  useFrame(() => {
    const t = elapsed.current;
    const breathe = props.animation.name === 'Breathing Glass Convulsion';
    const spiralPulse = props.animation.name === 'Barcode Spiral Pulse';

    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.28) * 0.16;
      root.current.rotation.z = Math.sin(t * 0.19) * 0.05;
    }

    if (shell.current) {
      const pulse = 1 + Math.sin(t * (breathe ? 3.2 : 1.1)) * (breathe ? 0.095 : 0.025);
      shell.current.scale.set(pulse, 1 + (pulse - 1) * 1.4, pulse);
      shell.current.rotation.y = t * (breathe ? 0.14 : 0.04);
    }

    if (spirals.current) {
      spirals.current.rotation.y = t * (spiralPulse ? 0.68 : 0.14);
      spirals.current.rotation.x = Math.sin(t * 0.35) * 0.1;
    }

    if (embryo.current) {
      embryo.current.rotation.y = -t * (spiralPulse ? 0.42 : 0.12);
      embryo.current.children.forEach((child, index) => {
        const pulse = 1 + Math.sin(t * (breathe ? 4.4 : 1.5) + index * 0.7) * (breathe ? 0.22 : 0.06);
        child.scale.setScalar(pulse);
      });
    }

    if (shield.current) {
      shield.current.rotation.x = t * 0.08;
      shield.current.rotation.z = -t * 0.11;
      shield.current.children.forEach((child, index) => {
        const pulse = 1 + Math.sin(t * (spiralPulse ? 3.8 : 1.2) + index) * (spiralPulse ? 0.1 : 0.025);
        child.scale.setScalar(pulse);
      });
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group ref={shell}>
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[2.9, 5]} />
            <PhysicalMaterial
              model={props}
              clippingPlanes={clippingPlanes}
              color="#8fb5bd"
              emissive="#4d91aa"
              emissiveIntensity={0.58}
              roughness={0.12}
              metalness={0.04}
              transmission={0.58}
              opacity={0.62}
            />
          </mesh>

          <mesh scale={[0.965, 1.04, 0.965]}>
            <icosahedronGeometry args={[2.9, 3]} />
            <StandardMaterial
              model={props}
              clippingPlanes={clippingPlanes}
              color="#d6e4df"
              emissive="#74b2c2"
              emissiveIntensity={0.34}
              roughness={0.24}
              metalness={0.18}
              opacity={0.34}
              wireframe
            />
          </mesh>

          {Array.from({ length: 22 }, (_, index) => {
            const angle = index * 2.399963;
            const latitude = -1.05 + (index % 7) * 0.34;
            const horizontalRadius = Math.cos(latitude) * 3.02;
            return (
              <mesh
                key={index}
                position={[
                  Math.cos(angle) * horizontalRadius,
                  Math.sin(latitude) * 3.02,
                  Math.sin(angle) * horizontalRadius,
                ]}
                rotation={[angle * 0.7, angle, latitude]}
                scale={[0.09, 0.28 + (index % 4) * 0.08, 0.08]}
              >
                <octahedronGeometry args={[1, 0]} />
                <StandardMaterial
                  model={props}
                  clippingPlanes={clippingPlanes}
                  color={index % 2 ? '#b8d4d4' : '#9fc6dc'}
                  emissive={index % 2 ? '#4b9d96' : '#477ead'}
                  emissiveIntensity={0.54}
                  roughness={0.22}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {props.layers.surface && (
        <group ref={spirals}>
          {spiralPaths.map((points, index) => (
            <Line
              key={index}
              points={points}
              color={index === 0 ? '#72f1d0' : index === 1 ? '#68bde2' : '#9d8fe3'}
              lineWidth={1.6 + index * 0.25}
              transparent
              opacity={props.silhouette ? 0 : 0.78 - index * 0.08}
             clippingPlanes={clippingPlanes} />
          ))}
        </group>
      )}

      {props.layers.structure && (
        <group>
          {[2.5, 2.08, 1.68].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.7, index * 0.45, index * 0.82]}>
              <icosahedronGeometry args={[radius, 2]} />
              <StandardMaterial
                model={props}
                clippingPlanes={clippingPlanes}
                color={index === 0 ? '#668896' : index === 1 ? '#697a9d' : '#806f9c'}
                emissive={index === 0 ? '#3b8390' : '#514c88'}
                emissiveIntensity={0.32}
                roughness={0.34}
                metalness={0.28}
                opacity={0.36}
                wireframe
              />
            </mesh>
          ))}

          {Array.from({ length: 9 }, (_, index) => {
            const angle = (index / 9) * Math.PI * 2;
            return (
              <Line
                key={index}
                points={[
                  [0, 0, 0],
                  [Math.cos(angle) * 2.65, Math.sin(angle * 2) * 0.8, Math.sin(angle) * 2.65],
                ]}
                color={index % 2 ? '#6d8fa3' : '#7a78a6'}
                lineWidth={1.1}
                transparent
                opacity={0.44}
               clippingPlanes={clippingPlanes} />
            );
          })}
        </group>
      )}

      {props.layers.internal && (
        <group ref={embryo}>
          <mesh>
            <dodecahedronGeometry args={[1.12, 3]} />
            <PhysicalMaterial
              model={props}
              clippingPlanes={clippingPlanes}
              color="#5d82a9"
              emissive="#5ae2ca"
              emissiveIntensity={1.2}
              roughness={0.1}
              transmission={0.32}
              opacity={0.84}
            />
          </mesh>

          {embryoNodes.map((node, index) => (
            <mesh key={index} position={node.position} scale={node.scale}>
              {index % 3 === 0 ? (
                <tetrahedronGeometry args={[1, 1]} />
              ) : index % 3 === 1 ? (
                <octahedronGeometry args={[1, 1]} />
              ) : (
                <icosahedronGeometry args={[1, 1]} />
              )}
              <StandardMaterial
                model={props}
                clippingPlanes={clippingPlanes}
                color={index % 2 ? '#a0d5cc' : '#91b9df'}
                emissive={index % 2 ? '#50b99f' : '#527fc1'}
                emissiveIntensity={0.82}
                roughness={0.16}
                metalness={0.12}
              />
            </mesh>
          ))}

          {[1.35, 1.62, 1.9].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.9, index * 0.62, index * 0.76]}>
              <torusGeometry args={[radius, 0.055, 8, 56]} />
              <meshBasicMaterial
                color={props.silhouette ? '#000000' : index % 2 ? '#62c8b0' : '#668fc8'}
                transparent
                opacity={0.5 - index * 0.08}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.functional && (
        <group ref={shield}>
          {[3.55, 4.15, 4.8].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.76, index * 0.43, index * 0.91]}>
              <torusGeometry args={[radius, 0.045, 8, 96]} />
              <meshBasicMaterial
                color={props.silhouette ? '#000000' : index % 2 ? '#69b7d2' : '#6ad4b8'}
                transparent
                opacity={0.34 - index * 0.06}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}

          {anchorPaths.map((points, index) => (
            <Line
              key={index}
              points={points}
              color={index % 2 ? '#59a9c8' : '#5ec4aa'}
              lineWidth={1.15}
              transparent
              opacity={0.42}
             clippingPlanes={clippingPlanes} />
          ))}
        </group>
      )}

      <Markers {...props} />
    </group>
  );
}
