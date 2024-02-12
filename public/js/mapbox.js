
export const mapFun=(locations)=>{
  mapboxgl.accessToken ='pk.eyJ1IjoibmlyYWo1NzAiLCJhIjoiY2xzMDJlaDdkMXFicTJrbzZxZW9oeWF5dyJ9.jwnf6Zcnmuf_kqHf5uJ72Q';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/niraj570/cls04odye00bf01pn3o0l12as',
    scrollZoom:false
  });

const bounds= new mapboxgl.LngLatBounds()
locations.forEach(loc=>{
    const el=document.createElement('div')
    el.className="marker"
    new mapboxgl.Marker({
        element:el,
        anchor:"bottom"
    }).setLngLat(loc.coordinates).addTo(map)
    new mapboxgl.Popup().setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} ${loc.description}`).addTo(map)
    bounds.extend(loc.coordinates)
})
map.fitBounds(bounds,{
    padding:{
        top:150,
        bottom:150,
        left:150,
        right:200
    }
})
}