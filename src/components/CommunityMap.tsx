import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Paper, useTheme } from '@mui/material';
import communityData from '../data/community.json';

// Use environment variable for Mapbox token
const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
console.log('Mapbox token available:', !!mapboxToken);
mapboxgl.accessToken = mapboxToken;

interface CommunityMember {
  name: string;
  location: string;
  telegram: string;
  badge?: string;
}

// City coordinates mapping
const cityCoordinates: { [key: string]: [number, number] } = {
  'Lviv, Ukraine': [24.0316, 49.8397],
  'Warsaw, Poland': [21.0122, 52.2297],
  'Kyiv, Ukraine': [30.5234, 50.4547],
  'Berlin, Germany': [13.4050, 52.5200],
  'Kharkiv, Ukraine': [36.2304, 49.9935],
  'Amsterdam, Netherlands': [4.9041, 52.3676],
  'Odesa, Ukraine': [30.7233, 46.4825],
  'Prague, Czech Republic': [14.4378, 50.0755],
  'Dnipro, Ukraine': [35.0462, 48.4647],
  'Vienna, Austria': [16.3738, 48.2082],
  'Vinnytsia, Ukraine': [28.4682, 49.2331],
  'Barcelona, Spain': [2.1734, 41.3851],
  'Zaporizhzhia, Ukraine': [35.1396, 47.8388],
  'Stockholm, Sweden': [18.0686, 59.3293],
  'Poltava, Ukraine': [34.5407, 49.5883],
  'Dublin, Ireland': [-6.2603, 53.3498],
  'Sumy, Ukraine': [34.7981, 50.9077],
  'Copenhagen, Denmark': [12.5683, 55.6761],
  'Chernihiv, Ukraine': [31.2849, 51.4982],
  'Helsinki, Finland': [24.9384, 60.1699],
  'Rivne, Ukraine': [26.2516, 50.6199],
  'Oslo, Norway': [10.7522, 59.9139],
  'Ternopil, Ukraine': [25.5948, 49.5535],
  'Brussels, Belgium': [4.3517, 50.8503],
  'Ivano-Frankivsk, Ukraine': [24.7111, 48.9226],
  'Lisbon, Portugal': [-9.1393, 38.7223],
  'Lutsk, Ukraine': [25.3424, 50.7472],
  'Athens, Greece': [23.7275, 37.9838],
  'Khmelnytskyi, Ukraine': [26.9965, 49.4229],
  'Rome, Italy': [12.4964, 41.9028],
  'Zhytomyr, Ukraine': [28.6587, 50.2547],
  'Madrid, Spain': [-3.7038, 40.4168],
  'Chernivtsi, Ukraine': [25.9407, 48.2917],
  'Budapest, Hungary': [19.0402, 47.4979],
  'Kropyvnytskyi, Ukraine': [32.2597, 48.5132],
  'Bucharest, Romania': [26.1025, 44.4268],
  'Uzhhorod, Ukraine': [22.2879, 48.6208],
  'Sofia, Bulgaria': [23.3219, 42.6977],
  'Kherson, Ukraine': [32.6167, 46.6354],
  'Zagreb, Croatia': [15.9819, 45.8150],
  'Mykolaiv, Ukraine': [31.9946, 46.9750],
  'Ljubljana, Slovenia': [14.5058, 46.0569],
  'Cherkasy, Ukraine': [32.0621, 49.4444],
  'Bratislava, Slovakia': [17.1077, 48.1486],
  'Kremenchuk, Ukraine': [33.4197, 49.0680],
  'Vilnius, Lithuania': [25.2797, 54.6872],
  'Bila Tserkva, Ukraine': [30.1109, 49.8091],
  'Riga, Latvia': [24.1052, 56.9496],
  'Kryvyi Rih, Ukraine': [33.3474, 47.9105],
  'Tallinn, Estonia': [24.7536, 59.4370],
  'Mariupol, Ukraine': [37.5413, 47.1308]
};

export const CommunityMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const theme = useTheme();
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is not set');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: theme.palette.mode === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [24.0316, 49.8397] as [number, number], // Lviv coordinates
      zoom: 4
    });

    map.current.on('load', () => {
      // Add markers for each community member
      const newMarkers = communityData.map((member: CommunityMember) => {
        const coordinates = cityCoordinates[member.location] || [0, 0];

        const marker = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 5px 0;">${member.name}</h3>
                  <p style="margin: 0 0 5px 0;">${member.location}</p>
                  <p style="margin: 0 0 5px 0;">Telegram: ${member.telegram}</p>
                  ${member.badge ? `<p style="margin: 0;">Badge: ${member.badge}</p>` : ''}
                </div>
              `)
          );

        return marker;
      });

      newMarkers.forEach(marker => marker.addTo(map.current!));
      setMarkers(newMarkers);
    });

    return () => {
      markers.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [theme.palette.mode]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        borderRadius: 0
      }}
    >
      <Box 
        ref={mapContainer} 
        sx={{ 
          height: '100%', 
          width: '100%',
          margin: 0,
          padding: 0
        }} 
      />
    </Paper>
  );
}; 