'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { toast } from 'sonner';
import type { Team, TeamMember } from '@/types';

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('email') || '' : '';

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
      toast.error('Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          members: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTeams([data.team, ...teams]);
        setFormData({ name: '', description: '', color: '#3b82f6' });
        setShowForm(false);
        toast.success('Equipo creado exitosamente');
      }
    } catch (error) {
      console.error('Error al crear equipo:', error);
      toast.error('Error al crear el equipo');
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail) return;

    try {
      const updatedMembers = [
        ...selectedTeam.members,
        { email: newMemberEmail, role: 'viewer' as const, joinedAt: new Date().toISOString() }
      ];

      const response = await fetch(`/api/teams?id=${selectedTeam._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembers })
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(teams.map(t => t._id === selectedTeam._id ? data.team : t));
        setSelectedTeam(data.team);
        setNewMemberEmail('');
        toast.success('Miembro agregado');
      }
    } catch (error) {
      console.error('Error al añadir miembro:', error);
      toast.error('Error al agregar miembro');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este equipo?')) return;

    try {
      const response = await fetch(`/api/teams?id=${teamId}`, { method: 'DELETE' });
      if (response.ok) {
        setTeams(teams.filter(t => t._id !== teamId));
        setSelectedTeam(null);
        toast.success('Equipo eliminado');
      }
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      toast.error('Error al eliminar el equipo');
    }
  };

  const handleRemoveMember = async (memberEmail: string) => {
    if (!selectedTeam) return;

    try {
      const updatedMembers = selectedTeam.members.filter(m => m.email !== memberEmail);
      const response = await fetch(`/api/teams?id=${selectedTeam._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembers })
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(teams.map(t => t._id === selectedTeam._id ? data.team : t));
        setSelectedTeam(data.team);
        toast.success('Miembro removido');
      }
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      toast.error('Error al eliminar miembro');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipos</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona tus equipos y colaboradores
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Nuevo Equipo
          </motion.button>
        </motion.div>

        {/* Create Team Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Equipo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el nombre del equipo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del equipo"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color del Equipo</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Crear Equipo
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teams Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando equipos...</p>
          </div>
        ) : teams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-600 dark:text-gray-400">
              No tienes equipos aún. ¡Crea tu primer equipo!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {teams.map((team) => (
                <motion.div
                  key={team._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => setSelectedTeam(team)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 cursor-pointer hover:shadow-xl transition-shadow"
                  style={{ borderLeftColor: team.color }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{team.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {team.description || 'Sin descripción'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {team.members.length + 1} Miembros
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">
                      {team.owner === userEmail ? 'Propietario' : 'Miembro'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Team Details Panel */}
        <AnimatePresence>
          {selectedTeam && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedTeam.description}
                  </p>
                </div>
                {selectedTeam.owner === userEmail && (
                  <motion.button
                    onClick={() => handleDeleteTeam(selectedTeam._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Eliminar
                  </motion.button>
                )}
              </div>

              {/* Add Member */}
              {selectedTeam.owner === userEmail && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                    Agregar Miembro
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Email del miembro"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.button
                      onClick={handleAddMember}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Agregar
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                  Miembros ({selectedTeam.members.length + 1})
                </h3>
                <div className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedTeam.owner}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Propietario</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 text-xs rounded-full font-medium">
                      Admin
                    </span>
                  </div>

                  {/* Members */}
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{member.email}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Agregado: {new Date(member.joinedAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">
                          {member.role === 'admin' ? 'Admin' : member.role === 'editor' ? 'Editor' : 'Viewer'}
                        </span>
                        {selectedTeam.owner === userEmail && (
                          <motion.button
                            onClick={() => handleRemoveMember(member.email)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm"
                            whileHover={{ scale: 1.1 }}
                          >
                            ✕
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => setSelectedTeam(null)}
                className="mt-6 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cerrar
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}