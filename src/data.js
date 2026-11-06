export const features = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { kind: 'building', name: 'Tall', height: 120 },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-77.037, 38.897],
                        [-77.035, 38.897],
                        [-77.035, 38.8985],
                        [-77.037, 38.8985],
                        [-77.037, 38.897],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { kind: 'building', name: 'Short', height: 30 },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-77.0387862, 38.8981621],
                        [-77.037277, 38.8981549],
                        [-77.0373048, 38.8970669],
                        [-77.0387676, 38.8970741],
                        [-77.0387862, 38.8981621],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { kind: 'road', name: '17th Street NW' },
            geometry: {
                type: 'LineString',
                coordinates: [
                    [-77.0394991, 38.8987674],
                    [-77.039462, 38.8964688],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { kind: 'poi', category: 'cafe', name: 'Cafe 17' },
            geometry: {
                type: 'Point',
                coordinates: [-77.0401422, 38.897556],
            },
        },
    ],
};
