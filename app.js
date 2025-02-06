mapboxgl.accessToken = 'SEU_TOKEN_MAPBOX'; // Substitua pelo seu token do Mapbox
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-46.6333, -23.5505], // Coordenadas de exemplo (São Paulo)
    zoom: 12
});

let startPoint = null;
let endPoint = null;

document.getElementById('startBtn').addEventListener('click', () => {
    map.once('click', (e) => {
        startPoint = e.lngLat;
        new mapboxgl.Marker({ color: 'green' }).setLngLat(startPoint).addTo(map);
    });
});

document.getElementById('endBtn').addEventListener('click', () => {
    map.once('click', (e) => {
        endPoint = e.lngLat;
        new mapboxgl.Marker({ color: 'red' }).setLngLat(endPoint).addTo(map);
    });
});

document.getElementById('calculateRoute').addEventListener('click', async () => {
    if (!startPoint || !endPoint) return alert('Defina os pontos inicial e final!');

    const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();

    if (map.getSource('route')) map.removeLayer('route');
    map.addLayer({
        id: 'route',
        type: 'line',
        source: {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: data.routes[0].geometry
            }
        },
        paint: { 'line-color': '#ff0000', 'line-width': 4 }
    });

    analyzeElevation(data.routes[0].geometry);
});

async function analyzeElevation(geometry) {
    const coords = geometry.coordinates;
    const elevationPromises = coords.map(coord => {
        return fetch(`https://api.mapbox.com/v4/mapbox.terrain-rgb/${coord[0]},${coord[1]},14.png?access_token=${mapboxgl.accessToken}`)
            .then(response => response.blob())
            .then(blob => {
                // Decodificar elevação a partir do Terrain-RGB
                return 100; // Valor de exemplo (em metros)
            });
    });

    const elevations = await Promise.all(elevationPromises);
    console.log('Elevações ao longo da rota:', elevations);
}
