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
  transmission = 0.26,
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
      thickness={1.1}
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

export function RedactedGrinModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const upperJaw = useRef<THREE.Group>(null);
  const lowerJaw = useRef<THREE.Group>(null);
  const pixels = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const staticPositions = useMemo(() => {
    const positions = new Float32Array(280 * 3);
    for (let index = 0; index < 280; index += 1) {
      const angle = index * 2.399963;
      const radius = 1.8 + (index % 24) * 0.12;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle * 1.7) * (1.1 + (index % 8) * 0.08);
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);
  const brokenRings = useMemo(() => Array.from({ length: 6 }, (_, ring) => Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    const angle = t * Math.PI * 1.55 + ring * 0.75;
    const radius = 2.8 + ring * 0.55;
    return [Math.cos(angle) * radius, Math.sin(angle * (1.2 + ring * 0.04)) * 0.55, Math.sin(angle) * radius] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const smile = props.animation.name === 'Error-Log Smile Pulse';
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.9) * 0.16;
      root.current.rotation.y = Math.sin(t * 0.45) * 0.18;
      root.current.position.x = Math.sin(t * 7.0) * (smile ? 0.08 : 0.025);
    }
    if (upperJaw.current) upperJaw.current.rotation.x = -0.08 - Math.abs(Math.sin(t * (smile ? 3.8 : 1.4))) * (smile ? 0.28 : 0.08);
    if (lowerJaw.current) lowerJaw.current.rotation.x = 0.08 + Math.abs(Math.sin(t * (smile ? 3.8 : 1.4))) * (smile ? 0.28 : 0.08);
    if (pixels.current) {
      pixels.current.children.forEach((child, index) => {
        child.visible = Math.sin(t * 9 + index * 1.7) > -0.35;
      });
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.07;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <group ref={upperJaw} position={[0, 0.65, 0]}>
            <mesh scale={[2.9, 0.62, 1.05]}>
              <boxGeometry args={[1, 1, 1]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#221c26" emissive="#6b245f" emissiveIntensity={0.48} roughness={0.42} metalness={0.36} />
            </mesh>
            {Array.from({ length: 11 }, (_, index) => (
              <mesh key={index} position={[-2.3 + index * 0.46, -0.48, 0.48]} rotation={[Math.PI, 0, 0]} scale={[0.16, 0.58 + (index % 3) * 0.12, 0.22]}>
                <coneGeometry args={[1, 1, 5]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#e6d5e8' : '#c09ecb'} emissive={index % 2 ? '#a64da8' : '#71367f'} emissiveIntensity={0.7} roughness={0.2} metalness={0.2} />
              </mesh>
            ))}
          </group>
          <group ref={lowerJaw} position={[0, -0.65, 0]}>
            <mesh scale={[2.9, 0.62, 1.05]}>
              <boxGeometry args={[1, 1, 1]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#18151d" emissive="#5e1b53" emissiveIntensity={0.45} roughness={0.46} metalness={0.34} />
            </mesh>
            {Array.from({ length: 11 }, (_, index) => (
              <mesh key={index} position={[-2.3 + index * 0.46, 0.48, 0.48]} scale={[0.16, 0.58 + ((index + 1) % 3) * 0.12, 0.22]}>
                <coneGeometry args={[1, 1, 5]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#d8c3dd' : '#ad8ab8'} emissive={index % 2 ? '#944296' : '#653071'} emissiveIntensity={0.68} roughness={0.22} metalness={0.18} />
              </mesh>
            ))}
          </group>
          <group ref={pixels}>
            {Array.from({ length: 36 }, (_, index) => {
              const angle = index * 1.61;
              const radius = 2.4 + (index % 7) * 0.32;
              return (
                <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle * 1.4) * 1.7, Math.sin(angle) * radius]} rotation={[angle, angle * 0.6, angle * 1.1]} scale={[0.08 + (index % 3) * 0.05, 0.22 + (index % 4) * 0.08, 0.08]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#b76fc5' : '#5d3a72'} transparent opacity={0.72} clippingPlanes={clippingPlanes} />
                </mesh>
              );
            })}
          </group>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[staticPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#b796c0" size={0.09} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.58} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <Line points={[[-3.2, 0, 0], [3.2, 0, 0]]} color="#7e667f" lineWidth={3} transparent opacity={0.64} />
          {[-2, -1, 0, 1, 2].map((x, index) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[index * 0.5, index * 0.3, 0]}>
              <torusGeometry args={[0.58 + (index % 2) * 0.15, 0.07, 8, 28]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7f647f" roughness={0.34} metalness={0.36} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <sphereGeometry args={[1.15, 30, 20]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.98} clippingPlanes={clippingPlanes} />
          </mesh>
          {[1.5, 1.95, 2.4].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.82, index * 0.53, index * 0.91]}>
              <torusGeometry args={[radius, 0.055, 8, 52]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#765079'} transparent opacity={0.42 - index * 0.08} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {brokenRings.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#6d466f' : '#ab6bb1'} lineWidth={1.25} transparent opacity={0.46 - index * 0.04} />
          ))}
          {[-5, -2.5, 0, 2.5, 5].map((x, index) => (
            <Line key={x} points={[[x, -4.5, -5], [x * 0.22, 0, 0], [x, 4.5, 5]]} color={index % 2 ? '#4f3153' : '#8b5c91'} lineWidth={1.1} transparent opacity={0.36} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function SpinalLoopModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const segments = useRef<THREE.Group>(null);
  const ghosts = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const stations = useMemo(() => Array.from({ length: 24 }, (_, index) => {
    const angle = (index / 24) * Math.PI * 2;
    return {
      angle,
      position: [Math.cos(angle) * 3.5, Math.sin(angle * 2) * 0.42, Math.sin(angle) * 3.5] as [number, number, number],
    };
  }), []);

  useFrame(() => {
    const t = elapsed.current;
    const devour = props.animation.name === 'Ouroboros Loop Devour';
    if (root.current) {
      root.current.rotation.y = t * (devour ? 0.34 : 0.1);
      root.current.position.y = Math.sin(t * 0.62) * 0.12;
    }
    if (segments.current) {
      segments.current.children.forEach((child, index) => {
        child.visible = Math.sin(t * (devour ? 7.0 : 2.2) + index * 0.52) > -0.82;
        child.rotation.z = stations[index].angle + t * (devour ? 0.08 : 0.02);
      });
    }
    if (ghosts.current) ghosts.current.rotation.y = -t * 0.16;
    if (core.current) {
      const pulse = 1 + Math.sin(t * (devour ? 5.0 : 1.7)) * (devour ? 0.15 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <group ref={segments}>
            {stations.map((station, index) => (
              <mesh key={index} position={station.position} rotation={[station.angle * 0.25, station.angle, station.angle]} scale={[0.82, 0.56, 1.0]}>
                <dodecahedronGeometry args={[1, 0]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 3 === 0 ? '#5d4c43' : index % 2 ? '#3e3935' : '#746052'} emissive="#5b2f29" emissiveIntensity={0.24} roughness={0.82} metalness={0.14} />
              </mesh>
            ))}
          </group>
          <group position={[3.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh scale={[1.15, 0.75, 1.45]}>
              <coneGeometry args={[1, 2.3, 8]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#2b2725" emissive="#5f3028" emissiveIntensity={0.28} roughness={0.7} metalness={0.18} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.48, side * 0.35, 0.95]} rotation={[side > 0 ? Math.PI : 0, 0, 0]} scale={[0.14, 0.5, 0.18]}>
                <coneGeometry args={[1, 1, 5]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a08772" roughness={0.44} metalness={0.24} />
              </mesh>
            ))}
          </group>
          <group ref={ghosts}>
            {[0.18, -0.18].map((offset, ghostIndex) => (
              <mesh key={offset} position={[0, offset, 0]} rotation={[ghostIndex * 0.12, ghostIndex * 0.08, 0]}>
                <torusGeometry args={[3.5, 0.36, 8, 72]} />
                <meshBasicMaterial color={props.silhouette ? '#000000' : ghostIndex ? '#7d99a2' : '#8a655f'} transparent opacity={0.16} wireframe clippingPlanes={clippingPlanes} />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.5, 0.16, 10, 96]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#92847a" roughness={0.42} metalness={0.28} wireframe />
          </mesh>
          {stations.filter((_, index) => index % 3 === 0).map((station, index) => (
            <Line key={index} points={[[0, 0, 0], station.position]} color="#82756c" lineWidth={1.4} transparent opacity={0.52} />
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.05, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#6c4b45" emissive="#a94e40" emissiveIntensity={1.0} roughness={0.18} transmission={0.12} opacity={0.9} />
          </mesh>
          {[1.45, 1.9, 2.35].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.72, index * 0.48, index * 0.84]}>
              <torusGeometry args={[radius, 0.06, 8, 52]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#81706a" emissive="#6f4040" emissiveIntensity={0.42} roughness={0.28} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[4.2, 5.3, 6.4].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.35, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#8c6f69' : '#6d8690'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-4, -2, 0, 2, 4].map((z, index) => (
            <Line key={z} points={[[-5, -1.5, z], [0, 0, z * 0.2], [5, 1.5, z]]} color={index % 2 ? '#8a6a62' : '#6f8790'} lineWidth={1.15} transparent opacity={0.4} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function CradleExeModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const leftShell = useRef<THREE.Group>(null);
  const rightShell = useRef<THREE.Group>(null);
  const children = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const lullabyWaves = useMemo(() => Array.from({ length: 6 }, (_, wave) => Array.from({ length: 72 }, (_, index) => {
    const t = index / 71;
    const angle = t * Math.PI * 2;
    const radius = 2.8 + wave * 0.7;
    return [Math.cos(angle) * radius, -1.5 + Math.sin(angle * 2 + wave) * 0.32, Math.sin(angle) * radius] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const hatch = props.animation.name === 'Eternally Hatching Bloom';
    const opening = 0.34 + Math.abs(Math.sin(t * (hatch ? 1.8 : 0.7))) * (hatch ? 0.42 : 0.12);
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.5) * 0.1;
      root.current.rotation.y = Math.sin(t * 0.22) * 0.1;
    }
    if (leftShell.current) leftShell.current.rotation.z = opening;
    if (rightShell.current) rightShell.current.rotation.z = -opening;
    if (children.current) {
      children.current.children.forEach((child, index) => {
        child.visible = Math.sin(t * 3.2 + index * 1.3) > -0.55;
        child.position.y = -0.6 + Math.sin(t * 0.9 + index) * 0.25;
      });
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * 1.7) * 0.07;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} position={[0, -0.2, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <group ref={leftShell} position={[-1.05, 0, 0]} rotation={[0, 0, 0.34]}>
            <mesh scale={[1.55, 2.65, 1.75]}>
              <sphereGeometry args={[1, 36, 24]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#d6d4e0" emissive="#8b78a4" emissiveIntensity={0.38} roughness={0.2} transmission={0.3} opacity={0.78} />
            </mesh>
          </group>
          <group ref={rightShell} position={[1.05, 0, 0]} rotation={[0, 0, -0.34]}>
            <mesh scale={[1.55, 2.65, 1.75]}>
              <sphereGeometry args={[1, 36, 24]} />
              <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#c6c3d2" emissive="#75648d" emissiveIntensity={0.34} roughness={0.22} transmission={0.26} opacity={0.78} />
            </mesh>
          </group>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 1.2, 0, 0]}>
              {[-1.4, -0.7, 0, 0.7, 1.4].map((y, index) => (
                <mesh key={y} position={[side * 0.42, y, 1.45]} rotation={[0, 0, side * 0.35]} scale={[0.1, 0.55 + index * 0.05, 0.12]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#8d819a" emissive="#645078" emissiveIntensity={0.28} roughness={0.38} metalness={0.22} />
                </mesh>
              ))}
            </group>
          ))}
          <group ref={children}>
            {Array.from({ length: 7 }, (_, index) => {
              const angle = (index / 7) * Math.PI * 2;
              return (
                <group key={index} position={[Math.cos(angle) * 1.65, -0.6, Math.sin(angle) * 1.65]}>
                  <mesh position={[0, 0.65, 0]}>
                    <sphereGeometry args={[0.28, 16, 10]} />
                    <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#f0eaf2" emissive="#b9a2ca" emissiveIntensity={0.42} roughness={0.18} transmission={0.36} opacity={0.72} />
                  </mesh>
                  <mesh scale={[0.28, 0.72, 0.28]}>
                    <capsuleGeometry args={[0.34, 0.8, 6, 12]} />
                    <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#ded5e3" emissive="#9d86ae" emissiveIntensity={0.34} roughness={0.2} transmission={0.3} opacity={0.7} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 1.05, 0, 0]}>
              {[-1.8, -0.9, 0, 0.9, 1.8].map((y, index) => (
                <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, index * 0.28, 0]}>
                  <torusGeometry args={[1.45 - Math.abs(index - 2) * 0.12, 0.075, 8, 34, Math.PI * 1.45]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#978d9f" roughness={0.4} wireframe />
                </mesh>
              ))}
            </group>
          ))}
          <Line points={[[-1.2, -2.4, 0], [0, 0, 0], [1.2, -2.4, 0]]} color="#968b9d" lineWidth={2.2} transparent opacity={0.64} />
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.15, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#866b9b" emissive="#b774d2" emissiveIntensity={1.1} roughness={0.14} transmission={0.26} opacity={0.86} />
          </mesh>
          {[1.55, 2.0, 2.45].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.78, index * 0.5, index * 0.9]}>
              <torusGeometry args={[radius, 0.06, 8, 54]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9d85ab" emissive="#754b8c" emissiveIntensity={0.48} roughness={0.24} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {lullabyWaves.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#c2a6ce' : '#846f96'} lineWidth={1.2} transparent opacity={0.46 - index * 0.045} />
          ))}
          <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[6.2, 64]} />
            <meshBasicMaterial color={props.silhouette ? '#000000' : '#756589'} transparent opacity={0.12} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
          </mesh>
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function FoldhowlModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const limbs = useRef<THREE.Group>(null);
  const ghosts = useRef<THREE.Group>(null);
  const jaw = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const staticPositions = useMemo(() => {
    const positions = new Float32Array(340 * 3);
    for (let index = 0; index < 340; index += 1) {
      const t = (index % 85) / 84;
      const angle = index * 1.73;
      positions[index * 3] = -2.4 + t * 5.6 + Math.cos(angle) * 0.65;
      positions[index * 3 + 1] = 0.2 + Math.sin(angle * 1.3) * 1.2;
      positions[index * 3 + 2] = Math.sin(angle) * 1.3;
    }
    return positions;
  }, []);
  const tearLines = useMemo(() => Array.from({ length: 7 }, (_, line) => Array.from({ length: 48 }, (_, index) => {
    const t = index / 47;
    return [-5 + t * 10, -2.4 + line * 0.7, Math.sin(t * Math.PI * (4 + line * 0.2) + line) * (0.7 + line * 0.12)] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const surge = props.animation.name === 'Dislocation Surge Teleport';
    if (root.current) {
      root.current.position.x = Math.sin(t * (surge ? 5.4 : 0.8)) * (surge ? 0.22 : 0.08);
      root.current.position.y = Math.sin(t * 0.72) * 0.12;
      root.current.rotation.y = Math.sin(t * 0.28) * 0.12;
    }
    if (limbs.current) {
      limbs.current.children.forEach((child, index) => {
        child.rotation.z = (index % 2 ? -1 : 1) * (0.14 + Math.sin(t * (surge ? 3.5 : 1.2) + index) * 0.18);
        child.visible = Math.sin(t * 8 + index * 1.5) > -0.72;
      });
    }
    if (ghosts.current) {
      ghosts.current.children.forEach((child, index) => {
        child.position.x = (index ? -1 : 1) * (0.35 + Math.sin(t * 4 + index) * 0.12);
      });
    }
    if (jaw.current) jaw.current.rotation.x = 0.12 + Math.abs(Math.sin(t * 2.4)) * 0.25;
    if (core.current) {
      const pulse = 1 + Math.sin(t * (surge ? 5.2 : 1.8)) * (surge ? 0.17 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  const WolfShell = ({ opacity, offset }: { opacity: number; offset: number }) => (
    <group position={[offset, 0, 0]}>
      <mesh scale={[2.45, 1.1, 1.25]}><capsuleGeometry args={[0.72, 2.8, 10, 20]} /><PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#29303b" emissive="#36506d" emissiveIntensity={0.42} roughness={0.24} transmission={0.12} opacity={opacity} /></mesh>
      <mesh position={[2.55, 0.65, 0]} scale={[1.15, 0.9, 0.9]}><dodecahedronGeometry args={[1, 1]} /><StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#202733" emissive="#344e6b" emissiveIntensity={0.4} roughness={0.5} opacity={opacity} /></mesh>
    </group>
  );

  return (
    <group ref={root} position={[0, -0.25, 0]} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <WolfShell opacity={0.9} offset={0} />
          <group ref={ghosts}>
            <WolfShell opacity={0.18} offset={0.38} />
            <WolfShell opacity={0.14} offset={-0.38} />
          </group>
          <group ref={limbs}>
            {[-1.4, 1.35].flatMap((x) => [-1, 1].map((z) => (
              <group key={`${x}-${z}`} position={[x, -1.0, z * 0.72]}>
                <mesh rotation={[0, 0, x < 0 ? 0.28 : -0.28]}>
                  <cylinderGeometry args={[0.16, 0.26, 2.6, 8]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#202835" emissive="#365775" emissiveIntensity={0.36} roughness={0.48} metalness={0.16} />
                </mesh>
                <mesh position={[x < 0 ? -0.55 : 0.55, -1.15, 0]} rotation={[0, 0, x < 0 ? -0.85 : 0.85]}>
                  <cylinderGeometry args={[0.1, 0.17, 1.5, 7]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#2d3745" emissive="#416581" emissiveIntensity={0.34} roughness={0.42} />
                </mesh>
              </group>
            )))}
          </group>
          <group position={[2.85, 0.25, 0.35]} ref={jaw}>
            <mesh scale={[1.0, 0.38, 0.68]}>
              <boxGeometry args={[1.6, 0.7, 1.0]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#171d27" emissive="#2d4761" emissiveIntensity={0.38} roughness={0.5} />
            </mesh>
            {Array.from({ length: 6 }, (_, index) => (
              <mesh key={index} position={[-0.55 + index * 0.22, -0.34, 0.42]} rotation={[Math.PI, 0, 0]} scale={[0.08, 0.3, 0.1]}>
                <coneGeometry args={[1, 1, 5]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#a6bfd0" emissive="#5b91b2" emissiveIntensity={0.52} roughness={0.24} />
              </mesh>
            ))}
          </group>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[2.35, 1.75, side * 0.52]} rotation={[side * 0.15, 0, side * 0.2]} scale={[0.18, 0.72, 0.22]}>
              <coneGeometry args={[1, 1.5, 5]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#26313f" emissive="#3c5e79" emissiveIntensity={0.34} roughness={0.46} />
            </mesh>
          ))}
          <Line points={[[-2.4, 0.2, 0], [-4.2, 0.7, 0.4], [-5.5, 0.2, -0.3]]} color="#51718b" lineWidth={3} transparent opacity={0.7} />
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[staticPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#7e9db1" size={0.08} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.62} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <Line points={[[-2.5, 0, 0], [-1.2, 0.2, 0], [0, 0.1, 0], [1.3, 0.4, 0], [2.6, 0.7, 0]]} color="#778895" lineWidth={3} transparent opacity={0.68} />
          {[-1.5, -0.7, 0.1, 0.9, 1.7].map((x, index) => (
            <mesh key={x} position={[x, 0.15, 0]} rotation={[Math.PI / 2, index * 0.3, 0]}>
              <torusGeometry args={[0.82, 0.07, 8, 30, Math.PI * 1.45]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#748491" roughness={0.38} metalness={0.22} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <icosahedronGeometry args={[1.0, 3]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#34536c" emissive="#4c9ac7" emissiveIntensity={1.1} roughness={0.14} transmission={0.16} opacity={0.9} />
          </mesh>
          {[1.4, 1.85, 2.3].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.8, index * 0.52, index * 0.9]}>
              <torusGeometry args={[radius, 0.06, 8, 52]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#54778e" emissive="#365b76" emissiveIntensity={0.42} roughness={0.24} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {tearLines.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#5b7690' : '#2f485e'} lineWidth={1.2} transparent opacity={0.46} />
          ))}
          {[-4.5, -1.5, 1.5, 4.5].map((x, index) => (
            <mesh key={x} position={[x, -2.3, index % 2 ? 1.4 : -1.4]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.75, 1.1, 36]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#3d5c74'} transparent opacity={0.34} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
