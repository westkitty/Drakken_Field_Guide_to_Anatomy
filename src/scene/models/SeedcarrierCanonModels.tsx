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
import {
  NeuralFungibinderModel as LegacyNeuralFungibinderModel,
  PrecipitationSynthModel as LegacyPrecipitationSynthModel,
  SporesphereArchivistModel as LegacySporesphereArchivistModel,
} from './SeedcarrierModels';

interface MaterialProps {
  model: SpecimenModelProps;
  clippingPlanes: THREE.Plane[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  wireframe?: boolean;
}

function StandardMaterial({
  model,
  clippingPlanes,
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  roughness = 0.6,
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
    />
  );
}

function PhysicalMaterial({
  model,
  clippingPlanes,
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  roughness = 0.35,
  metalness = 0.05,
  opacity = 0.86,
  wireframe,
}: MaterialProps) {
  return (
    <meshPhysicalMaterial
      color={materialColor(color, model.silhouette)}
      emissive={model.silhouette ? '#000000' : emissive}
      emissiveIntensity={model.silhouette ? 0 : emissiveIntensity}
      roughness={roughness}
      metalness={metalness}
      transmission={model.silhouette ? 0 : 0.18}
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

const legs: Array<[number, number, number]> = [
  [-2.1, -0.55, 2.1],
  [2.1, -0.55, 2.1],
  [-2.1, -0.55, -2.1],
  [2.1, -0.55, -2.1],
];

function antler(side: number): Array<[number, number, number]> {
  return [
    [side * 0.45, 4.0, 2.0],
    [side * 1.25, 5.05, 2.2],
    [side * 2.1, 5.55, 1.95],
    [side * 2.9, 6.1, 1.55],
  ];
}

function antlerFork(side: number): Array<[number, number, number]> {
  return [
    [side * 1.25, 5.05, 2.2],
    [side * 1.55, 6.1, 2.5],
    [side * 1.3, 6.85, 2.2],
  ];
}

export function MacrofloraColossusModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const antlers = useRef<THREE.Group>(null);
  const legGroup = useRef<THREE.Group>(null);
  const sapCore = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const spores = useMemo(() => {
    const positions = new Float32Array(160 * 3);
    for (let index = 0; index < 160; index += 1) {
      const leg = legs[index % legs.length];
      const phase = index * 1.618;
      positions[index * 3] = leg[0] + Math.sin(phase) * 0.75;
      positions[index * 3 + 1] = -2.45 + (index % 15) * 0.18;
      positions[index * 3 + 2] = leg[2] + Math.cos(phase) * 0.75;
    }
    return positions;
  }, []);

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.18) * 0.08;
      root.current.position.y = -0.25 + Math.sin(t * 0.55) * 0.07;
    }
    if (antlers.current) antlers.current.rotation.z = Math.sin(t * 0.65) * 0.035;
    if (legGroup.current) {
      legGroup.current.children.forEach((child, index) => {
        child.rotation.x = Math.sin(t * 0.8 + (index % 2) * Math.PI) * 0.035;
      });
    }
    if (sapCore.current) {
      const pulse = 1 + Math.sin(t * 1.9) * 0.07;
      sapCore.current.scale.set(1.05 * pulse, 1.8 * pulse, 1.05 * pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.25, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 1.3, 0]} scale={[2.7, 1.85, 3.15]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#39482e" emissive="#172b1c" emissiveIntensity={0.3} roughness={0.9} />
          </mesh>
          {[-1.6, -0.8, 0, 0.8, 1.6].map((z, index) => (
            <mesh key={z} position={[0, 1.45 + Math.abs(index - 2) * 0.08, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.15 - Math.abs(index - 2) * 0.18, 0.28, 10, 40, Math.PI * 1.45]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#53633f" emissive="#284532" emissiveIntensity={0.28} roughness={0.82} />
            </mesh>
          ))}
          <mesh position={[0, 3.55, 2]} scale={[1.35, 1.2, 1.55]}>
            <dodecahedronGeometry args={[1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#485b37" emissive="#24402d" emissiveIntensity={0.35} roughness={0.86} />
          </mesh>
          <group ref={legGroup}>
            {legs.map(([x, y, z], index) => (
              <group key={index} position={[x, y, z]}>
                <mesh rotation={[z > 0 ? -0.12 : 0.12, 0, x > 0 ? -0.12 : 0.12]}>
                  <cylinderGeometry args={[0.55, 0.78, 3.4, 9]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#303e29" roughness={0.93} />
                </mesh>
                <mesh position={[0, -1.65, 0]} scale={[0.82, 0.55, 1.15]}>
                  <dodecahedronGeometry args={[1, 0]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#233123" emissive="#4aa35e" emissiveIntensity={0.48} roughness={0.85} />
                </mesh>
                {[0, 1, 2].map((toe) => (
                  <mesh key={toe} position={[(toe - 1) * 0.42, -2.25, z > 0 ? 0.55 : -0.55]} rotation={[Math.PI / 2.25, 0, 0]}>
                    <coneGeometry args={[0.2, 1.25, 7]} />
                    <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#67704b" roughness={0.74} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
          <group ref={antlers}>
            {[-1, 1].map((side) => (
              <group key={side}>
                <Line points={antler(side)} color="#7fa96a" lineWidth={5} />
                <Line points={antlerFork(side)} color="#8fbd78" lineWidth={4} />
                <mesh position={[side * 2.95, 6.1, 1.55]} rotation={[Math.PI / 2, side * 0.3, 0]}>
                  <torusGeometry args={[0.95, 0.13, 8, 40, Math.PI * 1.45]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8fb17a" emissive="#4e8f60" emissiveIntensity={0.55} roughness={0.48} />
                </mesh>
                <Line
                  points={Array.from({ length: 36 }, (_, index) => {
                    const t = index / 35;
                    const angle = t * Math.PI * 5 + (side < 0 ? Math.PI : 0);
                    return [side * (0.65 + t * 2.2) + Math.cos(angle) * 0.18, 4.2 + t * 2, 2.05 + Math.sin(angle) * 0.18] as [number, number, number];
                  })}
                  color="#64d484"
                  lineWidth={2}
                  transparent
                  opacity={0.75}
                />
              </group>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.27, 0.38, 6.3, 12]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#929985" metalness={0.42} roughness={0.44} wireframe />
          </mesh>
          {[-1.6, -0.8, 0, 0.8, 1.6].map((z) => (
            <mesh key={z} position={[0, 1.45, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.95, 0.11, 8, 38, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7d886e" roughness={0.5} wireframe />
            </mesh>
          ))}
          {legs.map(([x, , z], index) => (
            <Line key={index} points={[[0, 1.2, z * 0.55], [x, -0.4, z], [x, -2.8, z]]} color="#9ba18d" lineWidth={2} transparent opacity={0.7} />
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={sapCore} position={[0, 1.25, 0]} scale={[1.05, 1.8, 1.05]}>
            <capsuleGeometry args={[0.75, 2.4, 10, 20]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#6ebc70" emissive="#3e9e61" emissiveIntensity={1.1} roughness={0.23} opacity={0.82} />
          </mesh>
          <mesh position={[0, 2.15, -1.7]}>
            <icosahedronGeometry args={[0.95, 2]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8bd897" emissive="#54ad79" emissiveIntensity={1.2} roughness={0.2} />
          </mesh>
        </group>
      )}
      {props.layers.functional && (
        <group>
          {legs.map(([x, , z], index) => (
            <Line key={index} points={[[x, -2.2, z], [x * 1.5, -3.2, z * 1.5], [x * 3.5, -3.9, z * 3.5]]} color="#78c98b" lineWidth={1.6} transparent opacity={0.58} />
          ))}
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[spores, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#9adf89" size={0.13} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.7} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function SporesphereArchivistModel(props: SpecimenModelProps) {
  const ornament = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const mist = useMemo(() => {
    const positions = new Float32Array(160 * 3);
    for (let index = 0; index < 160; index += 1) {
      const angle = index * 0.83;
      const radius = 2.8 + (index % 18) * 0.16;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = -0.8 + (index % 28) * 0.11;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (ornament.current) ornament.current.rotation.y = elapsed.current * 0.16;
  });

  return (
    <group onPointerDown={measurementHandler(props)}>
      <LegacySporesphereArchivistModel {...props} />
      {props.layers.surface && (
        <group ref={ornament}>
          <group position={[0, -2.95, 0]} rotation={[Math.PI, 0, 0]}>
            {Array.from({ length: 9 }, (_, index) => {
              const angle = (index / 9) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 1.15, 0, Math.sin(angle) * 1.15]} rotation={[0.45, -angle, 0]} scale={[0.8, 0.22, 1.65]}>
                  <sphereGeometry args={[1, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#93b978" emissive="#4a8057" emissiveIntensity={0.4} roughness={0.48} opacity={0.9} />
                </mesh>
              );
            })}
            <mesh>
              <cylinderGeometry args={[0.92, 1.3, 0.9, 28, 1, true]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#24251f" emissive="#6a365d" emissiveIntensity={0.5} roughness={0.7} />
            </mesh>
          </group>
          {Array.from({ length: 10 }, (_, index) => {
            const angle = (index / 10) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 4.5, index % 2 ? 0.9 : -0.5, Math.sin(angle) * 4.5]} rotation={[0, -angle, 0]}>
                <torusGeometry args={[0.48, 0.1, 7, 24, Math.PI * 1.55]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#d5a6d9' : '#9bd88a'} emissive={index % 2 ? '#914d9a' : '#4f9f62'} emissiveIntensity={0.8} roughness={0.35} />
              </mesh>
            );
          })}
        </group>
      )}
      {props.layers.functional && (
        <group>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[mist, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#d79ac8" size={0.12} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.62} clippingPlanes={clippingPlanes} />
          </points>
          <Line
            points={Array.from({ length: 64 }, (_, index) => {
              const t = index / 63;
              return [Math.sin(t * Math.PI * 5) * (2.4 + t * 3.2), -0.6 + Math.sin(t * Math.PI * 2) * 1.1, Math.cos(t * Math.PI * 5) * (2.4 + t * 3.2)] as [number, number, number];
            })}
            color="#e8b3df"
            lineWidth={1.6}
            transparent
            opacity={0.5}
          />
        </group>
      )}
    </group>
  );
}

export function NeuralFungibinderModel(props: SpecimenModelProps) {
  const crown = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);

  useFrame(() => {
    if (!crown.current) return;
    crown.current.rotation.y = Math.sin(elapsed.current * 0.45) * 0.1;
    crown.current.children.forEach((child, index) => {
      child.scale.y = 1 + Math.sin(elapsed.current * 1.7 + index * 0.7) * 0.08;
    });
  });

  return (
    <group onPointerDown={measurementHandler(props)}>
      <LegacyNeuralFungibinderModel {...props} />
      {props.layers.surface && (
        <group ref={crown} position={[0, 2.25, 0]}>
          {Array.from({ length: 10 }, (_, index) => {
            const angle = (index / 10) * Math.PI * 2;
            const points: Array<[number, number, number]> = [
              [Math.cos(angle) * 0.7, 0, Math.sin(angle) * 0.7],
              [Math.cos(angle + 0.25) * 1.5, 1 + (index % 2) * 0.35, Math.sin(angle + 0.25) * 1.5],
              [Math.cos(angle - 0.18) * 2.3, 1.8 + (index % 3) * 0.28, Math.sin(angle - 0.18) * 2.3],
            ];
            return <Line key={index} points={points} color={index % 2 ? '#78a45f' : '#6ed19a'} lineWidth={4} />;
          })}
          {Array.from({ length: 7 }, (_, index) => (
            <mesh key={index} position={[(index - 3) * 0.48, 1 + Math.sin(index) * 0.3, Math.cos(index) * 0.65]} scale={[0.65, 0.5, 0.8]}>
              <sphereGeometry args={[1, 18, 12]} />
              <meshStandardMaterial color={materialColor('#6e8056', props.silhouette)} emissive={props.silhouette ? '#000000' : '#3b8f5c'} emissiveIntensity={props.silhouette ? 0 : 0.62} roughness={0.58} clippingPlanes={clipArray(props.clipPlane)} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {Array.from({ length: 10 }, (_, index) => {
            const angle = (index / 10) * Math.PI * 2;
            return (
              <Line
                key={index}
                points={[[0, -1.5, 0], [Math.cos(angle + 0.35) * 2.7, -2.3, Math.sin(angle + 0.35) * 2.7], [Math.cos(angle) * 7.2, -2.85, Math.sin(angle) * 7.2]]}
                color={index % 2 ? '#62d99b' : '#82bff0'}
                lineWidth={1.5}
                transparent
                opacity={0.58}
              />
            );
          })}
        </group>
      )}
    </group>
  );
}

export function PrecipitationSynthModel(props: SpecimenModelProps) {
  const rainGlyphs = useMemo(() => Array.from({ length: 5 }, (_, glyph) => Array.from({ length: 40 }, (_, index) => {
    const t = index / 39;
    const angle = t * Math.PI * (2.5 + glyph * 0.3);
    return [Math.sin(angle) * (0.7 + t * 1.2) + (glyph - 2) * 1.35, -1.3 - t * 4.8, Math.cos(angle) * (0.55 + t * 0.7) + (glyph % 2 ? 1.4 : -1.4)] as [number, number, number];
  })), []);

  return (
    <group onPointerDown={measurementHandler(props)}>
      <LegacyPrecipitationSynthModel {...props} />
      {props.layers.surface && (
        <group>
          {Array.from({ length: 7 }, (_, index) => {
            const z = -3 + index;
            return (
              <Line
                key={index}
                points={Array.from({ length: 18 }, (_, step) => {
                  const t = step / 17;
                  return [Math.sin(t * Math.PI * 3) * 0.45 + Math.sin(z) * 0.45, (t - 0.5) * 0.7 + Math.cos(z) * 0.2, z + Math.cos(t * Math.PI * 3) * 0.25] as [number, number, number];
                })}
                color="#d8f5e8"
                lineWidth={1.3}
                transparent
                opacity={0.7}
              />
            );
          })}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {rainGlyphs.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#8ed2ff' : '#b9e7ff'} lineWidth={1.2} transparent opacity={0.55} />
          ))}
        </group>
      )}
    </group>
  );
}

class TerragulletCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

    getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(Math.sin(t * Math.PI * 2.4) * 0.55, Math.sin(t * Math.PI * 3) * 0.32, (t - 0.5) * 10.5);
  }
}

export function SoilRewriterModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const grinders = useRef<THREE.Group>(null);
  const compost = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new TerragulletCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 112, 1.05, 16, false), [curve]);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.2, 8, false), [curve]);
  const chambers = useMemo(() => [0.2, 0.34, 0.48, 0.62, 0.76].map((t) => curve.getPoint(t)), [curve]);
  const front = useMemo(() => curve.getPoint(1), [curve]);
  const loamTrail = useMemo(() => Array.from({ length: 80 }, (_, index) => {
    const t = index / 79;
    return [Math.sin(t * Math.PI * 5) * 0.5, -1.15 + Math.sin(t * Math.PI * 2) * 0.08, -5.2 - t * 8.5] as [number, number, number];
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) {
      root.current.position.y = -0.4 + Math.sin(t * 0.8) * 0.08;
      root.current.rotation.y = Math.sin(t * 0.35) * 0.12;
    }
    if (grinders.current) {
      grinders.current.children.forEach((child, index) => {
        child.rotation.z = t * (index % 2 ? -1.8 : 1.5);
      });
    }
    if (compost.current) {
      compost.current.children.forEach((child, index) => {
        const pulse = 1 + Math.sin(t * 1.7 + index * 0.65) * 0.05;
        child.scale.set(1.35 * pulse, 1.15 * pulse, 1.35 * pulse);
      });
    }
    if (core.current) core.current.rotation.z = -t * 0.45;
  });

  return (
    <group ref={root} position={[0, -0.4, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#514837" emissive="#2e3826" emissiveIntensity={0.26} roughness={0.9} />
          </mesh>
          {chambers.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[1.5, 1.25, 1.5]}>
              <dodecahedronGeometry args={[1, 1]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#5b5940' : '#46513a'} emissive="#345c36" emissiveIntensity={0.3} roughness={0.82} />
            </mesh>
          ))}
          <group ref={grinders} position={[front.x, front.y, front.z + 0.15]}>
            {[0, 1, 2].map((ring) => (
              <group key={ring} position={[0, 0, ring * 0.22]}>
                <mesh>
                  <torusGeometry args={[1.35 - ring * 0.25, 0.18, 10, 42]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={ring % 2 ? '#8e8b68' : '#6f704f'} metalness={0.42} roughness={0.5} />
                </mesh>
                {Array.from({ length: 12 - ring * 2 }, (_, tooth) => {
                  const count = 12 - ring * 2;
                  const angle = (tooth / count) * Math.PI * 2;
                  const radius = 1.35 - ring * 0.25;
                  return (
                    <mesh key={tooth} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0.18]} rotation={[0, 0, -angle]}>
                      <coneGeometry args={[0.16, 0.72, 6]} />
                      <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a0a27c" metalness={0.38} roughness={0.46} />
                    </mesh>
                  );
                })}
              </group>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a6a18b" metalness={0.28} roughness={0.5} wireframe />
          </mesh>
          {chambers.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.05, 0.11, 8, 30]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8a8871" roughness={0.55} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group ref={compost}>
          {chambers.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[1.35, 1.15, 1.35]}>
              <sphereGeometry args={[0.72, 24, 18]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#78a95d' : '#9a7c53'} emissive={index % 2 ? '#3f8a4b' : '#74552f'} emissiveIntensity={0.72} opacity={0.9} roughness={0.4} />
            </mesh>
          ))}
          <mesh ref={core} position={[0, 0, 1]}>
            <icosahedronGeometry args={[0.92, 2]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a9c66b" emissive="#6ea447" emissiveIntensity={1.05} roughness={0.24} />
          </mesh>
        </group>
      )}
      {props.layers.functional && (
        <group>
          <Line points={loamTrail} color="#7fbd63" lineWidth={5} transparent opacity={0.38} />
          {Array.from({ length: 7 }, (_, glyph) => (
            <Line
              key={glyph}
              points={Array.from({ length: 20 }, (_, index) => {
                const t = index / 19;
                const z = -6 - glyph * 1.1 - t * 0.8;
                return [Math.sin(t * Math.PI * 2 + glyph) * (0.45 + glyph * 0.05), -1, z] as [number, number, number];
              })}
              color="#9ad574"
              lineWidth={1.4}
              transparent
              opacity={0.55}
            />
          ))}
          {[-1, 1].map((side) => (
            <Line key={side} points={[[side * 0.75, -0.4, front.z], [side * 1.8, -1.9, front.z + 2.6], [side * 2.4, -2.4, front.z + 5.2]]} color="#a0d07b" lineWidth={1.3} transparent opacity={0.5} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
