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
  metalness = 0.12,
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
  roughness = 0.25,
  metalness = 0.05,
  opacity = 0.84,
  transmission = 0.24,
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
      thickness={1.2}
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
      {props.layers.surface && (
        <group>
          <mesh position={[0, 1.2, 0]} scale={[2.6, 1.85, 1.65]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#21191a" emissive="#5a2019" emissiveIntensity={0.34} roughness={0.72} metalness={0.48} />
          </mesh>
          <mesh ref={furnace} position={[0, 1.45, 1.25]} scale={[1.45, 1.65, 0.82]}>
            <boxGeometry args={[1.6, 1.8, 1]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#5c231f" emissive="#ff4a1c" emissiveIntensity={1.7} roughness={0.22} metalness={0.32} transmission={0.08} opacity={0.94} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 2.15, 2.55, 0]}>
              <mesh rotation={[0, 0, side * 0.18]}>
                <cylinderGeometry args={[0.38, 0.55, 3.8, 12]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#171315" emissive="#4d1b18" emissiveIntensity={0.3} roughness={0.62} metalness={0.55} />
              </mesh>
              <mesh position={[0, 2.1, 0]}>
                <coneGeometry args={[0.58, 1.2, 10]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#2f2425" emissive="#8f2d1c" emissiveIntensity={0.4} roughness={0.5} metalness={0.48} />
              </mesh>
            </group>
          ))}
          {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
            <group key={`${x}-${z}`} position={[x * 1.7, -0.85, z * 0.85]}>
              <mesh rotation={[z * 0.08, 0, x * 0.08]}>
                <cylinderGeometry args={[0.42, 0.62, 3.2, 10]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#292123" emissive="#4e201a" emissiveIntensity={0.22} roughness={0.72} metalness={0.42} />
              </mesh>
              <mesh position={[0, -1.75, 0]} scale={[0.8, 0.35, 1.0]}>
                <dodecahedronGeometry args={[1, 0]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#171315" roughness={0.82} metalness={0.5} />
              </mesh>
            </group>
          )))}
          <group ref={molds} position={[0, 0.8, -1.75]}>
            {Array.from({ length: 6 }, (_, index) => {
              const angle = (index / 6) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 1.15, Math.sin(angle) * 0.65, 0]} rotation={[0, 0, angle]} scale={[0.42, 0.7, 0.28]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5b4a45" emissive="#8b3b29" emissiveIntensity={0.3} roughness={0.46} metalness={0.58} />
                </mesh>
              );
            })}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[3.8, 3.2, 2.5]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8a7470" roughness={0.44} metalness={0.5} wireframe />
          </mesh>
          {[-0.8, 0, 0.8, 1.6, 2.4].map((y) => (
            <mesh key={y} position={[0, y, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.65, 0.09, 8, 36, Math.PI * 1.45]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9f827b" roughness={0.38} metalness={0.44} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh position={[0, 1.25, 0]}>
            <icosahedronGeometry args={[1.2, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#6f150f" emissive="#ff4b16" emissiveIntensity={2.0} roughness={0.12} transmission={0.05} opacity={0.96} />
          </mesh>
          {[-1.25, 1.25].map((x) => (
            <mesh key={x} position={[x, 1.2, 0]} scale={[0.42, 1.1, 0.42]}>
              <capsuleGeometry args={[0.5, 1.4, 8, 16]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#783020" emissive="#c54a25" emissiveIntensity={0.72} roughness={0.2} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {scriptTrails.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#ff6a29' : '#d9441b'} lineWidth={1.6} transparent opacity={0.58} />
          ))}
          {[3.0, 4.3, 5.6].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.34, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#d9471d'} transparent opacity={0.34 - index * 0.07} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
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
      {props.layers.surface && (
        <group>
          <mesh position={[0, 1.0, 0]}>
            <boxGeometry args={[1.25, 7.4, 1.25]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#202b34" emissive="#1d5d77" emissiveIntensity={0.34} roughness={0.48} metalness={0.62} />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[6.4, 0.9, 0.9]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#293640" emissive="#28799b" emissiveIntensity={0.36} roughness={0.42} metalness={0.64} />
          </mesh>
          <group ref={insulators} position={[0, 1.2, 0]}>
            {Array.from({ length: 10 }, (_, index) => {
              const angle = (index / 10) * Math.PI * 2;
              const radius = 1.9 + (index % 2) * 0.45;
              return (
                <mesh key={index} position={[Math.cos(angle) * radius, -1.2 + (index % 5) * 0.75, Math.sin(angle) * radius]} rotation={[Math.PI / 2, 0, angle]}>
                  <torusGeometry args={[0.42, 0.13, 8, 28]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d8f2f5" emissive="#62d2ef" emissiveIntensity={0.9} roughness={0.08} transmission={0.52} opacity={0.8} />
                </mesh>
              );
            })}
          </group>
          {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
            <mesh key={`${x}-${z}`} position={[x * 1.4, -3.2, z * 0.8]} rotation={[0, 0, x * 0.18]}>
              <coneGeometry args={[0.42, 2.8, 8]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#17222a" emissive="#1b5670" emissiveIntensity={0.26} roughness={0.54} metalness={0.58} />
            </mesh>
          )))}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh>
            <boxGeometry args={[2.0, 8.0, 2.0]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8ba2ad" roughness={0.36} metalness={0.62} wireframe />
          </mesh>
          {[-2.4, -0.8, 0.8, 2.4].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} rotation={[index * 0.4, index * 0.25, 0]}>
              <torusGeometry args={[1.4, 0.08, 8, 44]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9cb8c4" emissive="#3e86a5" emissiveIntensity={0.36} roughness={0.32} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={converter}>
            <icosahedronGeometry args={[1.1, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d7f7ff" emissive="#4bdcff" emissiveIntensity={1.8} roughness={0.08} transmission={0.28} opacity={0.9} />
          </mesh>
          {[-1.4, 1.4].map((y) => (
            <mesh key={y} position={[0, y, 0]} scale={[0.72, 0.38, 0.72]}>
              <sphereGeometry args={[1, 22, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#548ca4" emissive="#39bfe8" emissiveIntensity={0.8} roughness={0.18} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {gridLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#7ce5ff' : '#3caed4'} lineWidth={1.25} transparent opacity={0.52} />
          ))}
          {[-1, 1].map((side) => (
            <Line key={side} points={[[side * 3.2, 2.4, 0], [side * 5.8, 4.5, 0], [side * 7.2, 2.2, 0]]} color="#b9f3ff" lineWidth={1.7} transparent opacity={0.62} />
          ))}
        </group>
      )}
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
  const segments = useMemo(() => Array.from({ length: 8 }, (_, index) => ({
    z: -4.2 + index * 1.18,
    x: Math.sin(index * 0.75) * 0.25,
    y: Math.cos(index * 0.5) * 0.12,
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const scaleMode = props.animation.name === 'Skyline Tower Scale';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.3) * 0.14;
      root.current.position.y = Math.sin(t * 0.5) * 0.08;
    }
    if (buds.current) {
      buds.current.children.forEach((child, index) => {
        const stretch = 1 + Math.max(0, Math.sin(t * (scaleMode ? 2.2 : 1.0) + index * 0.5)) * (scaleMode ? 0.35 : 0.08);
        child.scale.y = stretch;
      });
    }
    if (husks.current) husks.current.rotation.y = -t * 0.08;
    if (slurry.current) {
      const pulse = 1 + Math.sin(t * 2.0) * 0.06;
      slurry.current.scale.set(1.0 * pulse, 0.75 * pulse, 1.55 * pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.4, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          {segments.map((segment, index) => (
            <mesh key={index} position={[segment.x, segment.y, segment.z]} scale={[1.45, 0.75, 1.0]} castShadow receiveShadow>
              <dodecahedronGeometry args={[1, 1]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#d6d3c8' : '#bdbdb4'} emissive="#9d9a87" emissiveIntensity={0.22} roughness={0.18} metalness={0.32} transmission={0.18} opacity={0.9} />
            </mesh>
          ))}
          <group ref={buds}>
            {segments.slice(1, 7).map((segment, index) => (
              <group key={index} position={[segment.x, 1.2, segment.z]}>
                <mesh scale={[0.48 + (index % 2) * 0.18, 1.6 + (index % 3) * 0.35, 0.48]}>
                  <cylinderGeometry args={[0.45, 0.62, 2.4, 8]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e6e1d4" emissive="#bcb68f" emissiveIntensity={0.3} roughness={0.12} metalness={0.28} transmission={0.3} opacity={0.84} />
                </mesh>
                <mesh position={[0, 1.7, 0]} scale={[0.55, 0.8, 0.55]}>
                  <coneGeometry args={[0.75, 1.8, 6]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#f0eadb" emissive="#c6bc8e" emissiveIntensity={0.3} roughness={0.1} transmission={0.34} opacity={0.82} />
                </mesh>
              </group>
            ))}
          </group>
          <group ref={husks}>
            {Array.from({ length: 10 }, (_, index) => {
              const angle = (index / 10) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * (3.2 + (index % 3) * 0.4), -1.1 + (index % 2) * 0.3, Math.sin(angle) * (3.2 + (index % 3) * 0.4)]} rotation={[0.2, angle, 0.4]} scale={[0.9, 0.08, 1.35]}>
                  <coneGeometry args={[1, 2.2, 5]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e9e4d9" emissive="#aaa487" emissiveIntensity={0.18} roughness={0.08} transmission={0.62} opacity={0.4} />
                </mesh>
              );
            })}
          </group>
          {segments.slice(0, 7).flatMap((segment, index) => [-1, 1].map((side) => (
            <mesh key={`${index}-${side}`} position={[side * 1.25, -1.15, segment.z]} rotation={[0, 0, side * 0.22]}>
              <cylinderGeometry args={[0.18, 0.32, 2.4, 8]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8f8e87" roughness={0.5} metalness={0.26} />
            </mesh>
          )))}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <Line points={segments.map((segment) => [segment.x, segment.y, segment.z] as [number, number, number])} color="#9c9a91" lineWidth={3} transparent opacity={0.72} />
          {segments.map((segment, index) => (
            <mesh key={index} position={[segment.x, segment.y, segment.z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.15, 0.09, 8, 30, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#aaa79c" roughness={0.4} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={slurry} scale={[1.0, 0.75, 1.55]}>
            <capsuleGeometry args={[0.65, 2.5, 8, 18]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#8a9c87" emissive="#5f8a68" emissiveIntensity={0.62} roughness={0.2} transmission={0.18} opacity={0.84} />
          </mesh>
          {segments.slice(2, 7).map((segment, index) => (
            <mesh key={index} position={[segment.x, segment.y, segment.z]} scale={[0.36, 0.3, 0.5]}>
              <sphereGeometry args={[1, 18, 12]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8ea38b" emissive="#62866a" emissiveIntensity={0.45} roughness={0.24} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[-3.2, -1.6, 0, 1.6, 3.2].map((x, index) => (
            <Line key={x} points={[[x, -2, -5.5], [x * 0.5, 0, 0], [x, 6.5 + index * 0.5, 5.5]]} color={index % 2 ? '#e8dcae' : '#b9b18b'} lineWidth={1.3} transparent opacity={0.46} />
          ))}
          {[3.2, 4.6, 6.0].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#c1b78b'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
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
        const extension = 1 + Math.max(0, Math.sin(t * (impale ? 4.0 : 1.2) + index * 0.45)) * (impale ? 0.48 : 0.08);
        child.scale.y = extension;
      });
    }
    if (head.current) head.current.position.z = front.z + 0.45 + Math.sin(t * 0.8) * 0.08;
  });

  return (
    <group ref={root} position={[0, -0.25, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.9, 0.55, 0.95]} rotation={[0, index * 0.12, 0]}>
              <dodecahedronGeometry args={[1, 0]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#12171a' : '#20272a'} emissive="#1b3138" emissiveIntensity={0.25} roughness={0.68} metalness={0.55} />
            </mesh>
          ))}
          <group ref={spikes}>
            {stations.map((point, index) => (
              <mesh key={index} position={[point.x, point.y + 0.9, point.z]} rotation={[0, index * 0.35, 0]} scale={[0.2, 0.9 + (index % 3) * 0.2, 0.2]}>
                <coneGeometry args={[1, 2.0, 5]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#3d474b" emissive="#254c5b" emissiveIntensity={0.35} roughness={0.42} metalness={0.64} />
              </mesh>
            ))}
          </group>
          {stations.slice(1, 13).flatMap((point, index) => [-1, 1].map((side) => (
            <group key={`${index}-${side}`} position={[point.x + side * 0.72, point.y - 0.55, point.z]}>
              <mesh rotation={[0, 0, side * 0.42]}>
                <cylinderGeometry args={[0.12, 0.2, 1.65, 7]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#1d2427" emissive="#20404a" emissiveIntensity={0.22} roughness={0.54} metalness={0.6} />
              </mesh>
              <mesh position={[side * 0.48, -0.55, 0]} rotation={[0, 0, side * Math.PI / 2]} scale={[0.18, 0.65, 0.18]}>
                <coneGeometry args={[1, 1.4, 5]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4a5559" roughness={0.38} metalness={0.68} />
              </mesh>
            </group>
          )))}
          <group ref={head} position={[front.x, front.y, front.z + 0.45]}>
            <mesh scale={[1.0, 0.7, 1.65]}>
              <coneGeometry args={[1, 2.6, 8]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#192023" emissive="#234a57" emissiveIntensity={0.32} roughness={0.48} metalness={0.65} />
            </mesh>
            {[-1, 0, 1].map((x, index) => (
              <mesh key={x} position={[x * 0.45, 0.85, 0.4]} rotation={[0, 0, x * 0.22]} scale={[0.1, 0.55 + index * 0.12, 0.1]}>
                <boxGeometry args={[1, 1, 1]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8dd5e6" emissive="#3fb6d3" emissiveIntensity={0.9} roughness={0.16} />
              </mesh>
            ))}
          </group>
          {[-1, 1].map((side) => (
            <Line key={side} points={stations.map((point) => [point.x + side * 1.0, point.y, point.z] as [number, number, number])} color="#59696d" lineWidth={1.7} transparent opacity={0.58} />
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#78878b" metalness={0.6} roughness={0.34} wireframe />
          </mesh>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, index * 0.25, 0]}>
              <torusGeometry args={[0.78, 0.075, 8, 28, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7c898c" roughness={0.38} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh>
            <capsuleGeometry args={[0.62, 3.0, 8, 18]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#436874" emissive="#2a9abc" emissiveIntensity={0.9} roughness={0.18} transmission={0.16} opacity={0.84} />
          </mesh>
          {stations.slice(3, 11).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.32, 0.26, 0.42]}>
              <sphereGeometry args={[1, 18, 12]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4f7780" emissive="#3f9baa" emissiveIntensity={0.52} roughness={0.22} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {trackLines.map((points, index) => (
            <Line key={index} points={points} color={index === 1 ? '#8ed5e4' : '#4b7884'} lineWidth={index === 1 ? 2.2 : 1.3} transparent opacity={0.5} />
          ))}
          {[-5, -2.5, 0, 2.5, 5].map((z, index) => (
            <mesh key={z} position={[0, -1.9, z]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.7 + index * 0.1, 0.82 + index * 0.1, 28]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#4d8da0'} transparent opacity={0.38} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
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
      surveyors.current.children.forEach((child, index) => {
        child.position.y = Math.sin(t * 1.2 + index) * 0.18;
      });
    }
    if (indexer.current) {
      const pulse = 1 + Math.sin(t * (scan ? 4.4 : 1.7)) * (scan ? 0.15 : 0.05);
      indexer.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.5, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.4, 0]} scale={[2.7, 1.5, 2.25]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4a3736" emissive="#69302d" emissiveIntensity={0.3} roughness={0.68} metalness={0.22} />
          </mesh>
          {[-1.2, 0, 1.2].map((y, row) => [-1.4, 0, 1.4].map((x, column) => (
            <mesh key={`${row}-${column}`} position={[x, y + 0.4, 2.0]} scale={[0.58, 0.48, 0.28]}>
              <boxGeometry args={[1, 1, 1]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#725353" emissive="#9e4540" emissiveIntensity={0.38} roughness={0.28} transmission={0.12} opacity={0.88} />
            </mesh>
          )))}
          <group ref={scanners} position={[0, 3.25, 0.6]}>
            {Array.from({ length: 9 }, (_, index) => {
              const angle = (index / 9) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 1.15, Math.sin(angle) * 0.75, 0]} rotation={[0, 0, angle]}>
                  <sphereGeometry args={[0.28 + (index % 3) * 0.06, 18, 12]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d8a9a0" emissive="#ff4e3f" emissiveIntensity={1.0} roughness={0.12} />
                </mesh>
              );
            })}
          </group>
          {[-1, 1].flatMap((x) => [-1, 0, 1].map((z) => (
            <mesh key={`${x}-${z}`} position={[x * 2.15, -1.6, z * 1.1]} rotation={[z * 0.14, 0, x * 0.22]}>
              <cylinderGeometry args={[0.2, 0.34, 3.4, 8]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#332b2b" emissive="#552929" emissiveIntensity={0.22} roughness={0.62} metalness={0.34} />
            </mesh>
          )))}
          <group ref={surveyors}>
            {Array.from({ length: 8 }, (_, index) => {
              const angle = (index / 8) * Math.PI * 2;
              return (
                <group key={index} position={[Math.cos(angle) * 4.0, 0.2, Math.sin(angle) * 4.0]}>
                  <mesh>
                    <octahedronGeometry args={[0.38, 0]} />
                    <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7a5f5b" emissive="#b24a43" emissiveIntensity={0.54} roughness={0.22} metalness={0.3} />
                  </mesh>
                  <mesh position={[0, 0.55, 0]} scale={[0.08, 0.42, 0.08]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#ff8e79" emissive="#ff4939" emissiveIntensity={0.9} roughness={0.1} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[4.5, 3.4, 3.8]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#967d79" roughness={0.42} metalness={0.3} wireframe />
          </mesh>
          <mesh position={[0, 2.0, 0]}>
            <cylinderGeometry args={[0.35, 0.5, 3.4, 10]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#927a76" roughness={0.38} wireframe />
          </mesh>
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={indexer}>
            <icosahedronGeometry args={[1.15, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#8f3c3a" emissive="#e34f43" emissiveIntensity={1.2} roughness={0.16} transmission={0.12} opacity={0.9} />
          </mesh>
          {[-1.3, 1.3].map((x) => (
            <mesh key={x} position={[x, 0, 0]} scale={[0.58, 0.78, 0.58]}>
              <sphereGeometry args={[1, 20, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#744644" emissive="#a64b46" emissiveIntensity={0.52} roughness={0.26} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {scanLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#ff6b5a' : '#c53b35'} lineWidth={1.2} transparent opacity={0.48} />
          ))}
          {[3.2, 4.6, 6.0].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#c8463f'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function RecordDevourerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const jaws = useRef<THREE.Group>(null);
  const ledgers = useRef<THREE.Group>(null);
  const furnace = useRef<THREE.Mesh>(null);
  const pages = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const pageSpiral = useMemo(() => Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    const angle = t * Math.PI * 7;
    const radius = 3.2 * (1 - t) + 0.3;
    return {
      position: [Math.cos(angle) * radius, 0.4 + Math.sin(angle * 0.6) * 1.2, 4.8 - t * 4.2] as [number, number, number],
      rotation: [t * 2.2, angle, t * 3.1] as [number, number, number],
    };
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    const ingest = props.animation.name === 'Library Ingestion Crush';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.25) * 0.1;
      root.current.position.y = Math.sin(t * 0.48) * 0.08;
    }
    if (jaws.current) {
      jaws.current.children.forEach((child, index) => {
        child.rotation.x = (index === 0 ? 1 : -1) * (0.12 + Math.abs(Math.sin(t * (ingest ? 3.8 : 1.2))) * (ingest ? 0.34 : 0.08));
      });
    }
    if (ledgers.current) ledgers.current.rotation.z = t * (ingest ? 0.44 : 0.14);
    if (pages.current) pages.current.rotation.z = -t * 0.16;
    if (furnace.current) {
      const pulse = 1 + Math.sin(t * 2.1) * 0.07;
      furnace.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.55, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.4, -0.5]} scale={[1.55, 1.2, 2.7]} castShadow receiveShadow>
            <capsuleGeometry args={[0.9, 2.8, 10, 20]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d7c9ad" emissive="#8d7658" emissiveIntensity={0.18} roughness={0.72} transmission={0.08} opacity={0.92} />
          </mesh>
          <group ref={jaws} position={[0, 0.65, 2.5]}>
            {[1, -1].map((side, jawIndex) => (
              <group key={side}>
                <mesh position={[0, side * 0.62, 0]} scale={[1.5, 0.42, 1.1]}>
                  <boxGeometry args={[1.8, 0.65, 1.4]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#b8aa91" emissive="#705b43" emissiveIntensity={0.2} roughness={0.64} metalness={0.14} />
                </mesh>
                {Array.from({ length: 8 }, (_, index) => (
                  <mesh key={index} position={[-1.0 + index * 0.29, side * 0.25, 0.85]} rotation={[side > 0 ? Math.PI : 0, 0, 0]} scale={[0.12, 0.42, 0.18]}>
                    <coneGeometry args={[1, 1.0, 5]} />
                    <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5d5548" roughness={0.38} metalness={0.44} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
          <group ref={ledgers} position={[0, 1.2, -0.9]}>
            {Array.from({ length: 9 }, (_, index) => {
              const angle = (index / 9) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 1.7, Math.sin(angle) * 0.65, 0]} rotation={[0, 0, angle]} scale={[0.2, 0.72, 0.9]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#806f55" emissive="#9f7848" emissiveIntensity={0.24} roughness={0.58} metalness={0.18} />
                </mesh>
              );
            })}
          </group>
          {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
            <group key={`${x}-${z}`} position={[x * 1.35, -1.45, z * 1.45 - 0.4]}>
              <mesh rotation={[z * 0.14, 0, x * 0.18]}>
                <cylinderGeometry args={[0.2, 0.34, 2.8, 8]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#746955" roughness={0.66} metalness={0.2} />
              </mesh>
              <mesh position={[0, -1.4, 0]} scale={[0.65, 0.25, 0.75]}>
                <boxGeometry args={[1, 1, 1]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5c5345" roughness={0.72} metalness={0.22} />
              </mesh>
            </group>
          )))}
          <group ref={pages}>
            {pageSpiral.map((page, index) => (
              <mesh key={index} position={page.position} rotation={page.rotation} scale={[0.42, 0.03, 0.58]}>
                <boxGeometry args={[1, 1, 1]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={index % 3 === 0 ? '#d8e4e7' : '#e7ddc7'} emissive={index % 3 === 0 ? '#668da0' : '#8f7350'} emissiveIntensity={0.22} roughness={0.42} transmission={0.05} opacity={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.4, -0.5]}>
            <boxGeometry args={[2.4, 2.1, 5.0]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8f8470" roughness={0.44} metalness={0.28} wireframe />
          </mesh>
          {[-1.6, -0.6, 0.4, 1.4].map((z, index) => (
            <mesh key={z} position={[0, 0.4, z]} rotation={[Math.PI / 2, index * 0.28, 0]}>
              <torusGeometry args={[1.2, 0.08, 8, 30, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#998d76" roughness={0.4} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={furnace} position={[0, 0.2, -0.8]}>
            <icosahedronGeometry args={[1.0, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#5b241a" emissive="#d44d25" emissiveIntensity={1.35} roughness={0.14} transmission={0.05} opacity={0.94} />
          </mesh>
          <mesh position={[0, 0.3, 0.9]} scale={[0.85, 0.6, 1.05]}>
            <capsuleGeometry args={[0.55, 1.4, 8, 16]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#705a3f" emissive="#9b642f" emissiveIntensity={0.46} roughness={0.3} />
          </mesh>
        </group>
      )}
      {props.layers.functional && (
        <group>
          {Array.from({ length: 5 }, (_, spiral) => (
            <Line
              key={spiral}
              points={Array.from({ length: 48 }, (_, index) => {
                const t = index / 47;
                const angle = t * Math.PI * 5 + spiral;
                const radius = 3.6 * (1 - t) + 0.3;
                return [Math.cos(angle) * radius, 0.4 + Math.sin(angle * 0.5) * 1.4, 5.4 - t * 5.0] as [number, number, number];
              })}
              color={spiral % 2 ? '#d7c59f' : '#7899a5'}
              lineWidth={1.2}
              transparent
              opacity={0.46}
            />
          ))}
          {[3.2, 4.6, 6.0].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#826f55'} transparent opacity={0.28 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
