'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Trees, Coffee, Volume2, VolumeX, Play, Pause } from 'lucide-react';

const SOUNDS = [
  { 
    id: 'rain', 
    name: 'Lluvia', 
    icon: CloudRain, 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', // Reemplazar con URL real de lluvia si es posible
    color: 'text-blue-500' 
  },
  { 
    id: 'forest', 
    name: 'Bosque', 
    icon: Trees, 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 
    color: 'text-green-500' 
  },
  { 
    id: 'cafe', 
    name: 'Café', 
    icon: Coffee, 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 
    color: 'text-orange-500' 
  }
];

// URLs reales de sonidos relajantes (Mixkit Free)
const SOUND_URLS = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  forest: 'https://assets.mixkit.co/active_storage/sfx/2361/2361-preview.mp3',
  cafe: 'https://assets.mixkit.co/active_storage/sfx/2362/2362-preview.mp3'
};

export default function AmbientSounds() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (activeSound) {
      if (audioRef.current) {
        audioRef.current.src = (SOUND_URLS as any)[activeSound];
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.error("Error playing audio", e));
      }
    } else {
      audioRef.current?.pause();
    }
  }, [activeSound]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleSound = (id: string) => {
    setActiveSound(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <Volume2 className="text-purple-500" />
        Sonidos de Ambiente
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {SOUNDS.map((sound) => {
          const Icon = sound.icon;
          const isActive = activeSound === sound.id;
          return (
            <motion.button
              key={sound.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSound(sound.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                isActive 
                  ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500 shadow-inner' 
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${isActive ? sound.color : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                {sound.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="playing"
                  className="mt-1 flex gap-0.5 items-end h-2"
                >
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 8, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-purple-500 rounded-full"
                    />
                  ))}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <VolumeX size={16} className="text-gray-400" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <Volume2 size={16} className="text-gray-400" />
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
