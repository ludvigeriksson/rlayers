import React, {MouseEvent, PropsWithChildren} from 'react';
import {Overlay} from 'ol';

import {RContextType} from './context';
import {RlayersBase} from './REvent';
import {type Coordinate} from 'ol/coordinate';

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
    autoPan?: boolean;
    /** Offset the overlay on the x and y axes relative to the containing feature
     * @default [0,0] */
    offset?: number[];
    /** The overlay position in map projection. */
    position?: Coordinate;
    /** Anchor point
     * @default 'top-left' */
    positioning?: Positioning;
    /** Automatically position the overlay so that it fits in the viewport
     * @default false */
    autoPosition?: boolean;
    /** Called immediately on click */
    onClick?: (event: MouseEvent<HTMLDivElement>) => void;
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
            positioning: props.positioning
        });
        this.containerRef = React.createRef();
    }

    protected setPosition(): void {
        this.ol.setPosition(this.props.position ?? this.context.location);
        // if (this.props.autoPosition && this.containerRef?.current) {
        //     this.containerRef.current.style.position = 'absolute';
        //     const pixel = this.context.map.getPixelFromCoordinate(this.context.location);
        //     const size = this.context.map.getSize();
        //     if (pixel[0] > size[0] / 2) {
        //         this.containerRef.current.style.left = null;
        //         this.containerRef.current.style.right = '0px';
        //     } else {
        //         this.containerRef.current.style.left = '0px';
        //         this.containerRef.current.style.right = null;
        //     }
        //     if (pixel[1] > size[1] / 2) {
        //         this.containerRef.current.style.top = null;
        //         this.containerRef.current.style.bottom = '0px';
        //     } else {
        //         this.containerRef.current.style.top = '0px';
        //         this.containerRef.current.style.bottom = null;
        //     }
        // }
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
                <div
                    ref={this.containerRef}
                    className={this.props.className}
                    onClick={this.props.onClick}
                >
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default class ROverlay extends ROverlayBase<ROverlayProps> {}
