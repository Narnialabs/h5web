import React, { useContext } from 'react';
import { GridChildComponentProps } from 'react-window';
import { format } from 'd3-format';
import styles from './MatrixVis.module.css';
import { GridSettingsContext } from './GridSettingsContext';

function Cell(props: GridChildComponentProps): JSX.Element {
  const { rowIndex, columnIndex, style } = props;
  const { valueAccessor } = useContext(GridSettingsContext);

  // Disable index columns (rendering done by the innerElementType)
  if (rowIndex * columnIndex === 0) return <></>;

  // -1 to account for the index row and column
  const dataValue = valueAccessor(rowIndex - 1, columnIndex - 1);
  return (
    <div
      className={styles.cell}
      style={style}
      data-bg={(rowIndex + columnIndex) % 2 === 1 ? '' : undefined}
    >
      {format('.3e')(dataValue)}
    </div>
  );
}

export default Cell;