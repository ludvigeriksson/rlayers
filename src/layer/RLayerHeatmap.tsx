import React from 'react';
import {Feature} from 'ol';
import {Heatmap as LayerHeatmap} from 'ol/layer';
import type {WeightExpression} from 'ol/layer/Heatmap';
import {Vector as SourceVector} from 'ol/source';
import BaseObject from 'ol/Object';
import {Geometry, Point} from 'ol/geom';

import {default as RLayerBaseVector, RLayerBaseVectorProps} from './RLayerBaseVector';

/**
 * @propsfor RLayerHeatmap
 */
export interface RLayerHeatmapProps extends RLayerBaseVectorProps<Feature<Point>> {
    /** Blurring */
    blur?: number;
    /** Radius */
    radius?: number;
    /** Weight function for each RFeature, weight goes from 0 to 1 */
    weight?: WeightExpression;
    /**
     * OpenLayers features that will be loaded
     *
     * This property currently does not support dynamic updates.
     *
     * Prefer using nested JSX <RFeature> components in this case.
     */
    features?: Feature<Point>[];
}

/** A vector layer that renders its RFeatures as a heatmap
 *
 * Compatible with RLayerVector
 *
 * Requires an `RMap` context
 *
 * Provides a vector layer for JSX-declared RFeatures
 */
export default class RLayerHeatmap extends RLayerBaseVector<Feature<Point>, RLayerHeatmapProps> {
    declare ol: LayerHeatmap<Feature<Point>>;
    declare source: SourceVector<Feature<Point>>;

    protected createSource(props: Readonly<RLayerHeatmapProps>): BaseObject[] {
        this.source = new SourceVector({
            features: this.props.features,
            url: this.props.url,
            format: this.props.format,
            loader: this.props.loader,
            wrapX: this.props.wrapX,
            strategy: this.props.strategy,
            attributions: this.props.attributions
        });
        this.ol = new LayerHeatmap<Feature<Point>, SourceVector<Feature<Point>>>({
            source: this.source,
            blur: props.blur,
            radius: props.radius,
            weight: props.weight,
            className: props.className
        });
        return [this.ol, this.source];
    }

    protected refresh(prev?: RLayerHeatmapProps): void {
        super.refresh(prev);
        if (prev?.blur !== this.props.blur && this.props.blur !== undefined)
            this.ol.setBlur(this.props.blur);
        if (prev?.radius !== this.props.radius && this.props.radius !== undefined)
            this.ol.setRadius(this.props.radius);
    }
}
