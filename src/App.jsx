import React, { useState, useEffect } from 'react';
import FolderPlus from 'lucide-react/dist/esm/icons/folder-plus';
import Plus from 'lucide-react/dist/esm/icons/plus';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Circle from 'lucide-react/dist/esm/icons/circle';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Clock from 'lucide-react/dist/esm/icons/clock';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid';
import ListTodo from 'lucide-react/dist/esm/icons/list-todo';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import CalendarPlus from 'lucide-react/dist/esm/icons/calendar-plus';
const PALETTE_COLORS = [
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-rose-500'
];

const URGENCY_LEVELS = [
  { id: 'low', label: 'Basse', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'medium', label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'high', label: 'Haute', color: 'bg-rose-100 text-rose-700 border-rose-200' }
];

export default function App() {
  // --- ÉTATS ---
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('app_projects');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Refonte Site Web', color: 'bg-orange-500' },
      { id: '2', name: 'Organisation Apéro', color: 'bg-emerald-500' }
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('app_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '101', projectId: '1', title: 'Maquette UI', durationHours: 2, done: true, urgency: 'low' },
      { id: '102', projectId: '1', title: 'Intégration React', durationHours: 4, done: false, urgency: 'high' },
      { id: '103', projectId: '2', title: 'Acheter les boissons', durationHours: 1, done: false, urgency: 'medium' }
    ];
  });

  const [activeProjectId, setActiveProjectId] = useState('all');
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Formulaire nouvelle tâche
  const [taskTitle, setTaskTitle] = useState('');
  const [taskHours, setTaskHours] = useState('1');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskUrgency, setTaskUrgency] = useState('medium');

  // Édition de tâche
  const [editingTask, setEditingTask] = useState(null);

  // Persistance
  useEffect(() => {
    localStorage.setItem('app_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (projects.length > 0 && !taskProjectId) {
      setTaskProjectId(projects[0].id);
    }
  }, [projects]);

  // --- ACTIONS PROJETS ---
  const addProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const randomColor = PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)];
    
    const newProj = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      color: randomColor
    };
    
    setProjects([...projects, newProj]);
    setTaskProjectId(newProj.id);
    setNewProjectName('');
    setShowNewProjectModal(false);
  };

  const changeProjectColor = (projId, e) => {
    e.stopPropagation();
    setProjects(projects.map(p => {
      if (p.id === projId) {
        const currentIndex = PALETTE_COLORS.indexOf(p.color);
        const nextColor = PALETTE_COLORS[(currentIndex + 1) % PALETTE_COLORS.length];
        return { ...p, color: nextColor };
      }
      return p;
    }));
  };

  const deleteProject = (id, e) => {
    e.stopPropagation();
    if (confirm('Supprimer ce projet et toutes ses tâches ?')) {
      setProjects(projects.filter(p => p.id !== id));
      setTasks(tasks.filter(t => t.projectId !== id));
      if (activeProjectId === id) setActiveProjectId('all');
    }
  };

  // --- ACTIONS TÂCHES ---
  const addTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskProjectId) return;

    const newTask = {
      id: Date.now().toString(),
      projectId: taskProjectId,
      title: taskTitle.trim(),
      durationHours: Math.max(0.5, parseFloat(taskHours) || 1),
      done: false,
      urgency: taskUrgency
    };

    setTasks([newTask, ...tasks]);
    setTaskTitle('');
    setTaskHours('1');
    setTaskUrgency('medium');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const cycleTaskUrgency = (taskId, e) => {
    e.stopPropagation();
    const order = ['low', 'medium', 'high'];
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const nextIdx = (order.indexOf(t.urgency || 'medium') + 1) % order.length;
        return { ...t, urgency: order[nextIdx] };
      }
      return t;
    }));
  };

  const saveEditedTask = (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    setTasks(tasks.map(t => t.id === editingTask.id ? {
      ...editingTask,
      title: editingTask.title.trim(),
      durationHours: Math.max(0.5, parseFloat(editingTask.durationHours) || 1)
    } : t));

    setEditingTask(null);
  };

  // --- CALCULS & TRI DES TÂCHES ---
  const getProjectStats = (projId) => {
    const projTasks = tasks.filter(t => t.projectId === projId);
    if (projTasks.length === 0) return { totalHours: 0, doneHours: 0, percent: 0 };
    
    const totalHours = projTasks.reduce((acc, t) => acc + (t.durationHours || 0), 0);
    const doneHours = projTasks.filter(t => t.done).reduce((acc, t) => acc + (t.durationHours || 0), 0);
    
    const percent = totalHours > 0 ? Math.round((doneHours / totalHours) * 100) : 0;
    return { totalHours, doneHours, percent };
  };

  const addToGoogleCalendar = (task) => {
    const now = new Date();
    const startTime = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(now.getTime() + (task.durationHours || 1) * 3600 * 1000);
    const endTime = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&details=${encodeURIComponent(`Tâche de ${task.durationHours}h`)}&dates=${startTime}/${endTime}`;
    window.open(url, '_blank');
  };

  // Filtrage + Tri (Les non-complétées en premier, les complétées en bas)
  const filteredTasks = activeProjectId === 'all' 
    ? tasks 
    : tasks.filter(t => t.projectId === activeProjectId);

  const displayedTasks = [...filteredTasks].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased pb-12">
      {/* En-tête avec nouveau titre */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-600 rounded-xl text-white shadow-sm">
              <Sparkles size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-stone-800">Get it Done!</h1>
          </div>
          <button 
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-orange-600 text-white px-3.5 py-2 rounded-xl shadow-sm hover:bg-orange-700 transition active:scale-95"
          >
            <FolderPlus size={15} />
            Nouveau Projet
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        {/* Section Projets */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Vos Projets</h2>
            <span className="text-xs font-medium text-stone-500">{projects.length} projet(s)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            <button
              onClick={() => setActiveProjectId('all')}
              className={`p-3 rounded-2xl border text-xs font-semibold transition flex flex-col justify-between h-[88px] ${
                activeProjectId === 'all'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <LayoutGrid size={14} />
                <span>Tous</span>
              </div>
              <span className="text-[10px] opacity-70 font-normal">{tasks.length} tâche(s)</span>
            </button>

            {projects.map((p) => {
              const stats = getProjectStats(p.id);
              const isActive = activeProjectId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  className={`cursor-pointer p-3 rounded-2xl border transition flex flex-col justify-between h-[88px] relative group ${
                    isActive
                      ? 'bg-white border-orange-500 ring-2 ring-orange-500/10 shadow-md'
                      : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <button 
                        onClick={(e) => changeProjectColor(p.id, e)} 
                        title="Changer la couleur"
                        className="hover:scale-125 transition p-0.5"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full block ${p.color}`} />
                      </button>
                      <span className="font-semibold text-xs text-stone-800 truncate">{p.name}</span>
                    </div>
                    <button 
                      onClick={(e) => deleteProject(p.id, e)} 
                      title="Supprimer le projet"
                      aria-label={`Supprimer le projet ${p.name}`}
                      className="text-stone-300 hover:text-rose-500 active:text-rose-600 transition p-1 flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ease-out ${p.color}`}
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-400 font-medium">
                      <span>{stats.doneHours}h / {stats.totalHours}h</span>
                      <span>{stats.percent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Formulaire Nouvelle Tâche avec Urgence */}
        <section className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <form onSubmit={addTask} className="space-y-2.5">
            <input
              type="text"
              placeholder="Intitulé de la tâche..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-base font-medium text-stone-800 placeholder-stone-400 focus:outline-none bg-transparent"
            />
            
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <select
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                  className="text-xs font-semibold text-stone-600 bg-stone-100 border-none rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer truncate"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 bg-stone-100 px-2 py-1.5 rounded-xl text-xs text-stone-600 font-medium">
                  <Clock size={12} />
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={taskHours}
                    onChange={(e) => setTaskHours(e.target.value)}
                    className="w-8 bg-transparent text-xs font-semibold focus:outline-none text-stone-800"
                  />
                  <span>h</span>
                </div>

                {/* Sélecteur d'urgence */}
                <select
                  value={taskUrgency}
                  onChange={(e) => setTaskUrgency(e.target.value)}
                  className="text-xs font-semibold text-stone-600 bg-stone-100 border-none rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="low">🟢 Basse</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="high">🔴 Haute</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!taskTitle.trim() || !taskProjectId}
                className="bg-orange-600 text-white p-2 rounded-xl hover:bg-orange-700 disabled:opacity-40 transition flex-shrink-0 active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>
          </form>
        </section>

        {/* Liste des Tâches (Triées avec accomplies en bas) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <ListTodo size={14} />
              Tâches
            </h2>
            <span className="text-xs font-medium text-stone-400">
              {displayedTasks.filter(t => t.done).length}/{displayedTasks.length} complétées
            </span>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-200">
              <p className="text-xs font-medium text-stone-400">Aucune tâche enregistrée.</p>
            </div>
          ) : (
            displayedTasks.map((task) => {
              const project = projects.find(p => p.id === task.projectId);
              const urgencyMeta = URGENCY_LEVELS.find(u => u.id === (task.urgency || 'medium'));

              return (
                <div
                  key={task.id}
                  className={`group bg-white p-3 rounded-2xl border transition flex items-center justify-between gap-3 shadow-sm ${
                    task.done ? 'border-stone-100 bg-stone-50/50 opacity-60' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`transition flex-shrink-0 ${
                        task.done ? 'text-emerald-500' : 'text-stone-300 hover:text-stone-400'
                      }`}
                    >
                      {task.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${
                        task.done ? 'line-through text-stone-400' : 'text-stone-800'
                      }`}>
                        {task.title}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {activeProjectId === 'all' && project && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md">
                            <span className={`w-1.5 h-1.5 rounded-full ${project.color}`} />
                            {project.name}
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-[10px] font-medium text-stone-400">
                          <Clock size={10} />
                          {task.durationHours}h
                        </span>

                        {/* Badge Urgence cliquable */}
                        <button
                          onClick={(e) => cycleTaskUrgency(task.id, e)}
                          title="Cliquer pour changer l'urgence"
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border transition ${urgencyMeta?.color}`}
                        >
                          {urgencyMeta?.label}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Bouton Édition */}
                    <button
                      onClick={() => setEditingTask(task)}
                      title="Modifier la tâche"
                      className="text-stone-300 hover:text-stone-700 transition p-1"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => addToGoogleCalendar(task)}
                      title="Ajouter à Google Calendar"
                      className="text-stone-300 hover:text-orange-600 transition p-1"
                    >
                      <Calendar size={15} />
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      title="Supprimer la tâche"
                      aria-label={`Supprimer la tâche ${task.title}`}
                      className="text-stone-300 hover:text-rose-500 active:text-rose-600 transition p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Modal Nouveau Projet */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs shadow-xl space-y-4">
            <h3 className="text-base font-bold text-stone-800">Nouveau Projet</h3>
            
            <form onSubmit={addProject} className="space-y-3">
              <input
                type="text"
                placeholder="Nom du projet..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-3.5 py-2 text-xs font-semibold bg-orange-600 text-white rounded-xl shadow-sm hover:bg-orange-700 disabled:opacity-40 transition"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition de Tâche */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs shadow-xl space-y-4">
            <h3 className="text-base font-bold text-stone-800">Modifier la tâche</h3>
            
            <form onSubmit={saveEditedTask} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400">Intitulé</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400">Projet</label>
                <select
                  value={editingTask.projectId}
                  onChange={(e) => setEditingTask({ ...editingTask, projectId: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1 bg-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-400">Durée (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={editingTask.durationHours}
                    onChange={(e) => setEditingTask({ ...editingTask, durationHours: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-400">Urgence</label>
                  <select
                    value={editingTask.urgency || 'medium'}
                    onChange={(e) => setEditingTask({ ...editingTask, urgency: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1 bg-white"
                  >
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🔴 Haute</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!editingTask.title.trim()}
                  className="px-3.5 py-2 text-xs font-semibold bg-orange-600 text-white rounded-xl shadow-sm hover:bg-orange-700 disabled:opacity-40 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}