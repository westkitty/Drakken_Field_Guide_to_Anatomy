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
  roughness = 0.5,
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

class SolnexusCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * Math.PI * 2;
    const radius = 3.35 + Math.sin(angle * 3) * 0.38;
    return target.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 2) * 1.15,
      Math.sin(angle) * radius,
    );
  }
}

export function StarbinderCoreModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const serpent = useRef<THREE.Group>(null);
  const gravityCoils = useRef<THREE.Group>(null);
  const star = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new SolnexusCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 160, 0.52, 14, true), [curve]);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 136, 0.13, 8, true), [curve]);
  const stations = useMemo(() => Array.from({ length: 16 }, (_, index) => curve.getPoint(index / 16)), [curve]);
  const cords = useMemo(() => Array.from({ length: 5 }, (_, cord) => Array.from({ length: 72 }, (_, index) => {
    const t = index / 71;
    const angle = t * Math.PI * 2 + cord * 1.2;
    const radius = 4.1 + cord * 0.18;
    return [Math.cos(angle) * radius, Math.sin(angle * 3 + cord) * 0.7, Math.sin(angle) * radius] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const sweep = props.animation.name === 'Starbinder Energy Sweep';
    if (root.current) root.current.rotation.y = t * 0.05;
    if (serpent.current) serpent.current.rotation.y = t * (sweep ? 0.2 : 0.08);
    if (gravityCoils.current) {
      gravityCoils.current.rotation.x = t * 0.12;
      gravityCoils.current.rotation.z = -t * 0.09;
    }
    if (star.current) {
      const pulse = 1 + Math.sin(t * (sweep ? 4.0 : 1.7)) * (sweep ? 0.13 : 0.05);
      star.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group ref={serpent}>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#e7d3a1" emissive="#d79a31" emissiveIntensity={1.0} roughness={0.16} metalness={0.22} transmission={0.22} opacity={0.9} />
          </mesh>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[0, index * 0.45, index * 0.18]} scale={[0.22, 0.95 + (index % 3) * 0.18, 0.22]}>
              <octahedronGeometry args={[1, 0]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#f5e6bd" emissive="#e8b856" emissiveIntensity={0.9} roughness={0.16} metalness={0.3} />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 3.1, 0.25, 0]} rotation={[0, side * 0.35, side * 0.25]}>
              {[0, 1, 2].map((tier) => (
                <mesh key={tier} position={[side * tier * 0.65, tier * 0.45, tier * 0.2]} scale={[1.8 - tier * 0.2, 0.13, 1.15]}>
                  <coneGeometry args={[1, 2.8, 5]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#f4ecdb" emissive="#dfbd69" emissiveIntensity={0.55} roughness={0.12} transmission={0.48} opacity={0.72} />
                </mesh>
              ))}
            </group>
          ))}
          {cords.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#b9975b' : '#f4d98a'} lineWidth={1.6} transparent opacity={0.58} />
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8f7750" metalness={0.55} roughness={0.3} wireframe />
          </mesh>
          <group ref={gravityCoils}>
            {[1.9, 2.5, 3.1].map((radius, index) => (
              <mesh key={radius} rotation={[index * 0.7, index * 0.42, index * 0.55]}>
                <torusGeometry args={[radius, 0.1, 8, 64]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d6bd7b" emissive="#b37a2c" emissiveIntensity={0.62} roughness={0.24} wireframe />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={star}>
            <icosahedronGeometry args={[1.55, 4]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#fff2b5" emissive="#ffb42c" emissiveIntensity={2.2} roughness={0.08} transmission={0.12} opacity={0.96} />
          </mesh>
          {[0, 1, 2, 3].map((index) => (
            <mesh key={index} rotation={[index * 0.63, index * 0.42, index * 0.8]}>
              <torusGeometry args={[1.9 + index * 0.34, 0.07, 8, 54]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#f0c961" emissive="#d28d25" emissiveIntensity={0.8} roughness={0.16} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[5.0, 6.4, 7.8].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.4, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 112]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#e6bd5c'} transparent opacity={0.34 - index * 0.07} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <Line key={side} points={[[side * 7, 0, -5], [side * 4.2, 0, 0], [side * 7, 0, 5]]} color="#f2d47d" lineWidth={1.4} transparent opacity={0.46} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

class NullthornCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 5.2) * 0.72,
      Math.cos(t * Math.PI * 4.1) * 0.42,
      (t - 0.5) * 11.5,
    );
  }
}

export function GravityImpalerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const ribs = useRef<THREE.Group>(null);
  const singularity = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new NullthornCurve(), []);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 128, 0.18, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 13 }, (_, index) => curve.getPoint((index + 0.5) / 13)), [curve]);
  const tail = useMemo(() => curve.getPoint(0), [curve]);
  const tears = useMemo(() => Array.from({ length: 7 }, (_, line) => Array.from({ length: 48 }, (_, index) => {
    const t = index / 47;
    return [Math.sin(t * Math.PI * 4 + line) * (0.5 + line * 0.16), -4 + line * 1.3, tail.z - 1.5 - t * 5] as [number, number, number];
  })), [tail.z]);

  useFrame(() => {
    const t = elapsed.current;
    const surge = props.animation.name === 'Gravity Well Surge';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.34) * 0.24;
      root.current.position.y = Math.sin(t * 0.55) * 0.15;
    }
    if (ribs.current) {
      ribs.current.children.forEach((child, index) => {
        child.rotation.z = t * (index % 2 ? -0.36 : 0.36);
      });
    }
    if (singularity.current) {
      const pulse = 1 + Math.sin(t * (surge ? 5.0 : 1.8)) * (surge ? 0.18 : 0.05);
      singularity.current.scale.setScalar(pulse);
      singularity.current.rotation.y = -t * 0.42;
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          {stations.map((point, index) => (
            <group key={index} position={[point.x, point.y, point.z]}>
              <mesh scale={[0.72 + (index % 3) * 0.12, 0.46, 0.9]} rotation={[index * 0.18, index * 0.35, 0]}>
                <dodecahedronGeometry args={[1, 0]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#24252a" emissive="#1b1b25" emissiveIntensity={0.25} roughness={0.72} metalness={0.42} />
              </mesh>
              <mesh position={[0, 0.78, 0]} rotation={[0, index * 0.4, 0]} scale={[0.2, 0.82, 0.2]}>
                <coneGeometry args={[1, 1.8, 5]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4b4d58" emissive="#252631" emissiveIntensity={0.28} roughness={0.46} metalness={0.55} />
              </mesh>
            </group>
          ))}
          <group ref={singularity} position={[tail.x, tail.y, tail.z - 0.8]}>
            <mesh>
              <sphereGeometry args={[1.0, 32, 22]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.98} clippingPlanes={clippingPlanes} />
            </mesh>
            {[1.4, 1.9, 2.4].map((radius, index) => (
              <mesh key={radius} rotation={[index * 0.8, index * 0.55, index * 0.9]}>
                <torusGeometry args={[radius, 0.08, 8, 56]} />
                <meshBasicMaterial color={props.silhouette ? '#000000' : '#574b74'} transparent opacity={0.5 - index * 0.1} clippingPlanes={clippingPlanes} />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#797b88" metalness={0.62} roughness={0.32} wireframe />
          </mesh>
          <group ref={ribs}>
            {stations.slice(1, 12).map((point, index) => (
              <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, index * 0.3, 0]}>
                <torusGeometry args={[0.9 + (index % 2) * 0.16, 0.09, 8, 30, Math.PI * 1.45]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8b8d99" roughness={0.4} metalness={0.48} wireframe />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.internal && (
        <group>
          {stations.slice(2, 11).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.36 + (index % 2) * 0.1, 0.36, 0.36]}>
              <sphereGeometry args={[1, 22, 16]} />
              <meshBasicMaterial color="#010103" transparent opacity={0.96} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          <mesh position={[0, 0, 1.2]}>
            <icosahedronGeometry args={[0.9, 2]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#292139" emissive="#57407c" emissiveIntensity={0.65} roughness={0.22} />
          </mesh>
        </group>
      )}
      {props.layers.functional && (
        <group>
          {tears.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#4e4566' : '#82729e'} lineWidth={1.3} transparent opacity={0.48} />
          ))}
          {[3.4, 4.8, 6.2].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.72, index * 0.45, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#544769'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

class LyriborisCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 2.4) * 0.82,
      Math.sin(t * Math.PI * 3.7) * 0.38,
      (t - 0.5) * 10.7,
    );
  }
}

export function DeepsongCarrierModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const ridges = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);
  const transmitter = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new LyriborisCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 132, 0.5, 12, false), [curve]);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 112, 0.13, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 14 }, (_, index) => curve.getPoint((index + 0.5) / 14)), [curve]);
  const dustPositions = useMemo(() => {
    const positions = new Float32Array(260 * 3);
    for (let index = 0; index < 260; index += 1) {
      const t = (index % 130) / 129;
      const point = curve.getPoint(t);
      const angle = index * 1.93;
      const radius = 0.7 + (index % 12) * 0.09;
      positions[index * 3] = point.x + Math.cos(angle) * radius;
      positions[index * 3 + 1] = point.y + Math.sin(angle * 1.2) * radius;
      positions[index * 3 + 2] = point.z + Math.sin(angle) * radius;
    }
    return positions;
  }, [curve]);
  const waves = useMemo(() => Array.from({ length: 6 }, (_, wave) => Array.from({ length: 72 }, (_, index) => {
    const t = index / 71;
    const angle = t * Math.PI * 2;
    const radius = 2.5 + wave * 0.7;
    return [Math.cos(angle) * radius, Math.sin(angle * 3 + wave) * 0.35, 4.8 + Math.sin(angle) * radius] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const broadcast = props.animation.name === 'Deepsong Broadcast Wave';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.38) * 0.26;
      root.current.rotation.z = Math.sin(t * 0.58) * 0.08;
      root.current.position.y = Math.sin(t * 0.7) * 0.18;
    }
    if (ridges.current) {
      ridges.current.children.forEach((child, index) => {
        child.scale.y = 1 + Math.sin(t * (broadcast ? 5.0 : 2.0) + index * 0.45) * (broadcast ? 0.24 : 0.08);
      });
    }
    if (dust.current) dust.current.rotation.z = -t * 0.05;
    if (transmitter.current) {
      const pulse = 1 + Math.sin(t * (broadcast ? 4.4 : 1.8)) * (broadcast ? 0.16 : 0.05);
      transmitter.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#b79fc9" emissive="#72538f" emissiveIntensity={0.58} roughness={0.2} transmission={0.28} opacity={0.82} />
          </mesh>
          <group ref={ridges}>
            {stations.map((point, index) => (
              <mesh key={index} position={[point.x, point.y + 0.58, point.z]} rotation={[0, index * 0.4, 0]} scale={[0.18, 0.82 + (index % 3) * 0.15, 0.18]}>
                <coneGeometry args={[1, 1.7, 6]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#d1bedc" emissive="#9f79b7" emissiveIntensity={0.72} roughness={0.22} />
              </mesh>
            ))}
          </group>
          {stations.slice(1, 13).map((point, index) => (
            <Line key={index} points={[[point.x, point.y, point.z], [point.x + Math.sin(index) * 1.2, point.y + 1.4 + (index % 3) * 0.25, point.z + Math.cos(index) * 0.7]]} color="#c8add8" lineWidth={2.2} transparent opacity={0.66} />
          ))}
          <points ref={dust}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#d8b9e6" size={0.1} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.66} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <mesh geometry={spineGeometry}>
          <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8f7a9b" metalness={0.28} roughness={0.38} wireframe />
        </mesh>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={transmitter} position={[0, 0, 1.1]}>
            <icosahedronGeometry args={[1.0, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d7c1e3" emissive="#9d68bb" emissiveIntensity={1.15} roughness={0.16} transmission={0.24} opacity={0.86} />
          </mesh>
          {stations.slice(3, 10).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.38, 0.3, 0.52]}>
              <sphereGeometry args={[1, 18, 12]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8f6ea2" emissive="#72418f" emissiveIntensity={0.62} roughness={0.22} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {waves.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#d0afe0' : '#9c77b3'} lineWidth={1.2} transparent opacity={0.46 - index * 0.04} />
          ))}
          {[3.2, 4.7, 6.2].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.34, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#9c6fb4'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function RadiantScaffoldModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const lattice = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const nodes = useMemo(() => Array.from({ length: 9 }, (_, index) => ({
    z: -4.8 + index * 1.2,
    x: Math.sin(index * 0.7) * 0.32,
    y: Math.cos(index * 0.7) * 0.18,
  })), []);
  const scaffoldLines = useMemo(() => nodes.flatMap((node, index) => {
    if (index === nodes.length - 1) return [];
    const next = nodes[index + 1];
    return [
      [[node.x - 1.2, node.y - 0.9, node.z], [next.x - 1.2, next.y - 0.9, next.z]],
      [[node.x + 1.2, node.y - 0.9, node.z], [next.x + 1.2, next.y - 0.9, next.z]],
      [[node.x - 1.2, node.y + 0.9, node.z], [next.x + 1.2, next.y + 0.9, next.z]],
      [[node.x + 1.2, node.y + 0.9, node.z], [next.x - 1.2, next.y + 0.9, next.z]],
    ] as Array<Array<[number, number, number]>>;
  }), [nodes]);

  useFrame(() => {
    const t = elapsed.current;
    const extend = props.animation.name === 'Hardlight Scaffold Extend';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.32) * 0.2;
      root.current.position.y = Math.sin(t * 0.58) * 0.14;
    }
    if (lattice.current) {
      const stretch = extend ? 1 + Math.max(0, Math.sin(t * 1.8)) * 0.24 : 1;
      lattice.current.scale.z = stretch;
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * 2.0) * 0.06;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          {nodes.map((node, index) => (
            <group key={index} position={[node.x, node.y, node.z]}>
              <mesh scale={[1.25, 0.72, 0.82]}>
                <octahedronGeometry args={[1, 0]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#f2e9c7" emissive="#e5bd4f" emissiveIntensity={0.75} roughness={0.1} transmission={0.42} opacity={0.78} />
              </mesh>
              {[-1, 1].map((side) => (
                <mesh key={side} position={[side * 1.5, 0, 0]} rotation={[0, 0, side * 0.35]} scale={[0.9, 0.12, 0.75]}>
                  <coneGeometry args={[1, 2.0, 5]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#fff5d9" emissive="#e9c75b" emissiveIntensity={0.62} roughness={0.08} transmission={0.5} opacity={0.68} />
                </mesh>
              ))}
            </group>
          ))}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 2.0, 0.7, 4.7]}>
              {[0, 1, 2].map((tier) => (
                <mesh key={tier} position={[side * tier * 0.45, tier * 0.35, tier * 0.15]} rotation={[0, side * 0.2, side * 0.28]} scale={[1.4 - tier * 0.18, 0.1, 0.9]}>
                  <coneGeometry args={[1, 2.4, 5]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#fff9e8" emissive="#efce69" emissiveIntensity={0.65} roughness={0.08} transmission={0.52} opacity={0.7} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group ref={lattice}>
          {scaffoldLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#f1ce6f' : '#fff2b0'} lineWidth={2.0} transparent opacity={0.72} />
          ))}
          {nodes.map((node, index) => (
            <mesh key={index} position={[node.x, node.y, node.z]} rotation={[Math.PI / 2, index * 0.3, 0]}>
              <torusGeometry args={[1.35, 0.08, 8, 36]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#e0bc58" emissive="#b98a27" emissiveIntensity={0.6} roughness={0.18} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.0, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#fff3b5" emissive="#f1c34b" emissiveIntensity={1.35} roughness={0.08} transmission={0.28} opacity={0.9} />
          </mesh>
          {[0, 1, 2].map((index) => (
            <mesh key={index} rotation={[index * 0.8, index * 0.52, index * 0.66]}>
              <torusGeometry args={[1.5 + index * 0.38, 0.07, 8, 54]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#f0cf75" emissive="#c6942e" emissiveIntensity={0.72} roughness={0.14} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[-5.5, -2.75, 0, 2.75, 5.5].map((x, index) => (
            <Line key={x} points={[[x, -2.4, -8], [x * 0.5, Math.sin(index) * 0.5, 0], [x, 2.4, 8]]} color={index % 2 ? '#f4d676' : '#fff0a8'} lineWidth={1.2} transparent opacity={0.44} />
          ))}
          {[3.6, 5.2, 6.8].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.35, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#e8c85f'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
