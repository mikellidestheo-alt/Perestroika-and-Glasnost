import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { sfx } from '../audio/sfx';

export function useCanvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return { canvas, texture };
  }, [w, h]);

  useEffect(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, w, h);
    texture.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return texture;
}

/** Wraps text into lines that fit `maxWidth` using the current ctx font. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Hover + click binding for an interactive 3D object. */
export function useInteractive(enabled: boolean, onActivate: () => void) {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!enabled) setHovered(false);
  }, [enabled]);
  useEffect(() => {
    document.body.style.cursor = hovered && enabled ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, enabled]);

  return {
    hovered: hovered && enabled,
    handlers: {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
      },
      onPointerOut: () => setHovered(false),
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (!enabled) return;
        sfx.click();
        onActivate();
      },
    },
  };
}
