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

export function HymnlockModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const bellRibs = useRef<THREE.Group>(null);
  const bars = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const chainAnchors = useMemo(() => [
    [-4.8, 4.4, -2.2], [4.8, 4.4, -2.2], [-4.3, -3.8, 2.4], [4.3, -3.8, 2.4],
  ] as Array<[number, number, number]>, []);

  useFrame(() => {
    const t = elapsed.current;
    const resonate = props.animation.name === 'Bell-Rib Choral Resonate';
    if (root.current) {
      root.current.position.y = 0.45 + Math.sin(t * 0.72) * 0.24;
      root.current.rotation.y = Math.sin(t * 0.24) * 0.12;
    }
    if (bellRibs.current) {
      bellRibs.current.children.forEach((child, index) => {
        child.rotation.z = Math.sin(t * (resonate ? 3.4 : 1.2) + index * 0.55) * (resonate ? 0.13 : 0.04);
      });
    }
    if (bars.current) {
      bars.current.children.forEach((child, index) => {
        const pulse = 1 + Math.sin(t * (resonate ? 5.0 : 1.8) + index * 0.75) * (resonate ? 0.22 : 0.06);
        child.scale.y = pulse;
      });
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * (resonate ? 4.4 : 1.6)) * (resonate ? 0.16 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.5, -0.45]} scale={[1.7, 2.65, 1.2]} castShadow receiveShadow>
            <capsuleGeometry args={[0.9, 3.1, 10, 20]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#39333d" emissive="#62506d" emissiveIntensity={0.28} roughness={0.62} metalness={0.22} />
          </mesh>
          <group ref={bellRibs} position={[0, 0.65, 0.65]}>
            {[-1.8, -1.15, -0.5, 0.15, 0.8, 1.45].map((y, index) => (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1 + index * 0.04, 1, 1]}>
                <torusGeometry args={[1.55, 0.18, 10, 42, Math.PI * 1.45]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#b8a5c2" emissive="#8c64a1" emissiveIntensity={0.52} roughness={0.16} transmission={0.2} opacity={0.88} />
              </mesh>
            ))}
          </group>
          <group ref={bars} position={[0, 0.55, 1.05]}>
            {[-0.95, -0.55, -0.15, 0.25, 0.65, 1.05].map((x, index) => (
              <mesh key={x} position={[x, -0.2 + (index % 2) * 0.25, 0]} scale={[0.12, 1, 0.12]}>
                <cylinderGeometry args={[1, 1, 2.8 - index * 0.16, 10]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#e0c988" emissive="#d49d39" emissiveIntensity={0.82} roughness={0.2} metalness={0.44} />
              </mesh>
            ))}
          </group>
          {chainAnchors.map((anchor, index) => (
            <group key={index}>
              <Line points={[[index % 2 ? 1.1 : -1.1, index < 2 ? 2.2 : -1.4, 0], anchor]} color="#a885c0" lineWidth={2} transparent opacity={0.72} />
              <mesh position={anchor}>
                <octahedronGeometry args={[0.34, 0]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#bba4ca" emissive="#8e5eaa" emissiveIntensity={0.74} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.35, -0.3]}>
            <cylinderGeometry args={[0.28, 0.42, 6.3, 12]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8c8290" roughness={0.38} metalness={0.34} wireframe />
          </mesh>
          {[-1.8, -0.8, 0.2, 1.2, 2.2].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, index * 0.22, 0]}>
              <torusGeometry args={[1.25 + index * 0.08, 0.08, 8, 34, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9c8ca3" roughness={0.38} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} position={[0, 0.4, 0]}>
            <icosahedronGeometry args={[1.05, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#a276b5" emissive="#c06adb" emissiveIntensity={1.25} roughness={0.12} transmission={0.2} opacity={0.9} />
          </mesh>
          {[1.45, 1.9, 2.35].map((radius, index) => (
            <mesh key={radius} position={[0, 0.4, 0]} rotation={[index * 0.8, index * 0.5, index * 0.9]}>
              <torusGeometry args={[radius, 0.06, 8, 52]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#b59ac1" emissive="#8c579f" emissiveIntensity={0.46} roughness={0.22} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[3.1, 4.5, 5.9].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, 0, 0]} position={[0, -2.3, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#9d70b1'} transparent opacity={0.36 - index * 0.08} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-4, -2, 0, 2, 4].map((x, index) => (
            <Line key={x} points={[[x, -4.5, -5], [x * 0.35, 0, 0], [x, 4.5, 5]]} color={index % 2 ? '#c89cda' : '#8e5aa4'} lineWidth={1.2} transparent opacity={0.44} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

class MemorialCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 2.4) * 0.62,
      Math.sin(t * Math.PI * 3.4) * 0.26,
      (t - 0.5) * 9.8,
    );
  }
}

export function MemorialveinModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const reliquaries = useRef<THREE.Group>(null);
  const elegy = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new MemorialCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.64, 14, false), [curve]);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 100, 0.14, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 9 }, (_, index) => curve.getPoint((index + 0.5) / 9)), [curve]);
  const veinPaths = useMemo(() => Array.from({ length: 6 }, (_, path) => Array.from({ length: 64 }, (_, index) => {
    const t = index / 63;
    const point = curve.getPoint(t);
    const angle = t * Math.PI * (5 + path * 0.35) + path;
    return [point.x + Math.cos(angle) * 0.69, point.y + Math.sin(angle) * 0.5, point.z] as [number, number, number];
  })), [curve]);
  const tailPaths = useMemo(() => Array.from({ length: 5 }, (_, line) => Array.from({ length: 58 }, (_, index) => {
    const t = index / 57;
    return [-1.3 + line * 0.65 + Math.sin(t * Math.PI * 4 + line) * 0.2, -1.2, -5.2 - t * 5.5] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const bloom = props.animation.name === 'Reliquary Face Bloom';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.58) * 0.18;
      root.current.rotation.y = Math.sin(t * 0.3) * 0.2;
      root.current.rotation.z = Math.sin(t * 0.46) * 0.06;
    }
    if (reliquaries.current) {
      reliquaries.current.children.forEach((child, index) => {
        const pulse = 1 + Math.sin(t * (bloom ? 3.8 : 1.4) + index * 0.75) * (bloom ? 0.18 : 0.06);
        child.scale.setScalar(pulse);
      });
    }
    if (elegy.current) elegy.current.rotation.y = Math.sin(t * 0.25) * 0.12;
    if (core.current) {
      const pulse = 1 + Math.sin(t * 1.8) * 0.06;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#b64b5f" emissive="#8f203c" emissiveIntensity={0.52} roughness={0.16} transmission={0.46} opacity={0.68} />
          </mesh>
          {veinPaths.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#ff899b' : '#7b1635'} lineWidth={1.5} transparent opacity={0.72} />
          ))}
          <group ref={reliquaries}>
            {stations.slice(1, 8).map((point, index) => (
              <group key={index} position={[point.x, point.y - 0.72, point.z]}>
                <mesh scale={[0.58 + (index % 2) * 0.1, 0.76, 0.58]}>
                  <sphereGeometry args={[1, 24, 16]} />
                  <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d16a78" emissive="#b23450" emissiveIntensity={0.72} roughness={0.12} transmission={0.5} opacity={0.62} />
                </mesh>
                <mesh position={[0, 0, 0.5]} scale={[0.32, 0.42, 0.06]}>
                  <sphereGeometry args={[1, 18, 12]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#f0c7ba" emissive="#b96f73" emissiveIntensity={0.4} roughness={0.34} opacity={0.74} />
                </mesh>
                {[-0.11, 0.11].map((x) => (
                  <mesh key={x} position={[x, 0.08, 0.56]}>
                    <sphereGeometry args={[0.035, 10, 8]} />
                    <meshBasicMaterial color={props.silhouette ? '#000000' : '#4f1d2b'} clippingPlanes={clippingPlanes} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
          <group ref={elegy}>
            {tailPaths.map((points, index) => (
              <Line key={index} points={points} color={index % 2 ? '#e2788a' : '#9f3151'} lineWidth={1.35} transparent opacity={0.58} />
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#88616b" metalness={0.26} roughness={0.4} wireframe />
          </mesh>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, index * 0.28, 0]}>
              <torusGeometry args={[0.82, 0.07, 8, 30, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9c747c" roughness={0.4} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.05, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#6f1833" emissive="#c93e5b" emissiveIntensity={1.15} roughness={0.12} transmission={0.16} opacity={0.9} />
          </mesh>
          {stations.slice(2, 7).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.34, 0.3, 0.48]}>
              <sphereGeometry args={[1, 18, 12]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7e3348" emissive="#a93652" emissiveIntensity={0.56} roughness={0.24} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[3.0, 4.4, 5.8].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.34, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#a63b58'} transparent opacity={0.32 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-4, -2, 0, 2, 4].map((x, index) => (
            <Line key={x} points={[[x, -3.8, -6], [x * 0.35, 0, 0], [x, 3.8, 6]]} color={index % 2 ? '#d56479' : '#7d2945'} lineWidth={1.15} transparent opacity={0.42} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function ShrinehungerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const relics = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const dustPositions = useMemo(() => {
    const positions = new Float32Array(260 * 3);
    for (let index = 0; index < 260; index += 1) {
      const angle = index * 2.399963;
      const radius = 2.0 + (index % 24) * 0.13;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = -2.4 + (index % 45) * 0.11;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);
  const routeLines = useMemo(() => Array.from({ length: 8 }, (_, route) => {
    const angle = (route / 8) * Math.PI * 2;
    return [[Math.cos(angle) * 8, -2.6, Math.sin(angle) * 8], [Math.cos(angle) * 3.2, -2.4, Math.sin(angle) * 3.2], [0, -2.2, 0]] as Array<[number, number, number]>;
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    const stride = props.animation.name.includes('Way') || props.animation.name.includes('Procession');
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.54) * 0.12;
      root.current.rotation.y = Math.sin(t * 0.24) * 0.1;
    }
    if (legs.current) {
      legs.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * (0.18 + Math.sin(t * (stride ? 2.2 : 1.0) + index) * 0.12);
      });
    }
    if (relics.current) relics.current.rotation.y = t * 0.1;
    if (dust.current) dust.current.rotation.y = -t * 0.05;
    if (core.current) {
      const pulse = 1 + Math.sin(t * 1.7) * 0.05;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.25, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.2, -0.4]} scale={[1.3, 1.25, 2.65]} castShadow receiveShadow>
            <capsuleGeometry args={[0.75, 3.1, 10, 20]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#3a3030" emissive="#5d3e35" emissiveIntensity={0.24} roughness={0.78} metalness={0.12} />
          </mesh>
          <group position={[0, 1.45, 2.4]}>
            <mesh scale={[1.35, 1.7, 0.7]}>
              <boxGeometry args={[1.6, 2.2, 0.8]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8b7a68" emissive="#9d7246" emissiveIntensity={0.28} roughness={0.58} metalness={0.22} />
            </mesh>
            <mesh position={[0, -0.1, 0.48]} scale={[0.72, 1.15, 0.2]}>
              <boxGeometry args={[1.2, 1.7, 0.4]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#171215'} transparent opacity={0.92} clippingPlanes={clippingPlanes} />
            </mesh>
            <mesh position={[0, 1.55, 0]} rotation={[0, 0, Math.PI / 4]} scale={[0.8, 0.8, 0.45]}>
              <boxGeometry args={[1, 1, 1]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a28b6e" emissive="#b47d3e" emissiveIntensity={0.32} roughness={0.5} metalness={0.24} />
            </mesh>
          </group>
          <group ref={legs}>
            {[-1, 1].flatMap((side) => [-2.2, -0.8, 0.8, 2.2].map((z, index) => (
              <group key={`${side}-${z}`} position={[side * 1.25, -1.2, z - 0.4]}>
                <mesh rotation={[0, 0, side * 0.28]}>
                  <cylinderGeometry args={[0.16, 0.26, 2.8, 8]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4b4140" emissive="#63473c" emissiveIntensity={0.18} roughness={0.68} metalness={0.18} />
                </mesh>
                <mesh position={[side * 0.48, -1.25, 0]} rotation={[0, 0, side * 0.8]}>
                  <cylinderGeometry args={[0.1, 0.16, 1.6 + index * 0.08, 7]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#403838" roughness={0.7} metalness={0.16} />
                </mesh>
              </group>
            )))}
          </group>
          {[-1, 1].flatMap((side) => [0, 1, 2].map((tier) => (
            <mesh key={`${side}-${tier}`} position={[side * (1.55 + tier * 0.3), 1.0 - tier * 0.75, -0.8 - tier * 0.6]} rotation={[0, side * 0.18, side * 0.2]} scale={[1.2 + tier * 0.25, 0.08, 1.7 + tier * 0.2]}>
              <coneGeometry args={[1, 2.6, 5]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color={tier % 2 ? '#6d4452' : '#aa7654'} emissive={tier % 2 ? '#63304a' : '#8d5632'} emissiveIntensity={0.25} roughness={0.32} transmission={0.06} opacity={0.72} />
            </mesh>
          )))}
          <group ref={relics}>
            {Array.from({ length: 12 }, (_, index) => {
              const angle = (index / 12) * Math.PI * 2;
              const radius = 2.4 + (index % 3) * 0.35;
              return (
                <group key={index} position={[Math.cos(angle) * radius, 0.7 + Math.sin(angle * 2) * 1.4, Math.sin(angle) * radius]}>
                  <Line points={[[0, 0.8, 0], [0, 0, 0]]} color="#b88d63" lineWidth={1.3} transparent opacity={0.62} />
                  <mesh>
                    <octahedronGeometry args={[0.25 + (index % 2) * 0.08, 0]} />
                    <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#c19b6f" emissive="#b16d35" emissiveIntensity={0.52} roughness={0.3} metalness={0.3} />
                  </mesh>
                </group>
              );
            })}
          </group>
          <points ref={dust}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#d5aa6d" size={0.1} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.62} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0, -0.4]}>
            <boxGeometry args={[1.5, 2.2, 5.4]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#80736d" roughness={0.44} metalness={0.24} wireframe />
          </mesh>
          {[-2, -1, 0, 1, 2].map((z, index) => (
            <mesh key={z} position={[0, 0, z - 0.4]} rotation={[Math.PI / 2, index * 0.28, 0]}>
              <torusGeometry args={[1.1, 0.075, 8, 30, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8b7c75" roughness={0.42} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} position={[0, 0.2, -0.3]}>
            <dodecahedronGeometry args={[1.0, 2]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#6d3e35" emissive="#b87539" emissiveIntensity={1.0} roughness={0.16} transmission={0.1} opacity={0.9} />
          </mesh>
          {[-1.3, 1.3].map((z) => (
            <mesh key={z} position={[0, 0, z]} scale={[0.52, 0.42, 0.68]}>
              <sphereGeometry args={[1, 18, 12]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#785044" emissive="#9f633c" emissiveIntensity={0.48} roughness={0.26} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {routeLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#d4a667' : '#9e7042'} lineWidth={1.4} transparent opacity={0.5} />
          ))}
          {[1.2, 2.2, 3.2, 4.2, 5.2].map((radius, index) => (
            <mesh key={radius} position={[0, -2.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius, radius + 0.08, 64]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#b8864d'} transparent opacity={0.34 - index * 0.045} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
