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

export function AerokarstModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const ribs = useRef<THREE.Group>(null);
  const lung = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const shells = useMemo(
    () => [
      { position: [0, 2.8, 0] as [number, number, number], scale: [2.6, 2.1, 2.6] as [number, number, number] },
      { position: [-2.1, 0.2, 0.5] as [number, number, number], scale: [2.1, 1.7, 2.0] as [number, number, number] },
      { position: [2.0, -1.8, -0.4] as [number, number, number], scale: [1.8, 1.5, 1.8] as [number, number, number] },
    ],
    [],
  );

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current) return;
    root.current.rotation.y = Math.sin(t * 0.35) * 0.28;
    root.current.position.y = Math.sin(t * 0.8) * 0.25;
    if (ribs.current) ribs.current.rotation.y = -t * 0.18;
    if (lung.current) {
      const pulse = props.animation.name === 'Cyclonic Lung Crush' ? 1 + Math.sin(t * 3.2) * 0.22 : 1 + Math.sin(t) * 0.05;
      lung.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          {shells.map((shell, index) => (
            <mesh key={index} position={shell.position} scale={shell.scale} castShadow receiveShadow>
              <sphereGeometry args={[1, 36, 24, 0, Math.PI * 2, 0.42, Math.PI - 0.84]} />
              <meshPhysicalMaterial
                color={materialColor(index === 0 ? '#9eb8c8' : '#718896', props.silhouette)}
                emissive={props.silhouette ? '#000000' : '#173b4d'}
                emissiveIntensity={0.35}
                roughness={0.32}
                metalness={0.16}
                transmission={props.silhouette ? 0 : 0.34}
                transparent
                opacity={props.silhouette ? 1 : 0.82}
                side={THREE.DoubleSide}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 3.3, 0.3, 0]} rotation={[0, 0, side * 0.18]}>
              {[0, 1, 2].map((index) => (
                <mesh key={index} position={[0, index * 1.25 - 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[1.15 + index * 0.18, 0.16, 10, 42, Math.PI * 1.45]} />
                  <meshStandardMaterial
                    color={materialColor('#b6c8d2', props.silhouette)}
                    metalness={0.38}
                    roughness={0.42}
                    wireframe={props.wireframe}
                    clippingPlanes={clippingPlanes}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}
      {props.layers.structure && (
        <group ref={ribs}>
          {[0, 1, 2].map((index) => (
            <mesh key={index} rotation={[index * 0.72, index * 0.9, index * 0.38]}>
              <torusGeometry args={[3.7 - index * 0.55, 0.12, 10, 72]} />
              <meshStandardMaterial color={materialColor('#6e8593', props.silhouette)} metalness={0.5} roughness={0.35} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 7.5, 12]} />
            <meshStandardMaterial color={materialColor('#c3d1d8', props.silhouette)} metalness={0.55} roughness={0.3} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
        </group>
      )}
      {props.layers.internal && (
        <mesh ref={lung} position={[0, 0.4, 0]}>
          <sphereGeometry args={[1.65, 36, 24]} />
          <meshPhysicalMaterial
            color={materialColor('#071018', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#4eb7df'}
            emissiveIntensity={1.1}
            roughness={0.16}
            transmission={props.silhouette ? 0 : 0.22}
            transparent
            opacity={0.8}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}
      {props.layers.functional && (
        <group>
          {[2.7, 4.2, 5.7].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.38, 0]}>
              <torusGeometry args={[radius, 0.045, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#7ed6f8'} transparent opacity={0.55 - index * 0.12} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function HydrostaticRendererModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const reservoir = useRef<THREE.Mesh>(null);
  const conduits = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current) return;
    root.current.position.y = Math.sin(t * 0.55) * 0.18;
    root.current.rotation.y = Math.sin(t * 0.28) * 0.15;
    if (reservoir.current) reservoir.current.scale.y = 1 + Math.sin(t * 1.5) * 0.06;
    if (conduits.current) conduits.current.rotation.y = t * 0.08;
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh ref={reservoir} position={[0, 1.0, 0]} scale={[3.5, 3.2, 3.5]} castShadow receiveShadow>
            <sphereGeometry args={[1, 48, 32]} />
            <meshPhysicalMaterial
              color={materialColor('#5f93ad', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#164968'}
              emissiveIntensity={0.45}
              roughness={0.18}
              metalness={0.08}
              transmission={props.silhouette ? 0 : 0.48}
              thickness={1.8}
              transparent
              opacity={props.silhouette ? 1 : 0.76}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          <mesh position={[0, 3.8, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[3.1, 2.1, 32, 1, true]} />
            <meshStandardMaterial color={materialColor('#8199a4', props.silhouette)} metalness={0.32} roughness={0.5} side={THREE.DoubleSide} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          {[-2.2, 0, 2.2].map((x) => (
            <mesh key={x} position={[x, -2.4, 0]}>
              <cylinderGeometry args={[0.34, 0.7, 4.6, 16, 1, true]} />
              <meshPhysicalMaterial color={materialColor('#6faec9', props.silhouette)} transmission={props.silhouette ? 0 : 0.32} transparent opacity={0.78} roughness={0.22} wireframe={props.wireframe} clippingPlanes={clippingPlanes} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const angle = (index / 6) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 3.65, 1.0, Math.sin(angle) * 3.65]} rotation={[0, -angle, Math.PI / 2]}>
                <coneGeometry args={[0.62, 1.8, 12, 1, true]} />
                <meshStandardMaterial color={materialColor('#a7c4d0', props.silhouette)} metalness={0.25} roughness={0.42} side={THREE.DoubleSide} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
              </mesh>
            );
          })}
        </group>
      )}
      {props.layers.structure && (
        <group ref={conduits}>
          {[-2.4, -1.2, 0, 1.2, 2.4].map((y) => (
            <mesh key={y} position={[0, y + 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[3.15 - Math.abs(y) * 0.16, 0.13, 8, 52]} />
              <meshStandardMaterial color={materialColor('#9aaeb7', props.silhouette)} metalness={0.5} roughness={0.38} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh position={[0, 0.8, 0]} scale={[1.55, 2.15, 1.55]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={materialColor('#1b6f99', props.silhouette)} emissive={props.silhouette ? '#000000' : '#2ea6d6'} emissiveIntensity={1.1} transparent opacity={0.78} roughness={0.2} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 1.8, 0.6, 0]} scale={[0.65, 1.6, 0.65]}>
              <capsuleGeometry args={[0.65, 1.8, 8, 16]} />
              <meshStandardMaterial color={materialColor('#d4e7ee', props.silhouette)} emissive={props.silhouette ? '#000000' : '#68b7d6'} emissiveIntensity={0.5} transparent opacity={0.72} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[-2.2, 0, 2.2].map((x) => (
            <Line key={x} points={[[x, -0.5, 0], [x, -7.2, 0]]} color="#73c7ee" lineWidth={2} transparent opacity={0.64} />
          ))}
          <mesh position={[0, -6.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[4.8, 64]} />
            <meshBasicMaterial color={props.silhouette ? '#000000' : '#2b88b0'} transparent opacity={0.12} wireframe clippingPlanes={clippingPlanes} />
          </mesh>
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

class ChoristerCurve extends THREE.Curve<THREE.Vector3> {
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * Math.PI * 2;
    return target.set(Math.sin(angle) * 2.3, (t - 0.5) * 8.5, Math.sin(angle * 2) * 1.15);
  }
}

export function StratosChoristerModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const wings = useRef<THREE.Group>(null);
  const bells = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new ChoristerCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.55, 12, false), [curve]);

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current) return;
    root.current.rotation.y = Math.sin(t * 0.42) * 0.35;
    root.current.rotation.z = Math.sin(t * 0.6) * 0.08;
    root.current.position.y = Math.sin(t * 0.7) * 0.22;
    if (wings.current) wings.current.rotation.z = Math.sin(t * 1.8) * 0.15;
    if (bells.current) bells.current.children.forEach((child, index) => child.scale.setScalar(1 + Math.sin(t * 2.5 + index) * 0.08));
  });

  return (
    <group ref={root} rotation={[0, 0, -0.12]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial color={materialColor('#819eb2', props.silhouette)} emissive={props.silhouette ? '#000000' : '#294f68'} emissiveIntensity={0.38} roughness={0.34} metalness={0.12} transmission={props.silhouette ? 0 : 0.22} transparent opacity={0.88} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          <group ref={wings} position={[0, 0.7, 0]}>
            {[-1, 1].map((side) => (
              <group key={side} scale={[side, 1, 1]}>
                {[0, 1, 2].map((tier) => (
                  <mesh key={tier} position={[2.2 + tier * 1.15, 1.7 - tier * 1.45, 0]} rotation={[0.15, 0, -0.42 - tier * 0.12]} scale={[2.1, 0.18, 1.05]}>
                    <coneGeometry args={[1, 2.7, 5]} />
                    <meshPhysicalMaterial color={materialColor('#b6d1df', props.silhouette)} transmission={props.silhouette ? 0 : 0.3} transparent opacity={0.76} roughness={0.26} side={THREE.DoubleSide} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
          <group ref={bells} position={[0, 2.9, 0.4]}>
            {[0, 1, 2].map((tier) => (
              <mesh key={tier} position={[0, tier * 0.95, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[1.25 - tier * 0.22, 1.2, 24, 1, true]} />
                <meshStandardMaterial color={materialColor('#d1e3ea', props.silhouette)} emissive={props.silhouette ? '#000000' : '#5b9fbd'} emissiveIntensity={0.45} metalness={0.2} roughness={0.32} side={THREE.DoubleSide} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={new THREE.TubeGeometry(curve, 72, 0.18, 8, false)}>
            <meshStandardMaterial color={materialColor('#d2dce0', props.silhouette)} metalness={0.45} roughness={0.34} wireframe clippingPlanes={clippingPlanes} />
          </mesh>
          {[-2.6, -0.9, 0.9, 2.6].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[1.25, 0.1, 8, 32, Math.PI]} />
              <meshStandardMaterial color={materialColor('#9db0ba', props.silhouette)} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          {[-1.2, 0.25, 1.7, 3.15].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} scale={[0.72 - index * 0.06, 0.95, 0.72 - index * 0.06]}>
              <sphereGeometry args={[1, 24, 18]} />
              <meshStandardMaterial color={materialColor('#5ca9c8', props.silhouette)} emissive={props.silhouette ? '#000000' : '#2b88b0'} emissiveIntensity={0.8} transparent opacity={0.76} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[2.2, 3.6, 5].map((radius, index) => (
            <mesh key={radius} position={[0, 3.6, 0]} rotation={[Math.PI / 2, index * 0.25, 0]}>
              <torusGeometry args={[radius, 0.045, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#8ad8ef'} transparent opacity={0.58 - index * 0.13} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          <Line points={[[-6, -2, 0], [0, 0, 0], [6, 2, 0]]} color="#7ed6f8" lineWidth={2} transparent opacity={0.58} />
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function BalanceEngineModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  useFrame(() => {
    const t = elapsed.current;
    if (root.current) root.current.position.y = Math.sin(t * 0.42) * 0.12;
    if (ringA.current) ringA.current.rotation.z = t * 0.2;
    if (ringB.current) ringB.current.rotation.x = -t * 0.16;
    if (ringC.current) ringC.current.rotation.y = t * 0.12;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.045);
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh ref={ringA}>
            <torusGeometry args={[5.2, 0.48, 16, 128]} />
            <meshStandardMaterial color={materialColor('#8798a5', props.silhouette)} metalness={0.66} roughness={0.28} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          <mesh ref={ringB} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[4.1, 0.38, 16, 112]} />
            <meshStandardMaterial color={materialColor('#b1c1ca', props.silhouette)} metalness={0.58} roughness={0.3} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          <mesh ref={ringC} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[3.15, 0.3, 14, 96]} />
            <meshStandardMaterial color={materialColor('#617b8a', props.silhouette)} metalness={0.62} roughness={0.32} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
            const angle = (index / 8) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0]} rotation={[0, 0, angle]} scale={[0.45, 0.2, 1.25]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={materialColor(index % 2 ? '#b06a4b' : '#5f8fa8', props.silhouette)} emissive={props.silhouette ? '#000000' : index % 2 ? '#7a2d1c' : '#245c78'} emissiveIntensity={0.35} metalness={0.42} roughness={0.38} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
              </mesh>
            );
          })}
        </group>
      )}
      {props.layers.structure && (
        <group>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, side * 4.6, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 9.2, 16]} />
              <meshStandardMaterial color={materialColor('#ccd5da', props.silhouette)} metalness={0.55} roughness={0.32} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[0, Math.PI / 2].map((rotation) => (
            <mesh key={rotation} rotation={[0, 0, rotation]}>
              <cylinderGeometry args={[0.22, 0.22, 10.4, 12]} />
              <meshStandardMaterial color={materialColor('#889aa5', props.silhouette)} metalness={0.5} roughness={0.4} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.8, 3]} />
            <meshPhysicalMaterial color={materialColor('#79b9d5', props.silhouette)} emissive={props.silhouette ? '#000000' : '#2f89ad'} emissiveIntensity={1.05} transmission={props.silhouette ? 0 : 0.28} transparent opacity={0.86} roughness={0.2} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 2.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.55, 2.1, 8, 16]} />
              <meshStandardMaterial color={materialColor(side < 0 ? '#b4563d' : '#4d94b3', props.silhouette)} emissive={props.silhouette ? '#000000' : side < 0 ? '#7b2718' : '#1f6482'} emissiveIntensity={0.75} transparent opacity={0.82} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[-4, -2, 0, 2, 4].map((y, index) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[6.2 - Math.abs(y) * 0.2, 0.035, 8, 112]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#e58b61' : '#76c5e7'} transparent opacity={0.28} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function StormmindTacticianModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const antlers = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const segments = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current) return;
    root.current.rotation.y = Math.sin(t * 0.5) * 0.32;
    root.current.position.y = Math.sin(t * 1.1) * 0.24;
    if (antlers.current) antlers.current.rotation.z = Math.sin(t * 3.1) * 0.06;
    if (core.current) core.current.scale.setScalar(1 + Math.max(0, Math.sin(t * 4.2)) * 0.16);
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          {segments.map((segment) => {
            const y = 3.3 - segment * 1.2;
            const lateral = Math.sin(segment * 1.4) * 0.55;
            return (
              <mesh key={segment} position={[lateral, y, 0]} scale={[2.2 - segment * 0.12, 0.9, 1.75 - segment * 0.08]} castShadow receiveShadow>
                <dodecahedronGeometry args={[1, 1]} />
                <meshPhysicalMaterial color={materialColor('#2b3542', props.silhouette)} emissive={props.silhouette ? '#000000' : '#274b66'} emissiveIntensity={0.42} roughness={0.66} metalness={0.18} transparent opacity={0.92} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
              </mesh>
            );
          })}
          <group ref={antlers} position={[0, 4.7, 0]}>
            {[-1, 1].map((side) => (
              <group key={side} scale={[side, 1, 1]}>
                <Line points={[[0.5, 0, 0], [1.7, 1.2, 0], [2.8, 0.65, 0.35], [3.8, 1.55, 0.1]]} color="#9ee9ff" lineWidth={4} />
                <Line points={[[1.7, 1.2, 0], [2.0, 2.2, -0.2]]} color="#70cbea" lineWidth={3} />
                <Line points={[[2.8, 0.65, 0.35], [3.2, -0.2, 0.6]]} color="#70cbea" lineWidth={3} />
              </group>
            ))}
          </group>
          {[0, 1, 2, 3].map((index) => {
            const angle = (index / 4) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 2.3, 1.2, Math.sin(angle) * 1.9]}>
                <sphereGeometry args={[0.24, 18, 12]} />
                <meshStandardMaterial color={materialColor('#bcefff', props.silhouette)} emissive={props.silhouette ? '#000000' : '#4cc7ef'} emissiveIntensity={1.6} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
              </mesh>
            );
          })}
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.28, 0.42, 7.4, 12]} />
            <meshStandardMaterial color={materialColor('#8ca6b5', props.silhouette)} metalness={0.55} roughness={0.34} wireframe clippingPlanes={clippingPlanes} />
          </mesh>
          {segments.map((segment) => (
            <mesh key={segment} position={[Math.sin(segment * 1.4) * 0.55, 3.3 - segment * 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.65 - segment * 0.08, 0.1, 8, 36]} />
              <meshStandardMaterial color={materialColor('#68869a', props.silhouette)} metalness={0.4} roughness={0.42} wireframe clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core} position={[0, 1.0, 0]}>
            <icosahedronGeometry args={[1.35, 2]} />
            <meshStandardMaterial color={materialColor('#d8f7ff', props.silhouette)} emissive={props.silhouette ? '#000000' : '#57d3ff'} emissiveIntensity={1.8} transparent opacity={0.84} roughness={0.16} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
          </mesh>
          {[2.8, 1.6, 0.4, -0.8, -2.0].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <sphereGeometry args={[0.45, 20, 14]} />
              <meshStandardMaterial color={materialColor('#78cce8', props.silhouette)} emissive={props.silhouette ? '#000000' : '#2c9ec8'} emissiveIntensity={0.75} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[2.8, 4.2, 5.6].map((radius, index) => (
            <mesh key={radius} position={[0, 1.0, 0]} rotation={[Math.PI / 2, index * 0.48, 0]}>
              <torusGeometry args={[radius, 0.045, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#6edbff'} transparent opacity={0.5 - index * 0.1} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-4, -2, 0, 2, 4].map((x) => (
            <Line key={x} points={[[0, 1, 0], [x, -5.4, x * 0.35]]} color="#b9f2ff" lineWidth={1.5} transparent opacity={0.5} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
