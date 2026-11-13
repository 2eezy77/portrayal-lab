import { features } from './data.js';
import { style, fallback } from './style.js';
import * as maplibregl from 'maplibre-gl';
//importing features from milsymbol repo
import ms from 'milsymbol';
import { ms2525c } from 'mil-std-2525';
//turtle file reader
import { Parser, Store } from 'n3';

// open console, you should see a list of triples.
// Each one has a `subject`, a `predicate` (the property) and an `object` (the value).
const text = await (await fetch('/mil2525.ttl')).text();
const triples = new Parser().parse(text);
const store = new Store(triples);
const MIL = 'https://cartoweave.dev/mil2525#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

function value(subject, prop) {
    return store.getObjects(subject, prop, null)[0]?.value;
}

function itemsOf(kind) {
    return store.getSubjects(TYPE, MIL + kind, null).map((s) => ({
        label: value(s, RDFS + 'label'),
        code: value(s, MIL + 'code'),
    }));
}

function fillSelect(id, kind) {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    for (const it of itemsOf(kind)) {
        const opt = document.createElement('option');
        opt.value = it.code;
        opt.textContent = it.label;
        sel.appendChild(opt);
    }
}

fillSelect('aff', 'Affiliation');
fillSelect('ech', 'Echelon');

console.log(triples);

const UNITS = ms2525c.WAR.GRDTRK_UNT.mainIcon;

const map = new maplibregl.Map({
    container: 'map2d',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [-77.038, 38.8975],
    zoom: 16,
});

const WORDS = {
    friend: [1, 'F'],
    hostile: [1, 'H'],
    enemy: [1, 'H'],
    neutral: [1, 'N'],
    squad: [11, 'B'],
    platoon: [11, 'D'],
    company: [11, 'E'],
    battalion: [11, 'F'],
    tank: [4, 'UCA---'],
};

function findUnit(words) {
    //.every() is true only if every word passes the test, so "mechanized infantry" needs both words in the name
    //.filter(w => w)
    const hits = UNITS.filter((r) => words.every((w) => r.name.toLowerCase().includes(w)));
    // .sort((a, b) => ...) puts the shrotest names first. "INFANTRY" beats "INFANTRY AIRBORNE" unless you type "airborne"
    hits.sort((a, b) => a.name.length - b.name.length);
    return hits[0];
}

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
    //added a mil2525 blue rectangle with an X (friendly infantry platoon: svg symbol) in the middle of the maplibre map.
    let sidc = 'SFG-UCI----D';
    const el = document.createElement('div');

    //same as react setState (we change the data (sidc) and then redraw from it)
    function draw() {
        const sym = new ms.Symbol(sidc, { size: 35 });
        el.innerHTML = sym.asSVG();
    }

    function setSlot(i, letter) {
        // .slice(a, b) works by concatenating e.g., f"{a}+{b}"=ab; where we solve an inate problem that is introduced in programming.
        //     * Strings cant be edited in place,
        //     * setSlot glues together the part before the slot, the new letter, and the part after.
        sidc = sidc.slice(0, i) + letter + sidc.slice(i + letter.length);
        //same as react setState (we change the data (sidc) and then redraw from it)
        draw();
    }

    document.getElementById('aff').addEventListener('change', (e) => setSlot(1, e.target.value));
    document.getElementById('ech').addEventListener('change', (e) => setSlot(11, e.target.value));
    // Plain-word search: known words (friend, company...) set their slot right away.
    // Leftover words go in `rest` and are searched in the 2525C ground-unit table, and the best match sets slots 4-9.
    // const rest = [] must come before the loop, or rest.push() crashes.
    document.getElementById('words').addEventListener('input', (e) => {
        const list = e.target.value
            .toLowerCase()
            .split(' ')
            .filter((w) => w);
        const rest = [];
        for (const w of list) {
            const hit = WORDS[w];
            if (hit) setSlot(hit[0], hit[1]);
            else rest.push(w);
        }
        const found = document.getElementById('found');
        if (rest.length === 0) return;
        const unit = findUnit(rest);
        if (unit) {
            setSlot(4, unit.functionid);
            found.textContent = unit.name;
        } else {
            found.textContent = 'no match';
        }
    });

    draw();
    //GeoJSON is the standard way to save map points as data.
    //  Each point is a "Feature" with a location plus any extra info you choose,
    //  here the SIDC code.
    const Marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(map.getCenter())
        .addTo(map);
    const placed = [];

    function placeCopy() {
        //reads where the marker is now, after you drag it
        const pos = Marker.getLngLat();
        const copy = document.createElement('div');
        //make copy ignore the mouse, and nudge your draggable symbol to the side so you can see the copy
        //pointerEvents = 'none' lets clicks pass through the copy to whatever is underneath
        copy.style.pointerEvents = 'none';
        //freezes the current picture, so later chagnes don't affect symbols you've already placed
        copy.innerHTML = el.innerHTML;
        new maplibregl.Marker({ element: copy }).setLngLat(pos).addTo(map);
        //adds a new GeoJSON point to the list
        placed.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [pos.lng, pos.lat] },
            properties: { sidc },
        });
        console.log(placed);
        //map.project turns a map location into screen pixels, and unproject turns pixels back into a location.
        //Together they move your symbol 50 pixels to the right of the copy
        const p = map.project(pos);
        Marker.setLngLat(map.unproject([p.x + 50, p.y]));
    }

    document.getElementById('place-btn').addEventListener('click', placeCopy);

    async function findPlace() {
        const q = document.getElementById('place').value;
        //encondeURIComponent -> makes spaces and commas safe to put in a web address
        //photon is a free shared service, so we search only when you click Go, not on every key you type.
        const url = 'https://photon.komoot.io/api/?limit=1&q=' + encodeURIComponent(q);
        const res = await fetch(url);
        const data = await res.json();
        const hit = data.features[0];
        if (!hit) return alert('Not found');
        // unpacks a two-item list into two variables in one line. Photon gives longitude first like
        // GeoJSON: layer styling specs
        const [lng, lat] = hit.geometry.coordinates;
        // smoothly moves map to the new spot
        map.flyTo({ center: [lng, lat], zoom: 12 });
        Marker.setLngLat([lng, lat]);
    }

    document.getElementById('go').addEventListener('click', findPlace);
});
