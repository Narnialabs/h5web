import { assertGroup, assertMinDims } from '@h5web/shared/guards';
import type { NumericType } from '@h5web/shared/hdf5-models';
import { useState } from 'react';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import { useHeatmapConfig } from '../../core/heatmap/config';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { getSliceSelection } from '../../core/utils';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertNumericNxData } from '../guards';
import { useNxData, useNxValuesCached } from '../hooks';
import type { NxData } from '../models';
import NxSignalPicker from '../NxSignalPicker';
import NxValuesFetcher from '../NxValuesFetcher';
import { guessKeepRatio } from '../utils';

function NxImageContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericNxData(nxData);

  const { signalDef, axisDefs, auxDefs, silxStyle } = nxData;
  const [selectedDef, setSelectedDef] = useState(signalDef);
  assertMinDims(selectedDef.dataset, 2);

  const { shape: dims } = selectedDef.dataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const axisLabels = axisDefs.map((def) => def?.label);
  const xAxisDef = axisDefs[dimMapping.indexOf('x')];
  const yAxisDef = axisDefs[dimMapping.indexOf('y')];

  const config = useHeatmapConfig({
    scaleType: silxStyle.signalScaleType,
    keepRatio: guessKeepRatio(xAxisDef, yAxisDef),
  });

  const nxDataToFetch: NxData<NumericType> = {
    ...nxData,
    signalDef: selectedDef,
    auxDefs: [], // fetch selected signal only
    titleDataset:
      selectedDef.dataset === signalDef.dataset
        ? nxData.titleDataset
        : undefined, // when auxiliary signal is selected, always use its label as title
  };

  return (
    <>
      {auxDefs.length > 0 && (
        <NxSignalPicker
          definitions={[signalDef, ...auxDefs]}
          onChange={setSelectedDef}
        />
      )}
      <DimensionMapper
        dims={dims}
        axisLabels={axisLabels}
        dimMapping={dimMapping}
        isCached={useNxValuesCached(nxData)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxDataToFetch}
          selection={getSliceSelection(dimMapping)}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            return (
              <MappedHeatmapVis
                dataset={selectedDef.dataset}
                value={signal}
                dimMapping={dimMapping}
                axisLabels={axisLabels}
                axisValues={axisValues}
                title={title}
                toolbarContainer={toolbarContainer}
                config={config}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxImageContainer;
