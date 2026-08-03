import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AnimationState, LayerId, SpecimenRecord } from '../types';

export interface SpecimenModelProps {
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

export function materialColor(base: string, silhouette: boolean): string {
  return silhouette ? '#05070a' : base;
}

export function clipArray(plane: THREE.Plane | null): THREE.Plane[] {
  return plane ? [plane] : [];
}

export function useAnimationClock(animation: AnimationState) {
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
