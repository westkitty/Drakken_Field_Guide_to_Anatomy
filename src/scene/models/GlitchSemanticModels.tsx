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
  transmission = 0.26,
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
      thickness={1.1}
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

export function ManifestDiscordModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const symbols = useRef<THREE.Group>(null);
  const limbs = useRef<THREE.Group>(null);
  const mask = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const infectionPaths = useMemo(() => Array.from({ length: 9 }, (_, path) => Array.from({ length: 54 }, (_, index) => {
    const t = index / 53;
    const angle = t * Math.PI * (3 + path * 0.18) + path * 0.7;
    const radius = 0.5 + t * (4.8 + path * 0.12);
    return [Math.cos(angle) * radius, -2.4 + path * 0.6 + Math.sin(angle * 1.3) * 0.45, Math.sin(angle) * radius] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const swarm = props.animation.name === 'Paradox Symbol Swarm';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.64) * 0.18;
      root.current.rotation.y = Math.sin(t * 0.28) * 0.16;
    }
    if (symbols.current) {
      symbols.current.rotation.y = t * (swarm ? 0.6 : 0.18);
      symbols.current.rotation.z = -t * (swarm ? 0.28 : 0.08);
      symbols.current.children.forEach((child, index) => {
        child.visible = Math.sin(t * 7.2 + index * 1.1) > -0.72;
      });
    }
    if (limbs.current) {
      limbs.current.children.forEach((child, index) => {
        child.position.y = Math.sin(t * 1.1 + index) * 0.35;
        child.rotation.z = Math.sin(t * 0.8 + index) * 0.3;
      });
    }
    if (mask.current) mask.current.rotation.z = Math.sin(t * 0.42) * 0.12;
    if (core.current) {
      const pulse = 1 + Math.sin(t * (swarm ? 4.6 : 1.7)) * (swarm ? 0.16 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <group ref={mask} position={[0, 0.5, 0]}>
            <mesh scale={[1.55, 2.0, 0.55]}>
              <sphereGeometry args={[1, 32, 22]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d5d0c8" emissive="#8f7b91" emissiveIntensity={0.28} roughness={0.3} transmission={0.12} opacity={0.9} />
            </mesh>
            <mesh position={[0, 0.1, 0.53]} scale={[0.94, 1.28, 0.08]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.94} clippingPlanes={clippingPlanes} />
            </mesh>
            {[-0.42, 0.42].map((x) => (
              <mesh key={x} position={[x, 0.42, 0.65]} rotation={[0, 0, x * 0.4]} scale={[0.28, 0.09, 0.06]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={props.silhouette ? '#000000' : '#c769d4'} clippingPlanes={clippingPlanes} />
              </mesh>
            ))}
          </group>
          <group ref={symbols}>
            {Array.from({ length: 24 }, (_, index) => {
              const angle = (index / 24) * Math.PI * 2;
              const radius = 2.8 + (index % 4) * 0.48;
              const type = index % 4;
              return (
                <group key={index} position={[Math.cos(angle) * radius, Math.sin(angle * 2.3) * 1.25, Math.sin(angle) * radius]} rotation={[angle, angle * 0.6, angle * 1.2]}>
                  {type === 0 && (
                    <mesh scale={[0.18, 0.8, 0.18]}>
                      <boxGeometry args={[1, 1, 1]} />
                      <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d46ada" emissive="#9b3ca7" emissiveIntensity={0.78} roughness={0.16} />
                    </mesh>
                  )}
                  {type === 1 && (
                    <mesh>
                      <torusGeometry args={[0.48, 0.12, 8, 24, Math.PI * 1.45]} />
                      <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#65c3d3" emissive="#328fa3" emissiveIntensity={0.72} roughness={0.18} />
                    </mesh>
                  )}
                  {type === 2 && (
                    <mesh scale={[0.7, 0.7, 0.18]}>
                      <octahedronGeometry args={[1, 0]} />
                      <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#e0b355" emissive="#ad7923" emissiveIntensity={0.72} roughness={0.2} />
                    </mesh>
                  )}
                  {type === 3 && (
                    <group>
                      <mesh rotation={[0, 0, Math.PI / 4]} scale={[0.12, 0.9, 0.12]}><boxGeometry args={[1, 1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d8586f" emissive="#a22d4d" emissiveIntensity={0.72} roughness={0.18} /></mesh>
                      <mesh rotation={[0, 0, -Math.PI / 4]} scale={[0.12, 0.9, 0.12]}><boxGeometry args={[1, 1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d8586f" emissive="#a22d4d" emissiveIntensity={0.72} roughness={0.18} /></mesh>
                    </group>
                  )}
                </group>
              );
            })}
          </group>
          <group ref={limbs}>
            {[-1, 1].flatMap((side) => [-1.8, 0, 1.8].map((y, index) => (
              <group key={`${side}-${y}`} position={[side * (2.3 + index * 0.5), y, side * 0.45]}>
                <mesh rotation={[0, 0, side * (0.35 + index * 0.1)]}>
                  <capsuleGeometry args={[0.2, 1.4 + index * 0.3, 8, 14]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#806786' : '#5d7187'} emissive={index % 2 ? '#864b8f' : '#3b728a'} emissiveIntensity={0.42} roughness={0.22} transmission={0.18} opacity={0.7} />
                </mesh>
              </group>
            )))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          {[1.3, 1.8, 2.3].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.82, index * 0.5, index * 0.92]}>
              <torusGeometry args={[radius, 0.075, 8, 50]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8b7790" roughness={0.34} metalness={0.26} wireframe />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <Line key={side} points={[[side * 4.8, -3.2, 0], [0, 0, 0], [side * 4.8, 3.2, 0]]} color="#817086" lineWidth={1.7} transparent opacity={0.54} />
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <dodecahedronGeometry args={[1.05, 2]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#37263f" emissive="#a34eb6" emissiveIntensity={1.15} roughness={0.12} transmission={0.16} opacity={0.9} />
          </mesh>
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index / 8) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 1.65, Math.sin(angle * 2) * 0.35, Math.sin(angle) * 1.65]} scale={[0.22, 0.46, 0.22]}>
                <octahedronGeometry args={[1, 0]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#b966c0' : '#5f9eb2'} emissive={index % 2 ? '#80398b' : '#39788e'} emissiveIntensity={0.58} roughness={0.2} />
              </mesh>
            );
          })}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {infectionPaths.map((points, index) => (
            <Line key={index} points={points} color={index % 3 === 0 ? '#d365d0' : index % 3 === 1 ? '#59a9bd' : '#c59a42'} lineWidth={1.2} transparent opacity={0.46 - index * 0.025} />
          ))}
          {[3.4, 4.8, 6.2].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.4, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#9d4ca9' : '#4e879b'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function GloryfailModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const wings = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Group>(null);
  const face = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const prayerLines = useMemo(() => Array.from({ length: 8 }, (_, line) => Array.from({ length: 52 }, (_, index) => {
    const t = index / 51;
    return [-4.5 + line * 1.3, -4.2 + t * 8.4, Math.sin(t * Math.PI * 4 + line) * (0.8 + line * 0.08)] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const reversal = props.animation.name.includes('Reversal') || props.animation.name.includes('Lance');
    if (root.current) {
      root.current.position.y = 0.35 + Math.sin(t * 0.62) * 0.22;
      root.current.rotation.y = Math.sin(t * 0.26) * 0.14;
    }
    if (wings.current) {
      wings.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * (0.16 + Math.sin(t * (reversal ? 3.6 : 1.2) + index) * 0.14);
        child.visible = Math.sin(t * 7.5 + index * 1.2) > -0.78;
      });
    }
    if (halo.current) {
      halo.current.rotation.y = t * (reversal ? 0.52 : 0.15);
      halo.current.rotation.z = -t * 0.08;
    }
    if (face.current) face.current.rotation.z = Math.sin(t * 2.3) * 0.12;
    if (core.current) {
      const pulse = 1 + Math.sin(t * (reversal ? 4.8 : 1.7)) * (reversal ? 0.17 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.25, 0]} scale={[1.1, 2.65, 0.82]} castShadow receiveShadow>
            <capsuleGeometry args={[0.72, 3.2, 10, 20]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d9d4cd" emissive="#9c8f87" emissiveIntensity={0.24} roughness={0.28} transmission={0.12} opacity={0.9} />
          </mesh>
          <group ref={face} position={[0, 3.15, 0.35]}>
            <mesh scale={[0.82, 1.0, 0.55]}>
              <sphereGeometry args={[1, 28, 18]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e2ddd5" emissive="#a89a92" emissiveIntensity={0.24} roughness={0.26} transmission={0.08} opacity={0.92} />
            </mesh>
            <mesh position={[-0.23, 0.2, 0.53]} scale={[0.12, 0.05, 0.04]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color={props.silhouette ? '#000000' : '#d8b25b'} clippingPlanes={clippingPlanes} /></mesh>
            <mesh position={[0.23, 0.2, 0.53]} scale={[0.12, 0.05, 0.04]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color={props.silhouette ? '#000000' : '#9d2838'} clippingPlanes={clippingPlanes} /></mesh>
            <Line points={[[-0.34, -0.3, 0.58], [0, -0.12, 0.62], [0.34, -0.38, 0.58]]} color="#7f3b46" lineWidth={2} transparent opacity={0.74} />
          </group>
          <group ref={wings}>
            {[-1, 1].flatMap((side) => [0, 1, 2, 3].map((tier) => (
              <mesh key={`${side}-${tier}`} position={[side * (1.7 + tier * 0.9), 1.25 - tier * 0.45, -0.35 + tier * 0.25]} rotation={[0.08, side * 0.12, side * (0.2 + tier * 0.08)]} scale={[2.0 - tier * 0.18, 0.12, 1.25]}>
                <coneGeometry args={[1, 3.0, 5]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={tier % 2 ? '#7d2d3d' : '#eadba7'} emissive={tier % 2 ? '#b22f46' : '#d5a938'} emissiveIntensity={tier % 2 ? 0.82 : 0.68} roughness={0.12} transmission={tier % 2 ? 0.08 : 0.4} opacity={0.66} />
              </mesh>
            )))}
          </group>
          <group ref={halo} position={[0, 4.55, 0]}>
            {Array.from({ length: 7 }, (_, index) => {
              const angle = (index / 7) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 1.45, Math.sin(angle) * 0.45, Math.sin(angle) * 1.45]} rotation={[angle, angle * 0.5, angle]} scale={[0.16, 0.58 + (index % 2) * 0.18, 0.12]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#e5c55e' : '#9b3447'} emissive={index % 2 ? '#d19b2c' : '#b12d46'} emissiveIntensity={0.82} roughness={0.16} metalness={0.28} />
                </mesh>
              );
            })}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.24, 0.34, 6.6, 10]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9a9290" roughness={0.4} metalness={0.24} wireframe />
          </mesh>
          {[-1.8, -0.8, 0.2, 1.2, 2.2].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, index * 0.28, 0]}>
              <torusGeometry args={[0.9 + index * 0.06, 0.07, 8, 30, Math.PI * 1.45]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a29a97" roughness={0.38} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.05, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#793040" emissive="#d34657" emissiveIntensity={1.2} roughness={0.12} transmission={0.1} opacity={0.92} />
          </mesh>
          {[1.45, 1.9, 2.35].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.8, index * 0.52, index * 0.9]}>
              <torusGeometry args={[radius, 0.06, 8, 52]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#d1b052' : '#8f3445'} emissive={index % 2 ? '#ae7922' : '#a02e43'} emissiveIntensity={0.5} roughness={0.22} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {prayerLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#c5a64e' : '#9b3548'} lineWidth={1.25} transparent opacity={0.44} />
          ))}
          <Line points={[[0, 0, 0], [0, 0, 8.5]]} color="#e4b94b" lineWidth={3} transparent opacity={0.58} />
          {[3.4, 4.8, 6.2].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.4, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#a3354d' : '#c8a14a'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function ViralBastionModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const screens = useRef<THREE.Group>(null);
  const turrets = useRef<THREE.Group>(null);
  const flag = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const firewallLines = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const offset = -5.5 + index;
    return [[offset, -3.5, -6], [offset * 0.45, 0, 0], [offset, 3.5, 6]] as Array<[number, number, number]>;
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    const salvo = props.animation.name.includes('Salvo') || props.animation.name.includes('Overwrite');
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.42) * 0.08;
      root.current.rotation.y = Math.sin(t * 0.18) * 0.06;
    }
    if (legs.current) {
      legs.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * (0.06 + Math.sin(t * 0.7 + index) * 0.06);
      });
    }
    if (screens.current) {
      screens.current.children.forEach((child, index) => {
        child.visible = Math.sin(t * 8 + index * 1.3) > -0.55;
      });
    }
    if (turrets.current) turrets.current.rotation.y = t * (salvo ? 0.48 : 0.12);
    if (flag.current) flag.current.rotation.y = Math.sin(t * 1.4) * 0.22;
    if (core.current) {
      const pulse = 1 + Math.sin(t * (salvo ? 4.6 : 1.7)) * (salvo ? 0.15 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.65, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 1.2, 0]} scale={[3.3, 2.25, 2.65]} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#22272d" emissive="#27485b" emissiveIntensity={0.28} roughness={0.62} metalness={0.58} />
          </mesh>
          <mesh position={[0, 3.25, 0]} scale={[2.35, 1.55, 2.0]}>
            <boxGeometry args={[1, 1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#2b3238" emissive="#31566a" emissiveIntensity={0.3} roughness={0.56} metalness={0.62} />
          </mesh>
          {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
            <mesh key={`${x}-${z}`} position={[x * 2.65, 3.95, z * 1.9]} scale={[0.55, 1.8, 0.55]}>
              <boxGeometry args={[1, 1, 1]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#343c43" emissive="#35627a" emissiveIntensity={0.32} roughness={0.5} metalness={0.66} />
            </mesh>
          )))}
          <group ref={screens}>
            {[-1, 0, 1].flatMap((row) => [-2, -1, 0, 1, 2].map((column, index) => (
              <mesh key={`${row}-${column}`} position={[column * 1.1, 1.2 + row * 0.9, 2.68]} scale={[0.82, 0.52, 0.06]}>
                <boxGeometry args={[1, 1, 1]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#4d7b8c' : '#733b5a'} emissive={index % 2 ? '#42b5d0' : '#c04485'} emissiveIntensity={0.92} roughness={0.12} metalness={0.2} />
              </mesh>
            )))}
          </group>
          <group ref={legs}>
            {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
              <group key={`${x}-${z}`} position={[x * 2.45, -1.6, z * 1.8]}>
                <mesh>
                  <boxGeometry args={[0.82, 4.2, 0.82]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#1c2227" emissive="#294a5b" emissiveIntensity={0.22} roughness={0.66} metalness={0.62} />
                </mesh>
                <mesh position={[0, -2.2, z * 0.25]} scale={[1.25, 0.45, 1.55]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#171b20" roughness={0.74} metalness={0.64} />
                </mesh>
              </group>
            )))}
          </group>
          <group ref={turrets} position={[0, 4.7, 0]}>
            {Array.from({ length: 8 }, (_, index) => {
              const angle = (index / 8) * Math.PI * 2;
              return (
                <group key={index} position={[Math.cos(angle) * 2.7, 0, Math.sin(angle) * 2.2]} rotation={[0, -angle, 0]}>
                  <mesh><cylinderGeometry args={[0.38, 0.5, 0.8, 10]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#3a4248" emissive="#3a687f" emissiveIntensity={0.3} roughness={0.48} metalness={0.68} /></mesh>
                  <mesh position={[0, 0.15, 0.85]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.18, 1.8, 8]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#59656d" emissive="#4d8ca8" emissiveIntensity={0.38} roughness={0.36} metalness={0.72} /></mesh>
                </group>
              );
            })}
          </group>
          <group ref={flag} position={[0, 6.2, 0]}>
            <mesh><cylinderGeometry args={[0.07, 0.07, 4.0, 8]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#6a7075" roughness={0.34} metalness={0.7} /></mesh>
            <mesh position={[0.9, 1.15, 0]} scale={[1.7, 0.85, 0.08]}><boxGeometry args={[1, 1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#6f1f2d" emissive="#ba293e" emissiveIntensity={0.78} roughness={0.3} opacity={0.82} /></mesh>
            {[0, 1, 2, 3].map((index) => (
              <mesh key={index} position={[0.35 + index * 0.48, 1.15 + Math.sin(index) * 0.25, 0.08]} rotation={[0, 0, index * 0.2]} scale={[0.2, 0.55 + index * 0.1, 0.16]}>
                <coneGeometry args={[1, 1.2, 6]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d64d2c" emissive="#ff5a23" emissiveIntensity={1.3} roughness={0.16} />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[6.2, 5.2, 4.8]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#73818a" roughness={0.38} metalness={0.62} wireframe />
          </mesh>
          {[-2.2, -0.8, 0.6, 2.0, 3.4].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} rotation={[index * 0.3, index * 0.22, 0]}>
              <torusGeometry args={[2.2 + index * 0.12, 0.08, 8, 52]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7b8d96" emissive="#345d72" emissiveIntensity={0.3} roughness={0.34} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} position={[0, 1.25, 0]}>
            <dodecahedronGeometry args={[1.25, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#354d5c" emissive="#42a5c7" emissiveIntensity={1.2} roughness={0.12} transmission={0.14} opacity={0.92} />
          </mesh>
          {[-1.5, 0, 1.5].map((x, index) => (
            <mesh key={x} position={[x, 1.25, 0]} scale={[0.52, 0.82, 0.52]}>
              <boxGeometry args={[1, 1, 1]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index === 1 ? '#77334f' : '#47697a'} emissive={index === 1 ? '#b83d75' : '#3a91ae'} emissiveIntensity={0.62} roughness={0.2} metalness={0.28} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {firewallLines.map((points, index) => (
            <Line key={index} points={points} color={index % 3 === 0 ? '#bf3c7b' : '#4ba7c3'} lineWidth={1.25} transparent opacity={0.48} />
          ))}
          {[4.2, 5.8, 7.4].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]} position={[0, -2.8, 0]}>
              <torusGeometry args={[radius, 0.045, 8, 112]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#a9346d' : '#3d8fa9'} transparent opacity={0.32 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {Array.from({ length: 12 }, (_, index) => {
            const angle = (index / 12) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 5.4, 0.4 + Math.sin(angle * 3) * 1.1, Math.sin(angle) * 5.4]}>
                <octahedronGeometry args={[0.28, 0]} />
                <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#c34882' : '#4da7bf'} transparent opacity={0.58} clippingPlanes={clippingPlanes} />
              </mesh>
            );
          })}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
