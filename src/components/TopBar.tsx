import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Play, Pause, Info, LayoutGrid, Trash2, Moon, Sun, Atom, Gauge, X, Zap, Languages, Box, PanelsTopLeft } from 'lucide-react';
import { TEMPLATES } from '../templates';
import { createPortal } from 'react-dom';
import type { CircuitTemplate } from '../templates';

const CircuitPreview: React.FC<{ template: CircuitTemplate }> = ({ template }) => {
    const points = [...template.components.map(c => ({x:c.x,y:c.y})), ...template.wires.flatMap(w => [{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}])];
    const minX = Math.min(...points.map(p => p.x)) - 35, maxX = Math.max(...points.map(p => p.x)) + 35;
    const minY = Math.min(...points.map(p => p.y)) - 35, maxY = Math.max(...points.map(p => p.y)) + 35;
    const meter = (type: string) => type === 'ammeter' ? 'A' : type === 'voltmeter' ? 'V' : type === 'motor' ? 'M' : type === 'buzzer' ? '♪' : type === 'fuse' ? 'F' : type === 'potentiometer' ? 'P' : '';
    return <div className="example-preview"><svg viewBox={`${minX} ${minY} ${maxX-minX} ${maxY-minY}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {template.wires.map((wire,index) => <line key={`w-${index}`} x1={wire.x1} y1={wire.y1} x2={wire.x2} y2={wire.y2} className="scheme-wire" />)}
        {template.components.map((component,index) => <g key={`c-${index}`} transform={`translate(${component.x} ${component.y}) rotate(${component.rotation})`} className={`scheme-component scheme-${component.type}`}>
            <line x1="-20" y1="0" x2="20" y2="0" />
            {component.type === 'battery' && <><rect x="-13" y="-10" width="26" height="20" rx="3" /><text y="4">9V</text></>}
            {(component.type === 'bulb' || component.type === 'led') && <><circle r="12" /><path d="M-6-6 6 6M6-6-6 6" /></>}
            {(component.type === 'resistor' || component.type === 'potentiometer') && <><path d="M-13 0-9-7-4 7 1-7 6 7 12 0" /><text y="-10">{component.type === 'potentiometer' ? '↗' : ''}</text></>}
            {component.type === 'capacitor' && <><path d="M-5-12V12M5-12V12" /></>}
            {component.type === 'switch' && <><circle cx="-10" r="2" /><circle cx="10" r="2" /><path d="M-8 0 7-8" /></>}
            {component.type === 'diode' && <><path d="M-9-9V9L8 0Z" /><path d="M9-10V10" /></>}
            {['motor','buzzer','ammeter','voltmeter'].includes(component.type) && <><circle r="12" /><text y="4">{meter(component.type)}</text></>}
            {component.type === 'fuse' && <><rect x="-12" y="-7" width="24" height="14" rx="5" /><text y="4">F</text></>}
        </g>)}
    </svg></div>;
};

export const TopBar: React.FC = () => {
    const { state, setState, clearBoard, loadTemplate } = useAppStore();
    const en = state.language === 'en';
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

    const changeLanguage = () => setState(current => {
        const language = current.language === 'tr' ? 'en' : 'tr';
        localStorage.setItem('iotfy-language', language);
        document.documentElement.lang = language;
        return { ...current, language };
    });

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
        measurementLab: { description: 'Akımı ve gerilim düşümünü ölçüm cihazlarıyla izle.', level: 'İleri' },
        voltageDivider: { description: 'Potansiyometrelerle ayarlanabilir bir gerilim bölücü kur.', level: 'İleri' },
        protectedMotor: { description: 'Motoru sigorta ve ters gerilim diyoduyla koru.', level: 'İleri' },
    };
    const exampleInfoEn: Record<string, { name: string; description: string; level: string }> = {
        simple: { name: 'Battery, Switch and Bulb', description: 'Control a bulb with a switch.', level: 'Beginner' },
        series: { name: 'Bulbs in Series', description: 'See how two bulbs share energy.', level: 'Beginner' },
        parallel: { name: 'Bulbs in Parallel', description: 'Explore current in parallel branches.', level: 'Intermediate' },
        rc: { name: 'Resistor and Capacitor', description: 'Observe a capacitor charging.', level: 'Intermediate' },
        led: { name: 'LED and Protection Resistor', description: 'Run an LED safely with a resistor.', level: 'Beginner' },
        motor: { name: 'Switched DC Motor', description: 'Turn electrical energy into motion.', level: 'Intermediate' },
        buzzer: { name: 'Audio Alert Circuit', description: 'Build a switched audio alert.', level: 'Beginner' },
        resistorBulb: { name: 'Resistor and Bulb Circuit', description: 'See how resistance limits bulb current.', level: 'Beginner' },
        finalLab: { name: 'Grand Final Circuit', description: 'Run all core components in one circuit.', level: 'Advanced' },
        measurementLab: { name: 'Current and Voltage Lab', description: 'Measure current and voltage drop live.', level: 'Advanced' },
        voltageDivider: { name: 'Adjustable Voltage Divider', description: 'Build an adjustable divider with potentiometers.', level: 'Advanced' },
        protectedMotor: { name: 'Protected Motor Control', description: 'Protect a motor with a fuse and flyback diode.', level: 'Advanced' },
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
                    title={en ? 'Clear board' : 'Tahtayı temizle'}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="relative" ref={dropdownRef}>
                <button 
                    className={`nav-action ${showTemplates ? 'active' : ''}`}
                    onClick={() => setShowTemplates(!showTemplates)}
                >
                    <LayoutGrid size={17} /> {en ? 'Examples' : 'Örnekler'} <span className="nav-count">{Object.keys(TEMPLATES).length}</span>
                </button>

                {showTemplates && createPortal((<><div className="examples-backdrop" onClick={() => setShowTemplates(false)} />
                    <div className="examples-gallery" role="dialog" aria-modal="true" aria-label={en ? 'Example circuits' : 'Örnek devreler'}>
                        <div className="examples-heading"><div><span>{en ? 'LEARN & EXPLORE' : 'ÖĞREN & KEŞFET'}</span><h2>{en ? 'Example Circuits' : 'Örnek Devreler'}</h2><p>{en ? 'Choose a circuit, run it and explore how its components behave.' : 'Hazır bir devre seç, çalıştır ve parçaların davranışını incele.'}</p></div><button onClick={() => setShowTemplates(false)} aria-label={en ? 'Close examples' : 'Örnekleri kapat'}><X size={18} /></button></div>
                        <div className="examples-grid">
                            {Object.entries(TEMPLATES).map(([id, template]) => (
                                <button key={id} className="example-card" onClick={() => { loadTemplate(id); setShowTemplates(false); }}>
                                    <CircuitPreview template={template} />
                                    <div className="example-copy"><span>{en ? exampleInfoEn[id]?.level : exampleInfo[id]?.level}</span><strong>{en ? exampleInfoEn[id]?.name : template.name}</strong><small>{en ? exampleInfoEn[id]?.description : exampleInfo[id]?.description}</small><em>{template.components.length} {en ? 'components · Open' : 'parça · Aç'}</em></div>
                                </button>
                            ))}
                        </div>
                    </div></>), document.body)}
            </div>

            <div className="flex bg-zinc-100 dark:bg-black/40 rounded-xl p-1">
                <button
                    onClick={() => setState(s => ({ ...s, isPaused: false }))}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${!state.isPaused ? 'bg-white dark:bg-white/15 text-black dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <Play size={16} /> {en ? 'Run' : 'Çalıştır'}
                </button>
                <button
                    onClick={() => setState(s => ({ ...s, isPaused: true }))}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${state.isPaused ? 'bg-white dark:bg-white/15 text-black dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <Pause size={16} /> {en ? 'Pause' : 'Durdur'}
                </button>
            </div>

            <div className="flex bg-zinc-100 dark:bg-black/40 rounded-xl p-1">
                <button
                    onClick={() => setState(s => ({ ...s, viewMode: 'standard', particlesReady: true }))}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${state.viewMode === 'standard' && state.particlesReady ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <Atom size={16} /> {en ? 'Show current' : 'Akımı göster'}
                </button>
                <button
                    onClick={() => setState(s => ({ ...s, viewMode: 'voltage', particlesReady: false }))}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${state.viewMode === 'voltage' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <Gauge size={16} /> {en ? 'Voltage' : 'Gerilim'}
                </button>
            </div>

            <button className="language-toggle" onClick={changeLanguage} title={en ? 'Türkçeye geç' : 'Switch to English'} aria-label={en ? 'Türkçeye geç' : 'Switch to English'}><Languages size={16} /><span>{en ? 'TR' : 'EN'}</span></button>

            <div className="dimension-toggle" aria-label={en ? 'Workspace dimension' : 'Çalışma alanı boyutu'}>
                <button className={state.dimension === '2d' ? 'active' : ''} onClick={() => setState(current => ({...current, dimension:'2d'}))}><PanelsTopLeft size={15} />2D</button>
                <button className={state.dimension === '3d' ? 'active' : ''} onClick={() => setState(current => ({...current, dimension:'3d'}))}><Box size={15} />3D</button>
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
                    <p className="mb-2"><strong className="text-black dark:text-white">{en ? 'Draw wires:' : 'Kablo çiz:'}</strong> {en ? 'Select Wire and drag from one point to another.' : 'Kablo aracını seç, bir noktadan diğerine sürükle.'}</p>
                    <p className="mb-2"><strong className="text-black dark:text-white">{en ? 'Experiment:' : 'Deney yap:'}</strong> {en ? 'Toggle switches; select, rotate or edit components.' : 'Anahtara dokun; parçaları seçip döndür veya değerlerini değiştir.'}</p>
                    <p><strong className="text-black dark:text-white">{en ? 'Explore:' : 'Keşfet:'}</strong> {en ? 'Open examples and observe electricity in action.' : 'Hazır devreleri aç ve elektriğin nasıl davrandığını gözlemle.'}</p>
                </div>
            </div>
        </div>
    );
};
