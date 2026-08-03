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

function StandardMaterial({ model, clippingPlanes, color, emissive = '#000000', emissiveIntensity = 0, roughness = 0.55, metalness = 0.12, opacity = 1, wireframe }: MaterialProps) {
  return <meshStandardMaterial color={materialColor(color, model.silhouette)} emissive={model.silhouette ? '#000000' : emissive} emissiveIntensity={model.silhouette ? 0 : emissiveIntensity} roughness={roughness} metalness={metalness} transparent={opacity < 1} opacity={model.silhouette ? 1 : opacity} wireframe={wireframe ?? model.wireframe} clippingPlanes={clippingPlanes} side={THREE.DoubleSide} />;
}

function PhysicalMaterial({ model, clippingPlanes, color, emissive = '#000000', emissiveIntensity = 0, roughness = 0.25, metalness = 0.05, opacity = 0.84, transmission = 0.24, wireframe }: MaterialProps) {
  return <meshPhysicalMaterial color={materialColor(color, model.silhouette)} emissive={model.silhouette ? '#000000' : emissive} emissiveIntensity={model.silhouette ? 0 : emissiveIntensity} roughness={roughness} metalness={metalness} transmission={model.silhouette ? 0 : transmission} thickness={1.2} transparent opacity={model.silhouette ? 1 : opacity} wireframe={wireframe ?? model.wireframe} clippingPlanes={clippingPlanes} side={THREE.DoubleSide} />;
}

function measurementHandler(props: SpecimenModelProps) {
  return (event: ThreeEvent<PointerEvent>) => {
    if (!props.measurementMode) return;
    event.stopPropagation();
    props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
  };
}

function Markers(props: SpecimenModelProps) {
  return <AnnotationMarkers record={props.record} layers={props.layers} selectedAnnotationId={props.selectedAnnotationId} onSelectAnnotation={props.onSelectAnnotation} />;
}

export function FoundryCantorModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const furnace = useRef<THREE.Mesh>(null);
  const molds = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const scriptTrails = useMemo(() => [-1.8, -0.6, 0.6, 1.8].map((x, line) => Array.from({ length: 42 }, (_, index) => {
    const t = index / 41;
    return [x + Math.sin(t * Math.PI * 5 + line) * 0.22, -2.4, -5.2 + t * 10.4] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const eruption = props.animation.name === 'Furnace Smelt Eruption';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.55) * 0.08;
      root.current.rotation.y = Math.sin(t * 0.22) * 0.08;
    }
    if (furnace.current) {
      const pulse = 1 + Math.sin(t * (eruption ? 4.8 : 1.8)) * (eruption ? 0.16 : 0.05);
      furnace.current.scale.set(1.45 * pulse, 1.65 * pulse, 0.82 * pulse);
    }
    if (molds.current) molds.current.rotation.y = t * (eruption ? 0.42 : 0.12);
  });

  return (
    <group ref={root} position={[0, -0.7, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && <group>
        <mesh position={[0, 1.2, 0]} scale={[2.6, 1.85, 1.65]} castShadow receiveShadow><dodecahedronGeometry args={[1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#21191a" emissive="#5a2019" emissiveIntensity={0.34} roughness={0.72} metalness={0.48} /></mesh>
        <mesh ref={furnace} position={[0, 1.45, 1.25]} scale={[1.45, 1.65, 0.82]}><boxGeometry args={[1.6, 1.8, 1]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#5c231f" emissive="#ff4a1c" emissiveIntensity={1.7} roughness={0.22} metalness={0.32} transmission={0.08} opacity={0.94} /></mesh>
        {[-1, 1].map((side) => <group key={side} position={[side * 2.15, 2.55, 0]}>
          <mesh rotation={[0, 0, side * 0.18]}><cylinderGeometry args={[0.38, 0.55, 3.8, 12]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#171315" emissive="#4d1b18" emissiveIntensity={0.3} roughness={0.62} metalness={0.55} /></mesh>
          <mesh position={[0, 2.1, 0]}><coneGeometry args={[0.58, 1.2, 10]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#2f2425" emissive="#8f2d1c" emissiveIntensity={0.4} roughness={0.5} metalness={0.48} /></mesh>
        </group>)}
        {[-1, 1].flatMap((x) => [-1, 1].map((z) => <group key={`${x}-${z}`} position={[x * 1.7, -0.85, z * 0.85]}>
          <mesh rotation={[z * 0.08, 0, x * 0.08]}><cylinderGeometry args={[0.42, 0.62, 3.2, 10]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#292123" emissive="#4e201a" emissiveIntensity={0.22} roughness={0.72} metalness={0.42} /></mesh>
          <mesh position={[0, -1.75, 0]} scale={[0.8, 0.35, 1]}><dodecahedronGeometry args={[1, 0]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#171315" roughness={0.82} metalness={0.5} /></mesh>
        </group>))}
        <group ref={molds} position={[0, 0.8, -1.75]}>{Array.from({ length: 6 }, (_, index) => {
          const angle = (index / 6) * Math.PI * 2;
          return <mesh key={index} position={[Math.cos(angle) * 1.15, Math.sin(angle) * 0.65, 0]} rotation={[0, 0, angle]} scale={[0.42, 0.7, 0.28]}><boxGeometry args={[1, 1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5b4a45" emissive="#8b3b29" emissiveIntensity={0.3} roughness={0.46} metalness={0.58} /></mesh>;
        })}</group>
      </group>}
      {props.layers.structure && <group>
        <mesh position={[0, 1.1, 0]}><boxGeometry args={[3.8, 3.2, 2.5]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8a7470" roughness={0.44} metalness={0.5} wireframe /></mesh>
        {[-0.8, 0, 0.8, 1.6, 2.4].map((y) => <mesh key={y} position={[0, y, 0.35]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.65, 0.09, 8, 36, Math.PI * 1.45]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9f827b" roughness={0.38} metalness={0.44} wireframe /></mesh>)}
      </group>}
      {props.layers.internal && <group>
        <mesh position={[0, 1.25, 0]}><icosahedronGeometry args={[1.2, 3]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#6f150f" emissive="#ff4b16" emissiveIntensity={2} roughness={0.12} transmission={0.05} opacity={0.96} /></mesh>
        {[-1.25, 1.25].map((x) => <mesh key={x} position={[x, 1.2, 0]} scale={[0.42, 1.1, 0.42]}><capsuleGeometry args={[0.5, 1.4, 8, 16]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#783020" emissive="#c54a25" emissiveIntensity={0.72} roughness={0.2} /></mesh>)}
      </group>}
      {props.layers.functional && <group>
        {scriptTrails.map((points, index) => <Line key={index} points={points} color={index % 2 ? '#ff6a29' : '#d9441b'} lineWidth={1.6} transparent opacity={0.58} />)}
        {[3, 4.3, 5.6].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2, index * 0.34, 0]}><torusGeometry args={[radius, 0.04, 8, 96]} /><meshBasicMaterial color={props.silhouette ? '#000000' : '#d9471d'} transparent opacity={0.34 - index * 0.07} clippingPlanes={clippingPlanes} /></mesh>)}
      </group>}
      <Markers {...props} />
    </group>
  );
}

export function PowerLatticeRegulatorModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const insulators = useRef<THREE.Group>(null);
  const converter = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const gridLines = useMemo(() => Array.from({ length: 10 }, (_, index) => {
    const offset = -4.5 + index;
    return [[offset, -2.4, -5], [offset * 0.5, 0, 0], [offset, 2.4, 5]] as Array<[number, number, number]>;
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    const flare = props.animation.name === 'High-Voltage Arc Flare';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.72) * 0.16;
      root.current.rotation.y = Math.sin(t * 0.28) * 0.1;
    }
    if (insulators.current) {
      insulators.current.rotation.y = t * (flare ? 0.52 : 0.16);
      insulators.current.rotation.z = Math.sin(t * 0.5) * 0.08;
    }
    if (converter.current) {
      const pulse = 1 + Math.sin(t * (flare ? 5.2 : 1.9)) * (flare ? 0.18 : 0.05);
      converter.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && <group>
        <mesh position={[0, 1, 0]}><boxGeometry args={[1.25, 7.4, 1.25]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#202b34" emissive="#1d5d77" emissiveIntensity={0.34} roughness={0.48} metalness={0.62} /></mesh>
        <mesh position={[0, 2.4, 0]}><boxGeometry args={[6.4, 0.9, 0.9]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#293640" emissive="#28799b" emissiveIntensity={0.36} roughness={0.42} metalness={0.64} /></mesh>
        <group ref={insulators} position={[0, 1.2, 0]}>{Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          const radius = 1.9 + (index % 2) * 0.45;
          return <mesh key={index} position={[Math.cos(angle) * radius, -1.2 + (index % 5) * 0.75, Math.sin(angle) * radius]} rotation={[Math.PI / 2, 0, angle]}><torusGeometry args={[0.42, 0.13, 8, 28]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d8f2f5" emissive="#62d2ef" emissiveIntensity={0.9} roughness={0.08} transmission={0.52} opacity={0.8} /></mesh>;
        })}</group>
        {[-1, 1].flatMap((x) => [-1, 1].map((z) => <mesh key={`${x}-${z}`} position={[x * 1.4, -3.2, z * 0.8]} rotation={[0, 0, x * 0.18]}><coneGeometry args={[0.42, 2.8, 8]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#17222a" emissive="#1b5670" emissiveIntensity={0.26} roughness={0.54} metalness={0.58} /></mesh>))}
      </group>}
      {props.layers.structure && <group>
        <mesh><boxGeometry args={[2, 8, 2]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8ba2ad" roughness={0.36} metalness={0.62} wireframe /></mesh>
        {[-2.4, -0.8, 0.8, 2.4].map((y, index) => <mesh key={y} position={[0, y, 0]} rotation={[index * 0.4, index * 0.25, 0]}><torusGeometry args={[1.4, 0.08, 8, 44]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9cb8c4" emissive="#3e86a5" emissiveIntensity={0.36} roughness={0.32} wireframe /></mesh>)}
      </group>}
      {props.layers.internal && <group>
        <mesh ref={converter}><icosahedronGeometry args={[1.1, 3]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d7f7ff" emissive="#4bdcff" emissiveIntensity={1.8} roughness={0.08} transmission={0.28} opacity={0.9} /></mesh>
        {[-1.4, 1.4].map((y) => <mesh key={y} position={[0, y, 0]} scale={[0.72, 0.38, 0.72]}><sphereGeometry args={[1, 22, 14]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#548ca4" emissive="#39bfe8" emissiveIntensity={0.8} roughness={0.18} /></mesh>)}
      </group>}
      {props.layers.functional && <group>
        {gridLines.map((points, index) => <Line key={index} points={points} color={index % 2 ? '#7ce5ff' : '#3caed4'} lineWidth={1.25} transparent opacity={0.52} />)}
        {[-1, 1].map((side) => <Line key={side} points={[[side * 3.2, 2.4, 0], [side * 5.8, 4.5, 0], [side * 7.2, 2.2, 0]]} color="#b9f3ff" lineWidth={1.7} transparent opacity={0.62} />)}
      </group>}
      <Markers {...props} />
    </group>
  );
}

export function SkylineMoulterModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const buds = useRef<THREE.Group>(null);
  const husks = useRef<THREE.Group>(null);
  const slurry = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const segments = useMemo(() => Array.from({ length: 8 }, (_, index) => ({ z: -4.2 + index * 1.18, x: Math.sin(index * 0.75) * 0.25, y: Math.cos(index * 0.5) * 0.12 })), []);

  useFrame(() => {
    const t = elapsed.current;
    const scaling = props.animation.name === 'Skyline Tower Scale';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.3) * 0.14;
      root.current.position.y = Math.sin(t * 0.5) * 0.08;
    }
    if (buds.current) buds.current.children.forEach((child, index) => { child.scale.y = 1 + Math.max(0, Math.sin(t * (scaling ? 2.2 : 1) + index * 0.5)) * (scaling ? 0.35 : 0.08); });
    if (husks.current) husks.current.rotation.y = -t * 0.08;
    if (slurry.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.06;
      slurry.current.scale.set(1 * pulse, 0.75 * pulse, 1.55 * pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.4, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && <group>
        {segments.map((segment, index) => <mesh key={index} position={[segment.x, segment.y, segment.z]} scale={[1.45, 0.75, 1]} castShadow receiveShadow><dodecahedronGeometry args={[1, 1]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#d6d3c8' : '#bdbdb4'} emissive="#9d9a87" emissiveIntensity={0.22} roughness={0.18} metalness={0.32} transmission={0.18} opacity={0.9} /></mesh>)}
        <group ref={buds}>{segments.slice(1, 7).map((segment, index) => <group key={index} position={[segment.x, 1.2, segment.z]}>
          <mesh scale={[0.48 + (index % 2) * 0.18, 1.6 + (index % 3) * 0.35, 0.48]}><cylinderGeometry args={[0.45, 0.62, 2.4, 8]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e6e1d4" emissive="#bcb68f" emissiveIntensity={0.3} roughness={0.12} metalness={0.28} transmission={0.3} opacity={0.84} /></mesh>
          <mesh position={[0, 1.7, 0]} scale={[0.55, 0.8, 0.55]}><coneGeometry args={[0.75, 1.8, 6]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#f0eadb" emissive="#c6bc8e" emissiveIntensity={0.3} roughness={0.1} transmission={0.34} opacity={0.82} /></mesh>
        </group>)}</group>
        <group ref={husks}>{Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          return <mesh key={index} position={[Math.cos(angle) * (3.2 + (index % 3) * 0.4), -1.1 + (index % 2) * 0.3, Math.sin(angle) * (3.2 + (index % 3) * 0.4)]} rotation={[0.2, angle, 0.4]} scale={[0.9, 0.08, 1.35]}><coneGeometry args={[1, 2.2, 5]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e9e4d9" emissive="#aaa487" emissiveIntensity={0.18} roughness={0.08} transmission={0.62} opacity={0.4} /></mesh>;
        })}</group>
        {segments.slice(0, 7).flatMap((segment, index) => [-1, 1].map((side) => <mesh key={`${index}-${side}`} position={[side * 1.25, -1.15, segment.z]} rotation={[0, 0, side * 0.22]}><cylinderGeometry args={[0.18, 0.32, 2.4, 8]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8f8e87" roughness={0.5} metalness={0.26} /></mesh>))}
      </group>}
      {props.layers.structure && <group>
        <Line points={segments.map((segment) => [segment.x, segment.y, segment.z] as [number, number, number])} color="#9c9a91" lineWidth={3} transparent opacity={0.72} />
        {segments.map((segment, index) => <mesh key={index} position={[segment.x, segment.y, segment.z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.15, 0.09, 8, 30, Math.PI * 1.5]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#aaa79c" roughness={0.4} wireframe /></mesh>)}
      </group>}
      {props.layers.internal && <group>
        <mesh ref={slurry} scale={[1, 0.75, 1.55]}><capsuleGeometry args={[0.65, 2.5, 8, 18]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#8a9c87" emissive="#5f8a68" emissiveIntensity={0.62} roughness={0.2} transmission={0.18} opacity={0.84} /></mesh>
        {segments.slice(2, 7).map((segment, index) => <mesh key={index} position={[segment.x, segment.y, segment.z]} scale={[0.36, 0.3, 0.5]}><sphereGeometry args={[1, 18, 12]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8ea38b" emissive="#62866a" emissiveIntensity={0.45} roughness={0.24} /></mesh>)}
      </group>}
      {props.layers.functional && <group>
        {[-3.2, -1.6, 0, 1.6, 3.2].map((x, index) => <Line key={x} points={[[x, -2, -5.5], [x * 0.5, 0, 0], [x, 6.5 + index * 0.5, 5.5]]} color={index % 2 ? '#e8dcae' : '#b9b18b'} lineWidth={1.3} transparent opacity={0.46} />)}
        {[3.2, 4.6, 6].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}><torusGeometry args={[radius, 0.035, 8, 96]} /><meshBasicMaterial color={props.silhouette ? '#000000' : '#c1b78b'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} /></mesh>)}
      </group>}
      <Markers {...props} />
    </group>
  );
}
