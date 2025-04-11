// Create the 'basemap' tile layer that will be the background of our map.

let openMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

// Create the map object with center and zoom options.

let map = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [openMap]
});

// Then add the 'basemap' tile layer to the map.

L.control.layers({
  "OpenStreetMap": openMap
}, {}, {
  collapsed: false
}).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
 
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000", 
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  
  function getColor(depth) {
    return depth > 700 ? "#ff00d5" :  
    depth > 300 ? "#ff58e4" : 
    depth > 100 ? "#ff7ae9" : 
    depth > 50 ? "#ff9bef" :  
    depth > 10 ? "#fac6f2" :   
                 "#fcf2fb";    
}

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<strong>Location:</strong> ${feature.properties.place}<br>
         <strong>Magnitude:</strong> ${feature.properties.mag}<br>
         <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
      );
    }

  }).addTo(map);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend

    let depth = [-10, 10, 50, 100, 300, 700];  
  let color = [
    "#fcf2fb",  
    "#fac6f2",  
    "#ff9bef",  
    "#ff7ae9", 
    "#ff58e4", 
    "#ff00d5"   
  ];

    // Loop through our depth intervals to generate a label with a colored square for each interval.

    for (let i = 0; i < depth.length; i++) {

      div.innerHTML +=
        `<i style="background:${color[i]}"></i> ${depth[i]}&ndash;${depth[i + 1] || "+"} km<br>`;
    }

    return div;
  };

  // Finally, add the legend to the map.

  legend.addTo(map);

    // Then add the tectonic_plates layer to the map.
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    L.geoJson(plate_data, {
      color: "#ff6600",  
      weight: 2,         
      opacity: 0.7      
    }).addTo(map);
  });
});
