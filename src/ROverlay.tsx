import React, {MouseEvent, PropsWithChildren} from 'react';
import {Overlay} from 'ol';
import {type Coordinate} from 'ol/coordinate';
import {type PanIntoViewOptions} from 'ol/Overlay';

import {RlayersBase} from './REvent';
import {type RContextType} from './context';

// TODO: Use the OpenLayers 7 type after OpenLayers 6 support
// is dropped
export type Positioning =
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'center-left'
    | 'center-center'
    | 'center-right'
    | 'top-left'
    | 'top-center'
    | 'top-right';

/**
 * @propsfor ROverlay
 */
export interface ROverlayProps extends PropsWithChildren<unknown> {
    /** Content to be displayed */
    content?: string | HTMLElement | React.ElementType;
    /** CSS class */
    className?: string;
    /** Automatically pan the map when the element is rendered
     * @default false */
    autoPan?: boolean | PanIntoViewOptions;
    /** Offset the overlay on the x and y axes relative to the containing feature
     * @default [0,0] */
    offset?: number[];
    /** The overlay position in map projection. */
    position?: Coordinate;
    /** Anchor point
     * @default 'top-left' */
    positioning?: Positioning;
    /** Whether event propagation to the map viewport should be stopped.
     * If true the overlay is placed in the same container as that of the controls
     * (CSS class name ol-overlaycontainer-stopevent);
     * if false it is placed in the container with CSS class name specified
     * by the className property. */
    stopEvent?: boolean;
    /** Called immediately on click */
    onClick?: (event: MouseEvent<HTMLDivElement>) => void;
    style?: React.CSSProperties;
}

/**
 * An element to be displayed over the map and attached to a single map location.
 * Like Control, Overlays are visible widgets. Unlike Controls, they are not in a
 * fixed position on the screen, but are tied to a geographical coordinate,
 * so panning the map will move an Overlay but not a Control.
 *
 * If it's a descendant of a `RFeature`, the position parameter can be skipped
 * as the location of the feature is used instead.
 *
 * @name ROverlay
 * @constructor
 */
export class ROverlayBase<P extends ROverlayProps> extends RlayersBase<P, Record<string, never>> {
    ol: Overlay;
    protected containerRef: React.RefObject<HTMLDivElement>;

    constructor(props: Readonly<P>, context?: React.Context<RContextType>) {
        super(props, context);
        if (!props.position && !this.context?.location)
            throw new Error(
                'An overlay must be part of a location provider (ie RFeature)' +
                    ', unless a position is provided'
            );
        this.ol = new Overlay({
            autoPan: props.autoPan,
            offset: props.offset,
            position: props.position,
            positioning: props.positioning,
            className: props.className,
            stopEvent: props.stopEvent
        });
        this.containerRef = React.createRef();
    }

    protected setPosition(): void {
        this.ol.setPosition(this.props.position ?? this.context.location);
    }

    protected refresh(prevProps?: P): void {
        super.refresh(prevProps);
        this.ol.setElement(this.containerRef.current);
        this.setPosition();
        if (this.props.offset !== prevProps?.offset) {
            this.ol.setOffset(this.props.offset);
        }
        if (this.props.positioning !== prevProps?.positioning) {
            this.ol.setPositioning(this.props.positioning);
        }
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.context.map.addOverlay(this.ol);
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
        this.context.map.removeOverlay(this.ol);
    }

    render(): JSX.Element {
        this.setPosition();
        return (
            <div className='_rlayers_ROverlay'>
                <div ref={this.containerRef} onClick={this.props.onClick} style={this.props.style}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default class ROverlay extends ROverlayBase<ROverlayProps> {}
