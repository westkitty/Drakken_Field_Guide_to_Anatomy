import { Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import {
  materialColor,
  clipArray,
  useAnimationClock,
  type SpecimenModelProps,
} from './SpecimenCommon';

export function AnnotationMarkers({
  record,
  layers,
  selectedAnnotationId,
  onSelectAnnotation,
}: Pick<
  SpecimenModelProps,
  'record' | 'layers' | 'selectedAnnotationId' | 'onSelectAnnotation'
>) {
  return (
    <>
      {record.annotations.map((annotation) => {
        if (!layers[annotation.layer]) return null;
        const active = selectedAnnotationId === annotation.id;
        return (
          <Html
            key={annotation.id}
            position={annotation.position}
            center
            distanceFactor={11}
            zIndexRange={[20, 0]}
          >
            <button
              type="button"
              className={`scene-marker ${active ? 'is-active' : ''}`}
              aria-label={`Open annotation: ${annotation.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectAnnotation(annotation.id);
              }}
            >
              <span className="marker-dot" aria-hidden="true" />
              <span className="marker-ping" aria-hidden="true" />
            </button>
          </Html>
        );
      })}
    </>
  );
}

// Custom Asymmetrical Infinity / Double-Loop Spline for Skymourn (Atmos-Engine Ribbon)
class SkymournMainCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const theta = t * Math.PI * 2;
    // Asymmetric vertical double loop with ribbonlike twist
    const x = 3.6 * Math.sin(theta * 2) * (1 + 0.15 * Math.cos(theta * 3));
    const y = 5.6 * Math.cos(theta) + 0.8 * Math.sin(theta * 2);
    const z = 1.4 * Math.cos(theta * 2) + 0.65 * Math.sin(theta * 4);
    return target.set(x, y, z);
  }
}

// Opposed Inner Thermal Circulation Vector Curve
class SkymournCoreCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const theta = t * Math.PI * 2;
    const x = 3.2 * Math.sin(theta * 2 + 0.4);
    const y = 5.2 * Math.cos(theta + 0.2);
    const z = 1.1 * Math.cos(theta * 2 - 0.3);
    return target.set(x, y, z);
  }
}

function SkymournModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group | null>(null);
  const frostMesh = useRef<THREE.Mesh | null>(null);
  const heatMesh = useRef<THREE.Mesh | null>(null);
  const coreMesh = useRef<THREE.Mesh | null>(null);
  const faceGroup = useRef<THREE.Group | null>(null);
  const laceGroup = useRef<THREE.Group | null>(null);
  const frostParticlesRef = useRef<THREE.Points | null>(null);

  const elapsed = useAnimationClock(props.animation);
  const curve = useMemo(() => new SkymournMainCurve(), []);
  const coreCurve = useMemo(() => new SkymournCoreCurve(), []);

  // Main Ribbon Body Geometry: Translucent Frost Shell
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 240, 0.78, 16, true), [curve]);
  const secondaryRibbonGeometry = useMemo(() => new THREE.TubeGeometry(curve, 240, 0.42, 10, true), [curve]);
  const coreGeometry = useMemo(() => new THREE.TubeGeometry(coreCurve, 200, 0.32, 12, true), [coreCurve]);

  // Crystalline spine spikes along the ribbon loop
  const spineSpikes = useMemo(() => {
    const items: Array<{ pos: [number, number, number]; rot: [number, number, number]; scale: number }> = [];
    for (let i = 0; i < 48; i++) {
      const t = i / 48;
      const pt = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const rotX = Math.atan2(tangent.y, tangent.z);
      const rotY = Math.atan2(tangent.x, tangent.z);
      items.push({
        pos: [pt.x + (Math.sin(i * 3.7) * 0.15), pt.y + (Math.cos(i * 2.3) * 0.15), pt.z + (Math.sin(i * 1.9) * 0.15)],
        rot: [rotX + Math.sin(i), rotY, Math.cos(i * 2)],
        scale: 0.25 + Math.sin(i * 1.8) * 0.18,
      });
    }
    return items;
  }, [curve]);

  // Data-Lace Persistent Memory Threads
  const laceRings = useMemo(() => {
    const rings: Array<{ points: [number, number, number][]; color: string }> = [];
    for (let r = 0; r < 4; r++) {
      const points: [number, number, number][] = [];
      const radius = 3.5 + r * 1.2;
      const height = -1.5 - r * 1.4;
      for (let i = 0; i <= 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        points.push([
          Math.sin(a) * radius + (r % 2 === 0 ? -1.2 : 1.2),
          height + Math.sin(a * 3) * 0.4,
          Math.cos(a) * (radius * 0.7) + (r * 0.3),
        ]);
      }
      rings.push({
        points,
        color: r % 2 === 0 ? '#7ed6f8' : '#8a85b6',
      });
    }
    return rings;
  }, []);

  // Sublimation Frost / Steam Particle Cloud
  const frostParticles = useMemo(() => {
    const count = 280;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const coldColor = new THREE.Color('#d8f2ff');
    const emberColor = new THREE.Color('#e05a2b');

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const p = curve.getPoint(t);
      const spread = 0.9 + (i % 9) * 0.12;
      positions[i * 3] = p.x + (Math.sin(i * 2.7) - 0.5) * spread;
      positions[i * 3 + 1] = p.y + (Math.cos(i * 1.9) - 0.5) * spread;
      positions[i * 3 + 2] = p.z + (Math.sin(i * 1.1) - 0.5) * spread;

      const c = i % 5 === 0 ? emberColor : coldColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [curve]);

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current || !frostMesh.current || !heatMesh.current || !coreMesh.current) return;

    const isRipple = props.animation.name === 'Thermal Ripple Burst';

    const driftSpeed = isRipple ? 0.45 : 0.22;
    root.current.rotation.y = Math.sin(t * driftSpeed) * 0.24;
    root.current.rotation.z = Math.sin(t * 0.35) * (isRipple ? 0.09 : 0.04);
    root.current.position.y = Math.sin(t * 0.48) * (isRipple ? 0.28 : 0.14);

    const frostPulse = isRipple ? 1 + Math.sin(t * 4.5) * 0.045 : 1 + Math.sin(t * 1.1) * 0.015;
    frostMesh.current.scale.setScalar(frostPulse);

    if (heatMesh.current) {
      heatMesh.current.scale.setScalar(1.02 + Math.cos(t * 2.2) * 0.025);
    }
    if (coreMesh.current) {
      coreMesh.current.rotation.y = -t * 0.15;
    }
    if (faceGroup.current) {
      faceGroup.current.position.y = 5.25 + Math.sin(t * 0.8) * 0.12;
      faceGroup.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }
    if (laceGroup.current) {
      laceGroup.current.rotation.y = t * 0.06;
    }
    if (frostParticlesRef.current) {
      frostParticlesRef.current.rotation.y = -t * 0.04;
    }
  });

  const clippingPlanes = clipArray(props.clipPlane);

  return (
    <group
      ref={root}
      onPointerDown={(event) => {
        if (!props.measurementMode) return;
        event.stopPropagation();
        props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
      }}
    >
      {/* SURFACE LAYER: Translucent Frost Shell, Blank Masklike Face, Crystalline Spikes */}
      {props.layers.surface && (
        <>
          {/* Main Translucent Frost Ribbon Shell */}
          <mesh ref={frostMesh} geometry={bodyGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={materialColor('#b9e1f8', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#2a5a78'}
              emissiveIntensity={props.silhouette ? 0 : 0.35}
              roughness={0.22}
              metalness={0.12}
              transmission={props.silhouette ? 0 : 0.45}
              transparent
              opacity={props.silhouette ? 1 : 0.84}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              clipShadows
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Blank Masklike Face (Unnerving Alabaster Featureless Mask) */}
          <group ref={faceGroup} position={[0, 5.25, 0.82]}>
            {/* Mask Skull Base */}
            <mesh scale={[1.05, 1.45, 0.48]} castShadow>
              <sphereGeometry args={[1, 48, 32]} />
              <meshPhysicalMaterial
                color={materialColor('#f0f5fa', props.silhouette)}
                roughness={0.55}
                metalness={0.05}
                transmission={props.silhouette ? 0 : 0.15}
                transparent
                opacity={0.92}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
                clipShadows
              />
            </mesh>
            {/* Blank Mask Faceplate - smooth unbroken porcelain surface */}
            <mesh position={[0, 0, 0.38]} scale={[0.88, 1.25, 0.18]}>
              <sphereGeometry args={[1, 32, 24]} />
              <meshStandardMaterial
                color={materialColor('#e4edf5', props.silhouette)}
                roughness={0.35}
                metalness={0.1}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
            {/* Subtle Cold Seam Lines on Mask (Facial Anatomy Absence) */}
            <Line
              points={[
                [0, 1.1, 0.45],
                [0, -1.1, 0.45],
              ]}
              color="#7ed6f8"
              lineWidth={1.5}
              transparent
              opacity={0.7}
            />
            <Line
              points={[
                [-0.6, 0.2, 0.42],
                [0.6, 0.2, 0.42],
              ]}
              color="#7ed6f8"
              lineWidth={1.2}
              transparent
              opacity={0.5}
            />
          </group>

          {/* Spine Crystalline Spikes */}
          {spineSpikes.map((spike, idx) => (
            <mesh
              key={idx}
              position={spike.pos}
              rotation={spike.rot}
              scale={spike.scale}
            >
              <octahedronGeometry args={[0.5, 0]} />
              <meshPhysicalMaterial
                color={materialColor('#d8f2ff', props.silhouette)}
                emissive={props.silhouette ? '#000000' : '#4a8ba8'}
                emissiveIntensity={0.4}
                transmission={0.5}
                transparent
                opacity={0.88}
                roughness={0.15}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}

          {/* Sublimation Frost/Steam Particles */}
          <points ref={frostParticlesRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[frostParticles.positions, 3]} />
              <bufferAttribute attach="attributes-color" args={[frostParticles.colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
              size={0.12}
              sizeAttenuation
              vertexColors
              transparent
              opacity={props.silhouette ? 0 : 0.75}
              clippingPlanes={clippingPlanes}
            />
          </points>
        </>
      )}

      {/* STRUCTURE LAYER: Reconstructed Load-Path & Cold Circulation Spine */}
      {props.layers.structure && (
        <mesh ref={secondaryRibbonGeometry ? heatMesh : undefined} geometry={secondaryRibbonGeometry}>
          <meshStandardMaterial
            color={materialColor('#4b7086', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#1c3e52'}
            emissiveIntensity={0.4}
            roughness={0.45}
            metalness={0.3}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* INTERNAL LAYER: Opposed Thermal Cores (Trapped Ember Heat vs Cold Circulation) */}
      {props.layers.internal && (
        <>
          {/* Opposed Internal Heat Conduit (Glowing Ember Magma Core beneath Frost) */}
          <mesh ref={coreMesh} geometry={coreGeometry}>
            <meshStandardMaterial
              color={materialColor('#e05a2b', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#c84418'}
              emissiveIntensity={1.8}
              roughness={0.3}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Sublimation Thermal Node A (Upper Frost-Heat Intersection) */}
          <mesh position={[-0.8, 1.2, 0.2]}>
            <icosahedronGeometry args={[1.35, 2]} />
            <meshPhysicalMaterial
              color={materialColor('#7ed6f8', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#2b88b0'}
              emissiveIntensity={1.2}
              transparent
              opacity={0.78}
              roughness={0.2}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          {/* Sublimation Thermal Node B (Lower Ember Heat Crucible) */}
          <mesh position={[0.85, -0.9, 0.1]}>
            <icosahedronGeometry args={[1.15, 2]} />
            <meshPhysicalMaterial
              color={materialColor('#e05a2b', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#9e2626'}
              emissiveIntensity={1.6}
              transparent
              opacity={0.82}
              roughness={0.25}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
        </>
      )}

      {/* FUNCTIONAL LAYER: Cold Data-Lace Memory Trails & Constellation Field */}
      {props.layers.functional && (
        <group ref={laceGroup}>
          {laceRings.map((ring, idx) => (
            <Line
              key={idx}
              points={ring.points}
              color={ring.color}
              lineWidth={1.5}
              transparent
              opacity={0.75}
            />
          ))}

          {/* Geometric Orbital Field Lines */}
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[5.2, 0.045, 8, 128]} />
            <meshBasicMaterial
              color={props.silhouette ? '#0a0b0d' : '#7ed6f8'}
              transparent
              opacity={props.silhouette ? 0 : 0.45}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
            <torusGeometry args={[4.8, 0.04, 8, 128]} />
            <meshBasicMaterial
              color={props.silhouette ? '#0a0b0d' : '#e05a2b'}
              transparent
              opacity={props.silhouette ? 0 : 0.4}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
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

function GorevaultModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group | null>(null);
  const maw = useRef<THREE.Mesh | null>(null);
  const reservoirs = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = clipArray(props.clipPlane);
  const ribs = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);

  const legs = useMemo(
    () => [
      [-3.4, -2.0, 2.6],
      [3.4, -2.0, 2.6],
      [-3.4, -2.0, -2.6],
      [3.4, -2.0, -2.6],
    ] as [number, number, number][],
    [],
  );

  const ashParticles = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = 2.5 + Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
  }, []);

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current || !maw.current || !reservoirs.current) return;
    const isIntake = props.animation.name === 'Crucible Maw Intake';

    root.current.position.x = isIntake ? 0 : Math.sin(t * 0.85) * 0.16;
    root.current.rotation.z = isIntake ? 0 : Math.sin(t * 0.85) * 0.02;
    maw.current.scale.z = isIntake ? 1 + Math.max(0, Math.sin(t * 2.8)) * 0.6 : 1;

    reservoirs.current.children.forEach((child, index) => {
      child.position.y = Math.sin(t * 1.2 + index) * 0.18;
      child.scale.y = 1 + Math.sin(t * 1.6 + index * 0.7) * 0.1;
    });

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.08;
    }
  });

  return (
    <group
      ref={root}
      scale={0.65}
      position={[0, 0.2, 0]}
      onPointerDown={(event) => {
        if (!props.measurementMode) return;
        event.stopPropagation();
        props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
      }}
    >
      {/* SURFACE LAYER: Vault Hull, Intake Maw, Biomechanical Claws, Reservoir Sacs */}
      {props.layers.surface && (
        <>
          {/* Main Vault Hull Crucible */}
          <mesh scale={[4.8, 3.6, 3.4]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 2]} />
            <meshStandardMaterial
              color={materialColor('#2a1417', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#420d12'}
              emissiveIntensity={0.38}
              roughness={0.78}
              metalness={0.3}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              clipShadows
            />
          </mesh>

          {/* Furnace Maw */}
          <mesh ref={maw} position={[0, 0.2, 3.6]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 2.5, 2.8, 32, 2, true]} />
            <meshStandardMaterial
              color={materialColor('#140608', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#9e1a1e'}
              emissiveIntensity={0.9}
              roughness={0.45}
              side={THREE.DoubleSide}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          {/* Processional Support Legs */}
          {legs.map((position, index) => (
            <group key={index} position={position}>
              <mesh rotation={[index < 2 ? -0.25 : 0.25, 0, index % 2 ? -0.18 : 0.18]}>
                <cylinderGeometry args={[0.65, 1.0, 4.6, 12]} />
                <meshStandardMaterial
                  color={materialColor('#242020', props.silhouette)}
                  roughness={0.8}
                  metalness={0.35}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
              <mesh position={[0, -2.4, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.75, 2.5, 10]} />
                <meshStandardMaterial
                  color={materialColor('#161718', props.silhouette)}
                  metalness={0.7}
                  roughness={0.3}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
          ))}

          {/* Hanging Fluid Biomass Reservoir Sacs */}
          <group ref={reservoirs}>
            {[-3.0, -1.5, 0, 1.5, 3.0].map((x, index) => (
              <mesh key={x} position={[x, -2.8, 0.3]} scale={[0.75, 1.4 + index * 0.04, 0.8]}>
                <sphereGeometry args={[1, 24, 18]} />
                <meshPhysicalMaterial
                  color={materialColor('#5c121c', props.silhouette)}
                  emissive={props.silhouette ? '#000000' : '#5e0a15'}
                  emissiveIntensity={0.4}
                  transmission={props.silhouette ? 0 : 0.2}
                  transparent
                  opacity={props.silhouette ? 1 : 0.86}
                  roughness={0.3}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            ))}
          </group>

          {/* Ash Vent Particles */}
          <points ref={particlesRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ashParticles, 3]} />
            </bufferGeometry>
            <pointsMaterial
              color="#e05a2b"
              size={0.1}
              sizeAttenuation
              transparent
              opacity={0.65}
              clippingPlanes={clippingPlanes}
            />
          </points>
        </>
      )}

      {/* STRUCTURE LAYER: Pressure Frame & Hardened Rib Armor */}
      {props.layers.structure && (
        <group rotation={[0, Math.PI / 2, 0]}>
          {ribs.map((rib) => (
            <mesh key={rib} position={[0, 0.1, -3.2 + rib * 0.9]}>
              <torusGeometry args={[3.9, 0.18, 8, 48, Math.PI * 1.55]} />
              <meshStandardMaterial
                color={materialColor('#706a64', props.silhouette)}
                metalness={0.5}
                roughness={0.45}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* INTERNAL LAYER: Render Crucible & Biomass Conduits */}
      {props.layers.internal && (
        <>
          <mesh position={[0, 0.7, 0]} scale={[2.3, 2.2, 2.5]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshPhysicalMaterial
              color={materialColor('#9e1a1e', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#881216'}
              emissiveIntensity={0.9}
              transparent
              opacity={0.78}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          {[-2.5, 0, 2.5].map((x) => (
            <mesh key={x} position={[x, 2.7, 0]} scale={[0.9, 1.5, 0.9]}>
              <capsuleGeometry args={[0.8, 1.8, 8, 16]} />
              <meshStandardMaterial
                color={materialColor('#6b2223', props.silhouette)}
                emissive={props.silhouette ? '#000000' : '#5a0d0f'}
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </>
      )}

      {/* FUNCTIONAL LAYER: Intake Flow & Energy Boundary */}
      {props.layers.functional && (
        <>
          {[-2.5, 0, 2.5].map((x) => (
            <Line
              key={x}
              points={[
                [0, 0.7, 3.8],
                [0, 0.7, 1.5],
                [x, 2.6, 0],
                [x, -2.5, 0.2],
              ]}
              color="#e05a2b"
              lineWidth={1.5}
              transparent
              opacity={0.7}
            />
          ))}
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[5.6, 24, 16]} />
            <meshBasicMaterial
              color={props.silhouette ? '#070707' : '#e05a2b'}
              transparent
              opacity={props.silhouette ? 0 : 0.05}
              wireframe
              clippingPlanes={clippingPlanes}
            />
          </mesh>
        </>
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

function BloodRingModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group | null>(null);
  const outer = useRef<THREE.Mesh | null>(null);
  const internal = useRef<THREE.Mesh | null>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = clipArray(props.clipPlane);
  const ribs = useMemo(() => Array.from({ length: 20 }, (_, i) => i), []);

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current || !outer.current || !internal.current) return;
    const isCooling = props.animation.name === 'Cooling-State Reconstruction';

    root.current.rotation.z = t * (isCooling ? 0.03 : 0.085);
    outer.current.scale.setScalar(isCooling ? 1 - Math.max(0, Math.sin(t * 1.2)) * 0.015 : 1);
    internal.current.rotation.z = -t * 0.11;
    internal.current.scale.setScalar(isCooling ? 0.96 + Math.sin(t * 1.4) * 0.01 : 1.02);
  });

  return (
    <group
      ref={root}
      rotation={[Math.PI / 2.6, 0.2, 0]}
      onPointerDown={(event) => {
        if (!props.measurementMode) return;
        event.stopPropagation();
        props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
      }}
    >
      {/* SURFACE LAYER: Vitrified Crimson Shell with Hardened Edges */}
      {props.layers.surface && (
        <mesh ref={outer} castShadow receiveShadow>
          <torusGeometry args={[5.4, 1.15, 24, 192]} />
          <meshPhysicalMaterial
            color={materialColor('#7a0e1c', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#640812'}
            emissiveIntensity={0.48}
            transmission={props.silhouette ? 0 : 0.16}
            transparent
            opacity={props.silhouette ? 1 : 0.9}
            roughness={0.28}
            metalness={0.2}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
            clipShadows
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* STRUCTURE LAYER: Spin-Alignment Hardened Macro-Ribs */}
      {props.layers.structure && (
        <group>
          {ribs.map((rib) => {
            const angle = (rib / ribs.length) * Math.PI * 2;
            return (
              <mesh
                key={rib}
                position={[Math.cos(angle) * 5.4, Math.sin(angle) * 5.4, 0]}
                rotation={[0, 0, angle]}
                scale={[0.24, 1.5, 1.45]}
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                  color={materialColor('#a04d3e', props.silhouette)}
                  emissive={props.silhouette ? '#000000' : '#521212'}
                  emissiveIntensity={0.35}
                  metalness={0.4}
                  roughness={0.45}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* INTERNAL LAYER: Rendered Core Matter & Clot-Vein Bands */}
      {props.layers.internal && (
        <>
          <mesh ref={internal}>
            <torusGeometry args={[5.4, 0.6, 16, 192]} />
            <meshStandardMaterial
              color={materialColor('#24070d', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#96121b'}
              emissiveIntensity={0.8}
              roughness={0.6}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              side={THREE.DoubleSide}
            />
          </mesh>
          {[0.4, 1.7, 2.8, 4.1, 5.4].map((angle) => (
            <mesh
              key={angle}
              position={[Math.cos(angle) * 5.35, Math.sin(angle) * 5.35, 0.2]}
              scale={[0.72, 0.35, 0.52]}
              rotation={[0, 0, angle]}
            >
              <sphereGeometry args={[1, 20, 14]} />
              <meshBasicMaterial
                color={props.silhouette ? '#040506' : '#060608'}
                transparent
                opacity={0.92}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </>
      )}

      {/* FUNCTIONAL LAYER: Orbital Shackle Field Lines */}
      {props.layers.functional && (
        <>
          {[0, 1, 2].map((index) => (
            <mesh key={index} scale={1 + index * 0.15}>
              <torusGeometry args={[5.4, 0.045, 8, 192]} />
              <meshBasicMaterial
                color={props.silhouette ? '#070708' : index === 0 ? '#e05a2b' : '#c4a359'}
                transparent
                opacity={props.silhouette ? 0 : 0.5 - index * 0.12}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[3.8, 3.8, 0.06, 96, 1, true]} />
            <meshBasicMaterial
              color={props.silhouette ? '#070708' : '#7ed6f8'}
              transparent
              opacity={props.silhouette ? 0 : 0.12}
              wireframe
              clippingPlanes={clippingPlanes}
            />
          </mesh>
        </>
      )}

      {/* Planetary Horizon Reference Sphere Segment */}
      <mesh scale={0.46}>
        <sphereGeometry args={[5.2, 48, 32]} />
        <meshStandardMaterial
          color="#0f1722"
          roughness={0.9}
          transparent
          opacity={0.28}
          wireframe
          clippingPlanes={clippingPlanes}
        />
      </mesh>

      <AnnotationMarkers
        record={props.record}
        layers={props.layers}
        selectedAnnotationId={props.selectedAnnotationId}
        onSelectAnnotation={props.onSelectAnnotation}
      />
    </group>
  );
}

import { SPECIMEN_CONFIGS } from './specimenConfigs';

function RecordParametricModel(props: SpecimenModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  const cfg = useMemo(() => {
    return (
      SPECIMEN_CONFIGS[props.record.id] ?? {
        scale: [3, 3, 3] as [number, number, number],
        primaryColor: '#3b4856',
        emissiveColor: '#7ed6f8',
        accentColor: '#7ed6f8',
        metalness: 0.3,
        roughness: 0.5,
        transmission: 0,
        geometryType: 'basalt-pylon' as const,
        featureCount: 6,
        animSpeed: 1,
        animStyle: 'drift' as const,
      }
    );
  }, [props.record.id]);

  const featureItems = useMemo(() => {
    return Array.from({ length: cfg.featureCount }, (_, i) => {
      const angle = (i / cfg.featureCount) * Math.PI * 2;
      return {
        pos: [
          Math.cos(angle) * (cfg.scale[0] * 0.95),
          i % 2 === 0 ? 0.8 : -0.8,
          Math.sin(angle) * (cfg.scale[2] * 0.95),
        ] as [number, number, number],
        rot: [0.25 * (i % 2 ? 1 : -1), -angle, 0.15] as [number, number, number],
        scale: 0.4 + (i % 3) * 0.15,
      };
    });
  }, [cfg]);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = elapsed.current * cfg.animSpeed;
    if (cfg.animStyle === 'seismic') {
      groupRef.current.rotation.y = t * 0.14;
      groupRef.current.position.y = Math.sin(t * 1.8) * 0.15;
    } else if (cfg.animStyle === 'undulate') {
      groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.3;
      groupRef.current.position.y = Math.sin(t * 1.4) * 0.35;
    } else if (cfg.animStyle === 'spin') {
      groupRef.current.rotation.z = t * 0.2;
      groupRef.current.rotation.y = t * 0.1;
    } else if (cfg.animStyle === 'glitch') {
      groupRef.current.rotation.y = t * 0.35;
      groupRef.current.position.x = Math.sin(t * 9.0) * 0.04;
    } else if (cfg.animStyle === 'breathe') {
      groupRef.current.rotation.y = t * 0.1;
      if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(t * 2.0) * 0.08);
    } else {
      groupRef.current.rotation.y = t * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.1) * 0.2;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        if (!props.measurementMode) return;
        e.stopPropagation();
        props.onMeasurePoint([e.point.x, e.point.y, e.point.z]);
      }}
    >
      {/* SURFACE LAYER: Record-Specific Proportions & Primary Shell */}
      {props.layers.surface && (
        <group>
          {/* Main Body Hull */}
          <mesh scale={cfg.scale} castShadow receiveShadow>
            {cfg.geometryType === 'basalt-pylon' && <cylinderGeometry args={[0.7, 1.3, 1, 8]} />}
            {cfg.geometryType === 'tectonic-slab' && <dodecahedronGeometry args={[1, 1]} />}
            {cfg.geometryType === 'storm-knot' && <torusKnotGeometry args={[1, 0.3, 96, 24]} />}
            {cfg.geometryType === 'siphon-bell' && <coneGeometry args={[1.2, 1.8, 24]} />}
            {cfg.geometryType === 'spore-pod' && <dodecahedronGeometry args={[1, 2]} />}
            {cfg.geometryType === 'mycelial-tendrils' && <icosahedronGeometry args={[1, 2]} />}
            {cfg.geometryType === 'abyssal-hull' && <icosahedronGeometry args={[1, 3]} />}
            {cfg.geometryType === 'fin-serpent' && <cylinderGeometry args={[0.5, 0.9, 2, 16]} />}
            {cfg.geometryType === 'wyrm-ring' && <torusGeometry args={[1.2, 0.3, 16, 96]} />}
            {cfg.geometryType === 'star-scaffold' && <octahedronGeometry args={[1.2, 1]} />}
            {cfg.geometryType === 'furnace-crucible' && <boxGeometry args={[1.1, 1.3, 0.9]} />}
            {cfg.geometryType === 'city-moulter' && <cylinderGeometry args={[1.2, 1.4, 1.6, 6]} />}
            {cfg.geometryType === 'psionic-obelisk' && <octahedronGeometry args={[1.1, 0]} />}
            {cfg.geometryType === 'lattice-spire' && <octahedronGeometry args={[1.2, 2]} />}
            {cfg.geometryType === 'glitch-matrix' && <boxGeometry args={[1, 1, 1]} />}
            {cfg.geometryType === 'null-void' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
            {cfg.geometryType === 'genesis-egg' && <sphereGeometry args={[1, 48, 36]} />}
            {cfg.geometryType === 'prime-matriarch' && <sphereGeometry args={[1.2, 64, 48]} />}

            {cfg.transmission > 0 ? (
              <meshPhysicalMaterial
                color={materialColor(cfg.primaryColor, props.silhouette)}
                emissive={props.silhouette ? '#000000' : cfg.emissiveColor}
                emissiveIntensity={0.4}
                roughness={cfg.roughness}
                metalness={cfg.metalness}
                transmission={props.silhouette ? 0 : cfg.transmission}
                thickness={1.5}
                transparent
                opacity={props.silhouette ? 1 : 0.88}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            ) : (
              <meshStandardMaterial
                color={materialColor(cfg.primaryColor, props.silhouette)}
                emissive={props.silhouette ? '#000000' : cfg.emissiveColor}
                emissiveIntensity={0.35}
                roughness={cfg.roughness}
                metalness={cfg.metalness}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            )}
          </mesh>

          {/* Record-Specific Sub-Appendages (Spines, Tendrils, Fins, Plates, Rings) */}
          {featureItems.map((item, idx) => (
            <mesh key={idx} position={item.pos} rotation={item.rot} scale={item.scale}>
              {cfg.hasUniqueSpines && <octahedronGeometry args={[0.6, 0]} />}
              {cfg.hasUniqueTendrils && <cylinderGeometry args={[0.2, 0.5, 2.2, 8]} />}
              {cfg.hasUniqueFins && <coneGeometry args={[0.8, 1.8, 6]} />}
              {cfg.hasUniqueRings && <torusGeometry args={[1.1, 0.1, 8, 32]} />}
              {cfg.hasUniqueMaw && <boxGeometry args={[0.8, 1.2, 0.8]} />}
              {!cfg.hasUniqueSpines &&
                !cfg.hasUniqueTendrils &&
                !cfg.hasUniqueFins &&
                !cfg.hasUniqueRings &&
                !cfg.hasUniqueMaw && <dodecahedronGeometry args={[0.6, 0]} />}
              <meshStandardMaterial
                color={materialColor(cfg.primaryColor, props.silhouette)}
                emissive={props.silhouette ? '#000' : cfg.emissiveColor}
                emissiveIntensity={0.2}
                roughness={cfg.roughness}
                metalness={cfg.metalness}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* STRUCTURE LAYER: Reconstructed Load Path Frame */}
      {props.layers.structure && (
        <mesh position={[0, 0, 0]} scale={[cfg.scale[0] * 1.05, cfg.scale[1] * 1.05, cfg.scale[2] * 1.05]}>
          <cylinderGeometry args={[0.8, 0.8, 1.1, 12, 1, true]} />
          <meshStandardMaterial
            color={materialColor('#a2b0bc', props.silhouette)}
            metalness={0.5}
            roughness={0.4}
            wireframe
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* INTERNAL LAYER: Record-Specific Organ Core */}
      {props.layers.internal && (
        <mesh ref={coreRef} position={[0, 0, 0]} scale={[cfg.scale[0] * 0.5, cfg.scale[1] * 0.5, cfg.scale[2] * 0.5]}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color={materialColor(cfg.emissiveColor, props.silhouette)}
            emissive={props.silhouette ? '#000000' : cfg.emissiveColor}
            emissiveIntensity={1.8}
            roughness={0.2}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* FUNCTIONAL LAYER: Vector Field & Resonance Rings */}
      {props.layers.functional && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[cfg.scale[0] * 1.3, 0.045, 8, 96]} />
          <meshBasicMaterial
            color={props.silhouette ? '#000000' : cfg.accentColor}
            transparent
            opacity={0.6}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
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

import {
  FaultTongueModel,
  ObsidianGulModel,
  TremorhoundModel,
  MagmaPleuronModel,
  GranithelionModel,
} from './models/CrustBinderModels';

export function SpecimenModel(props: SpecimenModelProps) {
  if (props.record.id === 'skymourn') return <SkymournModel {...props} />;
  if (props.record.id === 'gorevault') return <GorevaultModel {...props} />;
  if (props.record.id === 'blood-ring') return <BloodRingModel {...props} />;

  if (props.record.id === 'magma-pleuron') return <MagmaPleuronModel {...props} />;
  if (props.record.id === 'granithelion') return <GranithelionModel {...props} />;
  if (props.record.id === 'fault-tongue') return <FaultTongueModel {...props} />;
  if (props.record.id === 'obsidian-gul') return <ObsidianGulModel {...props} />;
  if (props.record.id === 'tremorhound') return <TremorhoundModel {...props} />;

  return <RecordParametricModel {...props} />;
}
