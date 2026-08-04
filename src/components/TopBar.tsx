import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Play, Pause, Info, FolderOpen, ChevronDown, Trash2, Moon, Sun, Atom, Gauge } from 'lucide-react';
import { TEMPLATES } from '../templates';

export const TopBar: React.FC = () => {
    const { state, setState, clearBoard, loadTemplate } = useAppStore();
    const [showTemplates, setShowTemplates] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowTemplates(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        setState(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
    };

    return (
        <div className="studio-topbar">
            <div className="flex items-center gap-2 px-2 border-r border-black/10 dark:border-white/10 mr-2">
                <div className="text-zinc-800 dark:text-zinc-600 font-bold text-sm px-2 whitespace-nowrap tracking-wider">
                    <span className="brand-mark">⚡</span>
                    <span className="brand-iotfy">IOTfy</span>&nbsp;<span className="brand-product">Circuits Studio</span>
                </div>
                <button 
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={clearBoard}
                    title="Tahtayı temizle"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="relative" ref={dropdownRef}>
                <button 
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${showTemplates ? 'bg-black/10 dark:bg-white/15 text-black dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                    onClick={() => setShowTemplates(!showTemplates)}
                >
                    <FolderOpen size={16} /> 
                    Hazır Devreler
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showTemplates ? 'rotate-180' : ''}`} />
                </button>

                {showTemplates && (
                    <div className="absolute top-full mt-2 w-48 bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-[#333] rounded-xl shadow-2xl py-2 z-50">
                        <div className="px-3 md:px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Keşfet</div>
                        {Object.entries(TEMPLATES).map(([id, template]) => (
                            <button
                                key={id}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                                onClick={() => {
                                    loadTemplate(id);
                                    setShowTemplates(false);
                                }}
                            >
                                {template.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex bg-zinc-100 dark:bg-black/40 rounded-xl p-1">
                <button
                    onClick={() => setState(s => ({ ...s, isPaused: false }))}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${!state.isPaused ? 'bg-white dark:bg-white/15 text-black dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <Play size={16} /> Çalıştır
                </button>
                <button
                    onClick={() => setState(s => ({ ...s, isPaused: true }))}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${state.isPaused ? 'bg-white dark:bg-white/15 text-black dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <Pause size={16} /> Durdur
                </button>
            </div>

            <div className="flex bg-zinc-100 dark:bg-black/40 rounded-xl p-1">
                <button
                    onClick={() => setState(s => ({ ...s, viewMode: 'standard', particlesReady: true }))}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${state.viewMode === 'standard' && state.particlesReady ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <Atom size={16} /> Akımı göster
                </button>
                <button
                    onClick={() => setState(s => ({ ...s, viewMode: 'voltage', particlesReady: false }))}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${state.viewMode === 'voltage' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <Gauge size={16} /> Gerilim
                </button>
            </div>

            <div className="flex items-center border-l border-black/10 dark:border-white/10 pl-4 ml-1">
                <button
                    onClick={toggleTheme}
                    className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1"
                    title="Görünümü değiştir"
                >
                    {state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <div className="px-3 flex items-center text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-help group relative">
                <Info size={16} />
                <div className="absolute right-0 top-full mt-4 w-72 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                    <p className="mb-2"><strong className="text-black dark:text-white">Kablo çiz:</strong> Kablo aracını seç, bir noktadan diğerine sürükle.</p>
                    <p className="mb-2"><strong className="text-black dark:text-white">Deney yap:</strong> Anahtara dokun; parçaları seçip döndür veya değerlerini değiştir.</p>
                    <p><strong className="text-black dark:text-white">Keşfet:</strong> Hazır devreleri aç ve elektriğin nasıl davrandığını gözlemle.</p>
                </div>
            </div>
        </div>
    );
};
