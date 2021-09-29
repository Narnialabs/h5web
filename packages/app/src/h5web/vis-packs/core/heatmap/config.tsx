import create from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorMap, Layout } from './models';
import type { ConfigProviderProps } from '../../models';
import createContext from 'zustand/context';
import type { CustomDomain, Domain } from '@h5web/lib';
import { ScaleType } from '@h5web/shared';

interface HeatmapConfig {
  dataDomain: Domain | undefined;
  setDataDomain: (dataDomain: Domain) => void;

  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: ScaleType;
  staleDomainScaleType: ScaleType | undefined; // for domain slider, when `dataDomain` is being recomputed with new scale type
  setScaleType: (scaleType: ScaleType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  layout: Layout;
  setLayout: (layout: Layout) => void;

  flipYAxis: boolean;
  toggleYAxisFlip: () => void;
}

function createStore() {
  return create<HeatmapConfig>(
    persist(
      (set, get) => ({
        dataDomain: undefined,
        setDataDomain: (dataDomain: Domain) => {
          set({ dataDomain, staleDomainScaleType: undefined });
        },

        customDomain: [null, null],
        setCustomDomain: (customDomain: CustomDomain) => set({ customDomain }),

        colorMap: 'Viridis',
        setColorMap: (colorMap: ColorMap) => set({ colorMap }),

        invertColorMap: false,
        toggleColorMapInversion: () => {
          set((state) => ({ invertColorMap: !state.invertColorMap }));
        },

        scaleType: ScaleType.Linear,
        staleDomainScaleType: undefined,
        setScaleType: (scaleType: ScaleType) => {
          const prevScaleType = get().scaleType;
          if (scaleType !== prevScaleType) {
            set(() => ({ scaleType, staleDomainScaleType: prevScaleType }));
          }
        },

        showGrid: true,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        layout: 'cover',
        setLayout: (layout: Layout) => set({ layout }),

        flipYAxis: false,
        toggleYAxisFlip: () =>
          set((state) => ({ flipYAxis: !state.flipYAxis })),
      }),
      {
        name: 'h5web:heatmap',
        whitelist: [
          'customDomain',
          'colorMap',
          'scaleType',
          'showGrid',
          'invertColorMap',
          'layout',
          'flipYAxis',
        ],
        version: 8,
      }
    )
  );
}

const { Provider, useStore } = createContext<HeatmapConfig>();
export const useHeatmapConfig = useStore;

export function HeatmapConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}