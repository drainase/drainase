const GOOGLE_API_KEY = 'AIzaSyCjG_X7Q27kis2_xV3-zrnUS7xbxgqFkaU'; 
const map = L.map('map', {
    zoomControl: false
}).setView([-6.954339, 110.438421], 17);

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false
}).addTo(map);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
}).addTo(map);

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
                "name": "Rencana Saluran Baru RW 07",
                "type": "NewChannel",
                "length": "200 m",
                "material": "Beton",
                "budget": "Rp 20.000.000"
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
                    [110.440406, -6.954855],
                    [110.440358, -6.954734],
                    [110.440406, -6.954734],
                    [110.440358, -6.954855],
                    [110.440406, -6.954855]
                ]]
            },
            "properties": {
                "name": "Area Genangan RW 07",
                "risk": "Sedang",
                "area": "500 m²",
                "image": "https://via.placeholder.com/150?text=Area+Genangan"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [110.438862, -6.955168],
                    [110.438377, -6.954468],
                    [110.438862, -6.954468],
                    [110.438377, -6.955168],
                    [110.438862, -6.955168]
                ]]
            },
            "properties": {
                "name": "Area Waspada Air Meluap RW 07",
                "risk": "Tinggi",
                "area": "800 m²",
                "image": "https://via.placeholder.com/150?text=Area+Waspada"
            }
        }
    ]
};

const proposalIcon = L.divIcon({
    className: 'proposal-marker',
    html: '<i class="fas fa-tools text-blue-600 text-2xl"></i>',
    iconSize: [40, 40]
});

const evacuationIcon = L.divIcon({
    className: 'evacuation-marker',
    html: '<i class="fas fa-people-arrows text-red-600 text-2xl"></i>',
    iconSize: [40, 40]
});

const newChannelIcon = L.divIcon({
    className: 'new-channel-marker',
    html: '<i class="fas fa-plus text-green-600 text-2xl"></i>',
    iconSize: [40, 40]
});

const tempMarkerIcon = L.divIcon({
    className: 'temp-marker',
    html: '<i class="fas fa-map-pin text-purple-600 text-2xl"></i>',
    iconSize: [40, 40]
});

let streetViewPanorama = null;
let insetMap = null;

function initializeStreetView(latlng, featureProps = {}) {
    const modal = document.getElementById('streetViewModal');
    const container = document.getElementById('streetViewContainer');
    const mapOverlay = document.getElementById('mapOverlay');

    // Show modal
    modal.style.display = 'block';

    // Initialize Street View panorama
    streetViewPanorama = new google.maps.StreetViewPanorama(container, {
        position: { lat: latlng.lat, lng: latlng.lng },
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
        addressControl: false,
        linksControl: true,
        panControl: true,
        enableCloseButton: false,
        clickToGo: true,
        scrollwheel: true
    });

    // Check if Street View is available
    const svService = new google.maps.StreetViewService();
    svService.getPanorama({
        location: { lat: latlng.lat, lng: latlng.lng },
        radius: 500 // Tingkatkan radius pencarian
    }, (data, status) => {
        if (status === google.maps.StreetViewStatus.OK) {
            streetViewPanorama.setPano(data.location.pano);
            streetViewPanorama.setPov({
                heading: 165,
                pitch: 0
            });
            streetViewPanorama.setZoom(1);
        } else {
            container.innerHTML = '<p style="color:white; text-align:center; padding-top:20px;">Tidak ada Street View tersedia di lokasi ini atau terjadi kesalahan koneksi.</p>';
        }
    });

    // Initialize inset map
    insetMap = new google.maps.Map(mapOverlay, {
        center: { lat: latlng.lat, lng: latlng.lng },
        zoom: 18,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true
    });

    // Add marker to inset map
    new google.maps.Marker({
        position: { lat: latlng.lat, lng: latlng.lng },
        map: insetMap,
        title: featureProps.name || 'Penanda Sementara'
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('streetViewModal');
    modal.style.display = 'none';
    // Clear Street View and inset map
    if (streetViewPanorama) {
        streetViewPanorama = null;
        document.getElementById('streetViewContainer').innerHTML = '';
    }
    if (insetMap) {
        insetMap = null;
        document.getElementById('mapOverlay').innerHTML = '';
    }
}

// Create popup with Street View button
function createPopup(feature, latlng) {
    const props = feature.properties;
    let content = `<div class="popup-content"><h3>${props.name}</h3>`;
    
    if (props.condition) {
        content += `
            <p><strong>Kondisi:</strong> <span class="condition-badge ${getConditionClass(props.condition)}">${props.condition}</span></p>
            <p><strong>Lebar:</strong> ${props.width || 'Tidak tersedia'}</p>
            <p><strong>Material:</strong> ${props.material || 'Tidak tersedia'}</p>
            ${props.image ? `<img src="${props.image}" alt="Saluran" style="width:100%;max-width:150px;">` : ''}
        `;
    } else if (props.risk) {
        content += `
            <p><strong>Risiko:</strong> <span class="risk-badge ${getRiskClass(props.risk)}">${props.risk}</span></p>
            <p><strong>Luas:</strong> ${props.area}</p>
            ${props.image ? `<img src="${props.image}" alt="Area" style="width:100%;max-width:150px;">` : ''}
        `;
    } else if (props.type === 'Evacuation') {
        content += `
            <p><strong>Titik Evakuasi</strong></p>
            <p><strong>Kapasitas:</strong> ${props.capacity}</p>
            <p><strong>Kontak:</strong> ${props.contact}</p>
        `;
    } else if (props.type === 'NewChannel') {
        content += `
            <p><strong>Rencana Saluran Baru</strong></p>
            <p><strong>Panjang:</strong> ${props.length}</p>
            <p><strong>Material:</strong> ${props.material}</p>
            <p><strong>Anggaran:</strong> ${props.budget}</p>
        `;
    } else {
        content += `
            <p><strong>Deskripsi:</strong> ${props.description || 'Tidak ada deskripsi'}</p>
            <p><strong>Status:</strong> ${props.status || 'Belum ditentukan'}</p>
        `;
    }

    content += `<button class="street-view-btn" onclick="initializeStreetView({lat: ${latlng.lat}, lng: ${latlng.lng}}, ${JSON.stringify(props)})">Lihat Street View</button>`;
    content += `</div>`;

    return L.popup({ maxWidth: 450 }).setContent(content);
}

// Map layers
const channelLayer = L.geoJSON(null, {
    style: feature => ({
        color: getConditionColor(feature.properties.condition),
        weight: 6,
        opacity: 0.9
    }),
    filter: feature => feature.geometry.type === 'LineString' && !feature.properties.type,
    onEachFeature: (feature, layer) => {
        const coords = feature.geometry.coordinates[0];
        layer.bindPopup(createPopup(feature, L.latLng(coords[1], coords[0])));
    }
}).addTo(map);

const floodAreaLayer = L.geoJSON(null, {
    style: feature => ({
        fillColor: getRiskColor(feature.properties.risk),
        fillOpacity: 0.4,
        color: getRiskColor(feature.properties.risk),
        weight: 3,
        opacity: 0.9
    }),
    filter: feature => feature.geometry.type === 'Polygon' && feature.properties.name.includes("Genangan"),
    onEachFeature: (feature, layer) => {
        const coords = feature.geometry.coordinates[0][0];
        layer.bindPopup(createPopup(feature, L.latLng(coords[1], coords[0])));
    }
}).addTo(map);

const overflowAreaLayer = L.geoJSON(null, {
    style: feature => ({
        fillColor: getRiskColor(feature.properties.risk),
        fillOpacity: 0.4,
        color: getRiskColor(feature.properties.risk),
        weight: 3,
        opacity: 0.9,
        dashArray: '5, 5'
    }),
    filter: feature => feature.geometry.type === 'Polygon' && feature.properties.name.includes("Waspada"),
    onEachFeature: (feature, layer) => {
        const coords = feature.geometry.coordinates[0][0];
        layer.bindPopup(createPopup(feature, L.latLng(coords[1], coords[0])));
    }
}).addTo(map);

const evacuationLayer = L.geoJSON(null, {
    pointToLayer: (feature, latlng) => L.marker(latlng, { icon: evacuationIcon }),
    filter: feature => feature.properties.type === 'Evacuation',
    onEachFeature: (feature, layer) => {
        layer.bindPopup(createPopup(feature, layer.getLatLng()));
    }
}).addTo(map);

const newChannelLayer = L.geoJSON(null, {
    style: {
        color: '#10b981',
        weight: 6,
        dashArray: '5, 5',
        opacity: 0.9
    },
    filter: feature => feature.properties.type === 'NewChannel',
    onEachFeature: (feature, layer) => {
        const coords = feature.geometry.coordinates[0];
        layer.bindPopup(createPopup(feature, L.latLng(coords[1], coords[0])));
    }
}).addTo(map);

const proposalLayer = L.geoJSON(null, {
    pointToLayer: (feature, latlng) => L.marker(latlng, { icon: proposalIcon }),
    filter: feature => feature.geometry.type === 'Point' && !feature.properties.type,
    onEachFeature: (feature, layer) => {
        layer.bindPopup(createPopup(feature, layer.getLatLng()));
    }
}).addTo(map);

const tempMarkerLayer = L.layerGroup().addTo(map);

// Add GeoJSON data to layers
channelLayer.addData(geojsonData);
floodAreaLayer.addData(geojsonData);
overflowAreaLayer.addData(geojsonData);
evacuationLayer.addData(geojsonData);
newChannelLayer.addData(geojsonData);
proposalLayer.addData(geojsonData);

// Layer control
const baseLayers = {
    "Citra Satelit": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    }),
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
};

const overlays = {
    "Saluran Drainase": channelLayer,
    "Area Genangan": floodAreaLayer,
    "Area Waspada Air Meluap": overflowAreaLayer,
    "Titik Evakuasi": evacuationLayer,
    "Rencana Saluran Baru": newChannelLayer,
    "Usulan Perbaikan": proposalLayer,
    "Penanda Sementara": tempMarkerLayer
};

L.control.layers(baseLayers, overlays, {
    collapsed: false,
    position: 'topright'
}).addTo(map);

// Interactive marker on map click
map.on('click', function(e) {
    tempMarkerLayer.clearLayers();
    const marker = L.marker(e.latlng, { icon: tempMarkerIcon }).addTo(tempMarkerLayer);
    const popupContent = `
        <div class="popup-content">
            <h3>Penanda Sementara</h3>
            <p><strong>Latitude:</strong> ${e.latlng.lat.toFixed(6)}</p>
            <p><strong>Longitude:</strong> ${e.latlng.lng.toFixed(6)}</p>
            <p>Klik di tempat lain untuk menandai ulang</p>
            <button class="street-view-btn" onclick="initializeStreetView({lat: ${e.latlng.lat}, lng: ${e.latlng.lng}})">Lihat Street View</button>
        </div>
    `;
    marker.bindPopup(popupContent).openPopup();
});

// Update statistics
function updateStats() {
    const channels = geojsonData.features.filter(f => f.geometry.type === 'LineString' && !f.properties.type).length;
    const floodAreas = geojsonData.features.filter(f => f.geometry.type === 'Polygon' && f.properties.name.includes("Genangan")).length;
    const overflowAreas = geojsonData.features.filter(f => f.geometry.type === 'Polygon' && f.properties.name.includes("Waspada")).length;
    const evacPoints = geojsonData.features.filter(f => f.properties.type === 'Evacuation').length;
    const proposals = geojsonData.features.filter(f => f.geometry.type === 'Point' && !f.properties.type).length;

    document.getElementById('totalChannels').textContent = channels;
    document.getElementById('totalFloodAreas').textContent = floodAreas + overflowAreas;
    document.getElementById('totalEvacPoints').textContent = evacPoints;
    document.getElementById('totalProposals').textContent = proposals;
}
updateStats();

// Filter map
function filterMap() {
    const condition = document.getElementById('conditionFilter').value;
    const risk = document.getElementById('riskFilter').value;

    channelLayer.clearLayers();
    floodAreaLayer.clearLayers();
    overflowAreaLayer.clearLayers();
    evacuationLayer.clearLayers();
    newChannelLayer.clearLayers();
    proposalLayer.clearLayers();

    const filteredData = {
        type: "FeatureCollection",
        features: geojsonData.features.filter(feature => {
            if (feature.geometry.type === 'LineString' && !feature.properties.type) {
                return condition === 'all' || feature.properties.condition === condition;
            }
            if (feature.geometry.type === 'Polygon') {
                return risk === 'all' || feature.properties.risk === risk;
            }
            return true;
        })
    };

    channelLayer.addData(filteredData);
    floodAreaLayer.addData(filteredData);
    overflowAreaLayer.addData(filteredData);
    evacuationLayer.addData(filteredData);
    newChannelLayer.addData(filteredData);
    proposalLayer.addData(filteredData);
}

// Reset filter
function resetFilter() {
    document.getElementById('conditionFilter').value = 'all';
    document.getElementById('riskFilter').value = 'all';
    filterMap();
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');

    sidebar.classList.toggle('open');

    if (sidebar.classList.contains('open')) {
        if (window.innerWidth <= 360) {
            toggleBtn.style.left = '280px';
        } else if (window.innerWidth <= 480) {
            toggleBtn.style.left = '300px';
        } else if (window.innerWidth <= 768) {
            toggleBtn.style.left = '340px';
        } else if (window.innerWidth <= 1024) {
            toggleBtn.style.left = '380px';
        } else {
            toggleBtn.style.left = '420px';
        }
        if (window.innerWidth <= 585) {
            document.addEventListener('click', closeSidebarOnClickOutside);
        }
    } else {
        toggleBtn.style.left = '26px';
        document.removeEventListener('click', closeSidebarOnClickOutside);
    }
}

// Close sidebar on click outside
function closeSidebarOnClickOutside(e) {
    const sidebar = document.querySelector('#sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');

    if (!sidebar.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
        toggleBtn.style.left = '26px';
        document.removeEventListener('click', closeSidebarOnClickOutside);
    }
}

// Window resize handler
window.addEventListener('resize', function() {
    const sidebar = document.querySelector('#sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');

    if (sidebar.classList.contains('open')) {
        if (window.innerWidth <= 360) {
            toggleBtn.style.left = '280px';
        } else if (window.innerWidth <= 480) {
            toggleBtn.style.left = '300px';
        } else if (window.innerWidth <= 768) {
            toggleBtn.style.left = '340px';
        } else if (window.innerWidth <= 1024) {
            toggleBtn.style.left = '380px';
        } else {
            toggleBtn.style.left = '420px';
        }
    }
});

// Color functions
function getConditionColor(condition) {
    switch (condition) {
        case 'Baik': return '#16a34a';
        case 'Tersumbat': return '#dc2626';
        case 'Rusak': return '#f59e0b';
        default: return '#6b7280';
    }
}

function getRiskColor(risk) {
    switch (risk) {
        case 'Tinggi': return '#dc2626';
        case 'Sedang': return '#f59e0b';
        case 'Rendah': return '#16a34a';
        default: return '#6b7280';
    }
}

function getConditionClass(condition) {
    switch (condition) {
        case 'Baik': return 'bg-green-100 text-green-800';
        case 'Tersumbat': return 'bg-red-100 text-red-800';
        case 'Rusak': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getRiskClass(risk) {
    switch (risk) {
        case 'Tinggi': return 'bg-red-100 text-red-800';
        case 'Sedang': return 'bg-yellow-100 text-yellow-800';
        case 'Rendah': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}