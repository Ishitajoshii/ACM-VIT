// Types for model-viewer

export interface ModelViewerOptions {
  pin?: boolean;
  debugMarkers?: boolean;
  endScroll?: number;
  showHelpers?: boolean;
  desiredSize?: number;
  padding?: number;
  cameraDistanceMul?: number;
  startX?: number;
  endX?: number;
  forcePinType?: string | null;
  watchdogMs?: number;
  recenter?: boolean;
}