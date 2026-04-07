'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../calendar.css';
import { motion } from 'framer-motion';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'pendiente' | 'en-progreso' | 'completada';
  priority: 'baja' | 'media' | 'alta';
  description?: string;
  creatorEmail?: string;
  backgroundColor?: string;
  borderColor?: string;
}

interface CalendarViewProps {
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  refreshKey?: number;
}

export default function CalendarView({ onSelectEvent, onSelectSlot, refreshKey }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  useEffect(() => {
    fetchEvents();
  }, [currentDate, refreshKey]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();

      const response = await fetch(`/api/calendar?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        const convertedEvents = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(convertedEvents);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  };

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.backgroundColor || '#3b82f6',
      borderRadius: '5px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '0.85rem',
    };

    return {
      style,
    };
  };


  if (loading) {
    return <div className="text-center py-8">Cargando calendario...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800">
      {/* Header con controles */}
      <motion.div
        className="mb-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 w-full">
          {/* Mes, Año y Tareas Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-1">
              <select 
                value={currentDate.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(parseInt(e.target.value));
                  setCurrentDate(newDate);
                }}
                className="text-2xl font-bold bg-transparent text-gray-900 dark:text-white capitalize cursor-pointer hover:text-blue-600 focus:outline-none transition-colors border-none p-0 appearance-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i} className="dark:bg-gray-800 text-base font-normal">
                    {format(new Date(2024, i, 1), 'MMMM', { locale: es })}
                  </option>
                ))}
              </select>
              <select 
                value={currentDate.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setFullYear(parseInt(e.target.value));
                  setCurrentDate(newDate);
                }}
                className="text-2xl font-bold bg-transparent text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 focus:outline-none transition-colors border-none p-0 appearance-none ml-1"
              >
                {Array.from({ length: 101 }, (_, i) => 2000 + i).map(y => (
                  <option key={y} value={y} className="dark:bg-gray-800 text-base font-normal">
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 sm:ml-2">
              {events.length} tarea{events.length !== 1 ? 's' : ''} cargada{events.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {/* Navegación */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={handlePrevious}
                className="p-1 px-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300"
                title="Anterior"
              >
                ←
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Hoy
              </button>
              <button
                onClick={handleNext}
                className="p-1 px-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300"
                title="Siguiente"
              >
                →
              </button>
            </div>

            {/* Vistas */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {(['month', 'week', 'day'] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded-md transition-all text-sm font-medium capitalize ${
                    view === v 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas rápidas */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-300 font-semibold">PENDIENTES</p>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {events.filter(e => e.status === 'pendiente').length}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">EN PROGRESO</p>
          <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
            {events.filter(e => e.status === 'en-progreso').length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-600 dark:text-green-300 font-semibold">COMPLETADAS</p>
          <p className="text-lg font-bold text-green-900 dark:text-green-100">
            {events.filter(e => e.status === 'completada').length}
          </p>
        </div>
      </div>

      {/* Calendario */}
      <div style={{ height: '600px' }} className="dark:text-white">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={setView}
          culture="es"
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          popup
          toolbar={false}
        />
      </div>
    </div>
  );
}
