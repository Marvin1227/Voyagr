export interface MapAction {
  type: 'flyTo' | 'showLayer' | 'clearMarkers';
  destination?: string;
  lat?: number;
  lng?: number;
  price?: string;
  summary?: string;
}

export interface MayaResponse {
  text: string;
  mapActions: MapAction[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
