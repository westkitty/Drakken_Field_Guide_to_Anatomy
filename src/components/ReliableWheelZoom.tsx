import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

interface OrbitLike {
  target: THREE.Vector3;
  update: () => void;
}

interface StateWithControls {
  camera: THREE.Camera;
  controls?: OrbitLike;
}

function publishCameraState(canvas: HTMLCanvasElement, camera: THREE.Camera, target: THREE.Vector3) {
  const mode = (camera as THREE.PerspectiveCamera).isPerspectiveCamera ? 'perspective' : 'orthographic';
  const position = camera.position.toArray().map((value) => value.toFixed(4)).join(',');
  const targetValue = target.toArray().map((value) => value.toFixed(4)).join(',');
  canvas.dataset.cameraState = `${mode}|${position}|${targetValue}|${camera.zoom.toFixed(4)}`;
  canvas.dataset.cameraInteractionCount = String(Number(canvas.dataset.cameraInteractionCount ?? '0') + 1);
  canvas.dataset.cameraMode = mode;
  canvas.dataset.cameraInteracting = 'false';
}

export function ReliableWheelZoom() {
  const gl = useThree((state) => state.gl);
  const get = useThree((state) => state.get);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const state = get() as unknown as StateWithControls;
      const camera = state.camera;
      const controls = state.controls;
      const target = controls?.target ?? new THREE.Vector3(0, 0.55, 0);
      const exponentialFactor = Math.exp(event.deltaY * 0.00145);

      if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
        const perspective = camera as THREE.PerspectiveCamera;
        const offset = perspective.position.clone().sub(target);
        const nextDistance = THREE.MathUtils.clamp(offset.length() * exponentialFactor, 2.5, 70);
        perspective.position.copy(target).add(offset.normalize().multiplyScalar(nextDistance));
      } else if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
        const orthographic = camera as THREE.OrthographicCamera;
        orthographic.zoom = THREE.MathUtils.clamp(orthographic.zoom / exponentialFactor, 8, 180);
      }

      camera.updateProjectionMatrix();
      controls?.update();
      publishCameraState(canvas, camera, target);
      invalidate();
    };

    canvas.addEventListener('wheel', handleWheel, { capture: true, passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel, { capture: true });
  }, [get, gl, invalidate]);

  return null;
}
