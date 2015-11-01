/**
 * Create map and marker
 */
var map;
var lat = parseFloat(document.getElementById('lat').innerHTML);
var lng = parseFloat(document.getElementById('lng').innerHTML);
var name = document.getElementById('name').innerHTML;

function initMap() {

  var LatLng = {lat: lat, lng: lng};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: LatLng
  });

  var marker = new google.maps.Marker({
    position: LatLng,
    map: map,
    title: name
  });
}