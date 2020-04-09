import React, { useCallback, useRef } from 'react';
import { extent } from 'd3-array';
import { rgb } from 'd3-color';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { Vector3 } from 'three';
import { ReactThreeFiber, PointerEvent, useThree } from 'react-three-fiber';
import { clamp } from 'lodash-es';

const ZOOM_FACTOR = 0.95;

export function computeTextureData(
  values: number[],
  domain: [number, number] | undefined,
  interpolator: (t: number) => string
): Uint8Array | undefined {
  if (domain === undefined) {
    return undefined;
  }
  const scale = scaleSequential(interpolator).domain(domain);
  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.map(val => {
    const { r, g, b } = rgb(scale(val)); // `colorMap` returns CSS RGB strings
    return [r, g, b];
  });

  return Uint8Array.from(colors.flat());
}

export function findDomain(values: number[]): [number, number] | undefined {
  const [min, max] = extent(values);

  if (min === undefined || max === undefined) {
    return undefined;
  }
  return [min, max];
}

export const adaptedNumTicks = scaleLinear()
  .domain([300, 900])
  .rangeRound([3, 10])
  .clamp(true);

export function usePanZoom(): ReactThreeFiber.Events {
  const { size, camera } = useThree();
  const { width, height } = size;

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

  const moveCameraTo = useCallback(
    (x: number, y: number) => {
      const { position, zoom } = camera;

      const factor = (1 - 1 / zoom) / 2;
      const xBound = width * factor;
      const yBound = height * factor;

      position.set(
        clamp(x, -xBound, xBound),
        clamp(y, -yBound, yBound),
        position.z
      );
    },
    [camera, height, width]
  );

  const onPointerDown = useCallback(
    (evt: PointerEvent) => {
      evt.stopPropagation();

      const { currentTarget, pointerId } = evt as React.PointerEvent;
      currentTarget.setPointerCapture(pointerId);

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      startOffsetPosition.current = camera.position.clone().add(projectedPoint);
    },
    [camera]
  );

  const onPointerUp = useCallback((evt: PointerEvent) => {
    evt.stopPropagation();

    const { currentTarget, pointerId } = evt as React.PointerEvent;
    currentTarget.releasePointerCapture(pointerId);

    startOffsetPosition.current = undefined;
  }, []);

  const onPointerMove = useCallback(
    (evt: PointerEvent) => {
      if (!startOffsetPosition.current) {
        return;
      }

      evt.stopPropagation();

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      const { x: pointerX, y: pointerY } = projectedPoint;
      const { x: startX, y: startY } = startOffsetPosition.current;

      moveCameraTo(startX - pointerX, startY - pointerY);
    },
    [camera, moveCameraTo]
  );

  const onWheel = useCallback(
    (evt: PointerEvent) => {
      evt.stopPropagation();

      const { deltaY } = evt as React.WheelEvent;
      const factor = deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

      // eslint-disable-next-line no-param-reassign
      camera.zoom = Math.max(1, camera.zoom * factor);
      camera.updateProjectionMatrix();

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      const { x: pointerX, y: pointerY } = projectedPoint;
      const { x: camX, y: camY } = camera.position;

      moveCameraTo(
        camX + pointerX * (1 - 1 / factor),
        camY + pointerY * (1 - 1 / factor)
      );
    },
    [camera, moveCameraTo]
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onWheel,
  };
}
