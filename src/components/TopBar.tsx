import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Play, Pause, Info, LayoutGrid, Trash2, Moon, Sun, Atom, Gauge, X, Zap } from 'lucide-react';
import { TEMPLATES } from '../templates';
import { createPortal } from 'react-dom';

export const TopBar: React.FC = () => {
    const { state, setState, clearBoard, loadTemplate } = useAppStore();
    const [showTemplates, setShowTemplates] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (target.closest?.('.examples-gallery')) return;
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

    const exampleInfo: Record<string, { description: string; level: string }> = {
        simple: { description: 'Anahtarla bir ampulü kontrol et.', level: 'Başlangıç' },
        series: { description: 'İki ampulün enerjiyi nasıl paylaştığını gör.', level: 'Başlangıç' },
        parallel: { description: 'Paralel kollardaki akımı keşfet.', level: 'Orta' },
        rc: { description: 'Kondansatörün dolmasını gözlemle.', level: 'Orta' },
        led: { description: 'LED’i dirençle güvenle çalıştır.', level: 'Başlangıç' },
        motor: { description: 'Elektrik enerjisini harekete dönüştür.', level: 'Orta' },
        buzzer: { description: 'Anahtarlı sesli uyarı sistemi kur.', level: 'Başlangıç' },
        resistorBulb: { description: 'Direncin ampul akımını nasıl sınırladığını gör.', level: 'Başlangıç' },
        finalLab: { description: 'Öğrendiğin bütün parçaları tek devrede çalıştır.', level: 'İleri' },
    };

    return (
        <div className="studio-topbar">
            <div className="nav-brand-group">
                <div className="studio-logo" aria-label="IOTfy Circuits Studio">
                    <span className="brand-mark"><Zap size={15} fill="currentColor" /></span>
                    <span className="brand-iotfy">IOTfy</span><span className="brand-circuits">Circuits</span><span className="brand-studio">Studio</span>
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
                    className={`nav-action ${showTemplates ? 'active' : ''}`}
                    onClick={() => setShowTemplates(!showTemplates)}
                >
                    <LayoutGrid size={17} /> Örnekler <span className="nav-count">{Object.keys(TEMPLATES).length}</span>
                </button>

                {showTemplates && createPortal((
                    <div className="examples-gallery">
                        <div className="examples-heading"><div><span>ÖĞREN &amp; KEŞFET</span><h2>Örnek Devreler</h2><p>Hazır bir devre seç, çalıştır ve parçaların davranışını incele.</p></div><button onClick={() => setShowTemplates(false)} aria-label="Örnekleri kapat"><X size={18} /></button></div>
                        <div className="examples-grid">
                            {Object.entries(TEMPLATES).map(([id, template]) => (
                                <button key={id} className="example-card" onClick={() => { loadTemplate(id); setShowTemplates(false); }}>
                                    <div className={`example-preview preview-${id}`}><span className="preview-battery">9V</span><i></i><b></b></div>
                                    <div className="example-copy"><span>{exampleInfo[id]?.level}</span><strong>{template.name}</strong><small>{exampleInfo[id]?.description}</small><em>{template.components.length} parça · Aç</em></div>
                                </button>
                            ))}
                        </div>
                    </div>
                ), document.body)}
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
