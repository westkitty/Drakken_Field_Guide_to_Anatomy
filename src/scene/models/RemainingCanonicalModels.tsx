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
  roughness = 0.5,
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
  roughness = 0.2,
  metalness = 0.05,
  opacity = 0.82,
  transmission = 0.3,
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

export function GlassspineModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const filigree = useRef<THREE.Group>(null);
  const prism = useRef<THREE.Mesh>(null);
  const fog = useRef<THREE.Points>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const stations = useMemo(
    () => Array.from({ length: 9 }, (_, index) => ({ y: -4.4 + index * 1.1, twist: index * 0.62 })),
    [],
  );
  const fogPositions = useMemo(() => {
    const positions = new Float32Array(180 * 3);
    for (let index = 0; index < 180; index += 1) {
      const angle = index * 2.399963;
      const radius = 1.4 + (index % 17) * 0.12;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = -4.5 + (index % 60) * 0.16;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);
  const opticalLines = useMemo(
    () => Array.from({ length: 7 }, (_, index) => {
      const angle = (index / 7) * Math.PI * 2;
      return [
        [Math.cos(angle) * 0.45, -4.3, Math.sin(angle) * 0.45],
        [Math.cos(angle + 0.4) * 1.2, 0, Math.sin(angle + 0.4) * 1.2],
        [Math.cos(angle) * 4.8, 5.6, Math.sin(angle) * 4.8],
      ] as Array<[number, number, number]>;
    }),
    [],
  );

  useFrame(() => {
    const t = elapsed.current;
    const burst = props.animation.name === 'Light Spindle Burst';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.3) * 0.24;
      root.current.position.y = Math.sin(t * 0.55) * 0.15;
    }
    if (filigree.current) filigree.current.rotation.y = t * (burst ? 0.42 : 0.12);
    if (prism.current) {
      const pulse = 1 + Math.sin(t * (burst ? 5.0 : 1.7)) * (burst ? 0.18 : 0.05);
      prism.current.scale.setScalar(pulse);
      prism.current.rotation.y = -t * 0.28;
    }
    if (fog.current) fog.current.rotation.y = -t * 0.04;
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          {stations.map((station, index) => (
            <group key={index} position={[0, station.y, 0]} rotation={[0, station.twist, 0]}>
              <mesh scale={[0.58 + index * 0.045, 0.62, 0.58 + index * 0.045]}>
                <octahedronGeometry args={[1, 1]} />
                <PhysicalMaterial
                  model={props}
                  clippingPlanes={clippingPlanes}
                  color={index % 2 ? '#bde3e9' : '#d5d0f2'}
                  emissive={index % 2 ? '#5bc5d6' : '#8474c8'}
                  emissiveIntensity={0.7}
                  roughness={0.08}
                  transmission={0.62}
                  opacity={0.72}
                />
              </mesh>
              {[-1, 1].map((side) => (
                <mesh
                  key={side}
                  position={[side * (0.72 + index * 0.035), 0, 0]}
                  rotation={[Math.PI / 2, 0, side * 0.32]}
                  scale={[0.12, 0.8 + (index % 3) * 0.15, 0.12]}
                >
                  <coneGeometry args={[1, 2, 5]} />
                  <PhysicalMaterial
                    model={props}
                    clippingPlanes={clippingPlanes}
                    color="#e7f7f6"
                    emissive="#81cfe2"
                    emissiveIntensity={0.5}
                    roughness={0.08}
                    transmission={0.55}
                    opacity={0.68}
                  />
                </mesh>
              ))}
            </group>
          ))}
          <group ref={filigree}>
            {[1.15, 1.6, 2.05].map((radius, index) => (
              <mesh key={radius} position={[0, -0.2 + index * 0.55, 0]} rotation={[index * 0.8, index * 0.45, index * 0.65]}>
                <torusGeometry args={[radius, 0.055, 8, 64]} />
                <PhysicalMaterial
                  model={props}
                  clippingPlanes={clippingPlanes}
                  color={index % 2 ? '#d8c8f4' : '#aeeaf0'}
                  emissive={index % 2 ? '#8e68c0' : '#4db7c8'}
                  emissiveIntensity={0.62}
                  roughness={0.1}
                  transmission={0.42}
                  opacity={0.7}
                />
              </mesh>
            ))}
          </group>
          <points ref={fog}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[fogPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#b9e9ef" size={0.1} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.48} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.34, 10.2, 10]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8fb7bd" emissive="#477b91" emissiveIntensity={0.4} metalness={0.34} roughness={0.24} wireframe />
          </mesh>
          {stations.map((station, index) => (
            <mesh key={index} position={[0, station.y, 0]} rotation={[Math.PI / 2, station.twist, 0]}>
              <torusGeometry args={[0.82 + index * 0.04, 0.07, 8, 32, Math.PI * 1.55]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a8c9d0" roughness={0.28} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={prism} position={[0, 1.0, 0]}>
            <octahedronGeometry args={[1.05, 2]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#f0e4ff" emissive="#a479e0" emissiveIntensity={1.3} roughness={0.06} transmission={0.48} opacity={0.88} />
          </mesh>
          {stations.slice(1, 8).map((station, index) => (
            <mesh key={index} position={[0, station.y, 0]} scale={[0.28, 0.42, 0.28]}>
              <icosahedronGeometry args={[1, 1]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#70c6d5" emissive="#43a5c0" emissiveIntensity={0.75} roughness={0.16} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {opticalLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#c4a8ef' : '#8ee5ee'} lineWidth={1.4} transparent opacity={0.55} clippingPlanes={clippingPlanes} />
          ))}
          {[3.4, 4.6, 5.8].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.4, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#8fd7e1'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function QuarrymindModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const quarry = useRef<THREE.Group>(null);
  const drones = useRef<THREE.Group>(null);
  const brain = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const droneStations = useMemo(
    () => Array.from({ length: 10 }, (_, index) => {
      const angle = (index / 10) * Math.PI * 2;
      return { angle, radius: 3.2 + (index % 2) * 0.4, y: 1.3 + (index % 3) * 0.42 };
    }),
    [],
  );
  const excavationVectors = useMemo(
    () => droneStations.map((station) => [
      [Math.cos(station.angle) * station.radius, station.y, Math.sin(station.angle) * station.radius],
      [Math.cos(station.angle) * 6.2, -4.9, Math.sin(station.angle) * 6.2],
    ] as Array<[number, number, number]>),
    [droneStations],
  );

  useFrame(() => {
    const t = elapsed.current;
    const barrage = props.animation.name === 'Hive Drill Barrage';
    if (root.current) {
      root.current.position.y = -0.2 + Math.sin(t * 0.6) * 0.08;
      root.current.rotation.y = Math.sin(t * 0.24) * 0.1;
    }
    if (quarry.current) quarry.current.rotation.y = t * (barrage ? 0.36 : 0.1);
    if (drones.current) {
      drones.current.rotation.y = t * (barrage ? 0.62 : 0.18);
      drones.current.children.forEach((child, index) => {
        child.position.y += Math.sin(t * 1.5 + index) * 0.002;
        child.rotation.z = t * (index % 2 ? -0.9 : 0.9);
      });
    }
    if (brain.current) {
      const pulse = 1 + Math.sin(t * (barrage ? 4.2 : 1.5)) * (barrage ? 0.12 : 0.04);
      brain.current.scale.set(1.45 * pulse, 0.75 * pulse, 1.65 * pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.4, 0]} scale={[2.8, 1.25, 3.4]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4c5049" emissive="#29433c" emissiveIntensity={0.28} roughness={0.82} metalness={0.18} />
          </mesh>
          <group ref={quarry} position={[0, 1.7, -0.2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.5, 0.46, 14, 48]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#676554" emissive="#6d713d" emissiveIntensity={0.36} roughness={0.7} metalness={0.24} />
            </mesh>
            {Array.from({ length: 8 }, (_, index) => {
              const angle = (index / 8) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 1.25, 0.15, Math.sin(angle) * 1.25]} rotation={[0, -angle, 0]} scale={[0.3, 0.7 + (index % 3) * 0.12, 0.3]}>
                  <coneGeometry args={[1, 1.8, 6]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9b9470" emissive="#77753d" emissiveIntensity={0.42} roughness={0.5} metalness={0.28} />
                </mesh>
              );
            })}
          </group>
          {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
            <group key={`${x}-${z}`} position={[x * 2.1, -1.7, z * 2.35]}>
              <mesh rotation={[z * 0.12, 0, x * 0.14]}>
                <cylinderGeometry args={[0.45, 0.72, 3.8, 10]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#3d433f" emissive="#24453b" emissiveIntensity={0.22} roughness={0.78} metalness={0.22} />
              </mesh>
              <mesh position={[0, -2, z * 0.25]} scale={[0.95, 0.35, 1.3]}>
                <dodecahedronGeometry args={[1, 0]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#272d2a" roughness={0.88} metalness={0.26} />
              </mesh>
            </group>
          )))}
          <group ref={drones}>
            {droneStations.map((station, index) => (
              <group key={index} position={[Math.cos(station.angle) * station.radius, station.y, Math.sin(station.angle) * station.radius]}>
                <mesh scale={[0.38, 0.22, 0.55]}>
                  <octahedronGeometry args={[1, 0]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a59f77" emissive="#8e873e" emissiveIntensity={0.58} roughness={0.34} metalness={0.38} />
                </mesh>
                <mesh position={[0, -0.34, 0]} rotation={[Math.PI, 0, 0]} scale={[0.12, 0.5, 0.12]}>
                  <coneGeometry args={[1, 1.3, 6]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#6e744f" emissive="#9c9d4a" emissiveIntensity={0.44} roughness={0.42} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0, 0]} scale={[2.2, 0.85, 2.8]}>
            <boxGeometry args={[1, 1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#85877c" metalness={0.35} roughness={0.42} wireframe />
          </mesh>
          {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
            <Line key={`${x}-${z}`} points={[[x * 1.4, 0, z * 1.8], [x * 2.1, -3.4, z * 2.35]]} color="#87938c" lineWidth={2} transparent opacity={0.7} clippingPlanes={clippingPlanes} />
          )))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={brain} position={[0, 1.8, 0]} scale={[1.45, 0.75, 1.65]}>
            <icosahedronGeometry args={[1, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#b8bc86" emissive="#9fa84d" emissiveIntensity={0.95} roughness={0.18} transmission={0.18} opacity={0.88} />
          </mesh>
          <mesh position={[0, 0.1, 0]} scale={[1.1, 0.75, 1.3]}>
            <dodecahedronGeometry args={[1, 2]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#646b4d" emissive="#8a8e45" emissiveIntensity={0.55} roughness={0.3} />
          </mesh>
        </group>
      )}
      {props.layers.functional && (
        <group>
          {excavationVectors.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#a9a869' : '#6f927b'} lineWidth={1.3} transparent opacity={0.5} clippingPlanes={clippingPlanes} />
          ))}
          {Array.from({ length: 5 }, (_, index) => (
            <mesh key={index} position={[0, -4.8, 0]} rotation={[Math.PI / 2, index * 0.3, 0]}>
              <ringGeometry args={[1.5 + index * 0.9, 1.56 + index * 0.9, 64]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#89925e'} transparent opacity={0.28 - index * 0.035} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function ToxicVeilEngineModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const chimneys = useRef<THREE.Group>(null);
  const smog = useRef<THREE.Points>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const chimneyStations = useMemo(
    () => Array.from({ length: 7 }, (_, index) => ({
      x: -2.1 + (index % 4) * 1.4,
      z: -1.2 + Math.floor(index / 4) * 2.1,
      height: 2.1 + (index % 3) * 0.55,
    })),
    [],
  );
  const smogPositions = useMemo(() => {
    const positions = new Float32Array(360 * 3);
    for (let index = 0; index < 360; index += 1) {
      const plume = index % chimneyStations.length;
      const station = chimneyStations[plume];
      const t = ((index / chimneyStations.length) % 52) / 51;
      const angle = index * 1.73;
      positions[index * 3] = station.x + Math.cos(angle) * (0.2 + t * 1.4);
      positions[index * 3 + 1] = 2.4 + station.height + t * 6.2;
      positions[index * 3 + 2] = station.z + Math.sin(angle) * (0.2 + t * 1.4);
    }
    return positions;
  }, [chimneyStations]);
  const shroudLines = useMemo(
    () => Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2;
      return [
        [Math.cos(angle) * 1.6, 1, Math.sin(angle) * 1.6],
        [Math.cos(angle + 0.3) * 4.8, 2.5, Math.sin(angle + 0.3) * 4.8],
        [Math.cos(angle + 0.6) * 7.2, 0.4, Math.sin(angle + 0.6) * 7.2],
      ] as Array<[number, number, number]>;
    }),
    [],
  );

  useFrame(() => {
    const t = elapsed.current;
    const eruption = props.animation.name === 'Smog Vent Eruption';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.26) * 0.12;
      root.current.position.y = -0.25 + Math.sin(t * 0.52) * 0.08;
    }
    if (chimneys.current) {
      chimneys.current.children.forEach((child, index) => {
        child.rotation.z = Math.sin(t * 0.75 + index) * 0.035;
      });
    }
    if (smog.current) {
      smog.current.position.y = Math.sin(t * (eruption ? 1.7 : 0.5)) * (eruption ? 0.5 : 0.15);
      smog.current.rotation.y = t * 0.035;
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * (eruption ? 4.6 : 1.6)) * (eruption ? 0.15 : 0.05);
      core.current.scale.set(1.3 * pulse, 0.9 * pulse, 1.5 * pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0, 0]} scale={[3.4, 1.85, 4.2]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 2]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#50543b" emissive="#58672a" emissiveIntensity={0.32} roughness={0.76} metalness={0.14} />
          </mesh>
          {[-1, 1].flatMap((side) => [-1.4, 0, 1.4].map((z, index) => (
            <mesh key={`${side}-${z}`} position={[side * 2.8, -0.1 + index * 0.25, z]} scale={[0.82, 1.05, 0.82]}>
              <sphereGeometry args={[1, 24, 16]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#7f8d3f" emissive="#9eae42" emissiveIntensity={0.46} roughness={0.3} transmission={0.12} opacity={0.86} />
            </mesh>
          )))}
          <group ref={chimneys}>
            {chimneyStations.map((station, index) => (
              <group key={index} position={[station.x, 2.2, station.z]}>
                <mesh position={[0, station.height / 2, 0]}>
                  <cylinderGeometry args={[0.28, 0.48, station.height, 10]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#353a2d" emissive="#6f782d" emissiveIntensity={0.3} roughness={0.68} metalness={0.28} />
                </mesh>
                <mesh position={[0, station.height + 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.42, 0.12, 8, 24]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#596044" emissive="#87913d" emissiveIntensity={0.42} roughness={0.52} metalness={0.24} />
                </mesh>
              </group>
            ))}
          </group>
          <points ref={smog}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[smogPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#a8b34e" size={0.18} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.54} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0, 0]} scale={[2.8, 1.25, 3.5]}>
            <boxGeometry args={[1, 1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#747766" metalness={0.34} roughness={0.46} wireframe />
          </mesh>
          {chimneyStations.map((station, index) => (
            <Line key={index} points={[[station.x, 0.4, station.z], [station.x, 2.2 + station.height, station.z]]} color="#7e8460" lineWidth={2} transparent opacity={0.64} clippingPlanes={clippingPlanes} />
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} scale={[1.3, 0.9, 1.5]}>
            <icosahedronGeometry args={[1, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#b1ba57" emissive="#9eaf31" emissiveIntensity={1.1} roughness={0.16} transmission={0.18} opacity={0.9} />
          </mesh>
          {[-1.8, 1.8].map((x) => (
            <mesh key={x} position={[x, -0.2, 0]} scale={[0.78, 1.1, 0.9]}>
              <sphereGeometry args={[1, 24, 16]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#77833f" emissive="#92a33d" emissiveIntensity={0.62} roughness={0.24} opacity={0.82} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {shroudLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#a8a74c' : '#75813a'} lineWidth={1.5} transparent opacity={0.48} clippingPlanes={clippingPlanes} />
          ))}
          {[4.2, 5.6, 7].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.28, 0]}>
              <ringGeometry args={[radius, radius + 0.08, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#89943e'} transparent opacity={0.28 - index * 0.06} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function HiveFloramotherModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const petals = useRef<THREE.Group>(null);
  const drones = useRef<THREE.Group>(null);
  const ovary = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const petalStations = useMemo(
    () => Array.from({ length: 12 }, (_, index) => ({ angle: (index / 12) * Math.PI * 2, tier: index % 2 })),
    [],
  );
  const droneStations = useMemo(
    () => Array.from({ length: 18 }, (_, index) => ({
      angle: (index / 18) * Math.PI * 2,
      radius: 3.8 + (index % 4) * 0.42,
      y: 1.8 + (index % 5) * 0.55,
    })),
    [],
  );
  const flightPaths = useMemo(
    () => droneStations.map((station, index) => [
      [Math.cos(station.angle) * 1.2, 2.6, Math.sin(station.angle) * 1.2],
      [Math.cos(station.angle + 0.4) * station.radius, station.y, Math.sin(station.angle + 0.4) * station.radius],
      [Math.cos(station.angle + 0.8) * (7 + (index % 3)), 4.5 + (index % 4), Math.sin(station.angle + 0.8) * (7 + (index % 3))],
    ] as Array<[number, number, number]>),
    [droneStations],
  );

  useFrame(() => {
    const t = elapsed.current;
    const bloom = props.animation.name === 'Ovary Hive Bloom';
    if (root.current) root.current.rotation.y = Math.sin(t * 0.18) * 0.08;
    if (petals.current) {
      petals.current.children.forEach((child, index) => {
        child.rotation.z = Math.sin(t * (bloom ? 1.6 : 0.5) + index * 0.55) * (bloom ? 0.12 : 0.035);
      });
    }
    if (drones.current) {
      drones.current.rotation.y = t * (bloom ? 0.46 : 0.14);
      drones.current.children.forEach((child, index) => {
        child.rotation.y = t * (index % 2 ? -0.8 : 0.8);
      });
    }
    if (ovary.current) {
      const pulse = 1 + Math.sin(t * (bloom ? 4.0 : 1.4)) * (bloom ? 0.16 : 0.05);
      ovary.current.scale.set(1.55 * pulse, 1.25 * pulse, 1.55 * pulse);
    }
  });

  return (
    <group ref={root} position={[0, -1.4, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, -1.4, 0]} scale={[1.15, 3.2, 1.15]}>
            <cylinderGeometry args={[0.8, 1.25, 2, 12]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#365334" emissive="#397743" emissiveIntensity={0.35} roughness={0.72} metalness={0.08} />
          </mesh>
          <group ref={petals} position={[0, 2.1, 0]}>
            {petalStations.map((station, index) => (
              <group key={index} rotation={[0, station.angle, 0]}>
                <mesh
                  position={[0, station.tier ? 0.35 : 0, 2.35 + station.tier * 0.6]}
                  rotation={[station.tier ? -0.45 : -0.22, 0, 0]}
                  scale={[1.35 - station.tier * 0.2, 0.18, 2.45 - station.tier * 0.35]}
                >
                  <sphereGeometry args={[1, 28, 16]} />
                  <PhysicalMaterial
                    model={props}
                    clippingPlanes={clippingPlanes}
                    color={index % 3 === 0 ? '#934d75' : index % 3 === 1 ? '#6f7550' : '#47715b'}
                    emissive={index % 3 === 0 ? '#b1447d' : '#6d8a45'}
                    emissiveIntensity={0.5}
                    roughness={0.3}
                    transmission={0.12}
                    opacity={0.9}
                  />
                </mesh>
              </group>
            ))}
          </group>
          <group ref={drones}>
            {droneStations.map((station, index) => (
              <mesh key={index} position={[Math.cos(station.angle) * station.radius, station.y, Math.sin(station.angle) * station.radius]} scale={[0.34, 0.2, 0.5]}>
                <octahedronGeometry args={[1, 0]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#b7d37b' : '#d0a2c2'} emissive={index % 2 ? '#7ca64f' : '#a95c8e'} emissiveIntensity={0.72} roughness={0.18} transmission={0.18} opacity={0.88} />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.28, 0.5, 7.5, 10]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#79906c" metalness={0.24} roughness={0.44} wireframe />
          </mesh>
          {petalStations.map((station, index) => (
            <Line key={index} points={[[0, 2, 0], [Math.sin(station.angle) * 4.5, 2.4 + station.tier * 0.5, Math.cos(station.angle) * 4.5]]} color="#78956f" lineWidth={1.7} transparent opacity={0.62} clippingPlanes={clippingPlanes} />
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={ovary} position={[0, 2.2, 0]} scale={[1.55, 1.25, 1.55]}>
            <icosahedronGeometry args={[1, 4]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d6c06b" emissive="#e1b84d" emissiveIntensity={1.25} roughness={0.12} transmission={0.22} opacity={0.9} />
          </mesh>
          {[1.9, 2.35, 2.8].map((radius, index) => (
            <mesh key={radius} position={[0, 2.2, 0]} rotation={[index * 0.8, index * 0.48, index * 0.73]}>
              <torusGeometry args={[radius, 0.08, 8, 60]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#a36e91' : '#8ca05e'} emissive={index % 2 ? '#8a4777' : '#768b42'} emissiveIntensity={0.56} roughness={0.2} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {flightPaths.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#c594b8' : '#9dc36a'} lineWidth={1.15} transparent opacity={0.4} clippingPlanes={clippingPlanes} />
          ))}
          {[5.2, 7, 8.8].map((radius, index) => (
            <mesh key={radius} position={[0, -4.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius, radius + 0.07, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#86a458'} transparent opacity={0.26 - index * 0.055} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
