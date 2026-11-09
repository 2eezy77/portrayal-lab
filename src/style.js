export const style = {
    rules: [
        {
            filter: { kind: 'poi' },
            symbolizer: { type: 'point', fill: 'rgb(84, 30, 245)', size: 5 },
        },
        {
            filter: { kind: 'building' },
            symbolizer: { type: 'polygon', fill: 'rgb(74, 230, 69)', extrude: true },
        },
        {
            filter: { kind: 'road' },
            symbolizer: { type: 'line', stroke: 'rgb(200, 137, 19)', width: 5 },
        },
    ],
};
