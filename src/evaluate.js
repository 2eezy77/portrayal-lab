import { style } from './style.js';

export function evaluate(feature) {
    for (const rule of style.rules) {
        if (feature.properties.kind === rule.filter.kind) {
            return rule.symbolizer;
        }
    }
    return null;
}
