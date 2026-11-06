export const style = {
    rules: [
        {
            filter: { kind: 'building' },
            symbolizer: { type: 'polygon', fill: '#e64553', extrude: true },
        },
        {
            filter: { kind: 'road' },
            symbolizer: { type: 'line', stroke: '#555555', width: 4 },
        },
        {
            filter: { kind: 'poi' },
            symbolizer: { type: 'point', fill: '#1e66f5', size: 10 },
        },
    ],
};
