import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import communityData from '../data/community.json';

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = mapboxToken;

interface CommunityMember {
  name: string;
  location: string;
  telegram: string;
  badge?: string;
}

const cityCoordinates: { [key: string]: [number, number] } = {
  'Lviv, Ukraine': [24.0316, 49.8397],
  'Warsaw, Poland': [21.0122, 52.2297],
  'Kyiv, Ukraine': [30.5234, 50.4547],
  'Dnipro, Ukraine': [35.0462, 48.4647],
  'Larnaca, Cyprus': [33.6233, 34.9229],
  'Katowice, Poland': [19.0238, 50.2613],
  'Krakow, Poland': [19.9445, 50.0647],
  'Vic, Spain': [2.2544, 41.9301],
  'Ivano-Frankivsk, Ukraine': [24.7111, 48.9226],
  'Odesa, Ukraine': [30.7233, 46.4825],
  'Kharkiv, Ukraine': [36.2304, 49.9935],
  'Wroclaw, Poland': [17.0385, 51.1079],
  'Gdansk, Poland': [18.6466, 54.3520],
  'Valencia, Spain': [-0.3763, 39.4699],
  'Prague, Czech Republic': [14.4378, 50.0755],
  'Cherkasy, Ukraine': [32.0598, 49.4444],
  'Vinnytsia, Ukraine': [28.4682, 49.2331],
  'Marbella, Spain': [-4.8823, 36.5101],
  'Bucha, Ukraine': [30.3433, 50.5500],
  'Bielsko-Biała, Poland': [19.0438, 49.8225],
  'Fastiv, Ukraine': [29.9167, 49.9000],
  'Stockholm, Sweden': [18.0686, 59.3293],
  'Tel Aviv, Israel': [34.7818, 32.0853],
};

const CITY_COLOR = '#4361EE';
const MEMBER_COLOR = '#7B2D8B';

const members = communityData as CommunityMember[];

const membersByLocation: { [key: string]: CommunityMember[] } = members.reduce(
  (acc, member) => {
    if (!acc[member.location]) acc[member.location] = [];
    acc[member.location].push(member);
    return acc;
  },
  {} as { [key: string]: CommunityMember[] }
);

// sorted by member count desc
const sortedCities = Object.entries(membersByLocation).sort(
  ([, a], [, b]) => b.length - a.length
);

export const CommunityMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const expandedCityRef = useRef<string | null>(null);
  const expandCityFnRef = useRef<((location: string) => void) | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken) return;

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [24.0316, 49.8397],
      zoom: 4,
    });

    map.current.on('load', () => {
      // ── shared expand logic ──────────────────────────────────────────────
      const expandCity = (location: string) => {
        const coordinates = cityCoordinates[location] || [0, 0];

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        if (expandedCityRef.current === location) {
          expandedCityRef.current = null;
          setActiveCity(null);
          return;
        }

        expandedCityRef.current = location;
        setActiveCity(location);

        map.current?.flyTo({ center: coordinates, zoom: 8, duration: 900 });

        const cityMembers = membersByLocation[location] || [];

        const newMarkers = cityMembers.map((member, index) => {
          const angle = (index * 2 * Math.PI) / cityMembers.length;
          const radius = cityMembers.length === 1 ? 0 : 0.008;
          const offsetCoords: [number, number] = [
            coordinates[0] + radius * Math.cos(angle),
            coordinates[1] + radius * Math.sin(angle),
          ];

          const memberEl = document.createElement('div');
          memberEl.style.cssText = 'cursor: pointer;';

          const telegramHandle = member.telegram.replace('@', '');
          const telegramUrl = `https://t.me/${telegramHandle}`;

          memberEl.innerHTML = `
            <div style="
              background: ${MEMBER_COLOR};
              color: white;
              border-radius: 50%;
              width: 42px;
              height: 42px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 16px;
              font-family: system-ui, sans-serif;
              box-shadow: 0 2px 8px rgba(123, 45, 139, 0.4);
              border: 2.5px solid white;
              cursor: pointer;
              user-select: none;
            ">
              ${member.name.charAt(0)}
            </div>
          `;

          return new mapboxgl.Marker(memberEl)
            .setLngLat(offsetCoords)
            .setPopup(
              new mapboxgl.Popup({ offset: 20, className: 'custom-popup' }).setHTML(`
                <div style="padding: 10px 6px; font-family: system-ui, sans-serif; min-width: 200px;">
                  <div style="font-weight: 700; font-size: 18px; margin-bottom: 6px; color: #1a1a2e;">
                    ${member.name}
                  </div>
                  <div style="font-size: 15px; color: #666; margin-bottom: 10px;">
                    📍 ${member.location}
                  </div>
                  ${member.telegram ? `
                  <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 15px;
                    color: ${CITY_COLOR};
                    text-decoration: none;
                    font-weight: 500;
                    padding: 5px 10px;
                    background: #f0f3ff;
                    border-radius: 6px;
                  ">
                    ✈ ${member.telegram}
                  </a>` : ''}
                  ${
                    member.badge
                      ? `<div style="margin-top: 8px; font-size: 13px; background: #f5f0ff; color: ${MEMBER_COLOR}; padding: 4px 10px; border-radius: 10px; display: inline-block; font-weight: 600;">${member.badge}</div>`
                      : ''
                  }
                </div>
              `)
            )
            .addTo(map.current!);
        });

        markersRef.current = newMarkers;
      };

      // expose to UI
      expandCityFnRef.current = expandCity;

      // ── city markers ─────────────────────────────────────────────────────
      sortedCities.forEach(([location, cityMembers]) => {
        const coordinates = cityCoordinates[location] || [0, 0];
        const count = cityMembers.length;
        const size = Math.min(36 + count * 5, 56);

        const circle = document.createElement('div');
        circle.style.cssText = `
          background: ${CITY_COLOR};
          color: white;
          border-radius: 50%;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: ${count > 9 ? '15px' : '17px'};
          font-family: system-ui, sans-serif;
          box-shadow: 0 2px 10px rgba(67, 97, 238, 0.45);
          cursor: pointer;
          border: 2.5px solid white;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          user-select: none;
        `;
        circle.textContent = String(count);

        circle.addEventListener('mouseenter', () => {
          circle.style.transform = 'scale(1.12)';
          circle.style.boxShadow = '0 4px 16px rgba(67, 97, 238, 0.6)';
        });
        circle.addEventListener('mouseleave', () => {
          circle.style.transform = 'scale(1)';
          circle.style.boxShadow = '0 2px 10px rgba(67, 97, 238, 0.45)';
        });

        const el = document.createElement('div');
        el.className = 'city-marker';
        el.style.cssText = 'cursor: pointer;';
        el.appendChild(circle);

        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          expandCity(location);
        });

        new mapboxgl.Marker(el).setLngLat(coordinates).addTo(map.current!);
      });
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.current?.remove();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Stats */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 16,
          background: 'white',
          borderRadius: 12,
          padding: '10px 16px',
          boxShadow: '0 2px 14px rgba(0,0,0,0.13)',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: CITY_COLOR, lineHeight: 1 }}>
            {members.length}
          </div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>учасників</div>
        </div>
        <div style={{ width: 1, height: 36, background: '#eee' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: MEMBER_COLOR, lineHeight: 1 }}>
            {sortedCities.length}
          </div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>міст</div>
        </div>
      </div>

      {/* City picker */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'white',
          borderRadius: 14,
          boxShadow: '0 2px 14px rgba(0,0,0,0.13)',
          fontFamily: 'system-ui, sans-serif',
          zIndex: 10,
          width: 300,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px 12px',
            fontSize: 15,
            fontWeight: 700,
            color: '#aaa',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          Міста
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {sortedCities.map(([location, cityMembers]) => {
            const isActive = activeCity === location;
            const shortName = location.split(',')[0];
            return (
              <button
                key={location}
                onClick={() => expandCityFnRef.current?.(location)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '13px 20px',
                  border: 'none',
                  background: isActive ? '#f0f3ff' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderLeft: isActive ? `3px solid ${CITY_COLOR}` : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#fafafa';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? CITY_COLOR : '#333',
                  }}
                >
                  {shortName}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isActive ? CITY_COLOR : '#bbb',
                    background: isActive ? '#dde3ff' : '#f5f5f5',
                    borderRadius: 20,
                    padding: '3px 11px',
                  }}
                >
                  {cityMembers.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
