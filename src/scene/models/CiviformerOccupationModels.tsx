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

class RoadthornCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 2.2) * 0.35,
      Math.cos(t * Math.PI * 3.3) * 0.18,
      (t - 0.5) * 10.8,
    );
  }
}

export function TransitImpalerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const spikes = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new RoadthornCurve(), []);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.18, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 14 }, (_, index) => curve.getPoint((index + 0.5) / 14)), [curve]);
  const front = useMemo(() => curve.getPoint(1), [curve]);
  const trackLines = useMemo(() => [-1.1, 0, 1.1].map((x) => [[x, -1.9, -7], [x, -1.9, 7]] as Array<[number, number, number]>), []);

  useFrame(() => {
    const t = elapsed.current;
    const impale = props.animation.name === 'Rail Network Impale';
    if (root.current) {
      root.current.position.z = Math.sin(t * 0.7) * 0.18;
      root.current.rotation.y = Math.sin(t * 0.25) * 0.08;
    }
    if (spikes.current) {
      spikes.current.children.forEach((child, index) => {
        child.scale.y = 1 + Math.max(0, Math.sin(t * (impale ? 4 : 1.2) + index * 0.45)) * (impale ? 0.48 : 0.08);
      });
    }
    if (head.current) head.current.position.z = front.z + 0.45 + Math.sin(t * 0.8) * 0.08;
  });

  return (
    <group ref={root} position={[0, -0.25, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && <group>
        {stations.map((point, index) => <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.9, 0.55, 0.95]} rotation={[0, index * 0.12, 0]}><dodecahedronGeometry args={[1, 0]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#12171a' : '#20272a'} emissive="#1b3138" emissiveIntensity={0.25} roughness={0.68} metalness={0.55} /></mesh>)}
        <group ref={spikes}>{stations.map((point, index) => <mesh key={index} position={[point.x, point.y + 0.9, point.z]} rotation={[0, index * 0.35, 0]} scale={[0.2, 0.9 + (index % 3) * 0.2, 0.2]}><coneGeometry args={[1, 2, 5]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#3d474b" emissive="#254c5b" emissiveIntensity={0.35} roughness={0.42} metalness={0.64} /></mesh>)}</group>
        {stations.slice(1, 13).flatMap((point, index) => [-1, 1].map((side) => <group key={`${index}-${side}`} position={[point.x + side * 0.72, point.y - 0.55, point.z]}>
          <mesh rotation={[0, 0, side * 0.42]}><cylinderGeometry args={[0.12, 0.2, 1.65, 7]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#1d2427" emissive="#20404a" emissiveIntensity={0.22} roughness={0.54} metalness={0.6} /></mesh>
          <mesh position={[side * 0.48, -0.55, 0]} rotation={[0, 0, side * Math.PI / 2]} scale={[0.18, 0.65, 0.18]}><coneGeometry args={[1, 1.4, 5]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4a5559" roughness={0.38} metalness={0.68} /></mesh>
        </group>))}
        <group ref={head} position={[front.x, front.y, front.z + 0.45]}>
          <mesh scale={[1, 0.7, 1.65]}><coneGeometry args={[1, 2.6, 8]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#192023" emissive="#234a57" emissiveIntensity={0.32} roughness={0.48} metalness={0.65} /></mesh>
          {[-1, 0, 1].map((x, index) => <mesh key={x} position={[x * 0.45, 0.85, 0.4]} rotation={[0, 0, x * 0.22]} scale={[0.1, 0.55 + index * 0.12, 0.1]}><boxGeometry args={[1, 1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8dd5e6" emissive="#3fb6d3" emissiveIntensity={0.9} roughness={0.16} /></mesh>)}
        </group>
        {[-1, 1].map((side) => <Line key={side} points={stations.map((point) => [point.x + side, point.y, point.z] as [number, number, number])} color="#59696d" lineWidth={1.7} transparent opacity={0.58} />)}
      </group>}
      {props.layers.structure && <group>
        <mesh geometry={spineGeometry}><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#78878b" metalness={0.6} roughness={0.34} wireframe /></mesh>
        {stations.map((point, index) => <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, index * 0.25, 0]}><torusGeometry args={[0.78, 0.075, 8, 28, Math.PI * 1.5]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7c898c" roughness={0.38} wireframe /></mesh>)}
      </group>}
      {props.layers.internal && <group>
        <mesh><capsuleGeometry args={[0.62, 3, 8, 18]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#436874" emissive="#2a9abc" emissiveIntensity={0.9} roughness={0.18} transmission={0.16} opacity={0.84} /></mesh>
        {stations.slice(3, 11).map((point, index) => <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.32, 0.26, 0.42]}><sphereGeometry args={[1, 18, 12]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4f7780" emissive="#3f9baa" emissiveIntensity={0.52} roughness={0.22} /></mesh>)}
      </group>}
      {props.layers.functional && <group>
        {trackLines.map((points, index) => <Line key={index} points={points} color={index === 1 ? '#8ed5e4' : '#4b7884'} lineWidth={index === 1 ? 2.2 : 1.3} transparent opacity={0.5} />)}
        {[-5, -2.5, 0, 2.5, 5].map((z, index) => <mesh key={z} position={[0, -1.9, z]} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[0.7 + index * 0.1, 0.82 + index * 0.1, 28]} /><meshBasicMaterial color={props.silhouette ? '#000000' : '#4d8da0'} transparent opacity={0.38} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} /></mesh>)}
      </group>}
      <Markers {...props} />
    </group>
  );
}

export function DemographicPlannerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const scanners = useRef<THREE.Group>(null);
  const surveyors = useRef<THREE.Group>(null);
  const indexer = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const scanLines = useMemo(() => Array.from({ length: 9 }, (_, index) => {
    const y = -2.6 + index * 0.65;
    return [[-6, y, 4], [0, y * 0.35, 0], [6, y, 4]] as Array<[number, number, number]>;
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    const scan = props.animation.name === 'Demographic Census Scan';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.5) * 0.08;
      root.current.rotation.y = Math.sin(t * 0.22) * 0.08;
    }
    if (scanners.current) scanners.current.rotation.y = t * (scan ? 0.5 : 0.16);
    if (surveyors.current) {
      surveyors.current.rotation.y = -t * 0.12;
      surveyors.current.children.forEach((child, index) => { child.position.y = Math.sin(t * 1.2 + index) * 0.18; });
    }
    if (indexer.current) {
      const pulse = 1 + Math.sin(t * (scan ? 4.4 : 1.7)) * (scan ? 0.15 : 0.05);
      indexer.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.5, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && <group>
        <mesh position={[0, 0.4, 0]} scale={[2.7, 1.5, 2.25]} castShadow receiveShadow><dodecahedronGeometry args={[1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4a3736" emissive="#69302d" emissiveIntensity={0.3} roughness={0.68} metalness={0.22} /></mesh>
        {[-1.2, 0, 1.2].flatMap((y, row) => [-1.4, 0, 1.4].map((x, column) => <mesh key={`${row}-${column}`} position={[x, y + 0.4, 2]} scale={[0.58, 0.48, 0.28]}><boxGeometry args={[1, 1, 1]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#725353" emissive="#9e4540" emissiveIntensity={0.38} roughness={0.28} transmission={0.12} opacity={0.88} /></mesh>))}
        <group ref={scanners} position={[0, 3.25, 0.6]}>{Array.from({ length: 9 }, (_, index) => {
          const angle = (index / 9) * Math.PI * 2;
          return <mesh key={index} position={[Math.cos(angle) * 1.15, Math.sin(angle) * 0.75, 0]} rotation={[0, 0, angle]}><sphereGeometry args={[0.28 + (index % 3) * 0.06, 18, 12]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d8a9a0" emissive="#ff4e3f" emissiveIntensity={1} roughness={0.12} /></mesh>;
        })}</group>
        {[-1, 1].flatMap((x) => [-1, 0, 1].map((z) => <mesh key={`${x}-${z}`} position={[x * 2.15, -1.6, z * 1.1]} rotation={[z * 0.14, 0, x * 0.22]}><cylinderGeometry args={[0.2, 0.34, 3.4, 8]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#332b2b" emissive="#552929" emissiveIntensity={0.22} roughness={0.62} metalness={0.34} /></mesh>))}
        <group ref={surveyors}>{Array.from({ length: 8 }, (_, index) => {
          const angle = (index / 8) * Math.PI * 2;
          return <group key={index} position={[Math.cos(angle) * 4, 0.2, Math.sin(angle) * 4]}><mesh><octahedronGeometry args={[0.38, 0]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7a5f5b" emissive="#b24a43" emissiveIntensity={0.54} roughness={0.22} metalness={0.3} /></mesh><mesh position={[0, 0.55, 0]} scale={[0.08, 0.42, 0.08]}><boxGeometry args={[1, 1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#ff8e79" emissive="#ff4939" emissiveIntensity={0.9} roughness={0.1} /></mesh></group>;
        })}</group>
      </group>}
      {props.layers.structure && <group><mesh position={[0, 0.4, 0]}><boxGeometry args={[4.5, 3.4, 3.8]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#967d79" roughness={0.42} metalness={0.3} wireframe /></mesh><mesh position={[0, 2, 0]}><cylinderGeometry args={[0.35, 0.5, 3.4, 10]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#927a76" roughness={0.38} wireframe /></mesh></group>}
      {props.layers.internal && <group><mesh ref={indexer}><icosahedronGeometry args={[1.15, 3]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#8f3c3a" emissive="#e34f43" emissiveIntensity={1.2} roughness={0.16} transmission={0.12} opacity={0.9} /></mesh>{[-1.3, 1.3].map((x) => <mesh key={x} position={[x, 0, 0]} scale={[0.58, 0.78, 0.58]}><sphereGeometry args={[1, 20, 14]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#744644" emissive="#a64b46" emissiveIntensity={0.52} roughness={0.26} /></mesh>)}</group>}
      {props.layers.functional && <group>{scanLines.map((points, index) => <Line key={index} points={points} color={index % 2 ? '#ff6b5a' : '#c53b35'} lineWidth={1.2} transparent opacity={0.48} />)}{[3.2, 4.6, 6].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}><torusGeometry args={[radius, 0.035, 8, 96]} /><meshBasicMaterial color={props.silhouette ? '#000000' : '#c8463f'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} /></mesh>)}</group>}
      <Markers {...props} />
    </group>
  );
}

export function RecordDevourerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const upperJaw = useRef<THREE.Group>(null);
  const lowerJaw = useRef<THREE.Group>(null);
  const ledgers = useRef<THREE.Group>(null);
  const furnace = useRef<THREE.Mesh>(null);
  const pages = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const pageSpiral = useMemo(() => Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    const angle = t * Math.PI * 7;
    const radius = 3.2 * (1 - t) + 0.3;
    return { position: [Math.cos(angle) * radius, 0.4 + Math.sin(angle * 0.6) * 1.2, 4.8 - t * 4.2] as [number, number, number], rotation: [t * 2.2, angle, t * 3.1] as [number, number, number] };
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    const ingest = props.animation.name === 'Library Ingestion Crush';
    const opening = 0.12 + Math.abs(Math.sin(t * (ingest ? 3.8 : 1.2))) * (ingest ? 0.34 : 0.08);
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.25) * 0.1;
      root.current.position.y = Math.sin(t * 0.48) * 0.08;
    }
    if (upperJaw.current) upperJaw.current.rotation.x = opening;
    if (lowerJaw.current) lowerJaw.current.rotation.x = -opening;
    if (ledgers.current) ledgers.current.rotation.z = t * (ingest ? 0.44 : 0.14);
    if (pages.current) pages.current.rotation.z = -t * 0.16;
    if (furnace.current) {
      const pulse = 1 + Math.sin(t * 2.1) * 0.07;
      furnace.current.scale.setScalar(pulse);
    }
  });

  const Jaw = ({ side, jawRef }: { side: number; jawRef: React.RefObject<THREE.Group | null> }) => (
    <group ref={jawRef}>
      <mesh position={[0, side * 0.62, 0]} scale={[1.5, 0.42, 1.1]}><boxGeometry args={[1.8, 0.65, 1.4]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#b8aa91" emissive="#705b43" emissiveIntensity={0.2} roughness={0.64} metalness={0.14} /></mesh>
      {Array.from({ length: 8 }, (_, index) => <mesh key={index} position={[-1 + index * 0.29, side * 0.25, 0.85]} rotation={[side > 0 ? Math.PI : 0, 0, 0]} scale={[0.12, 0.42, 0.18]}><coneGeometry args={[1, 1, 5]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5d5548" roughness={0.38} metalness={0.44} /></mesh>)}
    </group>
  );

  return (
    <group ref={root} position={[0, -0.55, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && <group>
        <mesh position={[0, 0.4, -0.5]} scale={[1.55, 1.2, 2.7]} castShadow receiveShadow><capsuleGeometry args={[0.9, 2.8, 10, 20]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d7c9ad" emissive="#8d7658" emissiveIntensity={0.18} roughness={0.72} transmission={0.08} opacity={0.92} /></mesh>
        <group position={[0, 0.65, 2.5]}><Jaw side={1} jawRef={upperJaw} /><Jaw side={-1} jawRef={lowerJaw} /></group>
        <group ref={ledgers} position={[0, 1.2, -0.9]}>{Array.from({ length: 9 }, (_, index) => {
          const angle = (index / 9) * Math.PI * 2;
          return <mesh key={index} position={[Math.cos(angle) * 1.7, Math.sin(angle) * 0.65, 0]} rotation={[0, 0, angle]} scale={[0.2, 0.72, 0.9]}><boxGeometry args={[1, 1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#806f55" emissive="#9f7848" emissiveIntensity={0.24} roughness={0.58} metalness={0.18} /></mesh>;
        })}</group>
        {[-1, 1].flatMap((x) => [-1, 1].map((z) => <group key={`${x}-${z}`} position={[x * 1.35, -1.45, z * 1.45 - 0.4]}><mesh rotation={[z * 0.14, 0, x * 0.18]}><cylinderGeometry args={[0.2, 0.34, 2.8, 8]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#746955" roughness={0.66} metalness={0.2} /></mesh><mesh position={[0, -1.4, 0]} scale={[0.65, 0.25, 0.75]}><boxGeometry args={[1, 1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5c5345" roughness={0.72} metalness={0.22} /></mesh></group>))}
        <group ref={pages}>{pageSpiral.map((page, index) => <mesh key={index} position={page.position} rotation={page.rotation} scale={[0.42, 0.03, 0.58]}><boxGeometry args={[1, 1, 1]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={index % 3 === 0 ? '#d8e4e7' : '#e7ddc7'} emissive={index % 3 === 0 ? '#668da0' : '#8f7350'} emissiveIntensity={0.22} roughness={0.42} transmission={0.05} opacity={0.8} /></mesh>)}</group>
      </group>}
      {props.layers.structure && <group><mesh position={[0, 0.4, -0.5]}><boxGeometry args={[2.4, 2.1, 5]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8f8470" roughness={0.44} metalness={0.28} wireframe /></mesh>{[-1.6, -0.6, 0.4, 1.4].map((z, index) => <mesh key={z} position={[0, 0.4, z]} rotation={[Math.PI / 2, index * 0.28, 0]}><torusGeometry args={[1.2, 0.08, 8, 30, Math.PI * 1.5]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#998d76" roughness={0.4} wireframe /></mesh>)}</group>}
      {props.layers.internal && <group><mesh ref={furnace} position={[0, 0.2, -0.8]}><icosahedronGeometry args={[1, 3]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#5b241a" emissive="#d44d25" emissiveIntensity={1.35} roughness={0.14} transmission={0.05} opacity={0.94} /></mesh><mesh position={[0, 0.3, 0.9]} scale={[0.85, 0.6, 1.05]}><capsuleGeometry args={[0.55, 1.4, 8, 16]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#705a3f" emissive="#9b642f" emissiveIntensity={0.46} roughness={0.3} /></mesh></group>}
      {props.layers.functional && <group>{Array.from({ length: 5 }, (_, spiral) => <Line key={spiral} points={Array.from({ length: 48 }, (_, index) => {
        const t = index / 47;
        const angle = t * Math.PI * 5 + spiral;
        const radius = 3.6 * (1 - t) + 0.3;
        return [Math.cos(angle) * radius, 0.4 + Math.sin(angle * 0.5) * 1.4, 5.4 - t * 5] as [number, number, number];
      })} color={spiral % 2 ? '#d7c59f' : '#7899a5'} lineWidth={1.2} transparent opacity={0.46} />)}{[3.2, 4.6, 6].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}><torusGeometry args={[radius, 0.035, 8, 96]} /><meshBasicMaterial color={props.silhouette ? '#000000' : '#826f55'} transparent opacity={0.28 - index * 0.06} clippingPlanes={clippingPlanes} /></mesh>)}</group>}
      <Markers {...props} />
    </group>
  );
}
