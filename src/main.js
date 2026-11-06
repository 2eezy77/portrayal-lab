import * as maplibregl from 'maplibre-gl';

const map = new maplibregl.Map({
    container: 'map2d',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [-77.038, 38.8975],
    zoom: 16,
});
