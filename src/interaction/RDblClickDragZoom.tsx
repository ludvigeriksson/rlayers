import React from 'react';
import {ObjectEvent} from 'ol/Object';
import {DblClickDragZoom} from 'ol/interaction';

import RBaseInteraction from './RBaseInteraction';

/**
 * @propsfor RDblClickDragZoom
 */
export interface RDblClickDragZoomProps {
    /** Animation duration in milliseconds.
     * @default 400 */
    duration?: number;
    /** The zoom delta applied on move of one pixel.
     * @default 1 */
    delta?: number;
    /** Should the down event be propagated to other interactions, or should be stopped? */
    stopDown?: (handled: boolean) => boolean;
    /** Generic change event. Triggered when the revision counter is increased. */
    onChange?: (this: RDblClickDragZoom, e: ObjectEvent) => void;
}

/**
 * Allows the user to zoom the map by double tap/click then drag up/down with one finger/left mouse.
 */
export default class RDblClickDragZoom extends RBaseInteraction<RDblClickDragZoomProps> {
    protected static classProps = ['duration', 'delta', 'stopDown'];
    ol: DblClickDragZoom;

    createOL(props: RDblClickDragZoomProps): DblClickDragZoom {
        this.classProps = RDblClickDragZoom.classProps;
        return new DblClickDragZoom(
            Object.keys(props)
                .filter((p) => this.classProps.includes(p))
                .reduce((ac, p) => ({...ac, [p]: props[p]}), {})
        );
    }
}
