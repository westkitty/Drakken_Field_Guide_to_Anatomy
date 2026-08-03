import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  AnnotationMarkers,
} from '../Specimens';
import {
  useAnimationClock,
  materialColor,
  clipArray,
  type SpecimenModelProps,
} from '../SpecimenCommon';

export function FaultTongueModel(props: SpecimenModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const jawLeftRef = useRef<THREE.Group>(null);
  const jawRightRef = useRef<THREE.Group>(null);
  const throatRef = useRef<THREE.Mesh>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  useFrame(() => {
    if (!rootRef.current) return;
    const t = elapsed.current;
    rootRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
    rootRef.current.position.y = Math.sin(t * 1.2) * 0.2;

    // Sideways opening harmonic mouth plates
    const jawAngle = Math.abs(Math.sin(t * 2.5)) * 0.35;
    if (jawLeftRef.current) jawLeftRef.current.rotation.z = jawAngle;
    if (jawRightRef.current) jawRightRef.current.rotation.z = -jawAngle;
    if (throatRef.current) throatRef.current.scale.setScalar(1 + Math.sin(t * 5.0) * 0.15);
  });

  return (
    <group
      ref={rootRef}
      onPointerDown={(e) => {
        if (!props.measurementMode) return;
        e.stopPropagation();
        props.onMeasurePoint?.([e.point.x, e.point.y, e.point.z]);
      }}
    >
      {/* SURFACE LAYER: Metallic Hide & Sideways Mouth Plates */}
      {props.layers.surface && (
        <group>
          {/* Flexible Serpent Body Spine */}
          {[-2.0, -1.0, 0, 1.0, 2.0].map((z, idx) => (
            <mesh key={z} position={[0, Math.sin(idx * 0.5) * 0.3, z]} scale={[1.8 - Math.abs(z) * 0.3, 1.6, 0.9]}>
              <cylinderGeometry args={[1, 1.2, 1, 12]} />
              <meshStandardMaterial
                color={materialColor('#2a323d', props.silhouette)}
                metalness={0.7}
                roughness={0.3}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}

          {/* Cranial Jaw & Sideways Opening Mandible Plates */}
          <group position={[0, 0.5, 2.8]}>
            {/* Left Mandible */}
            <group ref={jawLeftRef} position={[-0.6, 0, 0]}>
              <mesh position={[-0.8, 0, 0.8]} rotation={[0, -0.4, 0]}>
                <boxGeometry args={[0.4, 1.2, 2.2]} />
                <meshStandardMaterial
                  color={materialColor('#1f2630', props.silhouette)}
                  metalness={0.8}
                  roughness={0.2}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
            {/* Right Mandible */}
            <group ref={jawRightRef} position={[0.6, 0, 0]}>
              <mesh position={[0.8, 0, 0.8]} rotation={[0, 0.4, 0]}>
                <boxGeometry args={[0.4, 1.2, 2.2]} />
                <meshStandardMaterial
                  color={materialColor('#1f2630', props.silhouette)}
                  metalness={0.8}
                  roughness={0.2}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
          </group>
        </group>
      )}

      {/* STRUCTURE LAYER: Acoustic Spine & Harmonic Ribs */}
      {props.layers.structure && (
        <group>
          {[-1.5, -0.5, 0.5, 1.5].map((z) => (
            <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.0, 0.15, 8, 32]} />
              <meshStandardMaterial
                color={materialColor('#526375', props.silhouette)}
                metalness={0.6}
                roughness={0.4}
                wireframe
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* INTERNAL LAYER: Resonant Sound Throat */}
      {props.layers.internal && (
        <mesh ref={throatRef} position={[0, 0.3, 2.2]}>
          <sphereGeometry args={[1.2, 24, 24]} />
          <meshStandardMaterial
            color={materialColor('#7ed6f8', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#2b9ac7'}
            emissiveIntensity={2.0}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* FUNCTIONAL LAYER: Directional Acoustic Pulse Field */}
      {props.layers.functional && (
        <mesh position={[0, 0.3, 4.2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[2.5, 3.5, 16, 1, true]} />
          <meshBasicMaterial
            color={props.silhouette ? '#000' : '#7ed6f8'}
            transparent
            opacity={0.45}
            wireframe
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

export function ObsidianGulModel(props: SpecimenModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  useFrame(() => {
    if (!rootRef.current) return;
    const t = elapsed.current;
    rootRef.current.rotation.y = t * 0.15;
    rootRef.current.position.y = Math.sin(t * 1.5) * 0.15;

    // Tail scythe sweep
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(t * 2.0) * 0.4;
  });

  return (
    <group
      ref={rootRef}
      onPointerDown={(e) => {
        if (!props.measurementMode) return;
        e.stopPropagation();
        props.onMeasurePoint?.([e.point.x, e.point.y, e.point.z]);
      }}
    >
      {/* SURFACE LAYER: Wingless Quadruped Body, Obsidian Shards & Tail Scythe */}
      {props.layers.surface && (
        <group>
          {/* Torso Carapace */}
          <mesh position={[0, 0.5, 0]} scale={[2.4, 1.8, 3.8]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={materialColor('#141212', props.silhouette)}
              roughness={0.9}
              metalness={0.3}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          {/* Obsidian Armor Shards along Dorsal Ridge */}
          {[-1.2, -0.4, 0.4, 1.2].map((z, idx) => (
            <mesh key={z} position={[0, 1.8 + (idx % 2) * 0.2, z]} rotation={[0.4, (idx % 2 ? 0.3 : -0.3), 0]}>
              <octahedronGeometry args={[0.7, 0]} />
              <meshStandardMaterial
                color={materialColor('#0a0909', props.silhouette)}
                roughness={0.1}
                metalness={0.8}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}

          {/* 4 Quadruped Leg Joints */}
          {[
            [-1.6, 1.5],
            [1.6, 1.5],
            [-1.6, -1.5],
            [1.6, -1.5],
          ].map(([x, z], idx) => (
            <group key={idx} position={[x, -0.5, z]}>
              <mesh rotation={[0.4 * (z > 0 ? 1 : -1), 0, 0.2 * (x > 0 ? -1 : 1)]}>
                <cylinderGeometry args={[0.3, 0.5, 2.4, 8]} />
                <meshStandardMaterial
                  color={materialColor('#1c1715', props.silhouette)}
                  roughness={0.8}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
          ))}

          {/* Tail Scythe */}
          <group ref={tailRef} position={[0, 0.8, -2.4]}>
            <mesh position={[0, 0.4, -1.6]} rotation={[-0.6, 0, 0]} scale={[0.2, 0.8, 3.2]}>
              <coneGeometry args={[1, 2, 4]} />
              <meshStandardMaterial
                color={materialColor('#0f0d0d', props.silhouette)}
                emissive={props.silhouette ? '#000' : '#e05a2b'}
                emissiveIntensity={0.5}
                roughness={0.15}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          </group>
        </group>
      )}

      {/* STRUCTURE LAYER: Pyroclastic Skeleton & Hinge Joints */}
      {props.layers.structure && (
        <group>
          <mesh position={[0, 0.5, 0]} scale={[2.6, 2.0, 4.0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={materialColor('#52443d', props.silhouette)}
              wireframe
              clippingPlanes={clippingPlanes}
            />
          </mesh>
        </group>
      )}

      {/* INTERNAL LAYER: Volcanic Core Furnace & Molten Seams */}
      {props.layers.internal && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.5, 24, 24]} />
          <meshStandardMaterial
            color={materialColor('#e05a2b', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#c84418'}
            emissiveIntensity={2.2}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* FUNCTIONAL LAYER: Magma Slicing Grid Lines */}
      {props.layers.functional && (
        <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 7, 8, 8]} />
          <meshBasicMaterial
            color={props.silhouette ? '#000' : '#ff6b35'}
            wireframe
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

export function TremorhoundModel(props: SpecimenModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  useFrame(() => {
    if (!rootRef.current) return;
    const t = elapsed.current;
    rootRef.current.rotation.y = t * 0.2;
    rootRef.current.position.y = Math.sin(t * 2.2) * 0.2;
    if (spineRef.current) spineRef.current.rotation.z = Math.sin(t * 3.5) * 0.08;
  });

  return (
    <group
      ref={rootRef}
      onPointerDown={(e) => {
        if (!props.measurementMode) return;
        e.stopPropagation();
        props.onMeasurePoint?.([e.point.x, e.point.y, e.point.z]);
      }}
    >
      {/* SURFACE LAYER: Low-slung Wolf Body, Blue Echo Claws & Crown Glyph */}
      {props.layers.surface && (
        <group ref={spineRef}>
          {/* Wolf Torso Spine */}
          <mesh position={[0, 0, 0]} scale={[1.8, 1.4, 3.6]} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={materialColor('#1f242b', props.silhouette)}
              roughness={0.6}
              metalness={0.4}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          {/* Cranial Head */}
          <mesh position={[0, 0.4, 2.2]} scale={[1.2, 1.0, 1.4]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={materialColor('#171b21', props.silhouette)}
              roughness={0.5}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          {/* Crown Seismic Glyph */}
          <mesh position={[0, 1.5, 2.2]} rotation={[Math.PI / 6, 0, 0]}>
            <torusGeometry args={[0.6, 0.08, 8, 24]} />
            <meshStandardMaterial
              color={materialColor('#7ed6f8', props.silhouette)}
              emissive={props.silhouette ? '#000' : '#3da6d0'}
              emissiveIntensity={2.0}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          {/* 4 Spring Limbs with Luminous Cyan Claws */}
          {[
            [-1.3, 1.4],
            [1.3, 1.4],
            [-1.3, -1.4],
            [1.3, -1.4],
          ].map(([x, z], idx) => (
            <group key={idx} position={[x, -0.8, z]}>
              <mesh rotation={[0.3 * (z > 0 ? 1 : -1), 0, 0.2 * (x > 0 ? -1 : 1)]}>
                <cylinderGeometry args={[0.2, 0.4, 2.0, 8]} />
                <meshStandardMaterial
                  color={materialColor('#171b21', props.silhouette)}
                  roughness={0.7}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
              {/* Cyan Claws */}
              <mesh position={[0, -1.1, 0.2]} scale={[0.3, 0.2, 0.6]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                  color={materialColor('#7ed6f8', props.silhouette)}
                  emissive={props.silhouette ? '#000' : '#7ed6f8'}
                  emissiveIntensity={1.8}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* STRUCTURE LAYER: Wave Conduction Spine */}
      {props.layers.structure && (
        <mesh position={[0, 0, 0]} scale={[2.0, 1.6, 3.8]}>
          <cylinderGeometry args={[0.6, 0.6, 1, 12, 1, true]} />
          <meshStandardMaterial
            color={materialColor('#414e5e', props.silhouette)}
            wireframe
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* INTERNAL LAYER: Seismic Pulse Core */}
      {props.layers.internal && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.1, 24, 24]} />
          <meshStandardMaterial
            color={materialColor('#7ed6f8', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#2b9ac7'}
            emissiveIntensity={1.9}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* FUNCTIONAL LAYER: Waveform Propagation Trails */}
      {props.layers.functional && (
        <mesh position={[0, -1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 4.2, 32]} />
          <meshBasicMaterial
            color={props.silhouette ? '#000' : '#7ed6f8'}
            transparent
            opacity={0.4}
            wireframe
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

export function MagmaPleuronModel(props: SpecimenModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  useFrame(() => {
    if (!rootRef.current) return;
    const t = elapsed.current;
    rootRef.current.rotation.y = t * 0.12;
    rootRef.current.position.y = Math.sin(t * 1.0) * 0.1;
  });

  return (
    <group
      ref={rootRef}
      onPointerDown={(e) => {
        if (!props.measurementMode) return;
        e.stopPropagation();
        props.onMeasurePoint?.([e.point.x, e.point.y, e.point.z]);
      }}
    >
      {/* SURFACE LAYER: Basalt Vanguard Hull, Magma Pleuron Flank Plates & Anchor Pylons */}
      {props.layers.surface && (
        <group>
          {/* Main Carapace Hull */}
          <mesh position={[0, 0, 0]} scale={[3.2, 2.2, 4.2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 1.2, 1, 8]} />
            <meshStandardMaterial
              color={materialColor('#241f1c', props.silhouette)}
              roughness={0.85}
              metalness={0.2}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          {/* 6 Magma Pleuron Flank Plates */}
          {[-1.8, 0, 1.8].map((z, idx) => (
            <group key={idx} position={[0, 0, z]}>
              {/* Left Pleuron Plate */}
              <mesh position={[-2.2, 0, 0]} rotation={[0, 0, 0.3]} scale={[0.6, 1.8, 1.0]}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color={materialColor('#191513', props.silhouette)}
                  emissive={props.silhouette ? '#000' : '#e05a2b'}
                  emissiveIntensity={0.4}
                  roughness={0.9}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
              {/* Right Pleuron Plate */}
              <mesh position={[2.2, 0, 0]} rotation={[0, 0, -0.3]} scale={[0.6, 1.8, 1.0]}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color={materialColor('#191513', props.silhouette)}
                  emissive={props.silhouette ? '#000' : '#e05a2b'}
                  emissiveIntensity={0.4}
                  roughness={0.9}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
          ))}

          {/* 4 Ventral Thermal Anchor Pylons */}
          {[
            [-1.8, 1.8],
            [1.8, 1.8],
            [-1.8, -1.8],
            [1.8, -1.8],
          ].map(([x, z], idx) => (
            <mesh key={idx} position={[x, -1.8, z]} scale={[0.7, 1.6, 0.7]}>
              <cylinderGeometry args={[0.6, 0.2, 1, 8]} />
              <meshStandardMaterial
                color={materialColor('#191513', props.silhouette)}
                roughness={0.9}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* STRUCTURE LAYER: Interlocking Load Frame */}
      {props.layers.structure && (
        <mesh position={[0, 0, 0]} scale={[3.4, 2.4, 4.4]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={materialColor('#52443d', props.silhouette)}
            wireframe
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* INTERNAL LAYER: Internal Magma Core */}
      {props.layers.internal && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.6, 24, 24]} />
          <meshStandardMaterial
            color={materialColor('#e05a2b', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#ff4500'}
            emissiveIntensity={2.0}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* FUNCTIONAL LAYER: Thermal Conduction Ring */}
      {props.layers.functional && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[4.5, 0.05, 8, 96]} />
          <meshBasicMaterial
            color={props.silhouette ? '#000' : '#e05a2b'}
            transparent
            opacity={0.6}
            wireframe
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

export function GranithelionModel(props: SpecimenModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const elapsed = useAnimationClock(props.animation);
  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);

  useFrame(() => {
    if (!rootRef.current) return;
    const t = elapsed.current;
    rootRef.current.rotation.y = t * 0.08;
  });

  return (
    <group
      ref={rootRef}
      onPointerDown={(e) => {
        if (!props.measurementMode) return;
        e.stopPropagation();
        props.onMeasurePoint?.([e.point.x, e.point.y, e.point.z]);
      }}
    >
      {/* SURFACE LAYER: Monolithic Basalt Columns & Buttresses */}
      {props.layers.surface && (
        <group>
          {/* Central Monolithic Shaft */}
          <mesh position={[0, 0, 0]} scale={[2.2, 6.5, 2.2]} castShadow receiveShadow>
            <cylinderGeometry args={[1, 1.2, 1, 6]} />
            <meshStandardMaterial
              color={materialColor('#3d3733', props.silhouette)}
              roughness={0.9}
              metalness={0.1}
              wireframe={props.wireframe}
              clippingPlanes={clippingPlanes}
            />
          </mesh>

          {/* 6 Surrounding Column Pillars */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 2.6;
            const h = 4.5 + (i % 3) * 0.8;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * radius, (h - 6.5) * 0.5, Math.sin(angle) * radius]}
                scale={[0.8, h, 0.8]}
              >
                <cylinderGeometry args={[1, 1, 1, 6]} />
                <meshStandardMaterial
                  color={materialColor('#2c2724', props.silhouette)}
                  roughness={0.9}
                  wireframe={props.wireframe}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            );
          })}

          {/* 4 Load-bearing Buttresses */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 3.4, -2.2, Math.sin(angle) * 3.4]}
              rotation={[0, -angle, 0.5]}
              scale={[0.8, 3.2, 0.8]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={materialColor('#241f1d', props.silhouette)}
                roughness={0.95}
                wireframe={props.wireframe}
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* STRUCTURE LAYER: Seismic Core Spine */}
      {props.layers.structure && (
        <mesh position={[0, 0, 0]} scale={[2.4, 6.8, 2.4]}>
          <cylinderGeometry args={[1, 1, 1, 12, 1, true]} />
          <meshStandardMaterial
            color={materialColor('#6e5f57', props.silhouette)}
            wireframe
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* INTERNAL LAYER: Deep Magma Core Column */}
      {props.layers.internal && (
        <mesh position={[0, 0, 0]} scale={[1.2, 5.5, 1.2]}>
          <cylinderGeometry args={[1, 1, 1, 16]} />
          <meshStandardMaterial
            color={materialColor('#c84418', props.silhouette)}
            emissive={props.silhouette ? '#000000' : '#e05a2b'}
            emissiveIntensity={2.0}
            wireframe={props.wireframe}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {/* FUNCTIONAL LAYER: Structural Load Field Rings */}
      {props.layers.functional && (
        <group>
          {[-2.5, 0, 2.5].map((y, idx) => (
            <mesh key={idx} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[4.2, 0.05, 8, 64]} />
              <meshBasicMaterial
                color={props.silhouette ? '#000' : '#e05a2b'}
                transparent
                opacity={0.5}
                wireframe
                clippingPlanes={clippingPlanes}
              />
            </mesh>
          ))}
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
