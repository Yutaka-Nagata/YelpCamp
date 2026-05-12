  // sets the access token, associating the map with your Mapbox account and its permissions
  mapboxgl.accessToken = mapToken;

  // creates the map, setting the container to the id of the div you added in step 2, and setting the initial center and zoom level of the map
  const map = new mapboxgl.Map({
      container: 'map', // container ID
      center: campground.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
      zoom: 10 // starting zoom
  });

      // create the popup
const popup = new mapboxgl.Popup({ offset: 25 }).setText(
    campground.title
);


new mapboxgl.Marker()
        .setLngLat(campground.geometry.coordinates)
        .setPopup(popup)
        .addTo(map)

map.addControl(new mapboxgl.NavigationControl());
