'use client'

import { motion } from 'framer-motion';
import DashboardLayout from "../layouts/DashboardLayout";
import CalendarView from '../components/Calendar';

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Calendario
        </h1>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CalendarView
            onSelectEvent={(event) => {
              console.log('Evento seleccionado:', event);
            }}
            onSelectSlot={(slotInfo) => {
              console.log('Slot seleccionado:', slotInfo);
            }}
          />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}