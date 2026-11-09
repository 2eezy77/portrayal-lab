export const style = {
    rules: [
        {
            filter: { kind: 'building' },
            symbolizer: { type: 'polygon', fill: 'rgb(69, 133, 230)', extrude: true },
        },
        {
            filter: { kind: 'road' },
            symbolizer: { type: 'line', stroke: 'rgb(236, 15, 136)', width: 5 },
        },
        {
            filter: { kind: 'poi' },
            symbolizer: { type: 'point', fill: 'rgb(66, 245, 30)', size: 5 },
        },
    ],
};
