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

interface MaterialProps {
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
}

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
  roughness = 0.3,
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
      thickness={1.35}
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

class AbyssorielCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

    getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const z = (t - 0.5) * 11;
    return target.set(
      Math.sin(t * Math.PI * 2.2) * 0.65,
      Math.sin(t * Math.PI * 3.4) * 0.34,
      z,
    );
  }
}

export function TrenchSovereignModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const armor = useRef<THREE.Group>(null);
  const jaw = useRef<THREE.Group>(null);
  const depthCore = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new AbyssorielCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 128, 1.05, 16, false), [curve]);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 112, 0.2, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 11 }, (_, index) => curve.getPoint((index + 0.5) / 11)), [curve]);
  const front = useMemo(() => curve.getPoint(1), [curve]);
  const sonar = useMemo(() => Array.from({ length: 6 }, (_, ring) => Array.from({ length: 64 }, (_, index) => {
    const angle = (index / 63) * Math.PI * 2;
    const radius = 2.4 + ring * 0.8;
    return [Math.cos(angle) * radius, -0.35 + ring * 0.07, front.z + 1.1 + Math.sin(angle) * radius] as [number, number, number];
  })), [front.z]);

  useFrame(() => {
    const t = elapsed.current;
    const surge = props.animation.name === 'Sonar Pulse Surge';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.34) * 0.22;
      root.current.rotation.z = Math.sin(t * 0.48) * 0.06;
      root.current.position.y = Math.sin(t * 0.62) * 0.16;
    }
    if (armor.current) armor.current.rotation.z = Math.sin(t * 0.28) * 0.025;
    if (jaw.current) jaw.current.rotation.x = surge ? -0.18 - Math.abs(Math.sin(t * 2.3)) * 0.32 : -0.2;
    if (depthCore.current) {
      const pulse = 1 + Math.sin(t * (surge ? 4.4 : 1.8)) * (surge ? 0.16 : 0.06);
      depthCore.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} rotation={[0.08, 0, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group ref={armor}>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#10161a" emissive="#102b37" emissiveIntensity={0.32} roughness={0.2} metalness={0.42} transmission={0.08} opacity={0.96} />
          </mesh>
          {stations.map((point, index) => (
            <group key={index} position={[point.x, point.y, point.z]}>
              <mesh scale={[1.38 + (index % 2) * 0.14, 0.58, 1.25]} rotation={[0, 0, index % 2 ? 0.12 : -0.12]}>
                <dodecahedronGeometry args={[1, 0]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 3 === 0 ? '#17242b' : '#0b1115'} emissive="#14313d" emissiveIntensity={0.28} metalness={0.55} roughness={0.24} />
              </mesh>
              <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.38, 1.5 + (index % 3) * 0.22, 7]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#263239" emissive="#254a59" emissiveIntensity={0.35} metalness={0.48} roughness={0.28} />
              </mesh>
              <mesh position={[0, 0.62, 0.88]} scale={[0.22, 0.5, 0.18]}>
                <sphereGeometry args={[1, 18, 12]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#68b6cb" emissive="#38a8cf" emissiveIntensity={1.3} roughness={0.18} />
              </mesh>
            </group>
          ))}
          <group ref={jaw} position={[front.x, front.y, front.z + 0.55]}>
            <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.55, 0.72, 1.05]}>
              <coneGeometry args={[1, 2.4, 7, 1, true]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#161d21" metalness={0.5} roughness={0.26} />
            </mesh>
            <mesh position={[0, -0.75, 0.15]} rotation={[-Math.PI / 2, 0, Math.PI]} scale={[1.5, 0.7, 1.0]}>
              <coneGeometry args={[1, 2.25, 7, 1, true]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#0c1114" metalness={0.46} roughness={0.32} />
            </mesh>
            <mesh ref={depthCore} position={[0, -0.2, 0.65]} scale={[0.85, 1.15, 0.85]}>
              <sphereGeometry args={[1, 28, 18]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#3a080d" emissive="#b61f2b" emissiveIntensity={1.7} roughness={0.15} opacity={0.88} />
            </mesh>
          </group>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 1.2, -0.05, -5.2]} rotation={[0, side * 0.35, side * 0.55]} scale={[1.0, 0.16, 2.4]}>
              <coneGeometry args={[1, 3.2, 5]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#192a32" emissive="#24556a" emissiveIntensity={0.34} roughness={0.24} transmission={0.12} opacity={0.88} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#78909b" metalness={0.44} roughness={0.38} wireframe />
          </mesh>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.12, 0.1, 8, 32, Math.PI * 1.45]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5e7782" roughness={0.42} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          {stations.slice(2, 9).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.58, 0.48, 0.72]}>
              <sphereGeometry args={[1, 20, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#23566b" emissive="#2d96bd" emissiveIntensity={0.85} roughness={0.18} opacity={0.78} />
            </mesh>
          ))}
          <mesh position={[0, -0.1, 0]} scale={[0.95, 0.85, 1.4]}>
            <icosahedronGeometry args={[1, 2]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8e1622" emissive="#d02a35" emissiveIntensity={1.2} roughness={0.18} />
          </mesh>
        </group>
      )}
      {props.layers.functional && (
        <group>
          {sonar.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#4eafc8' : '#7dd8e8'} lineWidth={1.2} transparent opacity={0.48 - index * 0.05} />
          ))}
          {[2.8, 4.2, 5.6].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.34, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#346f85'} transparent opacity={0.32 - index * 0.07} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function SalinityConductorModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const fins = useRef<THREE.Group>(null);
  const crystals = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const glyphs = useMemo(() => {
    const positions = new Float32Array(120 * 3);
    for (let index = 0; index < 120; index += 1) {
      const angle = index * 2.399963;
      positions[index * 3] = Math.cos(angle) * (0.5 + (index % 14) * 0.13);
      positions[index * 3 + 1] = Math.sin(index * 1.17) * 0.7;
      positions[index * 3 + 2] = -2.5 + (index % 35) * 0.15;
    }
    return positions;
  }, []);

  useFrame(() => {
    const t = elapsed.current;
    const pulseMode = props.animation.name === 'Ion Polarization Pulse';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.35) * 0.28;
      root.current.rotation.z = Math.sin(t * 0.6) * 0.08;
      root.current.position.y = Math.sin(t * 0.7) * 0.22;
    }
    if (fins.current) {
      fins.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * (0.16 + Math.sin(t * 1.5 + index * 0.7) * 0.09);
      });
    }
    if (crystals.current) crystals.current.rotation.z = t * (pulseMode ? 0.55 : 0.18);
    if (core.current) {
      const pulse = 1 + Math.sin(t * (pulseMode ? 4.1 : 1.6)) * (pulseMode ? 0.15 : 0.05);
      core.current.scale.set(1.2 * pulse, 0.75 * pulse, 2.0 * pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh scale={[2.8, 0.9, 3.5]} castShadow receiveShadow>
            <sphereGeometry args={[1, 48, 28]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#a9c7c6" emissive="#3b7378" emissiveIntensity={0.42} roughness={0.18} metalness={0.12} transmission={0.42} opacity={0.76} />
          </mesh>
          <group ref={fins}>
            {[-1, 1].map((side) => (
              <group key={side} scale={[side, 1, 1]}>
                {[0, 1, 2].map((tier) => (
                  <mesh key={tier} position={[2.7 + tier * 1.1, 0.2 - tier * 0.22, -1.5 + tier * 1.2]} rotation={[0.1, 0, -0.18 - tier * 0.06]} scale={[2.25 - tier * 0.18, 0.16, 1.3]}>
                    <coneGeometry args={[1, 3.2, 5]} />
                    <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d7e6df" emissive="#78aeb1" emissiveIntensity={0.32} roughness={0.2} transmission={0.36} opacity={0.74} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
          <group ref={crystals} position={[0, 0, 3.45]}>
            {Array.from({ length: 14 }, (_, index) => {
              const angle = (index / 14) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 1.18, Math.sin(angle) * 0.58, 0]} rotation={[0, 0, angle]} scale={[0.28, 0.62 + (index % 3) * 0.12, 0.28]}>
                  <octahedronGeometry args={[1, 0]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#edf4ee" emissive="#c7e0df" emissiveIntensity={0.48} roughness={0.12} metalness={0.08} transmission={0.5} opacity={0.86} />
                </mesh>
              );
            })}
          </group>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[glyphs, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#f2f5ef" size={0.1} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.72} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.22, 5.2, 8, 18]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#829594" metalness={0.3} roughness={0.42} wireframe />
          </mesh>
          {[-2.4, -1.2, 0, 1.2, 2.4].map((z, index) => (
            <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.3 - Math.abs(index - 2) * 0.22, 0.09, 8, 42, Math.PI]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a5b8b2" roughness={0.44} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} scale={[1.2, 0.75, 2.0]}>
            <capsuleGeometry args={[0.7, 2.4, 8, 18]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#cbd9c2" emissive="#8db48d" emissiveIntensity={0.9} roughness={0.18} transmission={0.28} opacity={0.82} />
          </mesh>
          {[-1.45, 1.45].map((x) => (
            <mesh key={x} position={[x, 0, -0.3]} scale={[0.62, 0.42, 1.5]}>
              <sphereGeometry args={[1, 22, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#f0eee4" emissive="#c7c9b6" emissiveIntensity={0.5} roughness={0.2} opacity={0.78} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[-3.8, -1.9, 0, 1.9, 3.8].map((x, index) => (
            <Line key={x} points={[[x, 0, -5.5], [x * 0.65, Math.sin(index) * 0.4, 0], [x, 0, 5.5]]} color={index % 2 ? '#d7edf0' : '#9bc8cf'} lineWidth={1.3} transparent opacity={0.5} />
          ))}
          {[3.1, 4.4, 5.7].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.4, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#d8eee9'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

class CurrenthaloCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private readonly phase: number) {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * Math.PI * 2;
    const radius = 3.1 + Math.sin(angle * 2 + this.phase) * 0.55;
    return target.set(
      Math.cos(angle + this.phase) * radius,
      Math.sin(angle * 2 + this.phase) * 1.1,
      Math.sin(angle + this.phase) * radius,
    );
  }
}

export function GyreTacticianModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const loopA = useRef<THREE.Mesh>(null);
  const loopB = useRef<THREE.Mesh>(null);
  const loopC = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curves = useMemo(() => [new CurrenthaloCurve(0), new CurrenthaloCurve(Math.PI * 0.67), new CurrenthaloCurve(Math.PI * 1.33)], []);
  const geometries = useMemo(() => curves.map((curve) => new THREE.TubeGeometry(curve, 112, 0.48, 12, true)), [curves]);
  const ribs = useMemo(() => curves.flatMap((curve, curveIndex) => Array.from({ length: 12 }, (_, index) => ({
    point: curve.getPoint(index / 12),
    curveIndex,
    index,
  }))), [curves]);
  const droplets = useMemo(() => {
    const positions = new Float32Array(180 * 3);
    for (let index = 0; index < 180; index += 1) {
      const angle = index * 2.399963;
      const radius = 3.8 + (index % 18) * 0.16;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(index * 1.31) * 1.8;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame(() => {
    const t = elapsed.current;
    const spin = props.animation.name === 'Gyre Vortex Spin';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.65) * 0.18;
      root.current.rotation.x = Math.sin(t * 0.28) * 0.08;
    }
    if (loopA.current) loopA.current.rotation.y = t * (spin ? 0.38 : 0.16);
    if (loopB.current) loopB.current.rotation.x = -t * (spin ? 0.31 : 0.13);
    if (loopC.current) loopC.current.rotation.z = t * (spin ? 0.26 : 0.1);
    if (core.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.08;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh ref={loopA} geometry={geometries[0]}>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#4a9ab1" emissive="#2a7894" emissiveIntensity={0.58} roughness={0.18} transmission={0.32} opacity={0.78} />
          </mesh>
          <mesh ref={loopB} geometry={geometries[1]} rotation={[Math.PI / 2.7, 0, 0]}>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#62afbd" emissive="#277e99" emissiveIntensity={0.52} roughness={0.2} transmission={0.28} opacity={0.8} />
          </mesh>
          <mesh ref={loopC} geometry={geometries[2]} rotation={[0, 0, Math.PI / 2.9]}>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#357d9a" emissive="#235e82" emissiveIntensity={0.62} roughness={0.18} transmission={0.34} opacity={0.76} />
          </mesh>
          {ribs.map(({ point, curveIndex, index }) => (
            <mesh key={`${curveIndex}-${index}`} position={[point.x, point.y, point.z]} rotation={[0, index * 0.42, curveIndex * 0.5]} scale={[0.16, 0.72, 0.42]}>
              <coneGeometry args={[1, 1.7, 5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8dd9df" emissive="#4fbac7" emissiveIntensity={0.74} roughness={0.22} opacity={0.88} />
            </mesh>
          ))}
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[droplets, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#a9e7ef" size={0.11} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.68} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          {geometries.map((geometry, index) => (
            <mesh key={index} geometry={geometry} rotation={index === 1 ? [Math.PI / 2.7, 0, 0] : index === 2 ? [0, 0, Math.PI / 2.9] : [0, 0, 0]}>
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9bbfc7" metalness={0.28} roughness={0.38} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.15, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#7fd1d6" emissive="#3bb3c4" emissiveIntensity={1.1} roughness={0.16} transmission={0.3} opacity={0.84} />
          </mesh>
          {[0, 1, 2].map((index) => (
            <mesh key={index} rotation={[index * 0.76, index * 0.48, index * 0.91]}>
              <torusGeometry args={[1.75 + index * 0.3, 0.08, 8, 56]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5bb6c6" emissive="#2c8ea3" emissiveIntensity={0.62} roughness={0.24} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[4.6, 5.8, 7].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.36, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 112]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#59b8ca'} transparent opacity={0.35 - index * 0.08} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <Line key={side} points={[[side * 7.2, 0, -4.5], [side * 4.5, 0.8, 0], [side * 7.2, 0, 4.5]]} color="#85d9e5" lineWidth={1.5} transparent opacity={0.48} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function LittoralReformerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Group>(null);
  const processCore = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const segments = useMemo(() => Array.from({ length: 8 }, (_, index) => ({
    z: -4.2 + index * 1.2,
    x: Math.sin(index * 0.85) * 0.32,
    y: Math.cos(index * 0.55) * 0.12,
    scale: 1.28 - Math.abs(index - 3.5) * 0.07,
  })), []);
  const surfScar = useMemo(() => Array.from({ length: 90 }, (_, index) => {
    const t = index / 89;
    return [Math.sin(t * Math.PI * 10) * (0.35 + t * 2.8), -2.1, -5 + t * 13] as [number, number, number];
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    const stomp = props.animation.name === 'Breaker Wall Stomp';
    if (root.current) {
      root.current.position.y = -0.45 + Math.abs(Math.sin(t * (stomp ? 2.7 : 1.1))) * (stomp ? 0.16 : 0.06);
      root.current.rotation.y = Math.sin(t * 0.38) * 0.12;
    }
    if (blades.current) {
      blades.current.children.forEach((child, index) => {
        child.rotation.z = t * (index % 2 ? -1.7 : 1.7);
      });
    }
    if (processCore.current) {
      const pulse = 1 + Math.sin(t * 2.1) * 0.07;
      processCore.current.scale.set(1.05 * pulse, 0.78 * pulse, 1.55 * pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.45, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          {segments.map((segment, index) => (
            <mesh key={index} position={[segment.x, segment.y, segment.z]} scale={[1.8 * segment.scale, 0.9 * segment.scale, 1.15 * segment.scale]} castShadow receiveShadow>
              <dodecahedronGeometry args={[1, 1]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#586b68' : '#3e5655'} emissive="#244d50" emissiveIntensity={0.24} roughness={0.82} metalness={0.16} />
            </mesh>
          ))}
          <group ref={blades}>
            {segments.slice(1, 7).flatMap((segment, index) => [-1, 1].map((side) => (
              <group key={`${index}-${side}`} position={[side * 2.1, segment.y, segment.z]} rotation={[0, 0, side * 0.18]}>
                <mesh scale={[0.18, 1.25, 1.25]}>
                  <octahedronGeometry args={[1, 0]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#8fc6c4" emissive="#4d9b9b" emissiveIntensity={0.48} roughness={0.14} metalness={0.22} transmission={0.32} opacity={0.82} />
                </mesh>
              </group>
            )))}
          </group>
          {segments.slice(0, 7).flatMap((segment, index) => [-1, 1].map((side) => (
            <mesh key={`fin-${index}-${side}`} position={[side * 1.65, -0.25, segment.z + 0.25]} rotation={[0, 0, side * 0.62]} scale={[1.2, 0.16, 0.72]}>
              <coneGeometry args={[1, 2.1, 5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#739c96" emissive="#3a7776" emissiveIntensity={0.3} roughness={0.46} />
            </mesh>
          )))}
          <mesh position={[0, 0.1, 4.75]} scale={[1.3, 0.65, 1.55]}>
            <dodecahedronGeometry args={[1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#36504f" emissive="#245f61" emissiveIntensity={0.38} roughness={0.7} />
          </mesh>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <Line points={segments.map((segment) => [segment.x, segment.y, segment.z] as [number, number, number])} color="#a1b6ae" lineWidth={3} transparent opacity={0.7} />
          {segments.map((segment, index) => (
            <mesh key={index} position={[segment.x, segment.y, segment.z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.22 * segment.scale, 0.1, 8, 30, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8ea29b" roughness={0.48} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={processCore} position={[0, 0, 0]} scale={[1.05, 0.78, 1.55]}>
            <capsuleGeometry args={[0.72, 2.5, 8, 18]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#67a797" emissive="#3c8e82" emissiveIntensity={0.95} roughness={0.22} transmission={0.2} opacity={0.84} />
          </mesh>
          {segments.slice(1, 7).map((segment, index) => (
            <mesh key={index} position={[segment.x, segment.y, segment.z]} scale={[0.48, 0.38, 0.62]}>
              <sphereGeometry args={[1, 20, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a6c6a5" emissive="#63a474" emissiveIntensity={0.5} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          <Line points={surfScar} color="#76c4c0" lineWidth={2.4} transparent opacity={0.52} />
          {Array.from({ length: 6 }, (_, spiral) => (
            <Line
              key={spiral}
              points={Array.from({ length: 36 }, (_, index) => {
                const t = index / 35;
                const angle = t * Math.PI * 5;
                const radius = t * (1.2 + spiral * 0.18);
                return [Math.cos(angle) * radius + (spiral - 2.5) * 1.4, -2.12, Math.sin(angle) * radius + 6.2] as [number, number, number];
              })}
              color={spiral % 2 ? '#b8e4df' : '#73bdbd'}
              lineWidth={1.2}
              transparent
              opacity={0.46}
            />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

class GlacierthroatCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

    getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 2.15) * 0.85,
      Math.sin(t * Math.PI * 3.1) * 0.42,
      (t - 0.5) * 10.8,
    );
  }
}

export function CryofluidEngineModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const sails = useRef<THREE.Group>(null);
  const throat = useRef<THREE.Mesh>(null);
  const sheets = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new GlacierthroatCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 128, 0.78, 14, false), [curve]);
  const cartilageGeometry = useMemo(() => new THREE.TubeGeometry(curve, 112, 0.18, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 10 }, (_, index) => curve.getPoint((index + 0.5) / 10)), [curve]);
  const front = useMemo(() => curve.getPoint(1), [curve]);
  const slush = useMemo(() => {
    const positions = new Float32Array(180 * 3);
    for (let index = 0; index < 180; index += 1) {
      const t = (index % 60) / 59;
      positions[index * 3] = Math.sin(index * 1.8) * (0.35 + t * 2.1);
      positions[index * 3 + 1] = Math.cos(index * 1.4) * (0.25 + t * 1.4);
      positions[index * 3 + 2] = front.z + 0.8 + t * 7.2;
    }
    return positions;
  }, [front.z]);

  useFrame(() => {
    const t = elapsed.current;
    const flash = props.animation.name === 'Cryofluid Freezing Flash';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.42) * 0.26;
      root.current.rotation.z = Math.sin(t * 0.55) * 0.08;
      root.current.position.y = Math.sin(t * 0.72) * 0.2;
    }
    if (sails.current) {
      sails.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * (0.14 + Math.sin(t * 1.3 + index * 0.5) * 0.07);
      });
    }
    if (throat.current) {
      const pulse = 1 + Math.sin(t * (flash ? 5.2 : 1.8)) * (flash ? 0.2 : 0.06);
      throat.current.scale.set(1.0 * pulse, 0.9 * pulse, 1.25 * pulse);
    }
    if (sheets.current) {
      const expansion = flash ? 1 + Math.max(0, Math.sin(t * 2.6)) * 0.45 : 1;
      sheets.current.scale.setScalar(expansion);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#b7dbe9" emissive="#4f94b4" emissiveIntensity={0.48} roughness={0.16} transmission={0.48} opacity={0.78} />
          </mesh>
          <group ref={sails}>
            {stations.slice(1, 9).flatMap((point, index) => [-1, 1].map((side) => (
              <mesh key={`${index}-${side}`} position={[point.x + side * 0.85, point.y + 0.15, point.z]} rotation={[0.05, 0, side * 0.18]} scale={[side * (1.55 + (index % 3) * 0.22), 0.12, 1.1]}>
                <coneGeometry args={[1, 2.8, 5]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#eef6f8" emissive="#a9d8e8" emissiveIntensity={0.38} roughness={0.12} transmission={0.52} opacity={0.76} />
              </mesh>
            )))}
          </group>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y + 0.82, point.z]} scale={[0.3, 0.65 + (index % 3) * 0.12, 0.3]}>
              <octahedronGeometry args={[1, 0]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d9f0f7" emissive="#7bc4dd" emissiveIntensity={0.42} roughness={0.1} transmission={0.5} opacity={0.84} />
            </mesh>
          ))}
          <mesh ref={throat} position={[front.x, front.y, front.z + 0.25]} scale={[1.0, 0.9, 1.25]}>
            <sphereGeometry args={[1, 32, 22]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e9fbff" emissive="#9de9ff" emissiveIntensity={1.7} roughness={0.08} transmission={0.36} opacity={0.88} />
          </mesh>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={cartilageGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d8edf2" metalness={0.18} roughness={0.34} wireframe />
          </mesh>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.88, 0.08, 8, 28, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#b2d3de" roughness={0.38} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          {stations.slice(2, 8).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.5, 0.42, 0.68]}>
              <sphereGeometry args={[1, 20, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8dd5e8" emissive="#4dbbdc" emissiveIntensity={0.8} roughness={0.16} opacity={0.78} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0]}>
            <icosahedronGeometry args={[1.05, 2]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d7f5fb" emissive="#72d5ef" emissiveIntensity={1.2} roughness={0.12} transmission={0.3} opacity={0.84} />
          </mesh>
        </group>
      )}
      {props.layers.functional && (
        <group>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[slush, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#d8f7ff" size={0.11} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.72} clippingPlanes={clippingPlanes} />
          </points>
          <group ref={sheets} position={[0, 0, front.z + 3.4]}>
            {[0, 1, 2, 3].map((index) => (
              <mesh key={index} position={[0, -0.55 * index, index * 1.05]} rotation={[Math.PI / 2, index * 0.22, 0]} scale={[2.1 + index * 0.7, 1.35 + index * 0.45, 1]}>
                <ringGeometry args={[0.72, 1, 64]} />
                <meshBasicMaterial color={props.silhouette ? '#000000' : '#bcecff'} transparent opacity={0.35 - index * 0.06} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
              </mesh>
            ))}
          </group>
          <Line points={[[0, 0, front.z], [0, 0, front.z + 8.2]]} color="#d5f7ff" lineWidth={1.5} transparent opacity={0.5} />
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
