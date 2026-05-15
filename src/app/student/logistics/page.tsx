'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Bus, MapPin, Navigation, Clock } from 'lucide-react';

interface BusLocation {
  lat: number;
  lng: number;
  speed: number;
  timestamp: string;
}

export default function BusTrackingDashboard() {
  const [location, setLocation] = useState<BusLocation | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  // Mock route ID for demonstration
  const routeId = 'route-123';

  useEffect(() => {
    // Determine WebSocket URL based on current protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In production, this would point to the specific Worker domain
    const wsUrl = `${protocol}//${window.location.host}/ws/logistics/${routeId}`;

    const connectWebSocket = () => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setStatus('connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'BUS_LOCATION') {
                    setLocation(data.payload);
                }
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        };

        ws.onclose = () => {
            setStatus('disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = () => {
            setStatus('disconnected');
        };

        wsRef.current = ws;
    };

    // For demonstration, we will simulate the driver sending updates 
    // if the actual WebSocket connection fails (e.g., during local dev without the separate worker running)
    let mockInterval: NodeJS.Timeout;
    
    // Attempt real connection
    try {
      connectWebSocket();
    } catch(e) {
        console.warn("Real WebSocket connection failed, falling back to mock data");
    }

    // Mock driver movement
    let currentLat = -6.200000;
    let currentLng = 106.816666;
    
    mockInterval = setInterval(() => {
        currentLat += 0.0001 * (Math.random() - 0.5);
        currentLng += 0.0001 * (Math.random() - 0.5);
        
        setLocation({
            lat: currentLat,
            lng: currentLng,
            speed: Math.floor(Math.random() * 40) + 10,
            timestamp: new Date().toISOString()
        });
        setStatus('connected'); // Force connected status for mock
    }, 2000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearInterval(mockInterval);
    };
  }, []);

  return (
    <DashboardLayout role="STUDENT" userName="Student Name">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
             <Bus className="mr-3 text-yellow-500" />
             Live Bus Tracking
          </h1>
          <p className="text-gray-400 mt-1">Real-time location for Route A (Sudirman - Kemang)</p>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                status === 'connected' ? 'bg-green-500/20 text-green-400' : 
                status === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
            }`}>
                {status}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization Container */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm h-[500px] relative flex items-center justify-center">
            {/* 
               In a real application, you would integrate Leaflet, Mapbox, or Google Maps here.
               For this demo, we create a stylized radar/map placeholder.
            */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            
            {/* Radar Animation */}
            <div className="relative w-64 h-64 border border-blue-500/30 rounded-full flex items-center justify-center">
                <div className="absolute w-full h-full border border-blue-500/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="w-32 h-32 border border-blue-500/50 rounded-full"></div>
                
                {/* Bus Marker */}
                {location && (
                    <div className="absolute z-10 animate-bounce">
                        <div className="bg-yellow-500 text-gray-900 p-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                            <Bus size={24} />
                        </div>
                    </div>
                )}
            </div>

            {/* Coordinates Overlay */}
            {location && (
               <div className="absolute bottom-4 left-4 bg-gray-950/80 backdrop-blur border border-gray-800 p-3 rounded-lg text-xs font-mono text-gray-300">
                  <p>LAT: {location.lat.toFixed(6)}</p>
                  <p>LNG: {location.lng.toFixed(6)}</p>
               </div>
            )}
        </div>

        {/* Telemetry Data */}
        <div className="space-y-6">
           <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-semibold text-gray-200 mb-4 border-b border-gray-800 pb-2">Telemetry</h3>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                         <Navigation size={18} className="mr-2" /> Speed
                      </div>
                      <span className="text-xl font-bold text-white">
                         {location ? `${location.speed} km/h` : '--'}
                      </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                         <Clock size={18} className="mr-2" /> Last Update
                      </div>
                      <span className="text-sm text-gray-300">
                         {location ? new Date(location.timestamp).toLocaleTimeString() : '--:--'}
                      </span>
                  </div>
               </div>
           </div>

           <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-semibold text-gray-200 mb-4 border-b border-gray-800 pb-2">Route Stops</h3>
               <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
                  {[
                      { name: 'Sudirman Station', time: '06:00 AM', status: 'passed' },
                      { name: 'Senopati Checkpoint', time: '06:15 AM', status: 'passed' },
                      { name: 'Kemang Village', time: '06:45 AM', status: 'current' },
                      { name: 'SekolahApp V2 Campus', time: '07:15 AM', status: 'pending' },
                  ].map((stop, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 bg-gray-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ml-[3px] md:mx-auto ${
                              stop.status === 'passed' ? 'border-green-500' :
                              stop.status === 'current' ? 'border-yellow-500 bg-yellow-500 animate-pulse' :
                              'border-gray-600'
                          }`}></div>
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 p-3 rounded-lg border border-gray-800 bg-gray-800/30">
                              <p className={`text-sm font-semibold ${stop.status === 'pending' ? 'text-gray-500' : 'text-gray-200'}`}>{stop.name}</p>
                              <p className="text-xs text-gray-500">{stop.time}</p>
                          </div>
                      </div>
                  ))}
               </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
