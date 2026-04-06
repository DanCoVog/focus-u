'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
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
}

export default function CalendarView({ onSelectEvent, onSelectSlot }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

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

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
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

  const monthLabel = currentDate.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  }).charAt(0).toUpperCase() + currentDate.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  }).slice(1);

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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {monthLabel}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {events.length} tarea{events.length !== 1 ? 's' : ''} este mes
          </p>
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={handlePreviousMonth}
            className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Anterior
          </motion.button>
          
          <motion.button
            onClick={handleToday}
            className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hoy
          </motion.button>

          <motion.button
            onClick={handleNextMonth}
            className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Siguiente →
          </motion.button>
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
          popup
          toolbar={true}
        />
      </div>
    </div>
  );
}
