import { createContext, useContext } from 'react';
import type { Map } from 'mapbox-gl';

export const MapContext = createContext<Map | null>(null);

export const useMap = (): Map | null => useContext(MapContext);
