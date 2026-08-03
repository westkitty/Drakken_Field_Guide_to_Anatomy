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

function measurementHandler(props: SpecimenModelProps) {
  return (event: { stopPropagation: () => void; point: THREE.Vector3 }) => {
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

const rootDirections: Array<[number, number, number]> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
  [0.72, 0, 0.72],
  [-0.72, 0, 0.72],
  [0.72, 0, -0.72],
  [-0.72, 0, -0.72],
];

export function MacrofloraColossusModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const canopy = useRef<THREE.Group>(null);
  const sapCore = useRef<THREE.Mesh>(null);
  const anchorRoots = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  const sporeParticles = useMemo(() => {
    const positions = new Float32Array(180 * 3);
    for (let index = 0; index < 180; index += 1) {
      const angle = index * 2.399963;
      const radius = 1.5 + (index % 17) * 0.23;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = 3.8 + (index % 29) * 0.16;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) root.current.rotation.y = Math.sin(t * 0.18) * 0.08;
    if (canopy.current) {
      const bloom = props.animation.name === 'Bio-Forest Spore Bloom' ? 1 + Math.sin(t * 1.7) * 0.055 : 1 + Math.sin(t * 0.7) * 0.018;
      canopy.current.scale.setScalar(bloom);
      canopy.current.rotation.y = Math.sin(t * 0.25) * 0.1;
    }
    if (sapCore.current) sapCore.current.scale.setScalar(1 + Math.sin(t * 1.9) * 0.07);
    if (anchorRoots.current && props.animation.name === 'Deep Root Anchoring') {
      anchorRoots.current.position.y = Math.sin(t * 1.3) * 0.12;
    }
  });

  return (
    <group ref={root} position={[0, -0.2, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.7, 0]} scale={[2.25, 4.7, 2.1]} castShadow receiveShadow>
            <cylinderGeometry args={[0.62, 1.15, 2, 12, 4]} />
            <meshStandardMaterial
              color={materialColor('#304327', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#172a18'}
              emissiveIntensity={0.34}
              roughness={0.9}
              metalness={0.12}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          <group ref={canopy} position={[0, 4.6, 0]}>
            {[
              [0, 1.0, 0, 2.7],
              [-2.5, 0.2, 0.8, 2.0],
              [2.4, 0.5, -0.7, 2.1],
              [-0.4, 0.1, -2.2, 1.85],
              [0.8, -0.2, 2.2, 1.75],
            ].map(([x, y, z, scale], index) => (
              <mesh key={index} position={[x, y, z]} scale={[scale, scale * 0.72, scale]} castShadow>
                <dodecahedronGeometry args={[1, 1]} />
                <meshPhysicalMaterial
                  color={materialColor(index === 0 ? '#52733d' : '#3f6234', props.silhouette)}
                  emissive={props.silhouette ? '#000000' : '#214e2e'}
                  emissiveIntensity={0.55}
                  roughness={0.72}
                  metalness={0.04}
                  transmission={props.silhouette ? 0 : 0.08}
                  transparent
                  opacity={0.94}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            ))}

            {[-3.1, -1.9, -0.7, 0.7, 1.9, 3.1].map((x, index) => (
              <mesh key={x} position={[x, -1.9 - (index % 2) * 0.45, Math.sin(index) * 1.4]} rotation={[0.14, 0, index % 2 ? -0.18 : 0.18]}>
                <cylinderGeometry args={[0.1, 0.22, 3.4, 8]} />
                <meshStandardMaterial
                  color={materialColor('#6fa45a', props.silhouette)}
                  emissive={props.silhouette ? '#000000' : '#3f7d54'}
                  emissiveIntensity={0.65}
                  roughness={0.55}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            ))}
          </group>

          <group ref={anchorRoots} position={[0, -3.4, 0]}>
            {rootDirections.map(([x, , z], index) => {
              const angle = Math.atan2(x, z);
              return (
                <mesh key={index} position={[x * 3.0, -0.35, z * 3.0]} rotation={[Math.PI / 2.7, angle, 0]} scale={[0.75, 3.6, 0.75]}>
                  <coneGeometry args={[0.75, 2.2, 9]} />
                  <meshStandardMaterial
                    color={materialColor('#283822', props.silhouette)}
                    roughness={0.95}
                    metalness={0.08}
                    wireframe={props.wireframe}
                    clippingPlanes={clippingPlanes}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      )}

      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.45, 0]} scale={[0.72, 4.35, 0.72]}>
            <cylinderGeometry args={[0.72, 0.9, 2, 10]} />
            <meshStandardMaterial
              color={materialColor('#89917d', props.silhouette)}
              metalness={0.48}
              roughness={0.45}
              wireframe
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          {rootDirections.slice(0, 6).map(([x, , z], index) => (
            <mesh key={index} position={[x * 1.8, 3.4 + (index % 2) * 0.5, z * 1.8]} rotation={[Math.PI / 2.4, Math.atan2(x, z), 0]} scale={[0.22, 2.8, 0.22]}>
              <cylinderGeometry args={[0.5, 0.7, 2, 8]} />
              <meshStandardMaterial color={materialColor('#6f7f68', props.silhouette)} metalness={0.35} roughness={0.5} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.internal && (
        <group>
          <mesh ref={sapCore} position={[0, 0.6, 0]} scale={[1.0, 2.6, 1.0]}>
            <capsuleGeometry args={[0.72, 2.9, 10, 20]} />
            <meshPhysicalMaterial
              color={materialColor('#70b86d', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#3e9b61'}
              emissiveIntensity={1.0}
              transmission={props.silhouette ? 0 : 0.24}
              transparent
              opacity={0.82}
              roughness={0.24}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          <mesh position={[0, 3.55, 0]}>
            <icosahedronGeometry args={[1.05, 2]} />
            <meshStandardMaterial color={materialColor('#8bd897', props.silhouette)} emissive={props.silhouette ? '#000000' : '#54ad79'} emissiveIntensity={1.2} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
        </group>
      )}

      {props.layers.functional && (
        <group>
          {rootDirections.map(([x, , z], index) => (
            <Line
              key={index}
              points={[[0, -2.7, 0], [x * 3.2, -3.3, z * 3.2], [x * 7.2, -4.4, z * 7.2]]}
              color="#78c98b"
              lineWidth={1.5}
              transparent
              opacity={0.58}
            />
          ))}
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[sporeParticles, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#9adf89" size={0.13} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.68} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}

      <Markers {...props} />
    </group>
  );
}

export function SporesphereArchivistModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const podRing = useRef<THREE.Group>(null);
  const membrane = useRef<THREE.Mesh>(null);
  const archiveCore = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const pods = useMemo(() => Array.from({ length: 10 }, (_, index) => index), []);
  const helix = useMemo(() => {
    const a: [number, number, number][] = [];
    const b: [number, number, number][] = [];
    for (let index = 0; index <= 72; index += 1) {
      const t = index / 72;
      const angle = t * Math.PI * 6;
      const y = -2.2 + t * 4.4;
      a.push([Math.cos(angle) * 0.72, y, Math.sin(angle) * 0.72]);
      b.push([Math.cos(angle + Math.PI) * 0.72, y, Math.sin(angle + Math.PI) * 0.72]);
    }
    return { a, b };
  }, []);

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.72) * 0.3;
      root.current.rotation.y = Math.sin(t * 0.3) * 0.18;
    }
    if (podRing.current) podRing.current.rotation.y = t * (props.animation.name === 'Spore Pod Sampling' ? 0.34 : 0.16);
    if (membrane.current) membrane.current.scale.setScalar(1 + Math.sin(t * 1.45) * 0.035);
    if (archiveCore.current) archiveCore.current.rotation.y = -t * 0.28;
  });

  return (
    <group ref={root} position={[0, 0.4, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh ref={membrane} scale={[3.0, 3.35, 3.0]} castShadow receiveShadow>
            <sphereGeometry args={[1, 48, 36]} />
            <meshPhysicalMaterial
              color={materialColor('#7fae91', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#275b4c'}
              emissiveIntensity={0.4}
              roughness={0.25}
              metalness={0.04}
              transmission={props.silhouette ? 0 : 0.42}
              thickness={1.4}
              transparent
              opacity={props.silhouette ? 1 : 0.76}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          <group ref={podRing}>
            {pods.map((index) => {
              const angle = (index / pods.length) * Math.PI * 2;
              const y = index % 2 ? 0.75 : -0.6;
              return (
                <group key={index} position={[Math.cos(angle) * 4.3, y, Math.sin(angle) * 4.3]}>
                  <mesh scale={[0.72, 1.0, 0.72]}>
                    <dodecahedronGeometry args={[1, 1]} />
                    <meshPhysicalMaterial
                      color={materialColor('#9bcf83', props.silhouette)}
                      emissive={props.silhouette ? '#000000' : '#4a9b5f'}
                      emissiveIntensity={0.72}
                      transmission={props.silhouette ? 0 : 0.18}
                      transparent
                      opacity={0.9}
                      roughness={0.38}
                      wireframe={props.wireframe}
                      clippingPlanes={clippingPlanes}
                    />
                  </mesh>
                  <mesh position={[0, -1.0, 0]}>
                    <cylinderGeometry args={[0.07, 0.12, 1.4, 6]} />
                    <meshStandardMaterial color={materialColor('#688e72', props.silhouette)} roughness={0.62} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
                  </mesh>
                </group>
              );
            })}
          </group>

          {Array.from({ length: 14 }, (_, index) => {
            const angle = (index / 14) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 2.9, Math.sin(index * 1.7) * 1.35, Math.sin(angle) * 2.9]} rotation={[Math.PI / 2, -angle, 0]}>
                <coneGeometry args={[0.13, 1.25, 6]} />
                <meshStandardMaterial color={materialColor('#b1d8ad', props.silhouette)} emissive={props.silhouette ? '#000000' : '#4d8f69'} emissiveIntensity={0.35} roughness={0.5} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
              </mesh>
            );
          })}
        </group>
      )}

      {props.layers.structure && (
        <group>
          {[0, 1, 2, 3].map((index) => (
            <mesh key={index} rotation={[index * 0.63, index * 0.82, index * 0.41]}>
              <torusGeometry args={[2.65 - index * 0.22, 0.1, 8, 64]} />
              <meshStandardMaterial color={materialColor('#aab9a5', props.silhouette)} metalness={0.3} roughness={0.46} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {pods.map((index) => {
            const angle = (index / pods.length) * Math.PI * 2;
            return <Line key={index} points={[[0, 0, 0], [Math.cos(angle) * 4.05, index % 2 ? 0.75 : -0.6, Math.sin(angle) * 4.05]]} color="#6c8e7b" lineWidth={1} transparent opacity={0.45} />;
          })}
        </group>
      )}

      {props.layers.internal && (
        <group>
          <mesh ref={archiveCore}>
            <icosahedronGeometry args={[1.35, 3]} />
            <meshStandardMaterial color={materialColor('#75d497', props.silhouette)} emissive={props.silhouette ? '#000000' : '#3ec475'} emissiveIntensity={1.35} roughness={0.18} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          {[-1.35, 0, 1.35].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.55, 0.1, 8, 48]} />
              <meshStandardMaterial color={materialColor('#b7df9a', props.silhouette)} emissive={props.silhouette ? '#000000' : '#5ba56e'} emissiveIntensity={0.7} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.functional && (
        <group>
          <Line points={helix.a} color="#77d9a3" lineWidth={2} transparent opacity={0.72} />
          <Line points={helix.b} color="#a9e49a" lineWidth={2} transparent opacity={0.72} />
          {[3.5, 4.7, 5.9].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.34, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#7ed69a'} transparent opacity={0.38 - index * 0.08} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      <Markers {...props} />
    </group>
  );
}

export function NeuralFungibinderModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const cap = useRef<THREE.Mesh>(null);
  const relay = useRef<THREE.Mesh>(null);
  const stalks = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  const webLines = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      const bend = angle + (index % 2 ? 0.42 : -0.32);
      return [
        [0, -2.45, 0],
        [Math.cos(bend) * 3.5, -2.75, Math.sin(bend) * 3.5],
        [Math.cos(angle) * 7.2, -3.05, Math.sin(angle) * 7.2],
      ] as [number, number, number][];
    });
  }, []);

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.32) * 0.15;
      root.current.position.y = Math.sin(t * 0.75) * 0.12;
    }
    if (cap.current) cap.current.scale.y = 0.72 + Math.sin(t * 1.4) * 0.035;
    if (relay.current) relay.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.1);
    if (stalks.current) stalks.current.rotation.y = Math.sin(t * 0.5) * 0.08;
  });

  return (
    <group ref={root} position={[0, -0.4, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh ref={cap} position={[0, 2.3, 0]} scale={[3.6, 0.72, 3.6]} castShadow receiveShadow>
            <sphereGeometry args={[1, 48, 28, 0, Math.PI * 2, 0, Math.PI / 1.65]} />
            <meshPhysicalMaterial
              color={materialColor('#586b3c', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#315b38'}
              emissiveIntensity={0.6}
              roughness={0.55}
              metalness={0.03}
              transmission={props.silhouette ? 0 : 0.12}
              transparent
              opacity={0.93}
              side={THREE.DoubleSide}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          <mesh position={[0, -0.1, 0]} scale={[2.25, 1.25, 3.15]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.72, 2.1, 8, 18]} />
            <meshStandardMaterial color={materialColor('#39472f', props.silhouette)} emissive={props.silhouette ? '#000000' : '#1f3d28'} emissiveIntensity={0.3} roughness={0.82} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>

          <group ref={stalks}>
            {rootDirections.map(([x, , z], index) => (
              <group key={index} position={[x * 2.25, -1.55, z * 2.25]} rotation={[0.12 * z, 0, -0.18 * x]}>
                <mesh>
                  <cylinderGeometry args={[0.22, 0.38, 2.2, 8]} />
                  <meshStandardMaterial color={materialColor('#6f7650', props.silhouette)} roughness={0.76} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
                </mesh>
                <mesh position={[0, -1.15, 0]} scale={[0.42, 0.18, 0.8]}>
                  <sphereGeometry args={[1, 16, 10]} />
                  <meshStandardMaterial color={materialColor('#435438', props.silhouette)} emissive={props.silhouette ? '#000000' : '#2f805b'} emissiveIntensity={0.38} roughness={0.7} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
                </mesh>
              </group>
            ))}
          </group>

          {[-2.2, -1.1, 0, 1.1, 2.2].map((x, index) => (
            <mesh key={x} position={[x, 0.5 + (index % 2) * 0.3, 1.55]} rotation={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.15, 2.2, 6]} />
              <meshStandardMaterial color={materialColor('#77d59b', props.silhouette)} emissive={props.silhouette ? '#000000' : '#46b879'} emissiveIntensity={0.8} roughness={0.42} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.structure && (
        <group>
          {[-1.8, -0.9, 0, 0.9, 1.8].map((z, index) => (
            <mesh key={z} position={[0, -0.2 + Math.sin(index) * 0.16, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.55 - Math.abs(z) * 0.18, 0.11, 8, 32]} />
              <meshStandardMaterial color={materialColor('#a4aa87', props.silhouette)} metalness={0.16} roughness={0.6} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.32, 5.2, 10]} />
            <meshStandardMaterial color={materialColor('#82916f', props.silhouette)} roughness={0.55} wireframe clippingPlanes={clippingPlanes} />
          </mesh>
        </group>
      )}

      {props.layers.internal && (
        <group>
          <mesh ref={relay} position={[0, 0.15, 0]}>
            <icosahedronGeometry args={[1.15, 2]} />
            <meshStandardMaterial color={materialColor('#79dfa4', props.silhouette)} emissive={props.silhouette ? '#000000' : '#37c47a'} emissiveIntensity={1.5} roughness={0.18} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          {[-1.55, 1.55].map((x) => (
            <mesh key={x} position={[x, 0.2, 0]} scale={[0.72, 1.0, 0.72]}>
              <sphereGeometry args={[1, 24, 18]} />
              <meshPhysicalMaterial color={materialColor('#b3d981', props.silhouette)} emissive={props.silhouette ? '#000000' : '#6aaf56'} emissiveIntensity={0.6} transmission={props.silhouette ? 0 : 0.18} transparent opacity={0.82} roughness={0.28} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.functional && (
        <group>
          {webLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#60d596' : '#82bff0'} lineWidth={1.5} transparent opacity={0.58} />
          ))}
          {[2.8, 4.6, 6.4].map((radius, index) => (
            <mesh key={radius} position={[0, -2.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius, 0.04, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#5bcf91'} transparent opacity={0.42 - index * 0.1} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      <Markers {...props} />
    </group>
  );
}

class PrecipitationCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const z = (t - 0.5) * 9.5;
    const x = Math.sin(t * Math.PI * 2.2) * 1.1;
    const y = Math.sin(t * Math.PI * 3.3) * 0.72;
    return target.set(x, y, z);
  }
}

export function PrecipitationSynthModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const fins = useRef<THREE.Group>(null);
  const nutrientSac = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new PrecipitationCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 112, 0.62, 14, false), [curve]);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.17, 8, false), [curve]);
  const bodyPoints = useMemo(() => Array.from({ length: 9 }, (_, index) => curve.getPoint((index + 1) / 10)), [curve]);
  const pathPoints = useMemo(() => Array.from({ length: 64 }, (_, index) => curve.getPoint(index / 63).toArray() as [number, number, number]), [curve]);

  const rainParticles = useMemo(() => {
    const positions = new Float32Array(150 * 3);
    for (let index = 0; index < 150; index += 1) {
      const p = curve.getPoint((index % 100) / 99);
      positions[index * 3] = p.x + Math.sin(index * 1.7) * 1.2;
      positions[index * 3 + 1] = p.y - 1.2 - (index % 18) * 0.24;
      positions[index * 3 + 2] = p.z + Math.cos(index * 1.3) * 0.8;
    }
    return positions;
  }, [curve]);

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.45) * 0.32;
      root.current.rotation.z = Math.sin(t * 0.62) * 0.1;
      root.current.position.y = Math.sin(t * 0.9) * 0.28;
    }
    if (fins.current) fins.current.children.forEach((child, index) => {
      child.rotation.z = (index % 2 ? -1 : 1) * (0.32 + Math.sin(t * 1.8 + index) * 0.09);
    });
    if (nutrientSac.current) nutrientSac.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.08);
  });

  return (
    <group ref={root} rotation={[0.15, 0, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={materialColor('#8cc9b0', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#2d806d'}
              emissiveIntensity={0.55}
              roughness={0.2}
              metalness={0.04}
              transmission={props.silhouette ? 0 : 0.45}
              thickness={1.0}
              transparent
              opacity={props.silhouette ? 1 : 0.78}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          <group ref={fins}>
            {bodyPoints.map((point, index) => (
              <group key={index} position={[point.x, point.y, point.z]} rotation={[0, 0, index % 2 ? -0.34 : 0.34]}>
                {[-1, 1].map((side) => (
                  <mesh key={side} position={[side * 0.8, 0, 0]} scale={[side, 1, 1]} rotation={[0, 0, side * 0.3]}>
                    <coneGeometry args={[0.55, 1.7, 5]} />
                    <meshPhysicalMaterial color={materialColor('#a8e0c9', props.silhouette)} emissive={props.silhouette ? '#000000' : '#4fb896'} emissiveIntensity={0.45} transmission={props.silhouette ? 0 : 0.25} transparent opacity={0.8} roughness={0.24} side={THREE.DoubleSide} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>

          {[-1.8, -0.8, 0.2, 1.2].map((z) => (
            <mesh key={z} position={[0.52, 0.1, z]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.48, 0.055, 6, 20, Math.PI]} />
              <meshStandardMaterial color={materialColor('#d1efe2', props.silhouette)} emissive={props.silhouette ? '#000000' : '#71c6a5'} emissiveIntensity={0.4} roughness={0.4} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <meshStandardMaterial color={materialColor('#b7c9b9', props.silhouette)} metalness={0.25} roughness={0.42} wireframe clippingPlanes={clippingPlanes} />
          </mesh>
          {bodyPoints.slice(1, 8).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.78, 0.07, 7, 24, Math.PI * 1.45]} />
              <meshStandardMaterial color={materialColor('#8fae9f', props.silhouette)} roughness={0.5} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.internal && (
        <group>
          <mesh ref={nutrientSac} position={[0, 0, 0]} scale={[0.72, 0.72, 1.65]}>
            <capsuleGeometry args={[0.62, 1.8, 8, 18]} />
            <meshPhysicalMaterial color={materialColor('#75d79c', props.silhouette)} emissive={props.silhouette ? '#000000' : '#36b978'} emissiveIntensity={1.1} transmission={props.silhouette ? 0 : 0.22} transparent opacity={0.82} roughness={0.2} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          <mesh position={[0, 0, -2.1]}>
            <icosahedronGeometry args={[0.9, 2]} />
            <meshStandardMaterial color={materialColor('#b3e397', props.silhouette)} emissive={props.silhouette ? '#000000' : '#6dbd5d'} emissiveIntensity={0.9} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
        </group>
      )}

      {props.layers.functional && (
        <group>
          <Line points={pathPoints} color="#74d6b3" lineWidth={1.5} transparent opacity={0.58} />
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[rainParticles, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#8ed2ff" size={0.1} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.68} clippingPlanes={clippingPlanes} />
          </points>
          {[-2.6, 0, 2.6].map((z) => (
            <Line key={z} points={[[0, -0.2, z], [0, -6.1, z]]} color="#79c7ed" lineWidth={1} transparent opacity={0.45} />
          ))}
        </group>
      )}

      <Markers {...props} />
    </group>
  );
}

export function SoilRewriterModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const plow = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const reservoir = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const legPositions: Array<[number, number, number]> = [
    [-2.15, -1.2, 1.8],
    [2.15, -1.2, 1.8],
    [-2.15, -1.2, -1.8],
    [2.15, -1.2, -1.8],
  ];

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) {
      root.current.position.y = Math.abs(Math.sin(t * 1.3)) * 0.08;
      root.current.rotation.z = Math.sin(t * 0.65) * 0.025;
    }
    if (plow.current) plow.current.rotation.x = -0.08 + Math.sin(t * 1.9) * 0.035;
    if (legs.current) legs.current.children.forEach((child, index) => {
      child.position.y = Math.sin(t * 1.6 + (index % 2) * Math.PI) * 0.1;
    });
    if (reservoir.current) reservoir.current.scale.setScalar(1 + Math.sin(t * 2.0) * 0.06);
  });

  return (
    <group ref={root} position={[0, 0.2, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh position={[0, 0.45, -0.2]} scale={[2.8, 1.75, 3.5]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={materialColor('#4b4633', props.silhouette)} emissive={props.silhouette ? '#000000' : '#2e3323'} emissiveIntensity={0.25} roughness={0.86} metalness={0.18} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>

          <group ref={plow} position={[0, 0.1, 3.45]}>
            <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]} scale={[2.65, 1.0, 1.8]}>
              <coneGeometry args={[1, 2.2, 4]} />
              <meshStandardMaterial color={materialColor('#6f6b50', props.silhouette)} metalness={0.46} roughness={0.58} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
            {[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((x, index) => (
              <mesh key={x} position={[x, -0.75, 1.35]} rotation={[Math.PI / 2.25, 0, (index - 2.5) * 0.07]}>
                <coneGeometry args={[0.22, 2.2, 8]} />
                <meshStandardMaterial color={materialColor('#8fa06a', props.silhouette)} emissive={props.silhouette ? '#000000' : '#4f7d43'} emissiveIntensity={0.45} metalness={0.25} roughness={0.5} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
              </mesh>
            ))}
          </group>

          <group ref={legs}>
            {legPositions.map(([x, y, z], index) => (
              <group key={index} position={[x, y, z]}>
                <mesh rotation={[z > 0 ? -0.22 : 0.22, 0, x > 0 ? -0.15 : 0.15]}>
                  <cylinderGeometry args={[0.42, 0.62, 2.8, 10]} />
                  <meshStandardMaterial color={materialColor('#454737', props.silhouette)} roughness={0.78} metalness={0.22} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
                </mesh>
                <mesh position={[0, -1.45, z > 0 ? 0.45 : -0.45]} rotation={[Math.PI / 2, 0, 0]} scale={[1.15, 0.62, 0.72]}>
                  <torusGeometry args={[0.65, 0.24, 8, 24]} />
                  <meshStandardMaterial color={materialColor('#292d25', props.silhouette)} metalness={0.38} roughness={0.68} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
                </mesh>
              </group>
            ))}
          </group>

          {[-1.65, 0, 1.65].map((x) => (
            <mesh key={x} position={[x, 1.9, -0.4]} rotation={[-0.18, 0, 0]}>
              <capsuleGeometry args={[0.48, 1.8, 8, 14]} />
              <meshPhysicalMaterial color={materialColor('#62794b', props.silhouette)} emissive={props.silhouette ? '#000000' : '#355f39'} emissiveIntensity={0.38} transmission={props.silhouette ? 0 : 0.12} transparent opacity={0.9} roughness={0.42} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.35, -0.3]} scale={[2.45, 1.25, 3.1]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={materialColor('#8a8871', props.silhouette)} metalness={0.45} roughness={0.5} wireframe clippingPlanes={clippingPlanes} />
          </mesh>
          {legPositions.map(([x, , z], index) => (
            <Line key={index} points={[[0, 0.55, 0], [x, -0.4, z], [x, -2.4, z + (z > 0 ? 0.4 : -0.4)]]} color="#a7aa83" lineWidth={2} transparent opacity={0.65} />
          ))}
        </group>
      )}

      {props.layers.internal && (
        <group>
          <mesh ref={reservoir} position={[0, 0.55, -0.5]} scale={[1.45, 1.0, 2.15]}>
            <capsuleGeometry args={[0.72, 2.4, 8, 18]} />
            <meshPhysicalMaterial color={materialColor('#78b765', props.silhouette)} emissive={props.silhouette ? '#000000' : '#3c914f'} emissiveIntensity={1.0} transmission={props.silhouette ? 0 : 0.18} transparent opacity={0.84} roughness={0.24} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          <mesh position={[0, 0.35, 1.75]}>
            <icosahedronGeometry args={[1.05, 2]} />
            <meshStandardMaterial color={materialColor('#a5c873', props.silhouette)} emissive={props.silhouette ? '#000000' : '#6c9d43'} emissiveIntensity={0.9} roughness={0.25} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
        </group>
      )}

      {props.layers.functional && (
        <group>
          {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((x) => (
            <Line key={x} points={[[x, -1.0, 3.8], [x, -3.6, 1.5], [x, -3.6, -8.0]]} color="#80bd68" lineWidth={1.4} transparent opacity={0.58} />
          ))}
          {[-5.2, -2.6, 0, 2.6, 5.2].map((z) => (
            <Line key={z} points={[[-4.3, -3.62, z], [4.3, -3.62, z]]} color="#5f8f4d" lineWidth={1} transparent opacity={0.35} />
          ))}
        </group>
      )}

      <Markers {...props} />
    </group>
  );
}
