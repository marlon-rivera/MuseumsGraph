const tilesProvider = `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;

let tunjaMap = L.map("tunjaMap").setView([5.53528, -73.36778], 13);

L.tileLayer(tilesProvider, {
  maxZoom: 19,
  minZoom: 13,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(tunjaMap);

var corner1 = L.latLng(5.5874, -73.4412);
var corner2 = L.latLng(5.4963, -73.2922);
var bounds = L.latLngBounds(corner1, corner2);

tunjaMap.setMaxBounds(bounds);

function markPosition(position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    var popup = L.popup({
        closeOnClick: false,
        autoClose: false,
        closeButton : false
      })
    .setLatLng([latitude, longitude])
    .setContent("Te encuentras aqui")
    .openOn(tunjaMap);
}

if(navigator.geolocation) navigator.geolocation.getCurrentPosition(markPosition);


