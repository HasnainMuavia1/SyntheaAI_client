'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Folder, Trash2, Code2, X, Terminal, Search, Clock, Activity, Cpu, Shield, Zap, CornerDownRight } from 'lucide-react';
import { UserMenu } from '@/components/ui/UserMenu';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [launchingProject, setLaunchingProject] = useState<string | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>(['Initializing Secure Enclave...', 'Connecting Node 0xFD12...']);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiClient.projects.list();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();

    // Simulated log rotation
    const logInterval = setInterval(() => {
      const logs = [
        'Kernel.Optimize() // Status: OK',
        'Pulse.Beacon_Sent // Node: 01',
        'Sync_Engine.Active',
        'Enclave.Secure // Hash: 0xF2A'
      ];
      setSystemLogs(prev => [...prev.slice(-4), logs[Math.floor(Math.random() * logs.length)]]);
    }, 5000);

    return () => clearInterval(logInterval);
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newProjectName.trim()) return setError('Project name is required');
    try {
      const data = await apiClient.projects.create(newProjectName, description);
      setProjects([data.project, ...projects]);
      setIsModalOpen(false);
      setNewProjectName('');
      setDescription('');

      setLaunchingProject(data.project.id);
      router.push(`/editor/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Confirm protocol termination? All files will be purged from the secure enclave.")) {
      try {
        await apiClient.projects.delete(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        console.error("Failed to delete project:", err);
      }
    }
  };

  const handleLaunchProject = (id: string) => {
    setLaunchingProject(id);
    router.push(`/editor/${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      {/* Background Dither */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* DASHBOARD HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="size-8 border-2 border-white flex items-center justify-center font-bold italic -skew-x-12">S</div>
              <span className="text-xl font-black tracking-[0.2em] uppercase italic -skew-x-12 hidden md:block">Synthea</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="hidden lg:flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Activity size={12} className="text-blue-500" /> System: Active</span>
              <span className="flex items-center gap-2"><Cpu size={12} /> Node: 0xFD12</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
              <input type="text" placeholder="FILTER_PROJECTS" className="bg-white/5 border border-white/5 px-10 py-2 text-[10px] tracking-widest outline-none focus:border-white/20 transition-all uppercase w-48 lg:w-64" />
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* SYSTEM STATUS BAR */}
      <div className="bg-white/5 border-b border-white/10 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[8px] uppercase tracking-[0.3em] text-white/40">
          <div className="flex gap-6">
            {systemLogs.map((log, idx) => (
              <span key={idx} className={idx === systemLogs.length - 1 ? "text-blue-400 animate-pulse" : ""}>
                {log}
              </span>
            ))}
          </div>
          <div className="hidden sm:block">Enclave_Sync: 100% // Verified</div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-[10px] text-blue-500 uppercase tracking-[0.4em]">Core_Workspaces</div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Your_Projects</h1>
            </div>
            <p className="text-white/30 text-xs uppercase tracking-widest max-w-md">
              Manage your voice-controlled development nodes within the secure Synthea environment.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="bg-white text-black hover:bg-gray-200 rounded-none h-10 px-5 font-black tracking-[0.15em] text-[10px] transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            INITIALIZE NEW PROJECT <Plus className="ml-2" size={14} />
          </Button>
        </div>

        {/* PROJECT GRID */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="size-12 border-2 border-white/10 border-t-white animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40">Decrypting_Storage...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-white/5 bg-white/[0.02] relative group overflow-hidden">
            <Folder className="w-16 h-16 text-white/10 mx-auto mb-6 group-hover:text-blue-500/20 transition-colors" />
            <h3 className="text-xl font-bold uppercase tracking-[0.3em] mb-4">No_Nodes_Found</h3>
            <p className="text-white/30 text-[10px] mb-8 uppercase tracking-widest">Initialize a secure workspace to begin development.</p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="border-white/20 hover:bg-white hover:text-black rounded-none uppercase tracking-widest text-[10px] h-10 px-6"
            >
              CREATE_INITIAL_WORKSPACE
            </Button>
            <div className="absolute top-4 right-4 text-white/5"><Plus size={20} /></div>
            <div className="absolute bottom-4 left-4 text-white/5"><Plus size={20} /></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleLaunchProject(project.id)}
                className="group relative bg-[#0a0a0a] border border-white/10 p-5 hover:border-blue-500 transition-all cursor-pointer flex flex-col h-[180px] overflow-hidden hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              >
                {/* Plus Decorations */}
                <div className="absolute top-2 right-2 text-white/10 group-hover:text-blue-500 transition-colors"><Plus size={12} /></div>

                <div className="flex justify-between items-start mb-4">
                  <div className="size-10 border border-white/10 bg-white/5 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-all">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1.5 text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1 bg-blue-500 animate-pulse" />
                    <span className="text-[7px] uppercase tracking-[0.2em] text-blue-400">Node_Active</span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tighter truncate group-hover:text-blue-500 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest leading-relaxed line-clamp-2">
                    {project.description || "NO METADATA."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center text-[7px] text-white/20 uppercase tracking-widest">
                    <Clock size={8} className="mr-1.5" />
                    <span>SYNC: {project.updated ? new Date(project.updated).toLocaleDateString() : 'STABLE'}</span>
                  </div>
                  <CornerDownRight size={12} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* STYLISH LAUNCH LOADER OVERLAY */}
      {launchingProject && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center font-mono">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_60%)]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 rounded-full border border-blue-500/20 border-t-blue-500 animate-[spin_3s_linear_infinite] shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
              {/* Inner fast spinning ring */}
              <div className="absolute inset-4 rounded-full border border-white/10 border-b-white animate-[spin_1s_linear_infinite_reverse]" />
              {/* Center icon */}
              <Zap className="w-8 h-8 text-white animate-pulse" />
            </div>

            <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              Establishing Uplink
            </h2>

            <div className="flex flex-col items-center gap-2 text-[10px] text-blue-400 uppercase tracking-widest font-bold">
              <span className="animate-pulse">Compiling Editor Environment...</span>
              <span className="text-white/30 delay-100 animate-pulse">Bypassing Firewalls...</span>
              <span className="text-white/30 delay-200 animate-pulse">Mounting Workspace Node: {launchingProject.split('-')[0]}</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200 font-mono">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg p-10 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <div className="absolute top-4 right-4 text-white/5"><Plus size={24} /></div>

            <div className="flex justify-between items-center mb-10">
              <div className="space-y-1">
                <div className="text-[10px] text-blue-500 uppercase tracking-[0.4em]">Initialization_Wizard</div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Create_Workspace</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="size-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 block">Workspace_Identification</label>
                  <input
                    autoFocus
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="E.G. PROJECT_SYNT_01"
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 text-xs tracking-[0.2em] outline-none focus:border-blue-500 transition-all uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 block">Metadata_Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="DEFINE_WORKSPACE_CORE_LOGIC..."
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 text-xs tracking-[0.2em] outline-none focus:border-blue-500 min-h-[120px] resize-none transition-all uppercase"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3">
                  <Shield size={16} className="text-red-500" />
                  <p className="text-red-500 text-[9px] uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 border-white/10 hover:bg-white hover:text-black rounded-none uppercase tracking-widest text-[10px]"
                >
                  ABORT_SESSION
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-white text-black hover:bg-gray-200 rounded-none uppercase tracking-[0.2em] font-black text-[10px] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  INITIALIZE_NODE
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}