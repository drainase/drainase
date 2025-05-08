const map = L.map('map', {
    zoomControl: false  
}).setView([-6.9572528614364915, 110.4357737913904], 15);

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const geojsonData = {
  "type": "FeatureCollection",
  "features": [

      {
          "type": "Feature",
          "geometry": {
              "type": "LineString",
              "coordinates": [[110.435, -6.957], [110.436, -6.958], [110.437, -6.957]]
          },
          "properties": {
              "name": "Saluran Utama RT 01",
              "condition": "Tersumbat",
              "width": "1 m",
              "material": "Beton",
              "image": "https://via.placeholder.com/150?text=Saluran+Tersumbat"
          }
      },
      {
          "type": "Feature",
          "geometry": {
              "type": "LineString",
              "coordinates": [[110.438, -6.958], [110.439, -6.959]]
          },
          "properties": {
              "name": "Saluran Sekunder RT 02",
              "condition": "Baik",
              "width": "0.8 m",
              "material": "Tanah",
              "image": "https://via.placeholder.com/150?text=Saluran+Baik"
          }
      },

      {
          "type": "Feature",
          "geometry": {
              "type": "Polygon",
              "coordinates": [[[110.434, -6.956], [110.435, -6.956], [110.435, -6.957], [110.434, -6.957], [110.434, -6.956]]]
          },
          "properties": {
              "name": "Area Banjir RT 03",
              "risk": "Tinggi",
              "area": "1000 m²",
              "image": "https://via.placeholder.com/150?text=Area+Banjir"
          }
      },

      {
          "type": "Feature",
          "geometry": {
              "type": "Point",
              "coordinates": [110.436, -6.957]
          },
          "properties": {
              "name": "Titik Kumpul RT 01",
              "type": "Evacuation",
              "capacity": "50 orang",
              "contact": "Bpk. Sutrisno (0812345678)"
          }
      },
      {
          "type": "Feature",
          "geometry": {
              "type": "Point",
              "coordinates": [110.438, -6.959]
          },
          "properties": {
              "name": "Titik Kumpul RT 02",
              "type": "Evacuation",
              "capacity": "30 orang",
              "contact": "Bpk. Joko (0812345679)"
          }
      },

      {
          "type": "Feature",
          "geometry": {
              "type": "LineString",
              "coordinates": [[110.437, -6.958], [110.438, -6.958]]
          },
          "properties": {
              "name": "Rencana Saluran Baru RT 03",
              "type": "NewChannel",
              "length": "150 m",
              "material": "Beton",
              "budget": "Rp 15.000.000"
          }
      },

      {
          "type": "Feature",
          "geometry": {
              "type": "Point",
              "coordinates": [110.437, -6.957]
          },
          "properties": {
              "name": "Usulan Sumur Resapan",
              "description": "Sumur resapan untuk RT 01",
              "status": "Proposed"
          }
      }
  ]
};


const proposalIcon = L.divIcon({
  className: 'proposal-marker',
  html: '<i class="fas fa-tools"></i>',
  iconSize: [30, 30]
});

const evacuationIcon = L.divIcon({
  className: 'evacuation-marker',
  html: '<i class="fas fa-people-arrows"></i>',
  iconSize: [30, 30]
});

const newChannelIcon = L.divIcon({
  className: 'new-channel-marker',
  html: '<i class="fas fa-plus"></i>',
  iconSize: [30, 30]
});


const channelLayer = L.geoJSON(null, {
  style: feature => ({
      color: getConditionColor(feature.properties.condition),
      weight: 4,
      opacity: 0.8
  }),
  filter: feature => feature.geometry.type === 'LineString' && !feature.properties.type,
  onEachFeature: (feature, layer) => {
      const popupContent = `
          <div class="popup-content">
              <h3>${feature.properties.name}</h3>
              <p><strong>Kondisi:</strong> <span class="condition-badge ${getConditionClass(feature.properties.condition)}">${feature.properties.condition}</span></p>
              <p><strong>Lebar:</strong> ${feature.properties.width}</p>
              <p><strong>Material:</strong> ${feature.properties.material}</p>
              ${feature.properties.image ? `<img src="${feature.properties.image}" alt="Saluran">` : ''}
          </div>
      `;
      layer.bindPopup(popupContent);
  }
}).addTo(map);

const floodAreaLayer = L.geoJSON(null, {
  style: feature => ({
      fillColor: getRiskColor(feature.properties.risk),
      fillOpacity: 0.3,
      color: getRiskColor(feature.properties.risk),
      weight: 2,
      opacity: 0.8
  }),
  filter: feature => feature.geometry.type === 'Polygon',
  onEachFeature: (feature, layer) => {
      const popupContent = `
          <div class="popup-content">
              <h3>${feature.properties.name}</h3>
              <p><strong>Risiko:</strong> <span class="risk-badge ${getRiskClass(feature.properties.risk)}">${feature.properties.risk}</span></p>
              <p><strong>Luas:</strong> ${feature.properties.area}</p>
              ${feature.properties.image ? `<img src="${feature.properties.image}" alt="Area Banjir">` : ''}
          </div>
      `;
      layer.bindPopup(popupContent);
  }
}).addTo(map);

const evacuationLayer = L.geoJSON(null, {
  pointToLayer: (feature, latlng) => L.marker(latlng, { icon: evacuationIcon }),
  filter: feature => feature.properties.type === 'Evacuation',
  onEachFeature: (feature, layer) => {
      const popupContent = `
          <div class="popup-content">
              <h3>${feature.properties.name}</h3>
              <p><strong>Titik Evakuasi</strong></p>
              <p><strong>Kapasitas:</strong> ${feature.properties.capacity}</p>
              <p><strong>Kontak:</strong> ${feature.properties.contact}</p>
          </div>
      `;
      layer.bindPopup(popupContent);
  }
}).addTo(map);

const newChannelLayer = L.geoJSON(null, {
  style: {
      color: '#10b981',
      weight: 4,
      dashArray: '5, 5',
      opacity: 0.8
  },
  filter: feature => feature.properties.type === 'NewChannel',
  onEachFeature: (feature, layer) => {
      const popupContent = `
          <div class="popup-content">
              <h3>${feature.properties.name}</h3>
              <p><strong>Rencana Saluran Baru</strong></p>
              <p><strong>Panjang:</strong> ${feature.properties.length}</p>
              <p><strong>Material:</strong> ${feature.properties.material}</p>
              <p><strong>Anggaran:</strong> ${feature.properties.budget}</p>
          </div>
      `;
      layer.bindPopup(popupContent);
  }
}).addTo(map);

const proposalLayer = L.geoJSON(null, {
  pointToLayer: (feature, latlng) => L.marker(latlng, { icon: proposalIcon }),
  filter: feature => feature.geometry.type === 'Point' && !feature.properties.type,
  onEachFeature: (feature, layer) => {
      const popupContent = `
          <div class="popup-content">
              <h3>${feature.properties.name}</h3>
              <p><strong>Deskripsi:</strong> ${feature.properties.description}</p>
              <p><strong>Status:</strong> ${feature.properties.status}</p>
          </div>
      `;
      layer.bindPopup(popupContent);
  }
}).addTo(map);


channelLayer.addData(geojsonData);
floodAreaLayer.addData(geojsonData);
evacuationLayer.addData(geojsonData);
newChannelLayer.addData(geojsonData);
proposalLayer.addData(geojsonData);

// Update layer control
const baseLayers = {
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
};

const overlays = {
  "Saluran Drainase": channelLayer,
  "Area Rawan Banjir": floodAreaLayer,
  "Titik Evakuasi": evacuationLayer,
  "Rencana Saluran Baru": newChannelLayer,
  "Usulan Perbaikan": proposalLayer
};

L.control.layers(baseLayers, overlays, {
  collapsed: false,
  position: 'topright'
}).addTo(map);

function updateStats() {
    const channels = geojsonData.features.filter(f => f.geometry.type === 'LineString' && !f.properties.type).length;
    const floodAreas = geojsonData.features.filter(f => f.geometry.type === 'Polygon').length;
    const evacPoints = geojsonData.features.filter(f => f.properties.type === 'Evacuation').length;
    const proposals = geojsonData.features.filter(f => f.geometry.type === 'Point' && !f.properties.type).length;

    document.getElementById('totalChannels').textContent = channels;
    document.getElementById('totalFloodAreas').textContent = floodAreas;
    document.getElementById('totalEvacPoints').textContent = evacPoints;
    document.getElementById('totalProposals').textContent = proposals;
}

updateStats();

function filterMap() {
    const condition = document.getElementById('conditionFilter').value;
    const risk = document.getElementById('riskFilter').value;

    channelLayer.clearLayers();
    floodAreaLayer.clearLayers();
    proposalLayer.clearLayers();

    const filteredData = {
        type: "FeatureCollection",
        features: geojsonData.features.filter(feature => {
            if (feature.geometry.type === 'LineString') {
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
    proposalLayer.addData(filteredData);
}

function resetFilter() {
    document.getElementById('conditionFilter').value = 'all';
    document.getElementById('riskFilter').value = 'all';
    filterMap();
}

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
        
        if (window.innerWidth <= 800) {
            document.addEventListener('click', closeSidebarOnClickOutside);
        }
    } else {
        toggleBtn.style.left = '26px';
        document.removeEventListener('click', closeSidebarOnClickOutside);
    }
}

window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
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

function closeSidebarOnClickOutside(e) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    if (!sidebar.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
        toggleBtn.style.left = '26px';
        document.removeEventListener('click', closeSidebarOnClickOutside);
    }
}

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