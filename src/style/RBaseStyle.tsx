import React, {JSX, PropsWithChildren} from 'react';

import {RContext, RContextType} from '../context';
import debug from '../debug';

/**
 * @propsfor RBaseStyle
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RBaseStyleProps extends PropsWithChildren<unknown> {}

/**
 * An abstract class used as base for all Style components, not meant to be used directly
 */
export default class RBaseStyle<P extends RBaseStyleProps> extends React.PureComponent<
    P,
    Record<string, never>
> {
    static contextType = RContext;
    protected static classProps: string[] = [];
    classProps!: string[];
    ol: unknown = null;
    declare context: RContextType;

    constructor(props: Readonly<P>) {
        super(props);
    }

    /* istanbul ignore next */
    protected create(props: P): unknown {
        throw new Error('RBaseStyle is an abstract class');
    }

    protected refresh(prevProps?: P): void {
        debug('refreshStyle', this);
        if (!prevProps) return;
        for (const p of this.classProps) {
            const m = p.charAt(0).toUpperCase() + p.substring(1);
            if ((prevProps && prevProps[p]) !== this.props[p]) {
                const ol = this.ol as Record<string, unknown>;
                if (typeof ol['set' + m] === 'function') {
                    (ol['set' + m] as (v: unknown) => void)(this.props[p]);
                } else {
                    // eslint-disable-next-line no-console
                    console.error(
                        `Underlying OpenLayers object does not support updating of ${p} after object creation. ` +
                            'If you are using an anonymous constant array or object, ' +
                            'consider assigning its value to a constant and then passing the constant or ' +
                            'use React.useMemo() to avoid this warning and improve performance.'
                    );
                }
            }
        }
    }

    /* istanbul ignore next */
    protected set(ol: unknown): void {
        return;
    }

    componentDidMount(): void {
        this.set(this.ol);
    }

    componentDidUpdate(
        prevProps: Readonly<P>,
        prevState: Readonly<unknown>,
        snapshot: unknown
    ): void {
        if (prevProps !== this.props) this.refresh(prevProps);
    }

    componentWillUnmount(): void {
        this.set(null as unknown as undefined);
    }

    render(): React.ReactNode {
        if (!this.context) throw new Error('A style property must be part of a style');
        if (this.ol === null) {
            this.ol = this.create(this.props);
        }
        return null;
    }
}
