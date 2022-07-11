// API into variable
let queryURL= "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Base layer
let baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
});

// Define a baseMaps object to hold our base layers
let baseMaps = {
    "Base Map": baseMap
};

// Create our map, giving it the streetmap layer to display on load
let myMap = L.map("map", {
    center: [ 37.09, -95.71 ], //center of the us
    zoom: 4,
    layers: [baseMap],
});

// Popup describing the place, time, and magnitude
function popUpMsg(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p> <b>Date/Time: </b>" + new Date(feature.properties.time) + "</p>" +
        "<p> <b>Magnitude:</b> " + feature.properties.mag + "; <b>Depth:</b> " + feature.geometry.coordinates[2] + "</p>");
}

// Layer for data
let earthquakes = L.layerGroup();

// Overlay object to hold layer
let overlayMaps = {
    Earthquakes: earthquakes
};

// Passing in basemap and overlay
L.control.layers(null, overlayMaps, {
    collapsed: false,
  }).addTo(myMap);


// GET on URL and add markets varying by size based on magnitude
d3.json(queryURL).then(function(data) {
    L.geoJSON(data, {
        pointToLayer: function(feature, layer){
            return new L.CircleMarker(layer, {
               radius: (feature.properties.mag)*5,
               fillColor: depthColor(feature.geometry.coordinates[2]),
               weight: 0.8,
               color: "#000000",
               fillOpacity: 0.8,
            });
        },
        onEachFeature: popUpMsg,
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);
});

// Function for depth color scale
function depthColor(depth) {
    let color = '#FF5F65';
    if (depth < 10) {
        color = '#A3F600';
    } else if (depth < 30) {
        color = '#DCF400';
    } else if (depth < 50) {
        color = '#F7DB11';
    } else if (depth < 70) {
        color = '#FDB72A';
    } else if (depth < 90) {
        color = '#FCA35D';
    };  
    return color
}

// Legend control
var legend = L.control({
    position: "bottomright"
});

// Adding legend div
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");  
    let limits = [-10, 10, 30, 50, 70, 90]
    var legendInfo = "<h3>Depth Color Indicators</h3>";
    let labels = []
    div.innerHTML = legendInfo;
    for (let i = 0; i< limits.length; i++) {
        labels.push("<p style='background-color:" + depthColor(limits[i]) + "'>" + limits[i] + " to " + limits[i+1] + "</p>")
    };
    labels[5] = labels[5].replace(' to undefined', '+');
    div.innerHTML += labels.join("");
    div.innerHTML;
    return div;
};

// Add legend
legend.addTo(myMap);