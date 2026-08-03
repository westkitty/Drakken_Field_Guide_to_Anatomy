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

class UmbrakraelCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

    getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 2.5) * 0.88,
      Math.cos(t * Math.PI * 3.8) * 0.4,
      (t - 0.5) * 11,
    );
  }
}

export function PhantomOccluderModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const shadowShell = useRef<THREE.Mesh>(null);
  const staticGroup = useRef<THREE.Group>(null);
  const nullCore = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new UmbrakraelCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 136, 0.62, 12, false), [curve]);
  const shellGeometry = useMemo(() => new THREE.TubeGeometry(curve, 136, 1.05, 10, false), [curve]);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 112, 0.14, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 15 }, (_, index) => curve.getPoint((index + 0.5) / 15)), [curve]);
  const blindfield = useMemo(() => Array.from({ length: 5 }, (_, field) => Array.from({ length: 72 }, (_, index) => {
    const t = index / 71;
    const angle = t * Math.PI * 2;
    const radius = 3.0 + field * 0.9;
    return [Math.cos(angle) * radius, Math.sin(angle * 2 + field) * 0.55, Math.sin(angle) * radius] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const unfurl = props.animation.name === 'Solar Eclipse Unfurl';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.3) * 0.24;
      root.current.position.y = Math.sin(t * 0.55) * 0.14;
    }
    if (shadowShell.current) {
      const shimmer = 1 + Math.sin(t * (unfurl ? 4.8 : 2.1)) * (unfurl ? 0.08 : 0.03);
      shadowShell.current.scale.setScalar(shimmer);
    }
    if (staticGroup.current) {
      staticGroup.current.children.forEach((child, index) => {
        child.visible = Math.sin(t * 7 + index * 1.7) > -0.25;
      });
    }
    if (nullCore.current) {
      const pulse = 1 + Math.sin(t * 1.9) * 0.05;
      nullCore.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#030405" emissive="#09070f" emissiveIntensity={0.15} roughness={0.92} metalness={0.08} opacity={0.98} />
          </mesh>
          <mesh ref={shadowShell} geometry={shellGeometry}>
            <meshBasicMaterial color="#05020a" transparent opacity={props.silhouette ? 1 : 0.18} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} wireframe={props.wireframe} />
          </mesh>
          <group ref={staticGroup}>
            {stations.map((point, index) => (
              <mesh key={index} position={[point.x + Math.sin(index) * 0.72, point.y + Math.cos(index * 1.3) * 0.5, point.z]} rotation={[index * 0.2, index * 0.48, index * 0.14]} scale={[0.08 + (index % 3) * 0.05, 0.52 + (index % 4) * 0.13, 0.08]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={props.silhouette ? '#000000' : index % 2 ? '#7a6a91' : '#b9acc8'} transparent opacity={0.52} clippingPlanes={clippingPlanes} />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <mesh geometry={spineGeometry}>
          <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#2a2730" emissive="#14111c" emissiveIntensity={0.24} roughness={0.5} metalness={0.28} wireframe />
        </mesh>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={nullCore}>
            <sphereGeometry args={[1.15, 32, 22]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.98} clippingPlanes={clippingPlanes} />
          </mesh>
          {[1.55, 2.05, 2.55].map((radius, index) => (
            <mesh key={radius} rotation={[index * 0.74, index * 0.46, index * 0.83]}>
              <torusGeometry args={[radius, 0.055, 8, 54]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#5f536f'} transparent opacity={0.4 - index * 0.08} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {blindfield.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#17131e' : '#493e57'} lineWidth={1.3} transparent opacity={0.42 - index * 0.05} />
          ))}
          {[4.2, 5.8, 7.4].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.4, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#28202f'} transparent opacity={0.28 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

class CindervergeCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

    getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      Math.sin(t * Math.PI * 3.0) * 0.76,
      Math.sin(t * Math.PI * 4.4) * 0.34,
      (t - 0.5) * 11.4,
    );
  }
}

export function BurnlineReaperModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const ash = useRef<THREE.Points>(null);
  const plates = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const curve = useMemo(() => new CindervergeCurve(), []);
  const spineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 126, 0.16, 8, false), [curve]);
  const stations = useMemo(() => Array.from({ length: 15 }, (_, index) => curve.getPoint((index + 0.5) / 15)), [curve]);
  const front = useMemo(() => curve.getPoint(1), [curve]);
  const ashPositions = useMemo(() => {
    const positions = new Float32Array(420 * 3);
    for (let index = 0; index < 420; index += 1) {
      const t = (index % 140) / 139;
      const point = curve.getPoint(t);
      const angle = index * 2.17;
      const radius = 0.5 + (index % 22) * 0.11;
      positions[index * 3] = point.x + Math.cos(angle) * radius;
      positions[index * 3 + 1] = point.y + Math.sin(angle * 1.5) * radius * 0.65;
      positions[index * 3 + 2] = point.z - (index % 5) * 0.22;
    }
    return positions;
  }, [curve]);
  const ashVeils = useMemo(() => Array.from({ length: 7 }, (_, veil) => Array.from({ length: 72 }, (_, index) => {
    const t = index / 71;
    const point = curve.getPoint(t);
    return [point.x + Math.sin(t * Math.PI * 5 + veil) * (0.7 + veil * 0.15), point.y - veil * 0.12, point.z - t * veil * 0.38] as [number, number, number];
  })), [curve]);

  useFrame(() => {
    const t = elapsed.current;
    const scour = props.animation.name === 'Solar Laser Beam Sweep';
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.34) * 0.24;
      root.current.rotation.z = Math.sin(t * 0.52) * 0.07;
      root.current.position.y = Math.sin(t * 0.62) * 0.16;
    }
    if (ash.current) ash.current.rotation.z = -t * 0.04;
    if (plates.current) {
      plates.current.children.forEach((child, index) => {
        const pulse = 1 + Math.sin(t * 2.2 + index * 0.6) * 0.06;
        child.scale.setScalar(pulse);
      });
    }
    if (mouth.current) {
      const pulse = 1 + Math.sin(t * (scour ? 5.1 : 1.8)) * (scour ? 0.18 : 0.06);
      mouth.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <group ref={plates}>
            {stations.map((point, index) => (
              <group key={index} position={[point.x, point.y, point.z]}>
                <mesh scale={[0.82 + (index % 3) * 0.12, 0.48, 0.9]} rotation={[index * 0.15, index * 0.38, index * 0.1]}>
                  <dodecahedronGeometry args={[1, 0]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#2f2b29' : '#1d1a19'} emissive="#4b251d" emissiveIntensity={0.3} roughness={0.8} metalness={0.22} opacity={0.9} />
                </mesh>
                <mesh position={[0, 0.68, 0]} rotation={[0, index * 0.34, 0]} scale={[0.17, 0.72, 0.17]}>
                  <coneGeometry args={[1, 1.6, 5]} />
                  <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#4a433f" emissive="#6b2b1c" emissiveIntensity={0.34} roughness={0.54} metalness={0.28} />
                </mesh>
              </group>
            ))}
          </group>
          <mesh ref={mouth} position={[front.x, front.y, front.z + 0.45]}>
            <sphereGeometry args={[0.9, 28, 18]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#2b1712" emissive="#b34d28" emissiveIntensity={1.3} roughness={0.18} opacity={0.88} />
          </mesh>
          {ashVeils.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#6c625c' : '#3d3734'} lineWidth={1.5} transparent opacity={0.42} />
          ))}
          <points ref={ash}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ashPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#77706a" size={0.11} sizeAttenuation transparent opacity={props.silhouette ? 0 : 0.62} clippingPlanes={clippingPlanes} />
          </points>
        </group>
      )}
      {props.layers.structure && (
        <group>
          <mesh geometry={spineGeometry}>
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#77716d" metalness={0.34} roughness={0.46} wireframe />
          </mesh>
          {stations.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} rotation={[Math.PI / 2, index * 0.3, 0]}>
              <torusGeometry args={[0.78 + (index % 2) * 0.12, 0.075, 8, 28, Math.PI * 1.45]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#6f6965" roughness={0.46} wireframe />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          {stations.slice(2, 12).map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]} scale={[0.34, 0.28, 0.46]}>
              <sphereGeometry args={[1, 18, 12]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#5c2f22" emissive="#9b4329" emissiveIntensity={0.58} roughness={0.2} />
            </mesh>
          ))}
          <mesh position={[0, 0, 1]}>
            <icosahedronGeometry args={[0.86, 2]} />
            <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#7b3725" emissive="#bd542e" emissiveIntensity={0.95} roughness={0.16} />
          </mesh>
        </group>
      )}
      {props.layers.functional && (
        <group>
          {[3.4, 4.8, 6.2].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.38, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#5d5049'} transparent opacity={0.28 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
          {[-4, -2, 0, 2, 4].map((x, index) => (
            <Line key={x} points={[[x, 3.8, -7], [x * 0.6, 0, 0], [x, -3.8, 7]]} color={index % 2 ? '#675951' : '#9b6d58'} lineWidth={1.2} transparent opacity={0.4} />
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}

export function DataCoreUnbinderModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group>(null);
  const outerShell = useRef<THREE.Group>(null);
  const glyphs = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);
  const glyphData = useMemo(() => Array.from({ length: 32 }, (_, index) => {
    const phi = Math.acos(1 - 2 * (index + 0.5) / 32);
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    const radius = 3.1 + (index % 4) * 0.28;
    return {
      position: [Math.cos(theta) * Math.sin(phi) * radius, Math.cos(phi) * radius, Math.sin(theta) * Math.sin(phi) * radius] as [number, number, number],
      rotation: [phi, theta, index * 0.31] as [number, number, number],
      scale: [0.12 + (index % 3) * 0.05, 0.65 + (index % 5) * 0.12, 0.08] as [number, number, number],
    };
  }), []);
  const spirals = useMemo(() => Array.from({ length: 6 }, (_, spiral) => Array.from({ length: 96 }, (_, index) => {
    const t = index / 95;
    const angle = t * Math.PI * (6 + spiral * 0.4) + spiral;
    const radius = 0.45 + t * (3.8 + spiral * 0.18);
    return [Math.cos(angle) * radius, (t - 0.5) * (5.2 - spiral * 0.3), Math.sin(angle) * radius] as [number, number, number];
  })), []);

  useFrame(() => {
    const t = elapsed.current;
    const unbind = props.animation.name === 'Barcode Unbind Pulse';
    if (root.current) {
      root.current.rotation.y = t * 0.06;
      root.current.position.y = Math.sin(t * 0.5) * 0.14;
    }
    if (outerShell.current) {
      outerShell.current.rotation.x = t * (unbind ? 0.34 : 0.12);
      outerShell.current.rotation.z = -t * (unbind ? 0.28 : 0.09);
    }
    if (glyphs.current) {
      glyphs.current.rotation.y = -t * (unbind ? 0.5 : 0.16);
      glyphs.current.children.forEach((child, index) => {
        child.visible = Math.sin(t * 6.5 + index * 0.9) > -0.7;
      });
    }
    if (core.current) {
      const pulse = 1 + Math.sin(t * (unbind ? 4.8 : 1.8)) * (unbind ? 0.17 : 0.05);
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={root} onPointerDown={measurementHandler(props)}>
      {props.layers.surface && (
        <group>
          <group ref={outerShell}>
            {[2.65, 3.15, 3.65].map((radius, index) => (
              <mesh key={radius} rotation={[index * 0.72, index * 0.45, index * 0.84]}>
                <icosahedronGeometry args={[radius, index === 0 ? 2 : 1]} />
                <meshPhysicalMaterial
                  color={materialColor(index % 2 ? '#b6a4c8' : '#d7cce3', props.silhouette)}
                  emissive={props.silhouette ? '#000000' : index % 2 ? '#6f4d8a' : '#8a6ca5'}
                  emissiveIntensity={props.silhouette ? 0 : 0.52}
                  roughness={0.14}
                  transmission={props.silhouette ? 0 : 0.4}
                  transparent
                  opacity={props.silhouette ? 1 : 0.18 + index * 0.08}
                  wireframe
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            ))}
          </group>
          <group ref={glyphs}>
            {glyphData.map((glyph, index) => (
              <mesh key={index} position={glyph.position} rotation={glyph.rotation} scale={glyph.scale}>
                <boxGeometry args={[1, 1, 1]} />
                <StandardMaterial model={props} clippingPlanes={clippingPlanes} color={index % 2 ? '#e6d9ef' : '#8f70aa'} emissive={index % 2 ? '#a67bbb' : '#65437c'} emissiveIntensity={0.72} roughness={0.2} metalness={0.24} opacity={0.78} />
              </mesh>
            ))}
          </group>
        </group>
      )}
      {props.layers.structure && (
        <group>
          {[0, 1, 2, 3].map((index) => (
            <mesh key={index} rotation={[index * 0.78, index * 0.48, index * 0.91]}>
              <torusGeometry args={[1.8 + index * 0.48, 0.08, 8, 64]} />
              <StandardMaterial model={props} clippingPlanes={clippingPlanes} color="#9582a6" emissive="#624575" emissiveIntensity={0.45} roughness={0.28} metalness={0.4} wireframe />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <Line key={side} points={[[side * 4.2, -4.2, -4.2], [0, 0, 0], [side * 4.2, 4.2, 4.2]]} color="#9f83b4" lineWidth={1.4} transparent opacity={0.5} />
          ))}
        </group>
      )}
      {props.layers.internal && (
        <group>
          <mesh ref={core}>
            <dodecahedronGeometry args={[1.25, 2]} />
            <PhysicalMaterial model={props} clippingPlanes={clippingPlanes} color="#16101d" emissive="#7d4a9d" emissiveIntensity={1.1} roughness={0.12} transmission={0.18} opacity={0.92} />
          </mesh>
          {[0, 1, 2].map((index) => (
            <mesh key={index} rotation={[index * 0.9, index * 0.62, index * 0.74]}>
              <boxGeometry args={[2.4 + index * 0.5, 0.08, 2.4 + index * 0.5]} />
              <meshStandardMaterial color={materialColor('#c9b8d6', props.silhouette)} emissive={props.silhouette ? '#000000' : '#75548d'} emissiveIntensity={props.silhouette ? 0 : 0.55} metalness={0.72} roughness={0.12} transparent opacity={props.silhouette ? 1 : 0.44} wireframe={props.wireframe} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      {props.layers.functional && (
        <group>
          {spirals.map((points, index) => (
            <Line key={index} points={points} color={index % 2 ? '#c6a8d8' : '#76548d'} lineWidth={1.3} transparent opacity={0.48 - index * 0.04} />
          ))}
          {[4.2, 5.6, 7.0].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / 2, index * 0.37, 0]}>
              <torusGeometry args={[radius, 0.035, 8, 96]} />
              <meshBasicMaterial color={props.silhouette ? '#000000' : '#75518d'} transparent opacity={0.3 - index * 0.06} clippingPlanes={clippingPlanes} />
            </mesh>
          ))}
        </group>
      )}
      <Markers {...props} />
    </group>
  );
}
