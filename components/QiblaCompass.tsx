
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Compass, Navigation, AlertCircle, Loader2 } from 'lucide-react';

export const QiblaCompass: React.FC = () => {
  const { t } = useLanguage();
  const [heading, setHeading] = useState(0);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isAligned, setIsAligned] = useState(false);

  const calculateQibla = (lat: number, lon: number) => {
    const KAABA_LAT = 21.422487;
    const KAABA_LONG = 39.826206;
    
    const phiK = KAABA_LAT * Math.PI / 180.0;
    const lambdaK = KAABA_LONG * Math.PI / 180.0;
    const phi = lat * Math.PI / 180.0;
    const lambda = lon * Math.PI / 180.0;
    
    const psi = 180.0 / Math.PI * Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
    
    return Math.round(psi);
  };

  useEffect(() => {
    // 1. Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setQiblaBearing(calculateQibla(latitude, longitude));
          setLoading(false);
        },
        (err) => {
          setError(t('location_error'));
          setLoading(false);
        }
      );
    } else {
      setError(t('location_not_supported'));
      setLoading(false);
    }

    // 2. Check Permission needs (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
    } else {
      setPermissionGranted(true);
    }
  }, [t]);

  useEffect(() => {
    if (qiblaBearing === null) return;
    
    // Calculate shortest angular distance
    let diff = Math.abs(heading - qiblaBearing);
    diff = Math.min(diff, 360 - diff);
    
    const aligned = diff < 5; // 5 degrees tolerance
    
    if (aligned && !isAligned) {
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
    setIsAligned(aligned);
  }, [heading, qiblaBearing, isAligned]);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let compass = 0;
    
    if ((e as any).webkitCompassHeading) {
      // iOS
      compass = (e as any).webkitCompassHeading;
    } else {
      // Android / Standard
      compass = e.alpha ? 360 - e.alpha : 0;
    }
    
    setHeading(compass);
  }, []);

  useEffect(() => {
    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [permissionGranted, handleOrientation]);

  const requestPermission = () => {
    const doe = DeviceOrientationEvent as any;
    if (typeof doe.requestPermission === 'function') {
      doe.requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setPermissionGranted(true);
            setNeedsPermission(false);
          } else {
            setError(t('compass_permission_denied'));
          }
        })
        .catch(console.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
       {loading ? (
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="animate-spin text-gold" size={40} />
           <p className="text-cream-dim">{t('search_placeholder')}...</p>
         </div>
       ) : error ? (
         <div className="flex flex-col items-center gap-4 text-red-400">
           <AlertCircle size={40} />
           <p>{error}</p>
         </div>
       ) : needsPermission && !permissionGranted ? (
         <div className="bg-navy-mid border border-gold-dim/30 p-8 rounded-2xl max-w-sm">
            <Compass size={48} className="text-gold mx-auto mb-4" />
            <p className="text-cream mb-6">{t('compass_permission_needed')}</p>
            <button 
              onClick={requestPermission}
              className="bg-gold text-navy font-bold py-3 px-6 rounded-xl hover:bg-gold-light transition-colors w-full"
            >
              {t('enable_compass')}
            </button>
         </div>
       ) : (
         <div className="relative w-full">
            {/* Top Stats */}
            <div className="mb-8 flex justify-center items-end gap-6 md:gap-12 relative z-20">
              <div className="text-center">
                <div className="text-gold-light font-scheherazade text-4xl mb-1 drop-shadow-md">{qiblaBearing}°</div>
                <p className="text-cream-dim text-[10px] uppercase tracking-widest font-sans">{t('qibla')}</p>
              </div>
              
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

              <div className="text-center">
                <div className={`font-scheherazade text-4xl mb-1 drop-shadow-md transition-colors duration-300 ${isAligned ? 'text-emerald-400' : 'text-cream'}`}>
                    {Math.round(heading)}°
                </div>
                <p className="text-cream-dim text-[10px] uppercase tracking-widest font-sans">{t('current_heading')}</p>
              </div>
            </div>

            {/* Compass Dial */}
            <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto">
               {/* Alignment Glow */}
               <div className={`absolute inset-0 rounded-full transition-opacity duration-500 blur-2xl ${isAligned ? 'bg-emerald-500/20 opacity-100' : 'opacity-0'}`}></div>

               {/* Outer Ring */}
               <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-500 shadow-[0_0_30px_rgba(201,168,76,0.1)] ${isAligned ? 'border-emerald-500/30' : 'border-gold-dim/30'}`}></div>
               
               {/* Rotating Container */}
               <div 
                 className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform"
                 style={{ transform: `rotate(${-heading}deg)` }}
               >
                  {/* North Marker */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2">
                     <div className="text-red-500 font-bold text-lg">N</div>
                     <div className="w-1 h-3 bg-red-500 mx-auto rounded-full"></div>
                  </div>

                  {/* Other Cardinal Points */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-2 text-cream-dim/50 font-bold text-xs">S</div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 text-cream-dim/50 font-bold text-xs">E</div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 text-cream-dim/50 font-bold text-xs">W</div>

                  {/* Ticks */}
                  {Array.from({length: 12}).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute top-0 left-1/2 w-0.5 h-2 bg-cream-dim/20 origin-bottom"
                      style={{ 
                        transform: `rotate(${i * 30}deg) translateY(0px)`, 
                        height: '10px',
                        transformOrigin: '50% 144px' // radius of 72 * 4 = 288 / 2 = 144 approx
                      }}
                    ></div>
                  ))}

                  {/* Qibla Marker (The Kaaba) */}
                  {qiblaBearing !== null && (
                    <div 
                      className="absolute top-0 left-1/2 w-12 h-1/2 origin-bottom flex flex-col items-center justify-start -ml-6 pt-2 z-10"
                      style={{ 
                        transform: `rotate(${qiblaBearing}deg)`,
                        height: '144px', // Radius
                        transformOrigin: '50% 100%'
                      }}
                    >
                      {/* Icon pointing to Qibla */}
                      <div 
                        className={`p-2 rounded-full transition-all duration-500 flex items-center justify-center
                            ${isAligned 
                                ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.8)] scale-125' 
                                : 'bg-gold text-navy shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse'
                            }`}
                      >
                         <Navigation size={24} fill="currentColor" className={isAligned ? "" : ""} />
                      </div>
                      
                      {/* Laser Line */}
                       <div className={`w-0.5 flex-1 mt-1 rounded-full transition-colors duration-500 ${isAligned ? 'bg-gradient-to-b from-emerald-500 to-transparent shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-b from-gold to-transparent opacity-50'}`}></div>
                    </div>
                  )}
               </div>

               {/* Center Dot */}
               <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-10 border-2 transition-colors duration-500 ${isAligned ? 'bg-navy border-emerald-500' : 'bg-navy border-gold'}`}></div>
               
               {/* Static Indicator at top (Phone direction) */}
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-cream-dim opacity-30">
                 <div className="w-0.5 h-4 bg-cream mx-auto"></div>
               </div>
               
               {/* Alignment Message */}
               {isAligned && (
                <div className="absolute top-[60%] left-0 right-0 text-center animate-in fade-in zoom-in duration-500 pointer-events-none">
                     <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-4 py-1.5 rounded-full text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-sm">
                         {t('aligned_with_qibla')}
                     </span>
                </div>
               )}
            </div>

            <p className="mt-12 text-xs text-cream-dim/50 max-w-xs mx-auto">
               {t('compass_permission_needed')}
            </p>
         </div>
       )}
    </div>
  );
};
