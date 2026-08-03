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
  roughness = 0.28,
  metalness = 0.05,
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

class VeilcurrentCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 2.2) * 0.72,
      Math.cos(t * Math.PI * 3.4) * 0.36,
      (t - 0.5) * 11.5,
    );
  }
}

export function NebularStreamHerderModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const sails = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new VeilcurrentCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 128, 0.56, 12, false), [curve]);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 112, 0.14, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 9 }, (_, index) => curve.getPoint((index + 0.5) / 9)), [curve]);
  const dustPositions = useMemo(() => {
    const positions = new Float32Array(420 * 3);
    for (let index = 0; index < 420; index += 1) {
      const t = (index % 140) / 139;
      const point = curve.getPoint(t);
      const angle = index * 2.399963;
      const radius = 0.9 + (index % 17) * 0.1;
      positions[index * 3] = point.x + Math.cos(angle) * radius;
      positions[index * 3 + 1] = point.y + Math.sin(angle * 1.3) * radius * 0.55;
      positions[index * 3 + 2] = point.z + Math.sin(angle) * radius;
    }
    return positions;
  }, [curve]);

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.3) * 0.26;
      root.current.rotation.z = Math.sin(t * 0.47) * 0.07;
      root.current.position.y = Math.sin(t * 0.62) * 0.2;
    }
    if (sails.current) {
      sails.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * (0.12 + Math.sin(t * 1.15 + index * 0.4) * 0.06);
      });
    }
    if (dust.current) dust.current.rotation.z = -t * 0.035;
    if (core.current) {
      const pulse = 1 + Math.sin(t * 1.7) * 0.06;
      core.current.scale.set(0.72 * pulse, 0.58 * pulse, 1.65 * pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#b9dce3" emissive="#6da9b7" emissiveIntensity={0.42} roughness={0.16} transmission={0.48} opacity={0.72} />
          </mesh>
          <group ref={sails}>
            {stations.slice(1, 8).flatMap((point, index) => [-1, 1].map((side) => (
              <mesh
                key={`${index}-${side}`}
                position={[point.x + side * 1.0, point.y, point.z]}
                rotation={[0.08, side * 0.15, side * 0.16]}
                scale={[1.5 + (index % 3) * 0.24, 0.1, 1.15]}
              >
                <coneGeometry args={[1, 2.9, 5]} />
                <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#eef5f3" emissive="#9bc8d0" emissiveIntensity={0.3} roughness={0.12} transmission={0.58} opacity={0.58} />
              </mesh>
            )))}
          </group>
          <points ref={dust}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#b8d6e8" size={0.1} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.68} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7f9ca5" metalness={0.28} roughness={0.4} wireframe />
          </mesh>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.72, 0.07, 8, 28, Math.PI * 1.5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9eb3b7" roughness={0.42} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} scale={[0.72, 0.58, 1.65]}>
            <capsuleGeometry args={[0.62, 2.4, 8, 18]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#8cd2dc" emissive="#3da8ba" emissiveIntensity={1.0} roughness={0.16} transmission={0.3} opacity={0.8} />
          </mesh>
          {stations.slice(2, 7).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.34, 0.28, 0.5]}>
              <sphereGeometry args={[1, 18, 12]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#c2e4e4" emissive="#75bbc0" emissiveIntensity={0.5} roughness={0.2} opacity={0.76} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[-4.5, -2.25, 0, 2.25, 4.5].map((x, index) => (
            <Line key={x} points={[[x, -1.6, -8], [x * 0.5, Math.sin(index) * 0.8, 0], [x, 1.6, 8]]} color={index % 2 ? '#8fc8dd' : '#c2e2eb'} lineWidth={1.2} transparent opacity={0.44} />
          ))}
          {[3.4, 5.0, 6.6].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.32, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#91c6d4'} transparent opacity={0.28 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

class CoronaxisCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 2.6) * 0.9,
      Math.sin(t * Math.PI * 4.2) * 0.52,
      (t - 0.5) * 10.8,
    );
  }
}

export function StellarPlasmaSwimmerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const coils = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new CoronaxisCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 144, 0.62, 14, false), [curve]);
  const darkSpineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 128, 0.16, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 12 }, (_, index) => curve.getPoint((index + 0.5) / 12)), [curve]);
  const filaments = useMemo(() => Array.from({ length: 7 }, (_, filament) => Array.from({ length: 80 }, (_, index) => {
    const t = index / 79;
    const point = curve.getPoint(t);
    const angle = t * Math.PI * (7 + filament * 0.35) + filament * 0.9;
    return [point.x + Math.cos(angle) * (0.78 + filament * 0.07), point.y + Math.sin(angle) * (0.62 + filament * 0.05), point.z] as [number, number, number];
  })), [curve]);

  useFrame(() => {
    const t = elapsed.current;
    const flare = props.animation.name === 'Thermonuclear Pulse Flare';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.46) * 0.3;
      root.current.rotation.z = Math.sin(t * 0.72) * 0.09;
      root.current.position.y = Math.sin(t * 0.82) * 0.22;
    }
    if (coils.current) coils.current.rotation.z = t * (flare ? 0.5 : 0.18);
    if (core.current) {
      const pulse = 1 + Math.sin(t * (flare ? 5.2 : 2.0)) * (flare ? 0.18 : 0.06);
      core.current.scale.set(0.8 * pulse, 0.7 * pulse, 1.5 * pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#fff3cf" emissive="#ff8b2f" emissiveIntensity={2.0} roughness={0.08} transmission={0.12} opacity={0.9} />
          </mesh>
          {filaments.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#fff1a8' : '#ff7a2c'} lineWidth={1.8} transparent opacity={0.62} />
          ))}
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y + 0.72, point.z]} rotation={[0, index * 0.42, 0]} scale={[0.25, 0.7 + (index % 3) * 0.12, 0.25]}>
              <octahedronGeometry args={[1, 0]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#1a1110" emissive="#5b1d16" emissiveIntensity={0.5} roughness={0.28} metalness={0.45} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={darkSpineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#2d1614" emissive="#6e2118" emissiveIntensity={0.4} metalness={0.52} roughness={0.3} wireframe />
          </mesh>
          <group ref={coils}>
            {stations.slice(1, 11).map((point, index) => (
              <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, index * 0.34, 0]}>
                <torusGeometry args={[1.0 + (index % 2) * 0.16, 0.075, 8, 36]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#ffb55b" emissive="#ff5c20" emissiveIntensity={1.0} roughness={0.16} wireframe />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} scale={[0.8, 0.7, 1.5]}>
            <icosahedronGeometry args={[1, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#fff7df" emissive="#ff9d33" emissiveIntensity={2.4} roughness={0.06} transmission={0.12} opacity={0.92} />
          </mesh>
          {stations.slice(3, 9).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.42, 0.34, 0.58]}>
              <sphereGeometry args={[1, 20, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#ffbf55" emissive="#ff6c1f" emissiveIntensity={1.4} roughness={0.12} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[2.8, 4.1, 5.4].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.62, index * 0.37, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#ff8136' : '#ffd37a'} transparent opacity={0.4 - index * 0.08} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          <Line points={[[0, 0, -8], [0, 0, 8]]} color="#fff3b0" lineWidth={2.0} transparent opacity={0.48} />
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function OrbitalExtrusionEngineModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const throat = useRef<THREE.Mesh>(null);
  const halos = useRef<THREE.Group>(null);
  const limbs = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const slurry = useMemo(() => {
    const positions = new Float32Array(220 * 3);
    for (let index = 0; index < 220; index += 1) {
      const t = index / 219;
      const angle = index * 1.7;
      positions[index * 3] = Math.cos(angle) * (0.22 + t * 0.45);
      positions[index * 3 + 1] = 4.8 + t * 8.2;
      positions[index * 3 + 2] = Math.sin(angle) * (0.22 + t * 0.45);
    }
    return positions;
  }, []);

  useFrame(() => {
    const t = elapsed.current;
    const extrude = props.animation.name === 'Orbital Ring Extrusion';
    if (root.current) root.current.rotation.y = Math.sin(t * 0.22) * 0.08;
    if (throat.current) {
      const pulse = 1 + Math.sin(t * (extrude ? 4.2 : 1.7)) * (extrude ? 0.16 : 0.05);
      throat.current.scale.set(1.65 * pulse, 2.15 * pulse, 1.65 * pulse);
    }
    if (halos.current) halos.current.rotation.y = t * (extrude ? 0.42 : 0.14);
    if (limbs.current) {
      limbs.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * 0.16 + Math.sin(t * 0.6 + index) * 0.025;
      });
    }
  });

  return (
    <group ref={root} position={[0, -1.2, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.4, 0]} scale={[2.35, 2.7, 2.35]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#322228" emissive="#5d1822" emissiveIntensity={0.42} roughness={0.68} metalness={0.28} />
          </mesh>
          <mesh position={[0, 3.25, 0]} scale={[1.42, 2.55, 1.42]}>
            <capsuleGeometry args={[1, 2.8, 12, 24]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#6f2634" emissive="#a7192c" emissiveIntensity={0.76} roughness={0.22} transmission={0.18} opacity={0.86} />
          </mesh>
          <mesh ref={throat} position={[0, 4.8, 0]} scale={[1.65, 2.15, 1.65]}>
            <sphereGeometry args={[1, 38, 24]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#7a1322" emissive="#d32134" emissiveIntensity={1.6} roughness={0.16} transmission={0.22} opacity={0.82} />
          </mesh>
          <mesh position={[0, 7.15, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[2.3, 3.2, 32, 1, true]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4b3035" emissive="#8f1d2c" emissiveIntensity={0.52} roughness={0.38} metalness={0.34} />
          </mesh>
          <group ref={limbs}>
            {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
              <group key={`${x}-${z}`} position={[x * 2.4, -1.8, z * 2.4]}>
                <mesh rotation={[z * 0.18, 0, x * 0.16]}>
                  <cylinderGeometry args={[0.48, 0.72, 4.8, 12]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#3a3032" emissive="#5d2630" emissiveIntensity={0.3} roughness={0.72} metalness={0.28} />
                </mesh>
                <mesh position={[0, -2.45, 0]} scale={[1.1, 0.42, 1.3]}>
                  <dodecahedronGeometry args={[1, 0]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#241d20" roughness={0.84} metalness={0.34} />
                </mesh>
              </group>
            )))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.28, 0.45, 9.2, 12]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8e7478" metalness={0.42} roughness={0.38} wireframe />
          </mesh>
          {[-1.2, 0.5, 2.2, 3.9, 5.6].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.65 + index * 0.08, 0.11, 8, 36]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a68a8e" roughness={0.4} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh position={[0, 2.2, 0]} scale={[1.25, 2.2, 1.25]}>
            <capsuleGeometry args={[0.75, 3.1, 10, 20]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#2b070d" emissive="#c41d30" emissiveIntensity={1.3} roughness={0.15} transmission={0.08} opacity={0.9} />
          </mesh>
          {[-1.2, 1.2].map((x) => (
            <mesh key={x} position={[x, 0.2, 0]} scale={[0.62, 1.2, 0.62]}>
              <sphereGeometry args={[1, 22, 14]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#6e2732" emissive="#a81d2d" emissiveIntensity={0.7} roughness={0.22} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          <group ref={halos} position={[0, 6.2, 0]}>
            {[2.5, 3.5, 4.5].map((radius, index) => (
              <mesh key={radius} rotation={[Math.PI / 2, index * 0.42, 0]}>
                <torusGeometry args={[radius, 0.06, 8, 96]} />
                <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#b94250' : '#e07b83'} transparent opacity={0.44 - index * 0.08} clippingPlanes={clippingPlanes} />
              </mesh>
            ))}
          </group>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[slurry, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#b51c2d" size={0.14} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.8} clippingPlanes={clippingPlanes} />
          </points>
          <Line points={[[0, 4.7, 0], [0, 13.5, 0]]} color="#d83448" lineWidth={3.2} transparent opacity={0.54} />
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
