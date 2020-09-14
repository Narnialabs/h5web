import React from 'react';
import { AxisRight } from '@vx/axis';
import { useMeasure } from 'react-use';
import shallow from 'zustand/shallow';
import { adaptedNumTicks } from '../shared/utils';
import { useInterpolator } from './hooks';
import { useHeatmapConfig } from './config';
import styles from './HeatmapVis.module.css';
import { generateCSSLinearGradient } from './utils';
import { SCALE_FUNCTIONS } from '../shared/models';

function ColorBar(): JSX.Element {
  const [dataDomain, customDomain, scaleType] = useHeatmapConfig(
    (state) => [state.dataDomain, state.customDomain, state.scaleType],
    shallow
  );

  const interpolator = useInterpolator();
  const [gradientRef, { height: gradientHeight }] = useMeasure();

  if (!dataDomain) {
    return <></>;
  }

  const axisScale = SCALE_FUNCTIONS[scaleType]();
  axisScale.domain(customDomain || dataDomain);
  axisScale.range([gradientHeight, 0]);

  return (
    <div className={styles.colorBar}>
      <div
        ref={gradientRef}
        className={styles.gradient}
        style={{
          backgroundImage: generateCSSLinearGradient(interpolator, 'top'),
        }}
      />
      {gradientHeight > 0 && (
        <svg
          className={styles.colorBarAxis}
          height={gradientHeight}
          width="2em"
        >
          <AxisRight
            scale={axisScale}
            hideAxisLine
            numTicks={adaptedNumTicks(gradientHeight)}
            tickFormat={axisScale.tickFormat(
              adaptedNumTicks(gradientHeight),
              '.3'
            )}
          />
        </svg>
      )}
    </div>
  );
}

export default ColorBar;
