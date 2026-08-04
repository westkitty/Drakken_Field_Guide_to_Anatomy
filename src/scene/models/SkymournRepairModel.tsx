import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { AnnotationMarkers } from '../Specimens';
import {
  clipArray,
  materialColor,
  useAnimationClock,
  type SpecimenModelProps,
} from '../SpecimenCommon';

class SkymournBodyCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const theta = t * Math.PI * 2;
    const x = 3.45 * Math.sin(theta * 2) * (1 + 0.1 * Math.cos(theta * 3));
    const y = 5.45 * Math.cos(theta) + 0.55 * Math.sin(theta * 2);
    const z = 1.25 * Math.cos(theta * 2) + 0.42 * Math.sin(theta * 4);
    return target.set(x, y, z);
  }
}

class SkymournThermalCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const theta = t * Math.PI * 2;
    return target.set(
      3.08 * Math.sin(theta * 2 + 0.32),
      5.05 * Math.cos(theta + 0.16),
      0.94 * Math.cos(theta * 2 - 0.24),
    );
  }
}

interface CrystalDetail {
  position: [number, number, number];
  quaternion: [number, number, number, number];
  scale: [number, number, number];
}

export function SkymournRepairModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const frostShell = useRef<THREE.Mesh>(null);
  const coldSeam = useRef<THREE.Mesh>(null);
  const thermalCore = useRef<THREE.Mesh>(null);
  const face = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Points>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new SkymournBodyCurve(), []);
  const thermalCurve = useMemo(() => new SkymournThermalCurve(), []);

  const shellGeometry = useMemo(() => new THREE.TubeGeometry(curve, 240, 0.62, 20, true), [curve]);
  const seamGeometry = useMemo(() => new THREE.TubeGeometry(curve, 220, 0.16, 10, true), [curve]);
  const structureGeometry = useMemo(() => new THREE.TubeGeometry(curve, 220, 0.3, 12, true), [curve]);
  const thermalGeometry = useMemo(() => new THREE.TubeGeometry(thermalCurve, 220, 0.23, 12, true), [thermalCurve]);

  const crystals = useMemo<CrystalDetail[]>(() => {
    const up = new THREE.Vector3(0, 1, 0);
    return Array.from({ length: 30 }, (_, index) => {
      const t = (index + 0.5) / 30;
      const point = curve.getPoint(t);
      const normal = new THREE.Vector3(point.x * 0.7, point.y * 0.12, point.z || 0.2).normalize();
      const position = point.clone().addScaledVector(normal, 0.72);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
      const height = 0.34 + (index % 5) * 0.055;
      return {
        position: [position.x, position.y, position.z],
        quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
        scale: [0.16, height, 0.16],
      };
    });
  }, [curve]);

  const frostCloud = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cold = new THREE.Color('#d9f3ff');
    const ember = new THREE.Color('#dc673d');
    for (let index = 0; index < count; index += 1) {
      const point = curve.getPoint(index / count);
      const spread = 0.28 + (index % 7) * 0.055;
      positions[index * 3] = point.x + Math.sin(index * 2.37) * spread;
      positions[index * 3 + 1] = point.y + Math.cos(index * 1.73) * spread;
      positions[index * 3 + 2] = point.z + Math.sin(index * 1.11) * spread;
      const color = index % 11 === 0 ? ember : cold;
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [curve]);

  const circulationRibs = useMemo(() => {
    return Array.from({ length: 9 }, (_, index) => {
      const point = curve.getPoint((index + 0.25) / 9);
      return {
        position: [point.x, point.y, point.z] as [number, number, number],
        rotation: [Math.PI / 2, index * 0.42, index * 0.2] as [number, number, number],
        scale: 0.52 + (index % 3) * 0.1,
      };
    });
  }, [curve]);

  useFrame(() => {
    const time = elapsed.current;
    const ripple = props.animation.name === 'Thermal Ripple Burst';
    if (root.current) {
      root.current.rotation.y = Math.sin(time * 0.24) * 0.1;
      root.current.rotation.z = Math.sin(time * 0.31) * (ripple ? 0.045 : 0.018);
      root.current.position.y = Math.sin(time * 0.42) * (ripple ? 0.16 : 0.07);
    }
    if (frostShell.current) {
      const scale = 1 + Math.sin(time * (ripple ? 4.2 : 1.15)) * (ripple ? 0.022 : 0.007);
      frostShell.current.scale.setScalar(scale);
    }
    if (coldSeam.current) coldSeam.current.rotation.y = Math.sin(time * 0.3) * 0.018;
    if (thermalCore.current) thermalCore.current.rotation.y = -time * 0.08;
    if (face.current) {
      face.current.position.y = 5.55 + Math.sin(time * 0.68) * 0.06;
      face.current.rotation.z = Math.sin(time * 0.45) * 0.025;
    }
    if (particles.current) particles.current.rotation.y = -time * 0.025;
  });

  const measure = (event: { stopPropagation: () => void; point: THREE.Vector3 }) => {
    if (!props.measurementMode) return;
    event.stopPropagation();
    props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
  };

  return (
    <group ref={root} rotation={[0.03, -0.08, 0]} onPointerDown={measure}>
      {props.layers.surface && (
        <group>
          <mesh ref={frostShell} geometry={shellGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={materialColor('#9fc9df', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#20465d'}
              emissiveIntensity={props.silhouette ? 0 : 0.16}
              roughness={0.38}
              metalness={0.08}
              transmission={props.silhouette ? 0 : 0.16}
              thickness={0.8}
              ior={1.2}
              clearcoat={0.24}
              clearcoatRoughness={0.48}
              transparent
              opacity={props.silhouette ? 1 : 0.95}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              clipShadows
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh ref={coldSeam} geometry={seamGeometry}>
            <meshStandardMaterial
              color={materialColor('#315f79', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#397e9d'}
              emissiveIntensity={props.silhouette ? 0 : 0.42}
              roughness={0.48}
              transparent
              opacity={props.silhouette ? 1 : 0.62}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              side={THREE.DoubleSide}
            />
          </mesh>

          <group ref={face} position={[0, 5.55, 1.82]} rotation={[-0.08, 0, 0]}>
            <mesh position={[0, -1.12, -0.22]} rotation={[Math.PI / 2, 0, 0]} scale={[1.12, 1.12, 0.58]}>
              <torusGeometry args={[0.72, 0.18, 12, 48]} />
              <meshStandardMaterial color={materialColor('#6f93a8', props.silhouette)} roughness={0.5} metalness={0.12} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
            <mesh scale={[1.16, 1.42, 0.46]} castShadow>
              <sphereGeometry args={[1, 48, 34]} />
              <meshPhysicalMaterial
                color={materialColor('#d7e4ea', props.silhouette)}
                roughness={0.48}
                metalness={0.04}
                transmission={props.silhouette ? 0 : 0.04}
                transparent
                opacity={0.98}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
            <mesh position={[0, 0, 0.43]} scale={[0.96, 1.27, 0.13]}>
              <sphereGeometry args={[1, 40, 28]} />
              <meshStandardMaterial color={materialColor('#edf4f7', props.silhouette)} roughness={0.34} metalness={0.03} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
            <Line points={[[0, 1.02, 0.55], [0, -1.02, 0.55]]} color="#5f91a8" lineWidth={1.3} transparent opacity={0.72} clippingPlanes={clippingPlanes} />
            <Line points={[[-0.58, 0.16, 0.54], [0.58, 0.16, 0.54]]} color="#7bbbd4" lineWidth={1} transparent opacity={0.46} clippingPlanes={clippingPlanes} />
          </group>

          {crystals.map((crystal, index) => (
            <mesh key={index} position={crystal.position} quaternion={crystal.quaternion} scale={crystal.scale}>
              <octahedronGeometry args={[1, 0]} />
              <meshPhysicalMaterial
                color={materialColor('#c8e7f3', props.silhouette)}
                emissive={props.silhouette ? '#000000' : '#477d94'}
                emissiveIntensity={props.silhouette ? 0 : 0.22}
                transmission={props.silhouette ? 0 : 0.12}
                transparent
                opacity={0.92}
                roughness={0.3}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}

          <points ref={particles}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[frostCloud.positions, 3]} />
              <bufferAttribute attach="attributes-color" args={[frostCloud.colors, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.085} sizeAttenuation vertexColors transparent opacity={props.silhouette ? 0 : 0.58} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}

      {props.layers.structure && (
        <group>
          <mesh geometry={structureGeometry}>
            <meshStandardMaterial color={materialColor('#46697b', props.silhouette)} metalness={0.24} roughness={0.54} wireframe={props.wireframe} clippingPlanes={clippingPlanes} side={THREE.DoubleSide} />
          </mesh>
          {circulationRibs.map((rib, index) => (
            <mesh key={index} position={rib.position} rotation={rib.rotation} scale={rib.scale}>
              <torusGeometry args={[1.02, 0.09, 8, 36, Math.PI * 1.6]} />
              <meshStandardMaterial color={materialColor('#89a9b8', props.silhouette)} metalness={0.32} roughness={0.48} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.internal && (
        <group>
          <mesh ref={thermalCore} geometry={thermalGeometry}>
            <meshStandardMaterial color={materialColor('#d95b35', props.silhouette)} emissive={props.silhouette ? '#000000' : '#b83b1c'} emissiveIntensity={1.2} roughness={0.36} wireframe={props.wireframe} clippingPlanes={clippingPlanes} side={THREE.DoubleSide} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 1.05, 1.05, 0.25]}>
              <mesh scale={[0.66, 1.08, 0.66]}>
                <sphereGeometry args={[1, 28, 20]} />
                <meshPhysicalMaterial
                  color={materialColor(side < 0 ? '#6bb9d5' : '#d8663f', props.silhouette)}
                  emissive={props.silhouette ? '#000000' : side < 0 ? '#287da0' : '#a83a1f'}
                  emissiveIntensity={0.9}
                  transmission={props.silhouette ? 0 : 0.12}
                  transparent
                  opacity={0.88}
                  roughness={0.32}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {props.layers.functional && (
        <group>
          {[2.9, 4.25, 5.7].map((radius, index) => (
            <mesh key={radius} position={[0, 0.15, 0]} rotation={[Math.PI / 2, index * 0.31, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : index === 1 ? '#d56a42' : '#75cbe7'} transparent opacity={0.42 - index * 0.08} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          <Line points={[[-5.8, -2.6, 0], [0, 0, 0.3], [5.8, 2.6, 0]]} color="#8ad9ee" lineWidth={1.5} transparent opacity={0.5} clippingPlanes={clippingPlanes} />
        </group>
      )}

      <AnnotationMarkers
        record={props.record}
        layers={props.layers}
        selectedAnnotationId={props.selectedAnnotationId}
        onSelectAnnotation={props.onSelectAnnotation}
      />
    </group>
  );
}
