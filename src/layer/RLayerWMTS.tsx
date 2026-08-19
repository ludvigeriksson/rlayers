import React from 'react';
import {Map} from 'ol';
import {Tile as LayerTile} from 'ol/layer';
import {default as SourceWMTS, optionsFromCapabilities, Options} from 'ol/source/WMTS';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import BaseEvent from 'ol/events/Event';

import {default as RLayerRaster, RLayerRasterProps} from './RLayerRaster';
import debug from '../debug';

/**
 * @propsfor RLayerWMTS
 */
export interface RLayerWMTSProps extends RLayerRasterProps {
    /** URL for the WMTS getCapabilites request */
    url: string;
    /** Layer name */
    layer: string;
    /** Called by OpenLayers when the layer is ready to start rendering */
    onSourceReady?: (this: RLayerWMTS, e: BaseEvent) => void;
    /** Called each time the component is rerendered if/after the WMTS capabilities have been acquired */
    onCapabilities?: (this: RLayerWMTS, opt: Options) => void;
    /** Preferred matrix set when selecting the WMTS source */
    matrixSet?: string;
}

/**
 * A layer for WMTS-compatible raster tile servers
 *
 * Requires an `RMap` context
 */
export default class RLayerWMTS extends RLayerRaster<RLayerWMTSProps> {
    declare ol: LayerTile<SourceWMTS>;
    declare source: SourceWMTS | null;
    declare loading: Promise<SourceWMTS | null> | null;
    parser: WMTSCapabilities;
    declare options: Options | null;

    constructor(props: Readonly<RLayerWMTSProps>) {
        super(props);
        this.ol = new LayerTile({className: props.className});
        this.parser = new WMTSCapabilities();
        this.loading = this.createSource();
    }

    protected createSource(): Promise<SourceWMTS | null> {
        debug('createSource', this);
        return fetch(this.props.url)
            .then((r) => r.text())
            .then((text) => {
                const caps = this.parser.read(text);
                this.options = optionsFromCapabilities(caps, {
                    layer: this.props.layer,
                    projection: this.props.projection,
                    matrixSet: this.props.matrixSet
                });
                if (!this.options) {
                    throw new Error('Failed to create WMTS options');
                }
                if (this.props.attributions) this.options.attributions = this.props.attributions;
                this.options.crossOrigin = '';
                if (this.props.projection) this.options.projection = this.props.projection;
                if (this.props.matrixSet) this.options.matrixSet = this.props.matrixSet;
                this.options.wrapX = false;
                this.source = new SourceWMTS(this.options);
                this.ol.setSource(this.source);
                this.eventSources = [this.ol, this.source];
                if (this.props.onCapabilities) this.props.onCapabilities.call(this, this.options);
                return this.source;
            })
            .catch((e) => {
                // eslint-disable-next-line no-console
                console.error('failed loading WMTS', this.props.url, this.props.layer, e);
                return null;
            });
    }

    protected refresh(prevProps?: RLayerWMTSProps): void {
        super.refresh();
        if (
            prevProps?.url !== this.props.url ||
            prevProps?.layer !== this.props.layer ||
            prevProps?.projection !== this.props.projection ||
            prevProps?.matrixSet !== this.props.matrixSet
        ) {
            this.createSource().then(() => {
                if (this.source) {
                    this.ol.setSource(this.source);
                    this.attachOldEventHandlers(this.source);
                }
            });
        } else {
            if (this.props.onCapabilities && this.options)
                this.props.onCapabilities.call(this, this.options);
        }
    }
}
