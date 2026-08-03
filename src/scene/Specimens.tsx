import { Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AnimationState, LayerId, SpecimenRecord } from '../types';

interface SpecimenModelProps {
  record: SpecimenRecord;
  layers: Record<LayerId, boolean>;
  animation: AnimationState;
  clipPlane: THREE.Plane | null;
  wireframe: boolean;
  silhouette: boolean;
  measurementMode: boolean;
  onMeasurePoint: (point: [number, number, number]) => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string) => void;
}

function materialColor(base: string, silhouette: boolean): string {
  return silhouette ? '#05070a' : base;
}

function clipArray(plane: THREE.Plane | null): THREE.Plane[] {
  return plane ? [plane] : [];
}

function useAnimationClock(animation: AnimationState) {
  const elapsed = useRef(0);
  useEffect(() => {
    elapsed.current = 0;
  }, [animation.restartToken, animation.name]);

  useFrame((_, delta) => {
    if (!animation.playing) return;
    if (!animation.loop && elapsed.current >= 6) return;
    elapsed.current += delta * animation.speed;
    if (animation.loop && elapsed.current > 6) elapsed.current %= 6;
  });
  return elapsed;
}

function AnnotationMarkers({
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
              <span aria-hidden="true" />
            </button>
          </Html>
        );
      })}
    </>
  );
}

class SkymournCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const theta = t * Math.PI * 2;
    return target.set(
      3.25 * Math.sin(theta * 2),
      5.1 * Math.cos(theta),
      0.72 * Math.cos(theta * 2) + 0.28 * Math.sin(theta * 5),
    );
  }
}

function SkymournModel(props: SpecimenModelProps) {
  const root = useRef<THREE.Group | null>(null);
  const frost = useRef<THREE.Mesh | null>(null);
  const heat = useRef<THREE.Mesh | null>(null);
  const field = useRef<THREE.Group | null>(null);
  const elapsed = useAnimationClock(props.animation);
  const curve = useMemo(() => new SkymournCurve(), []);
  const bodyGeometry = useMemo(() => new THREE.TubeGeometry(curve, 192, 0.72, 14, true), [curve]);
  const heatGeometry = useMemo(() => new THREE.TubeGeometry(curve, 192, 0.24, 9, true), [curve]);
  const lacePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i < 36; i += 1) {
      const t = i / 35;
      points.push([
        -1.4 - t * 5.8,
        -0.6 - t * 3.2 + Math.sin(t * 18) * 0.3,
        -0.5 + Math.cos(t * 12) * 0.28,
      ]);
    }
    return points;
  }, []);
  const frostParticles = useMemo(() => {
    const positions = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i += 1) {
      const t = i / 180;
      const p = curve.getPoint(t);
      const spread = 0.8 + (i % 7) * 0.09;
      positions[i * 3] = p.x + Math.sin(i * 2.1) * spread;
      positions[i * 3 + 1] = p.y + Math.cos(i * 1.7) * spread;
      positions[i * 3 + 2] = p.z + Math.sin(i * 0.91) * spread;
    }
    return positions;
  }, [curve]);

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current || !frost.current || !heat.current || !field.current) return;
    const burst = props.animation.name === 'Thermal Ripple Burst';
    root.current.rotation.y = Math.sin(t * 0.22) * 0.18;
    root.current.rotation.z = Math.sin(t * 0.37) * (burst ? 0.08 : 0.03);
    root.current.position.y = Math.sin(t * 0.5) * (burst ? 0.22 : 0.12);
    const pulse = burst ? 1 + Math.sin(t * 4.2) * 0.055 : 1 + Math.sin(t * 0.9) * 0.018;
    frost.current.scale.setScalar(pulse);
    heat.current.scale.setScalar(2 - pulse);
    field.current.rotation.z = t * (burst ? 0.22 : 0.06);
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
      {props.layers.surface && (
        <>
          <mesh ref={frost} geometry={bodyGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={materialColor('#b9d9ef', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#416e8b'}
              emissiveIntensity={props.silhouette ? 0 : 0.28}
              roughness={0.35}
              metalness={0.08}
              transmission={props.silhouette ? 0 : 0.18}
              transparent
              opacity={props.silhouette ? 1 : 0.82}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              clipShadows
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 4.75, 0.62]} scale={[0.92, 1.28, 0.42]} castShadow>
            <sphereGeometry args={[1, 48, 32]} />
            <meshPhysicalMaterial
              color={materialColor('#dce8ef', props.silhouette)}
              roughness={0.72}
              metalness={0.02}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              clipShadows
            />
          </mesh>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[frostParticles, 3]} />
            </bufferGeometry>
            <pointsMaterial
              color={props.silhouette ? '#080b0d' : '#d8f2ff'}
              size={0.09}
              sizeAttenuation
              transparent
              opacity={props.silhouette ? 0 : 0.7}
              clippingPlanes={clippingPlanes}
            />
          </points>
        </>
      )}

      {props.layers.structure && (
        <mesh geometry={heatGeometry}>
          <meshStandardMaterial
            color={materialColor('#6f8795', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#243642'}
            emissiveIntensity={0.35}
            roughness={0.55}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {props.layers.internal && (
        <>
          <mesh ref={heat} geometry={heatGeometry}>
            <meshStandardMaterial
              color={materialColor('#ca5b32', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#b84924'}
              emissiveIntensity={1.4}
              roughness={0.4}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[-0.55, 0.8, 0.05]}>
            <icosahedronGeometry args={[1.15, 2]} />
            <meshPhysicalMaterial
              color={materialColor('#88c6e7', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#2c7ea8'}
              emissiveIntensity={0.8}
              transparent
              opacity={0.72}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          <mesh position={[0.68, -0.75, 0.02]}>
            <icosahedronGeometry args={[0.95, 2]} />
            <meshPhysicalMaterial
              color={materialColor('#e17344', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#bf3a20'}
              emissiveIntensity={0.95}
              transparent
              opacity={0.76}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
        </>
      )}

      {props.layers.functional && (
        <group ref={field}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[4.4, 0.055, 8, 128]} />
            <meshBasicMaterial
              color={props.silhouette ? '#0a0b0d' : '#7ccdf2'}
              transparent
              opacity={props.silhouette ? 0 : 0.52}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={[1.25, 1.25, 1.25]}>
            <torusGeometry args={[4.4, 0.055, 8, 128]} />
            <meshBasicMaterial
              color={props.silhouette ? '#0a0b0d' : '#d56a3c'}
              transparent
              opacity={props.silhouette ? 0 : 0.45}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          <Line points={lacePoints} color="#9bdcff" lineWidth={1.2} transparent opacity={0.65} />
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
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = clipArray(props.clipPlane);
  const ribs = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);
  const legs = useMemo(
    () => [
      [-3.2, -1.8, 2.4],
      [3.2, -1.8, 2.4],
      [-3.2, -1.8, -2.4],
      [3.2, -1.8, -2.4],
    ] as [number, number, number][],
    [],
  );

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current || !maw.current || !reservoirs.current) return;
    const intake = props.animation.name === 'Crucible Maw Intake';
    root.current.position.x = intake ? 0 : Math.sin(t * 0.9) * 0.18;
    root.current.rotation.z = intake ? 0 : Math.sin(t * 0.9) * 0.025;
    maw.current.scale.z = intake ? 1 + Math.max(0, Math.sin(t * 2.8)) * 0.55 : 1;
    reservoirs.current.children.forEach((child, index) => {
      child.position.y = Math.sin(t * 1.15 + index) * 0.16;
      child.scale.y = 1 + Math.sin(t * 1.5 + index * 0.7) * 0.08;
    });
  });

  return (
    <group
      ref={root}
      scale={0.62}
      position={[0, 0.2, 0]}
      onPointerDown={(event) => {
        if (!props.measurementMode) return;
        event.stopPropagation();
        props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
      }}
    >
      {props.layers.surface && (
        <>
          <mesh scale={[4.6, 3.5, 3.2]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 2]} />
            <meshStandardMaterial
              color={materialColor('#35171a', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#3f0c10'}
              emissiveIntensity={0.34}
              roughness={0.74}
              metalness={0.22}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              clipShadows
            />
          </mesh>
          <mesh ref={maw} position={[0, 0.2, 3.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.4, 2.3, 2.5, 32, 2, true]} />
            <meshStandardMaterial
              color={materialColor('#16080a', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#7d1719'}
              emissiveIntensity={0.8}
              roughness={0.5}
              side={THREE.DoubleSide}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          {legs.map((position, index) => (
            <group key={index} position={position}>
              <mesh rotation={[index < 2 ? -0.25 : 0.25, 0, index % 2 ? -0.18 : 0.18]}>
                <cylinderGeometry args={[0.62, 0.95, 4.4, 12]} />
                <meshStandardMaterial
                  color={materialColor('#2a2524', props.silhouette)}
                  roughness={0.82}
                  metalness={0.28}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
              <mesh position={[0, -2.3, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.72, 2.4, 10]} />
                <meshStandardMaterial
                  color={materialColor('#18191a', props.silhouette)}
                  metalness={0.65}
                  roughness={0.35}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
          ))}
          <group ref={reservoirs}>
            {[-2.8, -1.4, 0, 1.4, 2.8].map((x, index) => (
              <mesh key={x} position={[x, -2.7, 0.3]} scale={[0.7, 1.35 + index * 0.04, 0.75]}>
                <sphereGeometry args={[1, 24, 18]} />
                <meshPhysicalMaterial
                  color={materialColor('#4e1018', props.silhouette)}
                  emissive={props.silhouette ? '#000000' : '#4f0812'}
                  emissiveIntensity={0.35}
                  transmission={props.silhouette ? 0 : 0.1}
                  transparent
                  opacity={props.silhouette ? 1 : 0.82}
                  roughness={0.38}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            ))}
          </group>
        </>
      )}

      {props.layers.structure && (
        <group rotation={[0, Math.PI / 2, 0]}>
          {ribs.map((rib) => (
            <mesh key={rib} position={[0, 0.1, -3 + rib]}>
              <torusGeometry args={[3.7, 0.16, 8, 48, Math.PI * 1.55]} />
              <meshStandardMaterial
                color={materialColor('#85807a', props.silhouette)}
                metalness={0.44}
                roughness={0.52}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </group>
      )}

      {props.layers.internal && (
        <>
          <mesh position={[0, 0.7, 0]} scale={[2.2, 2.1, 2.4]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshPhysicalMaterial
              color={materialColor('#8b1e24', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#7a1218'}
              emissiveIntensity={0.8}
              transparent
              opacity={0.72}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          {[-2.4, 0, 2.4].map((x) => (
            <mesh key={x} position={[x, 2.6, 0]} scale={[0.85, 1.45, 0.85]}>
              <capsuleGeometry args={[0.8, 1.8, 8, 16]} />
              <meshStandardMaterial
                color={materialColor('#5e2526', props.silhouette)}
                emissive={props.silhouette ? '#000000' : '#501012'}
                emissiveIntensity={0.45}
                transparent
                opacity={0.78}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </>
      )}

      {props.layers.functional && (
        <>
          {[-2.4, 0, 2.4].map((x) => (
            <Line
              key={x}
              points={[
                [0, 0.7, 3.6],
                [0, 0.7, 1.4],
                [x, 2.5, 0],
                [x, -2.4, 0.2],
              ]}
              color="#c94940"
              lineWidth={1.2}
              transparent
              opacity={0.65}
            />
          ))}
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[5.4, 24, 16]} />
            <meshBasicMaterial
              color={props.silhouette ? '#070707' : '#d17540'}
              transparent
              opacity={props.silhouette ? 0 : 0.045}
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
  const ribs = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);

  useFrame(() => {
    const t = elapsed.current;
    if (!root.current || !outer.current || !internal.current) return;
    const cooling = props.animation.name === 'Cooling-State Reconstruction';
    root.current.rotation.z = t * (cooling ? 0.035 : 0.09);
    outer.current.scale.setScalar(cooling ? 1 - Math.max(0, Math.sin(t * 1.2)) * 0.018 : 1);
    internal.current.rotation.z = -t * 0.12;
    internal.current.scale.setScalar(cooling ? 0.96 + Math.sin(t * 1.4) * 0.012 : 1.02);
  });

  return (
    <group
      ref={root}
      rotation={[Math.PI / 2.7, 0.2, 0]}
      onPointerDown={(event) => {
        if (!props.measurementMode) return;
        event.stopPropagation();
        props.onMeasurePoint([event.point.x, event.point.y, event.point.z]);
      }}
    >
      {props.layers.surface && (
        <mesh ref={outer} castShadow receiveShadow>
          <torusGeometry args={[5.25, 1.12, 22, 180]} />
          <meshPhysicalMaterial
            color={materialColor('#6e0c18', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#5a0610'}
            emissiveIntensity={0.44}
            transmission={props.silhouette ? 0 : 0.12}
            transparent
            opacity={props.silhouette ? 1 : 0.88}
            roughness={0.32}
            metalness={0.18}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
            clipShadows
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {props.layers.structure && (
        <group>
          {ribs.map((rib) => {
            const angle = (rib / ribs.length) * Math.PI * 2;
            return (
              <mesh
                key={rib}
                position={[Math.cos(angle) * 5.25, Math.sin(angle) * 5.25, 0]}
                rotation={[0, 0, angle]}
                scale={[0.22, 1.45, 1.4]}
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                  color={materialColor('#944737', props.silhouette)}
                  emissive={props.silhouette ? '#000000' : '#471010'}
                  emissiveIntensity={0.32}
                  metalness={0.35}
                  roughness={0.48}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {props.layers.internal && (
        <>
          <mesh ref={internal}>
            <torusGeometry args={[5.25, 0.58, 14, 180]} />
            <meshStandardMaterial
              color={materialColor('#20060b', props.silhouette)}
              emissive={props.silhouette ? '#000000' : '#8b1018'}
              emissiveIntensity={0.72}
              roughness={0.66}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
              side={THREE.DoubleSide}
            />
          </mesh>
          {[0.4, 1.7, 2.8, 4.1, 5.4].map((angle) => (
            <mesh
              key={angle}
              position={[Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0.2]}
              scale={[0.7, 0.32, 0.5]}
              rotation={[0, 0, angle]}
            >
              <sphereGeometry args={[1, 20, 14]} />
              <meshBasicMaterial
                color={props.silhouette ? '#040506' : '#050507'}
                transparent
                opacity={0.9}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </>
      )}

      {props.layers.functional && (
        <>
          {[0, 1, 2].map((index) => (
            <mesh key={index} scale={1 + index * 0.14}>
              <torusGeometry args={[5.25, 0.04, 8, 180]} />
              <meshBasicMaterial
                color={props.silhouette ? '#070708' : index === 0 ? '#ce4c35' : '#bd8a43'}
                transparent
                opacity={props.silhouette ? 0 : 0.45 - index * 0.1}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[3.6, 3.6, 0.06, 96, 1, true]} />
            <meshBasicMaterial
              color={props.silhouette ? '#070708' : '#7c9db8'}
              transparent
              opacity={props.silhouette ? 0 : 0.1}
              wireframe
              clippingPlanes={clippingPlanes}
            />
          </mesh>
        </>
      )}

      <mesh scale={0.44}>
        <sphereGeometry args={[5.1, 48, 32]} />
        <meshStandardMaterial
          color="#111821"
          roughness={0.88}
          transparent
          opacity={0.24}
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

export function SpecimenModel(props: SpecimenModelProps) {
  if (props.record.id === 'skymourn') return <SkymournModel {...props} />;
  if (props.record.id === 'gorevault') return <GorevaultModel {...props} />;
  return <BloodRingModel {...props} />;
}
