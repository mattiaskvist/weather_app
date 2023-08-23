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
    lat = marker.getLatLng().lat.toFixed(6);
    lng = marker.getLatLng().lng.toFixed(6);
    document.getElementById("lat").innerHTML = 'Latitude: ' + lat;
    document.getElementById("lng").innerHTML = 'Longitude: ' + lng;
}

map.on('click', onMapClick);

// Get location from search box
var locationInput = document.getElementById("locationInput");
var searchButton = document.getElementById("searchButton");
var currentLocationButton = document.getElementById("currentLocationButton");

searchButton.addEventListener("click", function () {
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

// Get current location
currentLocationButton.addEventListener("click", function () {
    map.locate({ setView: true, maxZoom: 15 });
    // set marker to current location
    map.on('locationfound', function (e) {
        marker
            .setLatLng(e.latlng)
            .addTo(map)
            .bindPopup("You are here: " + e.latlng.toString())
            .openPopup();
        updateLatLng();
    }
    );
    // if location not found, show error message
    map.on('locationerror', function (e) {
        alert(e.message);
    }
    );
});


function processWeatherForecast(data) {
    var forecastContainer = document.getElementById("forecastContainer");

    // Remove any existing forecast data and insert placeholder
    forecastContainer.innerHTML = `<div class="forecast-box">
                                    <p>Date Time - Temp - Wind Speed (Gust) - Wind Dir</p>
                                </div>`;

    // Loop through each timeSeries object
    data.timeSeries.forEach(function (timeSeries) {
        // Get the valid time for the forecast
        var validTime = new Date(timeSeries.validTime).toLocaleString();
        var formattedValidTime = validTime.slice(0, -3);

        // Initialize variables to store extracted data
        var temperature, windSpeed, windDirection, windGustSpeed;

        // Loop through the parameters to find the ones we want
        timeSeries.parameters.forEach(function (parameter) {
            switch (parameter.name) {
                case "t":
                    temperature = parameter.values[0];
                    break;
                case "ws":
                    windSpeed = parameter.values[0];
                    break;
                case "wd":
                    windDirection = parameter.values[0];
                    break;
                case "gust":
                    windGustSpeed = parameter.values[0];
                    break;
                default:
                    // Handle other parameters here
                    break;
            }
        });

        // Create a "box" for the forecast
        var box = document.createElement("div");
        box.classList.add("forecast-box");
        box.innerHTML = `
            <p>${formattedValidTime} - ${temperature} °C - ${windSpeed} (${windGustSpeed}) m/s - ${windDirection}°</p>`;

        // Append the "box" to the forecast container
        forecastContainer.appendChild(box);
    });

    // Add time of last update
    var lastUpdated = new Date(data.approvedTime).toLocaleString();
    var formattedLastUpdated = lastUpdated.slice(0, -3);
    forecastContainer.innerHTML += `<p>Last updated: ${formattedLastUpdated}</p>`;
    forecastContainer.innerHTML += `<p>Source: SMHI Open Data API</p>`;
}

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
            processWeatherForecast(data);
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