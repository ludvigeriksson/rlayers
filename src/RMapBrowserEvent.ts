import type {MapBrowserEvent} from 'ol';

/** Map browser event type used by rlayers handlers (matches OpenLayers' constraint). */
export type RMapBrowserEvent = MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>;
