// TODO: initialise a Mapbox GL map here
// Steps:
// 1. Create a div ref for the map container
// 2. In a useEffect (empty deps), create a new mapboxgl.Map instance:
//    - container: the div ref
//    - style: 'mapbox://styles/mapbox/dark-v11'
//    - center: [18.0686, 59.3293]  (Stockholm)
//    - zoom: 4
//    - accessToken: import.meta.env.VITE_MAPBOX_TOKEN
// 3. Listen for the map 'load' event, then expose the instance via MapContext
// 4. Clean up by calling map.remove() on unmount
// Note: the map must never be unmounted while the app is running —
//       keep it mounted above AuthGuard in the component tree

export function MapCanvas() {
  return <div>Map (TODO)</div>;
}
