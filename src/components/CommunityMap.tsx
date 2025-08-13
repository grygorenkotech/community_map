import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Paper, useTheme } from '@mui/material';
import communityData from '../data/community.json';
import type { ExpressionSpecification } from 'mapbox-gl';

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
  'Mariupol, Ukraine': [37.5413, 47.1308],
  'Larnaca, Cyprus': [33.6233, 34.9229],
  'Katowice, Poland': [19.0238, 50.2613],
  'Krakow, Poland': [19.9445, 50.0647],
  'Vic, Spain': [2.2544, 41.9301],
  'Wroclaw, Poland': [17.0385, 51.1079],
  'Gdansk, Poland': [18.6466, 54.3520],
  'Valencia, Spain': [-0.3763, 39.4699],
  'Bucha, Ukraine': [30.2120, 50.5435]
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
      // Додаємо шар з кордонами країн
      map.current?.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });

      // Отримуємо унікальний список країн з учасниками
      const countriesWithMembers = new Set(
        communityData.map(member => {
          const location = member.location.split(', ')[1];
          return location;
        })
      );

      // Створюємо масив для match виразу
      const matchExpression: ExpressionSpecification = [
        'match',
        ['get', 'name_en'],
        ...Array.from(countriesWithMembers).flatMap(country => [
          country,
          country === 'Ukraine' 
            ? theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 0, 0.25)' 
              : 'rgba(255, 255, 0, 0.15)'
            : theme.palette.mode === 'dark' 
              ? 'rgba(25, 118, 210, 0.25)' 
              : 'rgba(25, 118, 210, 0.15)'
        ]),
        'transparent'
      ];

      // Додаємо шар з підсвічуванням країн
      map.current?.addLayer({
        'id': 'country-fills',
        'type': 'fill',
        'source': 'countries',
        'source-layer': 'country_boundaries',
        'paint': {
          'fill-color': matchExpression,
          'fill-outline-color': theme.palette.mode === 'dark' ? '#666' : '#ccc'
        }
      });

      // Групуємо учасників за містами
      const membersByLocation = communityData.reduce((acc: { [key: string]: CommunityMember[] }, member: CommunityMember) => {
        if (!acc[member.location]) {
          acc[member.location] = [];
        }
        acc[member.location].push(member);
        return acc;
      }, {});

      // Додаємо маркери для кожного міста
      const newMarkers = Object.entries(membersByLocation).map(([location, members]) => {
        const coordinates = cityCoordinates[location] || [0, 0];
        
        // Якщо в місті більше одного учасника, зміщуємо маркери
        const markers = members.map((member, index) => {
          let offsetCoordinates = [...coordinates] as [number, number];
          
          if (members.length > 1) {
            // Створюємо невелике зміщення для кожного маркера
            const angle = (index * 2 * Math.PI) / members.length;
            const radius = 0.02; // Збільшений радіус зміщення в градусах
            offsetCoordinates[0] += radius * Math.cos(angle);
            offsetCoordinates[1] += radius * Math.sin(angle);
          }

          const marker = new mapboxgl.Marker(
            location === 'Dnipro, Ukraine' ? {
              element: (() => {
                const el = document.createElement('div');
                el.innerHTML = '❤️';
                el.style.fontSize = '26px';
                el.style.transform = 'translate(-50%, -50%)';
                return el;
              })()
            } : undefined
          )
            .setLngLat(offsetCoordinates)
            .setPopup(
              new mapboxgl.Popup({ 
                offset: 25,
                className: 'custom-popup'
              })
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

        return markers;
      }).flat();

      // Додаємо кастомні стилі для попапу
      const style = document.createElement('style');
      style.textContent = `
        .custom-popup .mapboxgl-popup-content {
          background: ${theme.palette.background.paper};
          color: ${theme.palette.text.primary};
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .custom-popup .mapboxgl-popup-close-button {
          color: ${theme.palette.text.primary};
          font-size: 20px;
          padding: 4px 8px;
          background: ${theme.palette.background.paper};
          border-radius: 4px;
          margin: 4px;
        }
        .custom-popup .mapboxgl-popup-close-button:hover {
          background: ${theme.palette.action.hover};
        }
        .custom-popup .mapboxgl-popup-tip {
          border-top-color: ${theme.palette.background.paper} !important;
        }
      `;
      document.head.appendChild(style);

      newMarkers.forEach(marker => marker.addTo(map.current!));
      setMarkers(newMarkers);
    });

    return () => {
      markers.forEach(marker => marker.remove());
      map.current?.remove();
      // Видаляємо додані стилі при розмонтуванні
      const styleElement = document.querySelector('style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [theme.palette.mode, theme.palette.background.paper, theme.palette.text.primary, theme.palette.action.hover]);

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
