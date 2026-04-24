'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Target, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60;  // 5 minutes

const DEFAULT_FOCUS_TIME = 25 * 60; // 25 minutes
const DEFAULT_BREAK_TIME = 5 * 60;  // 5 minutes

export const logActivity = (type: 'task' | 'session') => {
  if (typeof window === 'undefined') return;
  const activityStr = localStorage.getItem('focus-u-activity') || '[]';
  const activity = JSON.parse(activityStr);
  activity.push({
    type,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('focus-u-activity', JSON.stringify(activity));
};

export default function FocusTimer() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Sincronizar timeLeft cuando cambian los inputs (si el timer no está activo)
  useEffect(() => {
    if (!isActive) {
      if (isBreak) {
        setTimeLeft(breakMinutes * 60);
      } else {
        setTimeLeft(focusMinutes * 60);
      }
    }
  }, [focusMinutes, breakMinutes, isBreak, isActive]);

  const playNotification = useCallback(() => {
    if (isMuted) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.error('Error playing sound:', e));
  }, [isMuted]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playNotification();
      if (isBreak) {
        toast.success('¡Descanso terminado! Es hora de concentrarse.');
        setTimeLeft(focusMinutes * 60);
        setIsBreak(false);
      } else {
        toast.success('¡Sesión de enfoque completada! Tómate un respiro.');
        logActivity('session');
        setTimeLeft(breakMinutes * 60);
        setIsBreak(true);
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak, playNotification]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? breakMinutes * 60 : focusMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (isBreak ? BREAK_TIME : FOCUS_TIME));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {isBreak ? <Coffee className="text-orange-500" /> : <Target className="text-blue-500" />}
          {isBreak ? 'Modo Descanso' : 'Modo Enfoque'}
        </h3>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Minutos Estudio</label>
          <input 
            type="number" 
            value={focusMinutes} 
            onChange={(e) => setFocusMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={isActive}
            className="w-full bg-transparent text-xl font-black text-blue-600 dark:text-blue-400 focus:outline-none disabled:opacity-50"
          />
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Minutos Descanso</label>
          <input 
            type="number" 
            value={breakMinutes} 
            onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={isActive}
            className="w-full bg-transparent text-xl font-black text-orange-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div className="relative flex items-center justify-center mb-8">
        {/* Progress Circle Visual */}
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100 dark:text-gray-700"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={553}
            initial={{ strokeDashoffset: 553 }}
            animate={{ strokeDashoffset: 553 * (1 - progress) }}
            className={`${isBreak ? "text-orange-500" : "text-blue-600"} transition-all duration-300`}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={timeLeft}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-mono font-bold text-gray-900 dark:text-white"
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            minutos restantes
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg ${
            isActive 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
          {isActive ? 'Pausar' : 'Empezar'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-md"
        >
          <RotateCcw size={20} />
        </motion.button>
      </div>
    </div>
  );
}
