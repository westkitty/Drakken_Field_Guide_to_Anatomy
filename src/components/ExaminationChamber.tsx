import {
  Bounds,
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  Line,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  useBounds,
} from '@react-three/drei';
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
  front: [0, 1.2, 14],
  side: [14, 1.2, 0],
  dorsal: [0, 14, 0.1],
  ventral: [0, -14, 0.1],
  'three-quarter': [9.4, 7.2, 11.2],
};

function FitToSpecimen({ recordId, resetToken }: { recordId: string; resetToken: number }) {
  const bounds = useBounds();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => bounds.refresh().clip().fit());
    return () => window.cancelAnimationFrame(frame);
  }, [bounds, recordId, resetToken]);
  return null;
}

function CameraController({
  mode,
  preset,
  commandToken,
}: {
  mode: CameraMode;
  preset: CameraPreset;
  commandToken: number;
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
    camera.lookAt(0, 0.55, 0);
    camera.updateProjectionMatrix();
    controls.current?.target.set(0, 0.55, 0);
    controls.current?.update();
  }, [mode, commandToken, preset]);

  return (
    <>
      <PerspectiveCamera
        ref={perspective}
        makeDefault={mode === 'perspective'}
        position={cameraPositions[preset]}
        fov={36}
        near={0.1}
        far={1000}
      />
      <OrthographicCamera
        ref={orthographic}
        makeDefault={mode === 'orthographic'}
        position={cameraPositions[preset]}
        zoom={58}
        near={0.1}
        far={1000}
      />
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.075}
        minDistance={3.5}
        maxDistance={60}
        panSpeed={0.8}
        rotateSpeed={0.68}
        zoomSpeed={0.82}
        screenSpacePanning
        target={[0, 0.55, 0]}
      />
    </>
  );
}

function MeasurementDisplay({ points }: { points: [number, number, number][] }) {
  if (points.length === 0) return null;
  const distance = points.length === 2 ? distanceMeters(points[0], points[1]) : 0;
  const midpoint: [number, number, number] = points.length === 2
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
          <meshBasicMaterial color="#a6e7ff" depthTest={false} />
        </mesh>
      ))}
      {points.length === 2 && (
        <>
          <Line points={points} color="#a6e7ff" lineWidth={2} depthTest={false} />
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
        <mesh position={[0, 1.55, 0]} castShadow>
          <sphereGeometry args={[0.18, 18, 12]} />
          <meshStandardMaterial color="#e4edf2" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow>
          <capsuleGeometry args={[0.22, 1.12, 8, 12]} />
          <meshStandardMaterial color="#a9b7c0" roughness={0.72} />
        </mesh>
        <Html position={[0, -0.15, 0]} center distanceFactor={12}>
          <span className="scale-label">Illustrative human marker</span>
        </Html>
      </group>
    );
  }
  if (type === 'vehicle') {
    return (
      <group position={[x, -4.15, 0]}>
        <mesh scale={[2.25, 0.75, 0.95]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#9baab3" roughness={0.68} />
        </mesh>
        {[-1.4, 1.4].map((wheelX) => (
          <mesh key={wheelX} position={[wheelX, -0.75, 0.74]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.28, 20]} />
            <meshStandardMaterial color="#303940" roughness={0.82} />
          </mesh>
        ))}
        <Html position={[0, -1.35, 0]} center distanceFactor={12}>
          <span className="scale-label">Illustrative vehicle marker</span>
        </Html>
      </group>
    );
  }
  return (
    <group position={[x, 0.4, 0]}>
      <Line points={[[0, -5, 0], [0, 5, 0]]} color="#c0ccd3" lineWidth={2} />
      {[-5, 5].map((y) => (
        <Line key={y} points={[[-0.55, y, 0], [0.55, y, 0]]} color="#c0ccd3" lineWidth={2} />
      ))}
      <Html position={[0, -5.65, 0]} center distanceFactor={12}>
        <span className="scale-label">Illustrative height marker</span>
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
  const rotation: [number, number, number] = clip.axis === 'x'
    ? [0, Math.PI / 2, 0]
    : clip.axis === 'y'
      ? [Math.PI / 2, 0, 0]
      : [0, 0, 0];
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[18, 18, 1, 1]} />
      <meshBasicMaterial color="#f0c46f" transparent opacity={0.17} wireframe side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function getSpecimenAccentColor(archetype: string): string {
  if (archetype.includes('Atmos-Engine')) return '#91e2ff';
  if (archetype.includes('Crust-Binder')) return '#ff7b4d';
  if (archetype.includes('Seedcarrier')) return '#86b96d';
  if (archetype.includes('Fluxborne')) return '#65b8eb';
  if (archetype.includes('Orbital-Wyrm')) return '#e0bd70';
  if (archetype.includes('Civiformer')) return '#e24a50';
  if (archetype.includes('Noosphere')) return '#b8afff';
  if (archetype.includes('Glitch-Touched')) return '#ff7b4d';
  return '#f2f8fb';
}

function ArchivalContainmentPlatform({ archetype }: { archetype: string }) {
  const ringColor = getSpecimenAccentColor(archetype);
  return (
    <group position={[0, -5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[52, 52]} />
        <meshStandardMaterial color="#171d22" roughness={0.92} metalness={0.04} />
      </mesh>
      <gridHelper args={[52, 52, '#34434d', '#28343c']} position={[0, 0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[6.8, 7.04, 96]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[11.8, 12.04, 96]} />
        <meshBasicMaterial color="#b7c8d2" transparent opacity={0.36} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function StudioLighting({ accent, qualityTier }: { accent: string; qualityTier: ChamberProps['qualityTier'] }) {
  return (
    <>
      <hemisphereLight color="#ffffff" groundColor="#61717c" intensity={1.15} />
      <ambientLight intensity={0.38} />
      <directionalLight
        position={[10, 15, 12]}
        color="#fffaf2"
        intensity={2.55}
        castShadow={qualityTier === 'standard'}
        shadow-mapSize-width={qualityTier === 'standard' ? 2048 : 512}
        shadow-mapSize-height={qualityTier === 'standard' ? 2048 : 512}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-12, 8, 8]} color="#b9e9ff" intensity={1.15} />
      <spotLight position={[0, 10, -13]} color={accent} intensity={1.7} angle={0.52} penumbra={1} distance={42} />
      <pointLight position={[0, -1, 7]} color="#ffffff" intensity={0.95} distance={24} decay={1.5} />
      <pointLight position={[0, -4, -4]} color="#f1c77b" intensity={0.65} distance={18} />
      <Environment resolution={qualityTier === 'standard' ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 8, -12]} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#a7ddff" position={[-10, 2, 4]} rotation={[0, Math.PI / 2, 0]} scale={[8, 8, 1]} />
        <Lightformer form="rect" intensity={1.8} color={accent} position={[10, 1, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 8, 1]} />
      </Environment>
    </>
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
    return new THREE.Plane(normal, -direction * props.clip.position);
  }, [props.clip.axis, props.clip.inverted, props.clip.position]);

  const accentLightColor = getSpecimenAccentColor(props.record.archetype);

  return (
    <div className="chamber-canvas" aria-label={`Three-dimensional examination chamber for ${props.record.designation}`}>
      <Canvas
        key={props.qualityTier}
        shadows={props.qualityTier === 'standard'}
        dpr={props.qualityTier === 'standard' ? [1, 1.75] : 1}
        gl={{ antialias: props.qualityTier === 'standard', powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          gl.setClearColor('#1b2329');
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.02;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <ContextLifecycle />
        <color attach="background" args={['#1b2329']} />
        <fog attach="fog" args={['#1b2329', 42, 96]} />
        <StudioLighting accent={accentLightColor} qualityTier={props.qualityTier} />
        <ArchivalContainmentPlatform archetype={props.record.archetype} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.38}>
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
          <FitToSpecimen recordId={props.record.id} resetToken={props.resetCameraToken} />
          </Bounds>
          <ContactShadows
            position={[0, -4.93, 0]}
            opacity={0.28}
            scale={28}
            blur={2.6}
            far={18}
            resolution={props.qualityTier === 'standard' ? 512 : 256}
            frames={1}
          />
          <ScaleReference type={props.scaleReference} />
          <MeasurementDisplay points={props.measurementPoints} />
          <ClippingIndicator clip={props.clip} />
        </Suspense>
        <CameraController
          mode={props.cameraMode}
          preset={props.cameraPreset}
          commandToken={props.cameraCommandToken}
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
