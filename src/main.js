import { features } from './data.js';
import { style, fallback } from './style.js';

import * as maplibregl from 'maplibre-gl';

const map = new maplibregl.Map({
    container: 'map2d',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [-77.038, 38.8975],
    zoom: 16,
});

map.on('load', () => {
    map.addSource('lab', { type: 'geojson', data: features });
    // use JavaScript's **`.find()`** method
    // It searches an array and returns the first item that passes a test,
    //  instead of choosing an item by position
    const buildingRule = style.rules.find((rule) => rule.filter.kind === 'building') ?? fallback; // ?? if not left then do the right side (fallback)
    const roadRule = style.rules.find((rule) => rule.filter.kind === 'road') ?? fallback; // fallback is explained in ./style.js
    const poiRule = style.rules.find((rule) => rule.filter.kind === 'poi') ?? fallback;
    map.addLayer({
        id: 'lab-building',
        type: 'fill',
        source: 'lab',
        filter: ['==', ['get', 'kind'], 'building'],
        //replacing hardcoded info with style.rules[array#].symbolizer.fill, with this expression allows you to call ./style.js (DONT USE QUOTES)
        paint: { 'fill-color': (buildingRule.symbolizer ?? buildingRule).fill },
    });
    map.addLayer({
        id: 'lab-road',
        type: 'line',
        source: 'lab',
        filter: ['==', ['get', 'kind'], 'road'],
        paint: {
            // ?? means "if left side is nothing use right"
            'line-color': (roadRule.symbolizer ?? roadRule).stroke,
            'line-width': (roadRule.symbolizer ?? roadRule).width,
        },
    });
    map.addLayer({
        id: 'lab-poi',
        type: 'circle',
        source: 'lab',
        filter: ['==', ['get', 'kind'], 'poi'],
        paint: {
            'circle-color': (poiRule.symbolizer ?? poiRule).fill,
            'circle-radius': (poiRule.symbolizer ?? poiRule).size,
        },
    });
});
