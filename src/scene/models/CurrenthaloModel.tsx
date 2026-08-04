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

function measurementHandler(props: SpecimenModelProps) {
  return (event: ThreeEvent<PointerEvent>) => {
    if (!props.measurementMode) return;
    event.stopPropagation();
    props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
  };
}

class CurrenthaloCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private readonly phase: number, private readonly verticalBias: number) {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * Math.PI * 2;
    const radius = 3.05 + Math.sin(angle * 2 + this.phase) * 0.5;
    return target.set(
      Math.cos(angle + this.phase) * radius,
      Math.sin(angle * 2 + this.phase) * 0.82 + this.verticalBias,
      Math.sin(angle + this.phase) * radius,
    );
  }
}

interface LoopAssemblyProps {
  model: SpecimenModelProps;
  clippingPlanes: THREE.Plane[];
  geometry: THREE.TubeGeometry;
  ribPoints: THREE.Vector3[];
  color: string;
  emissive: string;
}

function LoopAssembly({ model, clippingPlanes, geometry, ribPoints, color, emissive }: LoopAssemblyProps) {
  return (
    <>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color={materialColor(color, model.silhouette)}
          emissive={model.silhouette ? '#000000' : emissive}
          emissiveIntensity={model.silhouette ? 0 : 0.58}
          roughness={0.18}
          metalness={0.06}
          transmission={model.silhouette ? 0 : 0.32}
          thickness={1.1}
          transparent
          opacity={model.silhouette ? 1 : 0.79}
          wireframe={model.wireframe}
          clippingPlanes={clippingPlanes}
          side={THREE.DoubleSide}
        />
      </mesh>
      {ribPoints.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, point.z]} rotation={[0, index * 0.52, index * 0.18]} scale={[0.16, 0.72, 0.42]}>
          <coneGeometry args={[1, 1.7, 5]} />
          <meshStandardMaterial
            color={materialColor('#8dd9df', model.silhouette)}
            emissive={model.silhouette ? '#000000' : '#4fbac7'}
            emissiveIntensity={model.silhouette ? 0 : 0.74}
            roughness={0.22}
            transparent
            opacity={model.silhouette ? 1 : 0.88}
            wireframe={model.wireframe}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      ))}
    </>
  );
}

export function GyreTacticianModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const loopA = useRef<THREE.Group>(null);
  const loopB = useRef<THREE.Group>(null);
  const loopC = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curves = useMemo(() => [
    new CurrenthaloCurve(0, 0),
    new CurrenthaloCurve(Math.PI * 0.67, 0.18),
    new CurrenthaloCurve(Math.PI * 1.33, -0.18),
  ], []);
  const geometries = useMemo(() => curves.map((curve) => new THREE.TubeGeometry(curve, 112, 0.48, 12, true)), [curves]);
  const ribSets = useMemo(() => curves.map((curve) => Array.from({ length: 12 }, (_, index) => curve.getPoint(index / 12))), [curves]);
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
    if (loopB.current) loopB.current.rotation.x = Math.PI / 2.7 - t * (spin ? 0.31 : 0.13);
    if (loopC.current) loopC.current.rotation.z = Math.PI / 2.9 + t * (spin ? 0.26 : 0.1);
    if (core.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.08;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <group ref={loopA}>
            <LoopAssembly model={props} clippingPlanes={clippingPlanes} geometry={geometries[0]} ribPoints={ribSets[0]} color="#4a9ab1" emissive="#2a7894" />
          </group>
          <group ref={loopB} rotation={[Math.PI / 2.7, 0, 0]}>
            <LoopAssembly model={props} clippingPlanes={clippingPlanes} geometry={geometries[1]} ribPoints={ribSets[1]} color="#62afbd" emissive="#277e99" />
          </group>
          <group ref={loopC} rotation={[0, 0, Math.PI / 2.9]}>
            <LoopAssembly model={props} clippingPlanes={clippingPlanes} geometry={geometries[2]} ribPoints={ribSets[2]} color="#357d9a" emissive="#235e82" />
          </group>
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
          <group rotation={[0, 0, 0]}>
            <mesh geometry={geometries[0]}>
              <meshStandardMaterial color={materialColor('#9bbfc7', props.silhouette)} roughness={0.38} metalness={0.28} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          </group>
          <group rotation={[Math.PI / 2.7, 0, 0]}>
            <mesh geometry={geometries[1]}>
              <meshStandardMaterial color={materialColor('#9bbfc7', props.silhouette)} roughness={0.38} metalness={0.28} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          </group>
          <group rotation={[0, 0, Math.PI / 2.9]}>
            <mesh geometry={geometries[2]}>
              <meshStandardMaterial color={materialColor('#9bbfc7', props.silhouette)} roughness={0.38} metalness={0.28} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          </group>
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.15, 3]} />
            <meshPhysicalMaterial
              color={materialColor('#7fd1d6', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#3bb3c4'}
              emissiveIntensity={props.silhouette ? 0 : 1.1}
              roughness={0.16}
              transmission={props.silhouette ? 0 : 0.3}
              transparent
              opacity={props.silhouette ? 1 : 0.84}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          {[0, 1, 2].map((index) => (
            <mesh key={index} rotation={[index * 0.76, index * 0.48, index * 0.91]}>
              <torusGeometry args={[1.75 + index * 0.3, 0.08, 8, 56]} />
              <meshStandardMaterial color={materialColor('#5bb6c6', props.silhouette)} emissive={props.silhouette ? '#000000' : '#2c8ea3'} emissiveIntensity={props.silhouette ? 0 : 0.62} roughness={0.24} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
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
            <Line key={side} points={[[side * 7.2, 0, -4.5], [side * 4.5, 0.8, 0], [side * 7.2, 0, 4.5]]} color="#85d9e5" lineWidth={1.5} transparent opacity={0.48}  clippingPlanes={clippingPlanes} />
          ))}
        </group>
      )}
      <AnnotationMarkers record={props.record} layers={props.layers} selectedAnnotationId={props.selectedAnnotationId} onSelectAnnotation={props.onSelectAnnotation} />
    </group>
  );
}
