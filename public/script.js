// Initialize the map
function initMap() {
  // Set the map options
  const mapOptions = {
    center: { lat: -34.397, lng: 150.644 }, // Coordinates for the initial center of the map
    zoom: 8,  // Zoom level
  };

  // Create a map instance and link it to the div with id 'map'
  const map = new google.maps.Map(document.getElementById("map"), mapOptions);

  // Create a marker at the center of the map
  const marker = new google.maps.Marker({
    position: map.getCenter(),  // Set marker at the map's center
    map: map,                   // Add marker to the map
    title: "Hello World!",      // Tooltip text for the marker
  });

  // Add a click listener to the marker to show an alert on click
  marker.addListener("click", function () {
    alert("Marker clicked!");
  });
}

// Optionally, you can add more features or customization
// For example, adding an event listener to the map when clicked:

// Adding a click event listener to the map
// Uncomment if you'd like to display the latitude and longitude on the map click
/*
map.addListener("click", function (event) {
  const clickedLat = event.latLng.lat(); // Get latitude
  const clickedLng = event.latLng.lng(); // Get longitude
  alert("Clicked at: " + clickedLat + ", " + clickedLng);
});
*/