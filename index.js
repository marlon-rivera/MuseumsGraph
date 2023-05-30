const tilesProvider = `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
let apiKeyGeoApify = 'daa733f8d75c4fefa675c5c8b5979019';
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

let coordinates = []

function markPosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;

  let popup = L.popup({
    closeOnClick: false,
    autoClose: false,
    closeButton: false
  })
    .setLatLng([latitude, longitude])
    .setContent("Te encuentras aqui")
    .openOn(tunjaMap);

  coordinates.push([latitude, longitude])
  orderMuseums()
}

if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(markPosition) }

let polylines = []
let mode = 'walk'
let lastRoute = []

function showRoute(latitude, longitude) {
  lastRoute = [latitude, longitude]
  clearMap()
  coordinates = [coordinates[0]]
  fetch(`https://api.geoapify.com/v1/routing?waypoints=${coordinates[0][0]},${coordinates[0][1]}|${latitude},${longitude}&mode=${mode}&apiKey=${apiKeyGeoApify}`).then(
    r => r.json()).then(r => {
      r.features[0]["geometry"]["coordinates"].map(c => {
        c.map(coor => {

          coordinates.push([coor[1], coor[0]])
        })
      })
      let polyline = L.polyline(coordinates).addTo(tunjaMap);
      tunjaMap.fitBounds(polyline.getBounds());
      polylines.push(polyline);
    })

}


class Museum {

  latitude;
  longitude;
  nameMuseum;

  constructor(nameMuseum, latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.nameMuseum = nameMuseum;
  }

  getLongitud() {
    return this.longitude;
  }
  getName() {
    return this.name;
  }
  getLatitude() {
    return this.latitude;
  }
}

let museums = [new Museum('Casa Cultural Gustavo Rojas Pinilla', 5.5301927, -73.3634634),
new Museum('Casa del Escribano Don Juan de Vargas', 5.5327075, -73.3604686),
new Museum('Casa del Fundador Gonzalo Suárez Rendón', 5.532472, -73.3609683),
new Museum('Convento Santa Clara La Real', 5.5316669, -73.3590943),
new Museum('Monasterio de San Agustín', 5.5354762, -73.3589941),
new Museum('Parque Arqueológico Los Cojines del Zaque', 5.537992357170093, -73.36954600034161),
new Museum('Museo de Historia de la Medicina y la Salud', 5.5353168, -73.3562128),
new Museum('Museo arqueologico', 5.5540954, -73.3570758),
new Museum('Templo de goranchacha', 5.5524386, -73.3576174),
new Museum('Herbario UPTC', 5.5554573, -73.354628),
new Museum('Entrada principal UPTC', 5.5491494, -73.3544235)]

function markMuseums() {
  museums.map(m => {

    let myIcon = L.divIcon({
      className: 'custom-icon',
      html: `<img src="./resources/museo-britanico.png" class="icon-image" width="5px" /><div class="icon-label">${m.nameMuseum}</div>`,
      iconSize: [28, 17],
      iconAnchor: [16, 48]
    });

    let marker = L.marker([m.latitude, m.longitude], { icon: myIcon }).addTo(tunjaMap);
  })

}
markMuseums();

async function orderMuseums() {
  let museumsDistance = []
  for (let i = 0; i < museums.length; i++) {

    await fetch(`https://api.geoapify.com/v1/routing?waypoints=${coordinates[0][0]},${coordinates[0][1]}|${museums[i].latitude},${museums[i].longitude}&mode=walk&apiKey=${apiKeyGeoApify}`).then(
      r => r.json()).then(r => {
        museumsDistance.push({ 'nameMuseum': museums[i].nameMuseum, 'distance': ((r.features[0]["properties"]["distance"] / 1000) + Math.floor(Math.random() * (5 - 1 + 1)) + 1) })
      })
  }

  for (let i = 0; i <= museumsDistance.length - 1; i++) {

    for (let j = 0; j < (museumsDistance.length - i - 1); j++) {
      if (museumsDistance[j].distance > museumsDistance[j + 1].distance) {
        let temp = museumsDistance[j]
        museumsDistance[j] = museumsDistance[j + 1]
        museumsDistance[j + 1] = temp

        let tempAux = museums[j]
        museums[j] = museums[j + 1]
        museums[j + 1] = tempAux
      }
    }
  }

  createButtonsMuseum()
}

function createButtonsMuseum() {
  let buttons = document.getElementById("options");
  museums.map(m => {
    let divMuseum = document.createElement("div");
    divMuseum.latitude = m.latitude
    divMuseum.longitude = m.longitude
    divMuseum.className = "museum"
    divMuseum.innerText = m.nameMuseum
    divMuseum.addEventListener('click', () => {
      showRoute(divMuseum.latitude, divMuseum.longitude)
    })
    let divButtonVisited = document.createElement("div")
    let imgButton = document.createElement("img")
    imgButton.src = './resources/check.png'
    imgButton.width = 20
    imgButton.className = 'museumVisited'
    imgButton.addEventListener('click', (e) => {
      markVisited(e)
    })
    divButtonVisited.appendChild(imgButton)
    divMuseum.appendChild(divButtonVisited)
    buttons.appendChild(divMuseum)
  })
}

function clearMap() {
  for (i in tunjaMap._layers) {
    if (tunjaMap._layers[i]._path != undefined) {
      try {
        tunjaMap.removeLayer(tunjaMap._layers[i]);
      }
      catch (e) {
        console.log("problem with " + e + m._layers[i]);
      }
    }
  }
}

function markVisited(e) {
  let element = e.target.parentNode.parentNode
  if(element.classList.contains('visited')){
    element.classList.remove('visited')
  }else{
    element.classList.add('visited')
  }
  orderMuseumsVisited()
}

function orderMuseumsVisited() {
  let divOptions = document.getElementById('options')
  let museumsAux = divOptions.getElementsByClassName('museum')

  const divsMuseums = [...museumsAux];
  divsMuseums.sort((a, b) => {
    const aNumClases = a.classList.length;
    const bNumClases = b.classList.length;
    return aNumClases - bNumClases;
  });


  while (divOptions.firstChild) {
    divOptions.removeChild(divOptions.firstChild)
  }

  divsMuseums.forEach((div) => {
    divOptions.appendChild(div);
  });
}

function changeMode(e){
  
  if(e.target.id == 'img-walk'){
    mode = 'walk'
    let imgWalk = document.getElementById('img-walk')
    imgWalk.src = './resources/walk-dark.png'
    let imgDrive = document.getElementById('img-drive')
    imgDrive.src = './resources/car-ligth.png'
  }else{
    mode = 'drive'
    let imgWalk = document.getElementById('img-walk')
    imgWalk.src = './resources/walk-ligth.png'
    let imgDrive = document.getElementById('img-drive')
    imgDrive.src = './resources/car-dark.png'
  }
  
  showRoute(lastRoute[0], lastRoute[1])
}