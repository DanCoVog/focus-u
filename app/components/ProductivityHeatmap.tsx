'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Info } from 'lucide-react';

interface ActivityLog {
  type: 'task' | 'session';
  timestamp: string;
}

export default function ProductivityHeatmap() {
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadActivity = () => {
      const activityStr = localStorage.getItem('focus-u-activity') || '[]';
      const activities: ActivityLog[] = JSON.parse(activityStr);
      
      const counts: Record<string, number> = {};
      activities.forEach(act => {
        const date = act.timestamp.split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
      });

      setActivityData(counts);
      setTotalCount(activities.length);
    };

    loadActivity();
    // Escuchar cambios en localStorage (opcional, si se lanza un evento personalizado)
    window.addEventListener('storage', loadActivity);
    return () => window.removeEventListener('storage', loadActivity);
  }, []);

  // Generar últimos 90 días
  const days = Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    return d.toISOString().split('T')[0];
  });

  const getColor = (count: number) => {
    if (!count) return 'bg-gray-100 dark:bg-gray-800';
    if (count < 3) return 'bg-blue-200 dark:bg-blue-900/40 text-blue-800';
    if (count < 6) return 'bg-blue-400 dark:bg-blue-700 text-white';
    if (count < 10) return 'bg-blue-600 dark:bg-blue-500 text-white';
    return 'bg-blue-800 dark:bg-blue-400 text-white';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Activity className="text-blue-500" />
          Mapa de Actividad
        </h3>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {totalCount} acciones totales
        </span>
      </div>

      <div className="grid grid-cols-12 gap-2 overflow-x-auto pb-2">
        {days.map((date, index) => {
          const count = activityData[date] || 0;
          return (
            <motion.div
              key={date}
              whileHover={{ scale: 1.2, zIndex: 10 }}
              className={`w-full aspect-square rounded-sm ${getColor(count)} cursor-help transition-colors relative group`}
              title={`${date}: ${count} actividades`}
            >
              {/* Tooltip personalizado */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {date}: {count} acts
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex items-center gap-2">
          <span>Menos</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <div className="w-2 h-2 rounded-sm bg-blue-200 dark:bg-blue-900/40" />
            <div className="w-2 h-2 rounded-sm bg-blue-400 dark:bg-blue-700" />
            <div className="w-2 h-2 rounded-sm bg-blue-600 dark:bg-blue-500" />
            <div className="w-2 h-2 rounded-sm bg-blue-800 dark:bg-blue-400" />
          </div>
          <span>Más</span>
        </div>
        <div className="flex items-center gap-1">
          <Info size={10} />
          <span>Suma de tareas y sesiones</span>
        </div>
      </div>
    </div>
  );
}
