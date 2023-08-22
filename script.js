// Initialize Leaflet map
var map = L.map('map').setView([59.03, 18.27], 9);
var marker = L.marker([59.03, 18.27]).addTo(map);

var lat = marker.getLatLng().lat;
var lng = marker.getLatLng().lng;
updateLatLng();

// Add a tile layer to the map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);


function onMapClick(e) {
    marker
        .setLatLng(e.latlng)
        .addTo(map)
        .bindPopup(e.latlng.toString())
        .openPopup();
    updateLatLng();
}

function updateLatLng() {
    lat = marker.getLatLng().lat;
    lng = marker.getLatLng().lng;
    document.getElementById("lat").innerHTML = 'Latitude ' + lat;
    document.getElementById("lng").innerHTML = 'Longitude ' + lng;
}

map.on('click', onMapClick);

// Get location from search box
var locationInput = document.getElementById("locationInput");
var locationButton = document.getElementById("locationButton");

locationButton.addEventListener("click", function () {
    var locationName = locationInput.value;
    var url = "https://nominatim.openstreetmap.org/search?q=" + locationName + "&format=json&polygon=1&addressdetails=1";
    fetch(url)
        .then(function (response) {
            return response.json();
        }
        ).then(function (json) {
            // Get the latitude and longitude from the first result
            var lat = json[0].lat;
            var lon = json[0].lon;
            var latlng = L.latLng(lat, lon);
            marker
                .setLatLng(latlng)
                .addTo(map)
                .bindPopup("You searched for " + locationName + " at " + latlng.toString())
                .openPopup();
            map.setView(latlng, 13);
            updateLatLng();
        }
        ).catch(function (error) {
            console.error("Error: ", error);
        }
        );
});

// Function to get weather forecast data from SMHI API
function getWeatherForecast(lat, lon) {
    var apiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`;

    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Process the weather forecast data here
            // For example, you can extract temperature, precipitation, etc.
            console.log("Weather Forecast Data:", data);
        })
        .catch(function (error) {
            console.error("Error fetching weather data:", error);
        });
}

// Event listener for the "Get Weather Forecast" button
var weatherButton = document.getElementById("forecastButton");
weatherButton.addEventListener("click", function () {
    getWeatherForecast(lat, lng);
});