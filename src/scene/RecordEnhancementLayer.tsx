import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clipArray, materialColor, useAnimationClock, type SpecimenModelProps } from './SpecimenCommon';
import { recordEnhancementSpecs, type EnhancementDetail } from './recordEnhancementData';

const kindOffsets: Record<EnhancementDetail['kind'], [number, number, number]> = {
  crest: [0, 1.25, -0.3],
  ribs: [0, 0.1, 0],
  plates: [0, 0.15, 0],
  nodes: [0, 0.75, 0],
  rings: [0, 0.4, 0],
  fins: [0, 0.4, 0],
  pylons: [0, -1.8, 0],
  tendrils: [0, 0.9, -0.15],
  sacs: [0, -0.3, 0],
  jaws: [0, 0.15, 2],
  veils: [0, 0.45, 0],
  glyphs: [0, 1.1, 0],
};

function accentFor(archetype: string) {
  if (archetype.includes('Atmos-Engine')) return ['#b8ecff', '#ff8b58'];
  if (archetype.includes('Crust-Binder')) return ['#403832', '#ff7138'];
  if (archetype.includes('Seedcarrier')) return ['#638551', '#b4f18b'];
  if (archetype.includes('Fluxborne')) return ['#356d88', '#80ddff'];
  if (archetype.includes('Orbital-Wyrm')) return ['#9098aa', '#ffe084'];
  if (archetype.includes('Civiformer')) return ['#63383e', '#ff7568'];
  if (archetype.includes('Noosphere')) return ['#9c91b6', '#d3b9ff'];
  if (archetype.includes('Glitch-Touched')) return ['#4f485a', '#ff5f8d'];
  if (archetype.includes('Origin')) return ['#5b9184', '#abffdf'];
  return ['#758894', '#b8efff'];
}

function DetailMaterial({ detail, props, accent, transparent = false }: { detail: EnhancementDetail; props: SpecimenModelProps; accent: string; transparent?: boolean }) {
  const clippingPlanes = clipArray(props.clipPlane);
  return (
    <meshStandardMaterial
      color={materialColor(accent, props.silhouette)}
      emissive={props.silhouette ? '#000000' : accent}
      emissiveIntensity={props.silhouette ? 0 : detail.layer === 'functional' ? 0.72 : 0.3}
      roughness={transparent ? 0.26 : 0.48}
      metalness={detail.kind === 'plates' || detail.kind === 'pylons' ? 0.42 : 0.14}
      transparent={transparent}
      opacity={transparent ? 0.7 : 1}
      wireframe={props.wireframe}
      clippingPlanes={clippingPlanes}
      side={THREE.DoubleSide}
    />
  );
}

function DetailGeometry({ detail, props, accent, seed }: { detail: EnhancementDetail; props: SpecimenModelProps; accent: string; seed: number }) {
  const material = (transparent = false) => <DetailMaterial detail={detail} props={props} accent={accent} transparent={transparent} />;
  const indices = Array.from({ length: 8 }, (_, index) => index);
  const jitter = (index: number) => ((seed + index * 17) % 13) / 50;

  switch (detail.kind) {
    case 'crest':
      return <group>{indices.slice(0, 6).map((index) => <mesh key={index} position={[(index % 2 ? 1 : -1) * (0.4 + index * 0.12), 0.12 + index * 0.23, -1.25 + index * 0.48]} rotation={[0.15 + jitter(index), index * 0.42, index % 2 ? -0.46 : 0.46]}><coneGeometry args={[0.25 + jitter(index), 1.15 + index * 0.13, 5]} />{material()}</mesh>)}</group>;
    case 'ribs':
      return <group>{indices.slice(0, 6).map((index) => <mesh key={index} position={[0, -0.82 + index * 0.34, -1.15 + index * 0.46]} rotation={[Math.PI / 2, 0.1 * index, 0]} scale={[1 + index * 0.07, 0.72, 1]}><torusGeometry args={[1.5, 0.11 + jitter(index) * 0.2, 10, 40, Math.PI * 1.55]} />{material()}</mesh>)}</group>;
    case 'plates':
      return <group>{indices.slice(0, 7).map((index) => <mesh key={index} position={[(index % 2 ? 1 : -1) * (0.8 + jitter(index)), -0.5 + (index % 3) * 0.55, -1.5 + index * 0.48]} rotation={[0.12 * (index % 3), 0.25 * index, index % 2 ? 0.3 : -0.3]} scale={[0.68 + jitter(index), 0.2, 1.02]}><dodecahedronGeometry args={[1, 0]} />{material()}</mesh>)}</group>;
    case 'nodes':
      return <group>{indices.slice(0, 7).map((index) => { const angle = index / 7 * Math.PI * 2; return <mesh key={index} position={[Math.cos(angle) * (1.85 + jitter(index)), Math.sin(index * 1.8) * 0.38, Math.sin(angle) * (1.85 + jitter(index))]} rotation={[angle, angle * 0.6, angle * 0.25]}><octahedronGeometry args={[0.3 + jitter(index), 0]} />{material(detail.layer === 'functional')}</mesh>; })}</group>;
    case 'rings':
      return <group>{indices.slice(0, 5).map((index) => <mesh key={index} rotation={[index * 0.47, index * 0.3, index * 0.21]} scale={0.72 + index * 0.25}><torusGeometry args={[1.22, 0.07 + (index % 2) * 0.04, 10, 52]} />{material(true)}</mesh>)}</group>;
    case 'fins':
      return <group>{[-1, 1].map((side) => <group key={side} position={[side * 1.3, 0, 0]} rotation={[0, side * 0.22, side * -0.34]}>{indices.slice(0, 4).map((index) => <mesh key={index} position={[side * index * 0.4, 0.25 - index * 0.22, -0.55 + index * 0.45]} rotation={[0.08 * index, side * 0.2, side * 0.2]} scale={[1.1 + index * 0.24, 0.12, 0.72]}><coneGeometry args={[0.82, 2.1, 4]} />{material(true)}</mesh>)}</group>)}</group>;
    case 'pylons':
      return <group>{indices.slice(0, 6).map((index) => { const angle = index / 6 * Math.PI * 2; return <mesh key={index} position={[Math.cos(angle) * 2, 0, Math.sin(angle) * 2]} rotation={[0, -angle, index % 2 ? 0.15 : -0.15]} scale={[0.48, 1.35 + (index % 3) * 0.25, 0.48]}><cylinderGeometry args={[0.65, 0.92, 2.25, 6]} />{material()}</mesh>; })}</group>;
    case 'tendrils':
      return <group>{indices.map((index) => { const angle = index / 8 * Math.PI * 2; return <mesh key={index} position={[Math.cos(angle) * 1.12, 0.65, Math.sin(angle) * 1.12]} rotation={[-0.8, -angle, 0.28 * Math.sin(index)]} scale={[0.18, 1.15 + (index % 3) * 0.32, 0.18]}><cylinderGeometry args={[0.55, 0.2, 2.15, 7]} />{material()}</mesh>; })}</group>;
    case 'sacs':
      return <group>{indices.slice(0, 5).map((index) => <mesh key={index} position={[-1.35 + index * 0.68, -0.35 + (index % 2) * 0.56, -0.45 + (index % 3) * 0.42]} scale={[0.58 + jitter(index), 0.95 + (index % 2) * 0.28, 0.58 + jitter(index)]}><sphereGeometry args={[0.8, 22, 18]} />{material(true)}</mesh>)}</group>;
    case 'jaws':
      return <group>{[-1, 1].map((side) => <group key={side} position={[side * 0.72, 0, 0]} rotation={[0, side * -0.25, side * 0.12]}><mesh scale={[0.52, 0.68, 1.42]}><boxGeometry args={[1, 1, 1]} />{material()}</mesh>{indices.slice(0, 5).map((index) => <mesh key={index} position={[side * -0.34, -0.5 + index * 0.24, 0.55 + index * 0.28]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.11, 0.52, 5]} />{material()}</mesh>)}</group>)}</group>;
    case 'veils':
      return <group>{indices.slice(0, 6).map((index) => <mesh key={index} position={[-1.55 + index * 0.62, Math.sin(index) * 0.18, -0.55 + (index % 2) * 0.85]} rotation={[0.16 * index, 0.31 * index, -0.18 + index * 0.07]} scale={[0.72, 1.5 + (index % 2) * 0.48, 1]}><planeGeometry args={[1, 1, 3, 4]} />{material(true)}</mesh>)}</group>;
    case 'glyphs':
      return <group><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.78, 0.075, 8, 64]} />{material(true)}</mesh>{indices.map((index) => { const angle = index / 8 * Math.PI * 2; return <mesh key={index} position={[Math.cos(angle) * 1.78, Math.sin(index * 2.1) * 0.28, Math.sin(angle) * 1.78]} rotation={[0, -angle, index % 2 ? 0.2 : -0.2]} scale={[0.08 + (index % 3) * 0.035, 0.52 + (index % 2) * 0.28, 0.08]}><boxGeometry args={[1, 1, 1]} />{material()}</mesh>; })}</group>;
    default:
      return null;
  }
}

export function RecordEnhancementLayer(props: SpecimenModelProps) {
  const spec = recordEnhancementSpecs[props.record.id];
  const primaryRef = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const seed = useMemo(() => [...props.record.id].reduce((sum, char) => sum + char.charCodeAt(0), 0), [props.record.id]);
  const [baseColor, accent] = accentFor(props.record.archetype);

  useFrame(() => {
    if (!spec) return;
    const time = elapsed.current;
    if (primaryRef.current) {
      primaryRef.current.rotation.y = Math.sin(time * (0.3 + (seed % 7) * 0.025)) * 0.11;
      primaryRef.current.position.y = kindOffsets[spec.primary.kind][1] + Math.sin(time * 0.7 + seed) * 0.045;
    }
    if (secondaryRef.current) {
      secondaryRef.current.rotation.z = Math.sin(time * (0.4 + (seed % 5) * 0.035)) * 0.1;
      secondaryRef.current.scale.setScalar(0.9 + Math.sin(time * 1.1 + seed * 0.2) * 0.025);
    }
  });

  if (!spec) return null;
  const primaryPosition = kindOffsets[spec.primary.kind];
  const secondaryPosition = kindOffsets[spec.secondary.kind];

  return (
    <group
      onPointerDown={(event) => {
        if (!props.measurementMode) return;
        event.stopPropagation();
        props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
      }}
      userData={{ enhancementBasis: spec.basis, primary: spec.primary.label, secondary: spec.secondary.label }}
    >
      {props.layers[spec.primary.layer] && (
        <group ref={primaryRef} position={primaryPosition} name={`enhancement-${props.record.id}-primary`} userData={{ label: spec.primary.label }}>
          <DetailGeometry detail={spec.primary} props={props} accent={baseColor} seed={seed} />
        </group>
      )}
      {props.layers[spec.secondary.layer] && (
        <group ref={secondaryRef} position={secondaryPosition} scale={0.9} name={`enhancement-${props.record.id}-secondary`} userData={{ label: spec.secondary.label }}>
          <DetailGeometry detail={spec.secondary} props={props} accent={accent} seed={seed + 29} />
        </group>
      )}
    </group>
  );
}
