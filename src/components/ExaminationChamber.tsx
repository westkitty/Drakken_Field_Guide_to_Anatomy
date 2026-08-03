import { Html, Line, OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { distanceMeters, formatMeters } from '../lib/archive';
import { SpecimenModel } from '../scene/SpecimenRouter';
import type {
  AnimationState,
  CameraMode,
  CameraPreset,
  ClipState,
  DiagnosticsSnapshot,
  LayerId,
  SpecimenRecord,
} from '../types';

interface ChamberProps {
  record: SpecimenRecord;
  layers: Record<LayerId, boolean>;
  animation: AnimationState;
  cameraMode: CameraMode;
  cameraPreset: CameraPreset;
  cameraCommandToken: number;
  resetCameraToken: number;
  clip: ClipState;
  wireframe: boolean;
  silhouette: boolean;
  qualityTier: 'standard' | 'reduced';
  measurementMode: boolean;
  measurementPoints: [number, number, number][];
  onMeasurePoint: (point: [number, number, number]) => void;
  scaleReference: 'none' | 'human' | 'vehicle' | 'building';
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string) => void;
  onDiagnostics: (snapshot: DiagnosticsSnapshot) => void;
  onAnimationTime: (seconds: number) => void;
}

const cameraPositions: Record<CameraPreset, [number, number, number]> = {
  front: [0, 1.5, 18],
  side: [18, 1.5, 0],
  dorsal: [0, 18, 0.1],
  ventral: [0, -18, 0.1],
  'three-quarter': [12, 9, 14],
};

function CameraController({
  mode,
  preset,
  commandToken,
  resetToken,
}: {
  mode: CameraMode;
  preset: CameraPreset;
  commandToken: number;
  resetToken: number;
}) {
  const perspective = useRef<THREE.PerspectiveCamera | null>(null);
  const orthographic = useRef<THREE.OrthographicCamera | null>(null);
  const controls = useRef<any>(null);

  useEffect(() => {
    const camera = mode === 'perspective' ? perspective.current : orthographic.current;
    if (!camera) return;
    const position = cameraPositions[preset];
    camera.position.set(...position);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0.7, 0);
    camera.updateProjectionMatrix();
    if (controls.current) {
      controls.current.target.set(0, 0.7, 0);
      controls.current.update();
    }
  }, [mode, preset, commandToken, resetToken]);

  return (
    <>
      <PerspectiveCamera
        ref={perspective}
        makeDefault={mode === 'perspective'}
        position={cameraPositions[preset]}
        fov={42}
        near={0.1}
        far={1000}
      />
      <OrthographicCamera
        ref={orthographic}
        makeDefault={mode === 'orthographic'}
        position={cameraPositions[preset]}
        zoom={48}
        near={0.1}
        far={1000}
      />
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={70}
        panSpeed={0.75}
        rotateSpeed={0.65}
        zoomSpeed={0.75}
        target={[0, 0.7, 0]}
      />
    </>
  );
}

function MeasurementDisplay({ points }: { points: [number, number, number][] }) {
  if (points.length === 0) return null;
  const distance = points.length === 2 ? distanceMeters(points[0], points[1]) : 0;
  const midpoint: [number, number, number] =
    points.length === 2
      ? [
          (points[0][0] + points[1][0]) / 2,
          (points[0][1] + points[1][1]) / 2,
          (points[0][2] + points[1][2]) / 2,
        ]
      : points[0];

  return (
    <group>
      {points.map((point, index) => (
        <mesh key={`${point.join('-')}-${index}`} position={point}>
          <sphereGeometry args={[0.13, 18, 12]} />
          <meshBasicMaterial color="#73c7ee" depthTest={false} />
        </mesh>
      ))}
      {points.length === 2 && (
        <>
          <Line points={points} color="#73c7ee" lineWidth={2} depthTest={false} />
          <Html position={midpoint} center distanceFactor={12}>
            <output className="measurement-label" aria-live="polite">
              {formatMeters(distance)}
            </output>
          </Html>
        </>
      )}
    </group>
  );
}

function ScaleReference({ type }: { type: ChamberProps['scaleReference'] }) {
  if (type === 'none') return null;
  const x = -7.2;
  if (type === 'human') {
    return (
      <group position={[x, -4.6, 0]}>
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.18, 18, 12]} />
          <meshStandardMaterial color="#c1cad0" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <capsuleGeometry args={[0.22, 1.12, 8, 12]} />
          <meshStandardMaterial color="#89959d" roughness={0.8} />
        </mesh>
        <Html position={[0, -0.15, 0]} center distanceFactor={12}>
          <span className="scale-label">Human 1.8 m</span>
        </Html>
      </group>
    );
  }
  if (type === 'vehicle') {
    return (
      <group position={[x, -4.15, 0]}>
        <mesh scale={[2.25, 0.75, 0.95]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#7f8a91" roughness={0.72} />
        </mesh>
        {[-1.4, 1.4].map((wheelX) => (
          <mesh key={wheelX} position={[wheelX, -0.75, 0.74]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.28, 20]} />
            <meshStandardMaterial color="#1b1f22" roughness={0.86} />
          </mesh>
        ))}
        <Html position={[0, -1.35, 0]} center distanceFactor={12}>
          <span className="scale-label">Ground vehicle 1.5 m</span>
        </Html>
      </group>
    );
  }
  return (
    <group position={[x, 0.4, 0]}>
      <Line points={[[0, -5, 0], [0, 5, 0]]} color="#a3aeb5" lineWidth={2} />
      {[-5, 5].map((y) => (
        <Line key={y} points={[[-0.55, y, 0], [0.55, y, 0]]} color="#a3aeb5" lineWidth={2} />
      ))}
      <Html position={[0, -5.65, 0]} center distanceFactor={12}>
        <span className="scale-label">10 m marker</span>
      </Html>
    </group>
  );
}

function RuntimeProbe({
  record,
  animation,
  cameraMode,
  qualityTier,
  clip,
  onDiagnostics,
  onAnimationTime,
}: Pick<
  ChamberProps,
  'record' | 'animation' | 'cameraMode' | 'qualityTier' | 'clip' | 'onDiagnostics' | 'onAnimationTime'
>) {
  const { gl } = useThree();
  const animationTime = useRef(0);
  const sampleTime = useRef(0);

  useEffect(() => {
    animationTime.current = 0;
    onAnimationTime(0);
  }, [record.id, animation.name, animation.restartToken, onAnimationTime]);

  useFrame((_, delta) => {
    if (animation.playing) {
      animationTime.current += delta * animation.speed;
      if (animation.loop && animationTime.current > 6) animationTime.current %= 6;
      if (!animation.loop) animationTime.current = Math.min(animationTime.current, 6);
    }
    sampleTime.current += delta;
    if (sampleTime.current < 0.25) return;
    sampleTime.current = 0;
    onAnimationTime(animationTime.current);
    const info = gl.info;
    onDiagnostics({
      specimenId: record.id,
      activeAnimation: animation.name,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      cameraMode,
      qualityTier,
      clipping: clip.enabled ? `${clip.axis.toUpperCase()} ${clip.position.toFixed(1)} units` : 'Disabled',
    });
  });

  return null;
}

function ClippingIndicator({ clip }: { clip: ClipState }) {
  if (!clip.enabled) return null;
  const position: [number, number, number] = [
    clip.axis === 'x' ? clip.position : 0,
    clip.axis === 'y' ? clip.position : 0,
    clip.axis === 'z' ? clip.position : 0,
  ];
  const rotation: [number, number, number] =
    clip.axis === 'x'
      ? [0, Math.PI / 2, 0]
      : clip.axis === 'y'
        ? [Math.PI / 2, 0, 0]
        : [0, 0, 0];
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[16, 16, 1, 1]} />
      <meshBasicMaterial color="#d2a24c" transparent opacity={0.16} wireframe side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function getSpecimenAccentColor(archetype: string): string {
  if (archetype.includes('Atmos-Engine')) return '#7ed6f8';
  if (archetype.includes('Crust-Binder')) return '#e05a2b';
  if (archetype.includes('Seedcarrier')) return '#4a6b38';
  if (archetype.includes('Fluxborne')) return '#1e405b';
  if (archetype.includes('Orbital-Wyrm')) return '#c4a359';
  if (archetype.includes('Civiformer')) return '#9e1a1e';
  if (archetype.includes('Noosphere')) return '#8a85b6';
  if (archetype.includes('Glitch-Touched')) return '#e05a2b';
  return '#f0f8ff';
}

function ArchivalContainmentPlatform({ archetype }: { archetype: string }) {
  const ringColor = getSpecimenAccentColor(archetype);

  return (
    <group position={[0, -5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#06090e" roughness={0.92} metalness={0.08} />
      </mesh>
      <gridHelper args={[48, 48, '#1e2d3d', '#0f1722']} position={[0, 0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[6.8, 7.0, 64]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[11.8, 12.0, 64]} />
        <meshBasicMaterial color="#50667a" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ContextLifecycle() {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('[Vault 9 Examination System] WebGL context lost; awaiting browser restoration.');
    };
    const handleContextRestored = () => {
      console.info('[Vault 9 Examination System] WebGL context restored.');
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost, false);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored, false);
    };
  }, [gl]);

  return null;
}

export function ExaminationChamber(props: ChamberProps) {
  const clipPlane = useMemo(() => {
    const direction = props.clip.inverted ? -1 : 1;
    const normal = new THREE.Vector3(
      props.clip.axis === 'x' ? direction : 0,
      props.clip.axis === 'y' ? direction : 0,
      props.clip.axis === 'z' ? direction : 0,
    );
    const constant = -direction * props.clip.position;
    return new THREE.Plane(normal, constant);
  }, [props.clip.axis, props.clip.inverted, props.clip.position]);

  const accentLightColor = getSpecimenAccentColor(props.record.archetype);

  return (
    <div className="chamber-canvas" aria-label={`Three-dimensional examination chamber for ${props.record.designation}`}>
      <Canvas
        key={props.qualityTier}
        shadows={props.qualityTier === 'standard'}
        dpr={props.qualityTier === 'standard' ? [1, 1.6] : 1}
        gl={{ antialias: props.qualityTier === 'standard', powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          gl.setClearColor('#05080f');
        }}
      >
        <ContextLifecycle />
        <color attach="background" args={['#05080f']} />
        <fog attach="fog" args={['#05080f', 26, 62]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[10, 15, 12]} color="#dceaf5" intensity={2.6} castShadow />
        <directionalLight position={[-14, 6, -10]} color="#283b54" intensity={1.3} />
        <directionalLight position={[0, -10, -12]} color="#c4a359" intensity={0.7} />
        <pointLight position={[0, 0, 4]} color={accentLightColor} intensity={1.8} distance={20} />
        <ArchivalContainmentPlatform archetype={props.record.archetype} />
        <Suspense fallback={null}>
          <SpecimenModel
            key={props.record.id}
            record={props.record}
            layers={props.layers}
            animation={props.animation}
            clipPlane={props.clip.enabled ? clipPlane : null}
            wireframe={props.wireframe}
            silhouette={props.silhouette}
            measurementMode={props.measurementMode}
            onMeasurePoint={props.onMeasurePoint}
            selectedAnnotationId={props.selectedAnnotationId}
            onSelectAnnotation={props.onSelectAnnotation}
          />
          <ScaleReference type={props.scaleReference} />
          <MeasurementDisplay points={props.measurementPoints} />
          <ClippingIndicator clip={props.clip} />
        </Suspense>
        <CameraController
          mode={props.cameraMode}
          preset={props.cameraPreset}
          commandToken={props.cameraCommandToken}
          resetToken={props.resetCameraToken}
        />
        <RuntimeProbe
          record={props.record}
          animation={props.animation}
          cameraMode={props.cameraMode}
          qualityTier={props.qualityTier}
          clip={props.clip}
          onDiagnostics={props.onDiagnostics}
          onAnimationTime={props.onAnimationTime}
        />
      </Canvas>
      <div className="chamber-crosshair" aria-hidden="true" />
      <div className="chamber-hud-bar" aria-label="Keyboard shortcut guide">
        <span><kbd>R</kbd> Reset camera</span>
        <span><kbd>Space</kbd> Play / Pause</span>
        <span><kbd>Esc</kbd> Close drawers</span>
        <span><kbd>Drag</kbd> Orbit 3D</span>
      </div>
      <div className="chamber-scale-note">
        Record visualization-height metadata: {props.record.dimensions.visualizationHeightMeters} m. Chamber geometry is normalized and uncalibrated.
      </div>
    </div>
  );
}
