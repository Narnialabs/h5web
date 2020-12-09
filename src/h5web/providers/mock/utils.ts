import { mockValues, myMockMetadata } from './data';
import {
  assertDataset,
  assertMySimpleShape,
  assertNumericType,
  isGroup,
} from '../utils';
import { assertArray, assertDefined } from '../../visualizations/shared/utils';
import ndarray from 'ndarray';
import { MyHDF5Entity } from '../models';
import { getChildEntity } from '../../visualizations/nexus/utils';

export function getMockDataArray(path: string): ndarray {
  const pathSegments = path.slice(1).split('/');

  const dataset = pathSegments.reduce<MyHDF5Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined;
    },
    myMockMetadata
  );

  assertDefined(dataset, `Expected entity at path "${path}"`);
  assertDataset(dataset, `Expected group at path "${path}"`);
  assertNumericType(dataset);
  assertMySimpleShape(dataset);

  const value = mockValues[dataset.id as keyof typeof mockValues];
  assertArray<number>(value);

  return ndarray(value, dataset.shape.dims);
}
