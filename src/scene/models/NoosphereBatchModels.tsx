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

export function SyntaxBreakerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const throats = useRef<THREE.Group>(null);
  const glyphs = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const tongueScripts = useMemo(() => Array.from({ length: 5 }, (_, line) => Array.from({ length: 54 }, (_, index) => {
    const t = index / 53;
    return [(-2 + line) * 0.38 + Math.sin(t * Math.PI * 5 + line) * 0.22, -0.4 - t * 2.8, 2.0 + t * 4.5] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const scramble = props.animation.name === 'Syntax Scramble Pulse';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.65) * 0.18;
      root.current.rotation.y = Math.sin(t * 0.3) * 0.18;
    }
    if (throats.current) {
      throats.current.children.forEach((child, index) => {
        const pulse = 1 + Math.sin(t * (scramble ? 5.0 : 1.8) + index * 0.8) * (scramble ? 0.22 : 0.07);
        child.scale.y = pulse;
      });
    }
    if (glyphs.current) {
      glyphs.current.rotation.y = t * (scramble ? 0.56 : 0.16);
      glyphs.current.rotation.z = Math.sin(t * 0.45) * 0.12;
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * (scramble ? 4.6 : 1.7)) * (scramble ? 0.16 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 1.45, 0]} scale={[1.45, 1.15, 1.15]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e5dfcf" emissive="#a5977e" emissiveIntensity={0.24} roughness={0.34} transmission={0.18} opacity={0.92} />
          </mesh>
          <group ref={throats} position={[0, 0.2, 0.65]}>
            {Array.from({ length: 6 }, (_, index) => {
              const angle = (index / 6) * Math.PI * 2;
              return (
                <group key={index} position={[Math.cos(angle) * 1.15, Math.sin(angle) * 0.75, 0]} rotation={[0, 0, angle]}>
                  <mesh scale={[0.32, 0.9, 0.32]}>
                    <capsuleGeometry args={[0.42, 1.0, 8, 16]} />
                    <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d6cdb9" emissive="#9e816c" emissiveIntensity={0.28} roughness={0.48} />
                  </mesh>
                  <mesh position={[0, 0.78, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.34, 0.1, 8, 24]} />
                    <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#6d4f5b" emissive="#a43f71" emissiveIntensity={0.7} roughness={0.22} />
                  </mesh>
                </group>
              );
            })}
          </group>
          {Array.from({ length: 9 }, (_, index) => {
            const angle = (index / 9) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 1.8, 1.35 + Math.sin(angle * 2) * 0.35, Math.sin(angle) * 1.8]} rotation={[0, angle, angle * 0.3]} scale={[0.12, 0.95 + (index % 3) * 0.18, 0.12]}>
                <coneGeometry args={[1, 1.9, 5]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#eee7d5" emissive="#ad9f80" emissiveIntensity={0.24} roughness={0.44} />
              </mesh>
            );
          })}
          <group ref={glyphs} position={[0, 1.5, 0]}>
            {Array.from({ length: 18 }, (_, index) => {
              const angle = (index / 18) * Math.PI * 2;
              const radius = 2.6 + (index % 3) * 0.35;
              return (
                <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.7, Math.sin(angle) * radius]} rotation={[angle, angle * 0.6, angle * 1.2]} scale={[0.08 + (index % 2) * 0.05, 0.55 + (index % 4) * 0.13, 0.08]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#c7a6d2' : '#f0d9a4'} emissive={index % 2 ? '#8e52a1' : '#c18b32'} emissiveIntensity={0.76} roughness={0.18} opacity={0.82} />
                </mesh>
              );
            })}
          </group>
          {tongueScripts.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#bd73c8' : '#efc169'} lineWidth={1.5} transparent opacity={0.58}  clippingPlanes={clippingPlanes} />
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.26, 0.34, 5.0, 10]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9f9583" roughness={0.4} metalness={0.2} wireframe />
          </mesh>
          {[-0.8, 0, 0.8, 1.6, 2.4].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, index * 0.32, 0]}>
              <torusGeometry args={[1.15 + index * 0.06, 0.075, 8, 32, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#aaa08d" roughness={0.38} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} position={[0, 0.8, 0]}>
            <icosahedronGeometry args={[1.0, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#8b5a8f" emissive="#c253c9" emissiveIntensity={1.25} roughness={0.14} transmission={0.2} opacity={0.9} />
          </mesh>
          {[0, 1, 2].map((index) => (
            <mesh key={index} rotation={[index * 0.85, index * 0.55, index * 0.7]}>
              <torusGeometry args={[1.4 + index * 0.35, 0.07, 8, 48]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#b38bb8" emissive="#8a4e94" emissiveIntensity={0.55} roughness={0.2} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[3.1, 4.4, 5.7].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#a25dad' : '#d2a34d'} transparent opacity={0.34 - index * 0.07} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-3, -1.5, 0, 1.5, 3].map((x, index) => (
            <Line key={x} points={[[x, -3.8, -5], [x * 0.4, 0, 0], [x, 3.8, 5]]} color={index % 2 ? '#bb75c4' : '#d9b15f'} lineWidth={1.15} transparent opacity={0.44}  clippingPlanes={clippingPlanes} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function CivicTimeRewriterModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const wheel = useRef<THREE.Group>(null);
  const pendulums = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const phaseColors = ['#9dbd69', '#5b4c64', '#e6b951', '#282435'];

  useFrame(() => {
    const t = elapsed.current;
    const desync = props.animation.name === 'Sundial Temporal Desync';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.5) * 0.12;
      root.current.rotation.y = Math.sin(t * 0.2) * 0.08;
    }
    if (wheel.current) {
      wheel.current.rotation.z = t * (desync ? 0.42 : 0.12);
      wheel.current.rotation.y = Math.sin(t * 0.33) * 0.1;
    }
    if (pendulums.current) {
      pendulums.current.children.forEach((child, index) => {
        child.rotation.z = Math.sin(t * (desync ? 2.4 + index * 0.3 : 1.2) + index) * (desync ? 0.72 : 0.32);
      });
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * (desync ? 4.2 : 1.8)) * (desync ? 0.15 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <group ref={wheel} position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <torusGeometry args={[2.8, 0.48, 14, 72]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#b7a87e" emissive="#806d45" emissiveIntensity={0.3} roughness={0.32} metalness={0.32} transmission={0.08} opacity={0.94} />
            </mesh>
            {phaseColors.map((color, index) => {
              const angle = (index / 4) * Math.PI * 2;
              return (
                <mesh key={color} position={[Math.cos(angle) * 2.15, Math.sin(angle) * 2.15, 0]} rotation={[0, 0, angle]} scale={[0.92, 1.3, 0.22]}>
                  <dodecahedronGeometry args={[1, 0]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={color} emissive={color} emissiveIntensity={0.24} roughness={0.52} metalness={0.18} />
                </mesh>
              );
            })}
            {Array.from({ length: 12 }, (_, index) => {
              const angle = (index / 12) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 3.25, Math.sin(angle) * 3.25, 0]} rotation={[0, 0, angle]} scale={[0.12, 0.6, 0.12]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d8c899" emissive="#9a8249" emissiveIntensity={0.24} roughness={0.38} metalness={0.34} />
                </mesh>
              );
            })}
          </group>
          <group ref={pendulums}>
            {[-1.8, -0.6, 0.6, 1.8].map((x, index) => (
              <group key={x} position={[x, -1.4, 0]}>
                <mesh position={[0, -1.4, 0]}>
                  <cylinderGeometry args={[0.08, 0.08, 2.8, 8]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7f7459" roughness={0.42} metalness={0.38} />
                </mesh>
                <mesh position={[0, -2.8, 0]}>
                  <sphereGeometry args={[0.42 + index * 0.04, 20, 14]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={phaseColors[index]} emissive={phaseColors[index]} emissiveIntensity={0.38} roughness={0.3} />
                </mesh>
              </group>
            ))}
          </group>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 1.2, 1.0, 1.1]}>
              <mesh>
                <sphereGeometry args={[0.5, 22, 14]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e2d5a7" emissive="#b58d3e" emissiveIntensity={0.5} roughness={0.15} transmission={0.28} opacity={0.88} />
              </mesh>
              {Array.from({ length: 5 }, (_, index) => (
                <mesh key={index} position={[0, 0, 0.52 + index * 0.03]} rotation={[0, 0, index * 0.5]} scale={[0.04, 0.25 + index * 0.04, 0.04]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5a4d34" roughness={0.3} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
          {Array.from({ length: 10 }, (_, index) => {
            const angle = (index / 10) * Math.PI * 2;
            return (
              <Line key={index} points={[[0, 0, 0], [Math.cos(angle) * 2.8, Math.sin(angle) * 2.8, 0]]} color="#a5966c" lineWidth={1.8} transparent opacity={0.68}  clippingPlanes={clippingPlanes} />
            );
          })}
          <mesh>
            <torusGeometry args={[2.8, 0.12, 8, 64]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9d8c61" roughness={0.38} metalness={0.4} wireframe />
          </mesh>
        </group>
      )}
      {props.layers.internal && (
        <group position={[0, 1.0, 0]}>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.05, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d9bf72" emissive="#d89b2e" emissiveIntensity={1.2} roughness={0.14} transmission={0.18} opacity={0.9} />
          </mesh>
          {[1.45, 1.85, 2.25].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.75, index * 0.5, index * 0.9]}>
              <torusGeometry args={[radius, 0.065, 8, 52]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={phaseColors[index]} emissive={phaseColors[index]} emissiveIntensity={0.42} roughness={0.24} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[3.6, 5.0, 6.4].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : phaseColors[index]} transparent opacity={0.34 - index * 0.07} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-4, -2, 0, 2, 4].map((x, index) => (
            <Line key={x} points={[[x, -5, -4], [x * 0.4, 1, 0], [x, 5, 4]]} color={phaseColors[index % 4]} lineWidth={1.15} transparent opacity={0.42}  clippingPlanes={clippingPlanes} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function OneiricEcologistModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const wings = useRef<THREE.Group>(null);
  const spores = useRef<THREE.Points>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const sporePositions = useMemo(() => {
    const positions = new Float32Array(260 * 3);
    for (let index = 0; index < 260; index += 1) {
      const angle = index * 2.399963;
      const radius = 1.8 + (index % 20) * 0.15;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = -1.6 + (index % 40) * 0.1;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);
  const dreamWaves = useMemo(() => Array.from({ length: 6 }, (_, wave) => Array.from({ length: 72 }, (_, index) => {
    const t = index / 71;
    const angle = t * Math.PI * 2;
    const radius = 2.8 + wave * 0.75;
    return [Math.cos(angle) * radius, -1.0 + Math.sin(angle * 2 + wave) * 0.35, Math.sin(angle) * radius] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const mist = props.animation.name === 'Subconscious Mist Pulse';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.62) * 0.22;
      root.current.rotation.y = Math.sin(t * 0.25) * 0.2;
      root.current.rotation.z = Math.sin(t * 0.45) * 0.06;
    }
    if (wings.current) {
      wings.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * (0.12 + Math.sin(t * 1.35 + index) * 0.08);
      });
    }
    if (spores.current) {
      spores.current.rotation.y = t * (mist ? 0.28 : 0.08);
      spores.current.position.y = Math.sin(t * 0.8) * 0.3;
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * (mist ? 4.0 : 1.6)) * (mist ? 0.14 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh scale={[2.4, 0.72, 2.65]} castShadow receiveShadow>
            <sphereGeometry args={[1, 42, 24]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e5dce4" emissive="#9d7ca5" emissiveIntensity={0.34} roughness={0.16} transmission={0.4} opacity={0.74} />
          </mesh>
          <group ref={wings}>
            {[-1, 1].map((side) => (
              <group key={side} scale={[side, 1, 1]}>
                {[0, 1, 2].map((tier) => (
                  <mesh key={tier} position={[2.5 + tier * 1.0, 0.15 - tier * 0.18, -0.8 + tier * 0.65]} rotation={[0.05, 0, -0.12 - tier * 0.05]} scale={[2.0 - tier * 0.16, 0.12, 1.35]}>
                    <coneGeometry args={[1, 3.0, 5]} />
                    <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#f0e7ef" emissive="#baa0c3" emissiveIntensity={0.3} roughness={0.12} transmission={0.52} opacity={0.62} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 1.2, 0.8, -1.5]} rotation={[0, 0, side * 0.32]}>
              {[0, 1, 2].map((branch) => (
                <mesh key={branch} position={[side * branch * 0.45, branch * 0.48, 0]} rotation={[0, 0, side * (0.2 + branch * 0.18)]} scale={[0.12, 0.9 - branch * 0.12, 0.12]}>
                  <capsuleGeometry args={[0.18, 1.0, 6, 12]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d8cfe0" emissive="#9b7fa7" emissiveIntensity={0.28} roughness={0.18} transmission={0.28} opacity={0.82} />
                </mesh>
              ))}
            </group>
          ))}
          {Array.from({ length: 18 }, (_, index) => {
            const angle = (index / 18) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * (1.35 + (index % 3) * 0.3), Math.sin(angle * 2) * 0.38, Math.sin(angle) * 1.8]} rotation={[0, angle, Math.PI / 2]} scale={[0.28, 0.06, 0.12]}>
                <capsuleGeometry args={[0.25, 0.45, 6, 12]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#695b70" emissive="#8f6f99" emissiveIntensity={0.28} roughness={0.5} />
              </mesh>
            );
          })}
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index / 8) * Math.PI * 2;
            return (
              <Line key={index} points={[[Math.cos(angle) * 1.2, -0.4, Math.sin(angle) * 1.2], [Math.cos(angle) * 2.2, -2.8, Math.sin(angle) * 2.2]]} color="#c4a9ca" lineWidth={1.8} transparent opacity={0.55}  clippingPlanes={clippingPlanes} />
            );
          })}
          <points ref={spores}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[sporePositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#d8bddf" size={0.11} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.66} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          {[-1.7, -0.85, 0, 0.85, 1.7].map((z, index) => (
            <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.65 - Math.abs(index - 2) * 0.14, 0.075, 8, 36, Math.PI]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a599a8" roughness={0.4} wireframe />
            </mesh>
          ))}
          <Line points={[[-4.8, 0, 0], [0, 0, 0], [4.8, 0, 0]]} color="#aca0b1" lineWidth={2.4} transparent opacity={0.65}  clippingPlanes={clippingPlanes} />
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.0, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#755b83" emissive="#a867bd" emissiveIntensity={1.1} roughness={0.14} transmission={0.22} opacity={0.86} />
          </mesh>
          {[-1.2, 1.2].map((x) => (
            <mesh key={x} position={[x, 0, 0]} scale={[0.54, 0.42, 0.8]}>
              <sphereGeometry args={[1, 20, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a58aae" emissive="#855d91" emissiveIntensity={0.52} roughness={0.24} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {dreamWaves.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#d4b8dc' : '#9d78aa'} lineWidth={1.2} transparent opacity={0.46 - index * 0.04}  clippingPlanes={clippingPlanes} />
          ))}
          {[3.6, 5.0, 6.4].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#9a75a5'} transparent opacity={0.28 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function SovereigntyEaterModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const regalia = useRef<THREE.Group>(null);
  const veils = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const decreeLines = useMemo(() => Array.from({ length: 7 }, (_, line) => Array.from({ length: 60 }, (_, index) => {
    const t = index / 59;
    return [-4.5 + line * 1.5, -3.5 + t * 7, Math.sin(t * Math.PI * 4 + line) * (1.0 + line * 0.08)] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const dissolve = props.animation.name === 'Sovereignty Dissolution Sweep';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.56) * 0.16;
      root.current.rotation.y = Math.sin(t * 0.27) * 0.14;
    }
    if (regalia.current) {
      regalia.current.rotation.y = t * (dissolve ? 0.48 : 0.14);
      regalia.current.rotation.z = Math.sin(t * 0.4) * 0.1;
    }
    if (veils.current) {
      veils.current.children.forEach((child, index) => {
        child.rotation.z = Math.sin(t * 0.7 + index) * 0.08;
      });
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * (dissolve ? 4.5 : 1.7)) * (dissolve ? 0.16 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.35, 0]} scale={[0.95, 2.8, 0.85]} castShadow receiveShadow>
            <capsuleGeometry args={[0.72, 3.3, 10, 20]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#090a0e" emissive="#191322" emissiveIntensity={0.22} roughness={0.88} metalness={0.1} />
          </mesh>
          <mesh position={[0, 3.55, 0.2]} scale={[0.8, 1.0, 0.72]}>
            <sphereGeometry args={[1, 30, 20]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#111218" emissive="#21172c" emissiveIntensity={0.22} roughness={0.82} />
          </mesh>
          <mesh position={[0, 3.55, 0.91]} scale={[0.08, 0.72, 0.05]}>
            <boxGeometry args={[1, 1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8f7999" emissive="#79518a" emissiveIntensity={0.72} roughness={0.2} />
          </mesh>
          <group ref={veils}>
            {[-1, 1].flatMap((side) => [0, 1, 2].map((tier) => (
              <mesh key={`${side}-${tier}`} position={[side * (1.0 + tier * 0.4), 1.8 - tier * 1.2, -0.3]} rotation={[0, side * 0.18, side * 0.14]} scale={[1.2 + tier * 0.35, 0.08, 2.0 + tier * 0.45]}>
                <coneGeometry args={[1, 3.2, 5]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#27222e" emissive="#372641" emissiveIntensity={0.24} roughness={0.2} transmission={0.18} opacity={0.44} />
              </mesh>
            )))}
          </group>
          <group ref={regalia} position={[0, 2.2, 0]}>
            {Array.from({ length: 9 }, (_, index) => {
              const angle = (index / 9) * Math.PI * 2;
              const radius = 2.2 + (index % 3) * 0.38;
              const type = index % 3;
              return (
                <group key={index} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.55, Math.sin(angle) * radius]} rotation={[angle, angle * 0.5, angle * 1.1]}>
                  {type === 0 && (
                    <group>
                      <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.48, 0.09, 8, 28, Math.PI * 1.5]} />
                        <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#6f5d45" emissive="#80623d" emissiveIntensity={0.32} roughness={0.42} metalness={0.44} />
                      </mesh>
                      {[-0.35, 0, 0.35].map((x) => (
                        <mesh key={x} position={[x, 0.45, 0]} scale={[0.1, 0.42 + Math.abs(x) * 0.3, 0.1]}>
                          <coneGeometry args={[1, 1.0, 5]} />
                          <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7f6846" roughness={0.36} metalness={0.48} />
                        </mesh>
                      ))}
                    </group>
                  )}
                  {type === 1 && (
                    <mesh scale={[0.62, 0.62, 0.12]}>
                      <octahedronGeometry args={[1, 0]} />
                      <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#54444e" emissive="#62425d" emissiveIntensity={0.28} roughness={0.44} metalness={0.34} />
                    </mesh>
                  )}
                  {type === 2 && (
                    <group>
                      <mesh scale={[0.12, 0.85, 0.12]}>
                        <cylinderGeometry args={[0.2, 0.2, 1.8, 8]} />
                        <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#62504b" roughness={0.4} metalness={0.38} />
                      </mesh>
                      <mesh position={[0, 0.95, 0]}>
                        <sphereGeometry args={[0.28, 16, 10]} />
                        <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#71605a" roughness={0.38} metalness={0.4} />
                      </mesh>
                    </group>
                  )}
                </group>
              );
            })}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.22, 0.32, 7.2, 10]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4d4853" roughness={0.44} metalness={0.28} wireframe />
          </mesh>
          {[-2.0, -1.0, 0, 1.0, 2.0].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, index * 0.28, 0]}>
              <torusGeometry args={[0.82 + index * 0.07, 0.07, 8, 30, Math.PI * 1.45]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#554f5c" roughness={0.4} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <dodecahedronGeometry args={[1.05, 2]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#21172b" emissive="#6f3c86" emissiveIntensity={1.05} roughness={0.14} transmission={0.14} opacity={0.9} />
          </mesh>
          {[1.45, 1.9, 2.35].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.8, index * 0.52, index * 0.9]}>
              <torusGeometry args={[radius, 0.065, 8, 54]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#62516e" emissive="#533560" emissiveIntensity={0.42} roughness={0.26} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {decreeLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#4c4055' : '#75627d'} lineWidth={1.2} transparent opacity={0.42}  clippingPlanes={clippingPlanes} />
          ))}
          {[3.2, 4.7, 6.2].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.38, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#4b3b55'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
