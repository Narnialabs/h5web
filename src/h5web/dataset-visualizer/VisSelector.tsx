import React from 'react';
import type { Vis } from './models';
import styles from './VisSelector.module.css';
import { VIS_DEFS } from '../visualizations';

interface Props {
  activeVis: Vis;
  choices: Vis[];
  onChange?: (vis: Vis) => void;
}

function VisSelector(props: Props): JSX.Element {
  const { activeVis, choices, onChange } = props;

  return (
    <div className={styles.selector} role="tablist" aria-label="Visualization">
      {choices.map((vis) => {
        const { Icon } = VIS_DEFS[vis];
        const onClick = onChange ? () => onChange(vis) : undefined;
        return (
          <button
            key={vis}
            className={styles.btn}
            type="button"
            role="tab"
            aria-selected={vis === activeVis}
            onClick={onClick}
          >
            <Icon className={styles.icon} />
            {vis}
          </button>
        );
      })}
    </div>
  );
}

export default VisSelector;
