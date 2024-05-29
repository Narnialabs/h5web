import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getValueOrError } from '@h5web/app';
import {
  assertDataset,
  assertEnvVar,
  assertGroup,
  assertGroupWithChildren,
  hasNonNullShape,
} from '@h5web/shared/guards';
import { expect, test } from 'vitest';

import { H5WasmApi } from './h5wasm-api';

const H5WASM_TEST_FILE = import.meta.env.VITEST_H5WASM_TEST_FILE;
assertEnvVar(H5WASM_TEST_FILE, 'VITEST_H5WASM_TEST_FILE');

const TEST_FILE = path.resolve(process.cwd(), H5WASM_TEST_FILE);

test('test file matches snapshot', async () => {
  if (!existsSync(TEST_FILE)) {
    throw new Error("Sample file doesn't exist");
  }

  const buffer = await readFile(TEST_FILE);
  const api = new H5WasmApi('sample.h5', buffer);

  const root = await api.getEntity('/');
  assertGroup(root);
  assertGroupWithChildren(root);

  const children = await Promise.all(
    root.children.map(async (child) => {
      assertDataset(child);
      const { name, shape, type, rawType } = child;

      const value = hasNonNullShape(child)
        ? await getValueOrError(api, child)
        : null;

      return { name, shape, type, rawType, value };
    }),
  );

  expect(children).toMatchSnapshot();
});
