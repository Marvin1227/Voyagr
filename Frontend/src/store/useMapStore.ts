import { create } from 'zustand';

type LayerId = 'beaches' | 'hiking' | 'restaurants' | 'parks' | 'hidden-gems';

interface MapStore {
  activeLayers: Set<LayerId>;
  toggleLayer: (id: LayerId) => void;
  currentDestination: string | null;
  setCurrentDestination: (dest: string | null) => void;
}

export const useMapStore = create<MapStore>(() => ({
  activeLayers: new Set(),

  toggleLayer: (_id) => {
    // TODO: add the layer id if not present, remove it if already present
  },

  currentDestination: null,

  setCurrentDestination: (_dest) => {
    // TODO: update currentDestination in the store
  },
}));
