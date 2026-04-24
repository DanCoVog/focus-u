'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ActivityLog {
  type: 'task' | 'session';
  timestamp: string;
}

export default function WeeklyReport() {
  const [weeklyStats, setWeeklyStats] = useState<number[]>(new Array(7).fill(0));
  const [totalWeekly, setTotalWeekly] = useState(0);

  useEffect(() => {
    const loadStats = () => {
      const activityStr = localStorage.getItem('focus-u-activity') || '[]';
      const activities: ActivityLog[] = JSON.parse(activityStr);
      
      const now = new Date();
      const currentWeek = new Array(7).fill(0);
      
      // Obtener el inicio de la semana (Lunes)
      const monday = new Date(now);
      const day = now.getDay() || 7;
      monday.setHours(0, 0, 0, 0);
      monday.setDate(now.getDate() - (day - 1));

      let weeklySum = 0;
      activities.forEach(act => {
        const actDate = new Date(act.timestamp);
        if (actDate >= monday) {
          const dayIndex = (actDate.getDay() || 7) - 1;
          currentWeek[dayIndex]++;
          weeklySum++;
        }
      });

      setWeeklyStats(currentWeek);
      setTotalWeekly(weeklySum);
    };

    loadStats();
    window.addEventListener('storage', loadStats);
    return () => window.removeEventListener('storage', loadStats);
  }, []);

  const daysLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const maxVal = Math.max(...weeklyStats, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <BarChart3 className="text-purple-500" />
          Reporte Semanal
        </h3>
        <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
          <TrendingUp size={14} />
          <span>+{totalWeekly}</span>
        </div>
      </div>

      <div className="flex items-end justify-between h-40 gap-2 mb-4">
        {weeklyStats.map((count, i) => (
          <div key={daysLabels[i]} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full flex flex-col justify-end h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(count / maxVal) * 100}%` }}
                className={`w-full rounded-t-lg transition-all ${
                  count === maxVal && count > 0 
                    ? 'bg-gradient-to-t from-purple-600 to-blue-500' 
                    : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-purple-400'
                }`}
              />
              {count > 0 && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {count}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 uppercase font-medium">{daysLabels[i]}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-gray-500">
        Has completado <span className="font-bold text-gray-800 dark:text-gray-200">{totalWeekly}</span> actividades esta semana.
      </p>
    </div>
  );
}
