// Ganti seluruh isi script.js Anda dengan ini
const map = L.map('map', {
    zoomControl: false
}).setView([-6.954339, 110.438421], 17);

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
});

osmLayer.addTo(map);

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false
});

const geojsonData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[110.440512, -6.955222], [110.439955, -6.953715]]
            },
            "properties": {
                "name": "Rekomendasi Saluran Baru",
                "type": "NewChannel",
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [110.438421, -6.954339]
            },
            "properties": {
                "name": "Balai RW 07",
                "type": "Evacuation",
                "capacity": "40 orang",
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [110.440406, -6.954734],
                    [110.440406, -6.954855],
                    [110.440358, -6.954855],
                    [110.440358, -6.954734],
                    [110.440406, -6.954734]
                ]]
            },
            "properties": {
                "name": "Area Genangan",
                "risk": "Sedang",
                "image": "https://via.placeholder.com/150?text=Area+Genangan"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [110.438496, -6.955209], 
                    [110.438926, -6.955195], 
                    [110.438611, -6.954736], 
                    [110.438257, -6.954840],
                    [110.438496, -6.955209]  
                ]]
            },
            "properties": {
                "name": "Area Waspada Air Meluap",
                "risk": "Sedang",
                "image": "https://via.placeholder.com/150?text=Area+Waspada"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [110.438226, -6.954128], // Titik Awal
                    [110.439940, -6.953688]  // Titik Akhir
                ]
            },
            "properties": {
                "name": "Rencana Perbaikan Saluran",
                "type": "ImprovementPlan" 
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [110.439904, -6.953383], 
                    [110.440438, -6.953285], 
                    [110.440573, -6.953843], 
                    [110.441013, -6.955133], 
                    [110.440555, -6.955200], 
                    [110.439904, -6.953383]
                ]]
            },
            "properties": {
                "name": "Area Waspada Luapan Banjir Kanal Timur",
                "risk": "Tinggi"
            }
        }
    ]
};

const proposalIcon = L.divIcon({ className: 'proposal-marker', html: '<i class="fas fa-tools text-blue-600 text-2xl"></i>', iconSize: [40, 40] });
const evacuationIcon = L.divIcon({ className: 'evacuation-marker', html: '<i class="fas fa-people-arrows text-red-600 text-2xl"></i>', iconSize: [40, 40] });
const newChannelIcon = L.divIcon({ className: 'new-channel-marker', html: '<i class="fas fa-plus text-green-600 text-2xl"></i>', iconSize: [40, 40] });

function createPopup(feature, latlng) {
    const props = feature.properties;
    let content = `<div class="popup-content"><h3>${props.name}</h3>`;

    if (props.condition) {
        content += `<p><strong>Kondisi:</strong> <span class="condition-badge ${getConditionClass(props.condition)}">${props.condition}</span></p><p><strong>Lebar:</strong> ${props.width || 'Tidak tersedia'}</p><p><strong>Material:</strong> ${props.material || 'Tidak tersedia'}</p>${props.image ? `<img src="${props.image}" alt="Saluran" style="width:100%;max-width:150px;">` : ''}`;
    } else if (props.risk) {
        content += `<p><strong>Risiko:</strong> <span class="risk-badge ${getRiskClass(props.risk)}">${props.risk}</span></p>`;
    } else if (props.type === 'Evacuation') {
        content += `<p><strong>Titik Evakuasi</strong></p><p><strong>Kapasitas:</strong> ${props.capacity}</p>`;
    } else if (props.type === 'NewChannel' || props.type === 'ImprovementPlan') {
        content += `<p><strong>Status:</strong> Rencana</p>`;
    } else {
        content += `<p><strong>Deskripsi:</strong> ${props.description || 'Tidak ada deskripsi'}</p><p><strong>Status:</strong> ${props.status || 'Belum ditentukan'}</p>`;
    }

    content += `</div>`;
    return L.popup({ maxWidth: 450 }).setContent(content);
}

// ... Semua kode layer dan fungsi lainnya tetap sama ...
const channelLayer = L.geoJSON(null, { style: feature => ({ color: getConditionColor(feature.properties.condition), weight: 6, opacity: 0.9 }), filter: feature => feature.geometry.type === 'LineString' && !feature.properties.type, onEachFeature: (feature, layer) => { const coords = feature.geometry.coordinates[0]; layer.bindPopup(createPopup(feature, L.latLng(coords[1], coords[0]))); } }).addTo(map);
const floodAreaLayer = L.geoJSON(null, { style: feature => ({ fillColor: getRiskColor(feature.properties.risk), fillOpacity: 0.4, color: getRiskColor(feature.properties.risk), weight: 3, opacity: 0.9 }), filter: feature => feature.geometry.type === 'Polygon', onEachFeature: (feature, layer) => { const coords = feature.geometry.coordinates[0][0]; layer.bindPopup(createPopup(feature, L.latLng(coords[1], coords[0]))); } }).addTo(map);
const evacuationLayer = L.geoJSON(null, { pointToLayer: (feature, latlng) => L.marker(latlng, { icon: evacuationIcon }), filter: feature => feature.properties.type === 'Evacuation', onEachFeature: (feature, layer) => { layer.bindPopup(createPopup(feature, layer.getLatLng())); } }).addTo(map);
const newChannelLayer = L.geoJSON(null, { style: { color: '#10b981', weight: 6, dashArray: '5, 5', opacity: 0.9 }, filter: feature => feature.properties.type === 'NewChannel', onEachFeature: (feature, layer) => { const coords = feature.geometry.coordinates[0]; layer.bindPopup(createPopup(feature, L.latLng(coords[1], coords[0]))); } }).addTo(map);
const proposalLayer = L.geoJSON(null, { pointToLayer: (feature, latlng) => L.marker(latlng, { icon: proposalIcon }), filter: feature => feature.geometry.type === 'Point' && !feature.properties.type, onEachFeature: (feature, layer) => { layer.bindPopup(createPopup(feature, layer.getLatLng())); } }).addTo(map);
const improvementPlanLayer = L.geoJSON(null, { style: { color: '#3b82f6', weight: 5, opacity: 0.9 }, filter: feature => feature.properties.type === 'ImprovementPlan', onEachFeature: (feature, layer) => { const coords = feature.geometry.coordinates[0]; layer.bindPopup(createPopup(feature, L.latLng(coords[1], coords[0]))); } }).addTo(map);

channelLayer.addData(geojsonData);
floodAreaLayer.addData(geojsonData);
evacuationLayer.addData(geojsonData);
newChannelLayer.addData(geojsonData);
proposalLayer.addData(geojsonData);
improvementPlanLayer.addData(geojsonData);

let layerControl;
const baseLayers = { "OpenStreetMap": osmLayer, "Citra Satelit": satelliteLayer };
const overlays = { "Saluran Drainase": channelLayer, "Area Rawan": floodAreaLayer, "Titik Evakuasi": evacuationLayer, "Rekomendasi Saluran Baru": newChannelLayer, "Usulan Perbaikan": proposalLayer, "Rencana Perbaikan Saluran": improvementPlanLayer };
layerControl = L.control.layers(baseLayers, overlays, { collapsed: false, position: 'topright' });

function updateStats() { const channels = geojsonData.features.filter(f => f.geometry.type === 'LineString').length; const floodAreas = geojsonData.features.filter(f => f.geometry.type === 'Polygon').length; const evacPoints = geojsonData.features.filter(f => f.properties.type === 'Evacuation').length; const proposals = geojsonData.features.filter(f => f.geometry.type === 'Point' && !f.properties.type).length; document.getElementById('totalChannels').textContent = channels; document.getElementById('totalFloodAreas').textContent = floodAreas; document.getElementById('totalEvacPoints').textContent = evacPoints; document.getElementById('totalProposals').textContent = proposals; }
updateStats();

function filterMap() { const condition = document.getElementById('conditionFilter').value; const risk = document.getElementById('riskFilter').value; channelLayer.clearLayers(); floodAreaLayer.clearLayers(); evacuationLayer.clearLayers(); newChannelLayer.clearLayers(); proposalLayer.clearLayers(); improvementPlanLayer.clearLayers().addData(geojsonData); const filteredData = { type: "FeatureCollection", features: geojsonData.features.filter(feature => { if (feature.geometry.type === 'LineString' && !feature.properties.type) { return condition === 'all' || feature.properties.condition === condition; } if (feature.geometry.type === 'Polygon') { return risk === 'all' || feature.properties.risk === risk; } return true; }) }; channelLayer.addData(filteredData); floodAreaLayer.addData(filteredData); evacuationLayer.addData(filteredData); newChannelLayer.addData(filteredData); proposalLayer.addData(filteredData); }
function resetFilter() { document.getElementById('conditionFilter').value = 'all'; document.getElementById('riskFilter').value = 'all'; filterMap(); }
function toggleSidebar() { const sidebar = document.getElementById('sidebar'); const toggleBtn = document.querySelector('.sidebar-toggle'); sidebar.classList.toggle('open'); if (sidebar.classList.contains('open')) { if (window.innerWidth <= 360) { toggleBtn.style.left = '280px'; } else if (window.innerWidth <= 480) { toggleBtn.style.left = '300px'; } else if (window.innerWidth <= 768) { toggleBtn.style.left = '340px'; } else if (window.innerWidth <= 1024) { toggleBtn.style.left = '380px'; } else { toggleBtn.style.left = '420px'; } if (window.innerWidth <= 585) { document.addEventListener('click', closeSidebarOnClickOutside); } } else { toggleBtn.style.left = '26px'; document.removeEventListener('click', closeSidebarOnClickOutside); } }
function closeSidebarOnClickOutside(e) { const sidebar = document.querySelector('#sidebar'); const toggleBtn = document.querySelector('.sidebar-toggle'); if (!sidebar.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) { sidebar.classList.remove('open'); toggleBtn.style.left = '26px'; document.removeEventListener('click', closeSidebarOnClickOutside); } }
window.addEventListener('resize', function() { const sidebar = document.querySelector('#sidebar'); const toggleBtn = document.querySelector('.sidebar-toggle'); if (sidebar.classList.contains('open')) { if (window.innerWidth <= 360) { toggleBtn.style.left = '280px'; } else if (window.innerWidth <= 480) { toggleBtn.style.left = '300px'; } else if (window.innerWidth <= 768) { toggleBtn.style.left = '340px'; } else if (window.innerWidth <= 1024) { toggleBtn.style.left = '380px'; } else { toggleBtn.style.left = '420px'; } } });
function getConditionColor(condition) { switch (condition) { case 'Baik': return '#16a34a'; case 'Tersumbat': return '#dc2626'; case 'Rusak': return '#f59e0b'; default: return '#6b7280'; } }
function getRiskColor(risk) { switch (risk) { case 'Tinggi': return '#dc2626'; case 'Sedang': return '#f59e0b'; case 'Rendah': return '#16a34a'; default: return '#6b7280'; } }
function getConditionClass(condition) { switch (condition) { case 'Baik': return 'bg-green-100 text-green-800'; case 'Tersumbat': return 'bg-red-100 text-red-800'; case 'Rusak': return 'bg-yellow-100 text-yellow-800'; default: return 'bg-gray-100 text-gray-800'; } }
function getRiskClass(risk) { switch (risk) { case 'Tinggi': return 'bg-red-100 text-red-800'; case 'Sedang': return 'bg-yellow-100 text-yellow-800'; case 'Rendah': return 'bg-green-100 text-green-800'; default: return 'bg-gray-100 text-gray-800'; } }

const layersToggleButton = document.getElementById('layers-toggle');
let isLayerControlVisible = false;
layersToggleButton.addEventListener('click', () => { if (isLayerControlVisible) { map.removeControl(layerControl); isLayerControlVisible = false; } else { layerControl.addTo(map); isLayerControlVisible = true; } });
