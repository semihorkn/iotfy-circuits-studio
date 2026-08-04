import React, { useState, useRef, MouseEvent } from 'react';
import { useAppStore } from '../store';
import { CircuitSymbols } from './circuit/Symbols';
import { Position } from '../types';
import { Maximize2, Minus, Plus, RotateCw, Trash2 } from 'lucide-react';

export const CircuitCanvas: React.FC = () => {
    const { state, addWire, updateComponent, removeEntity, addComponent } = useAppStore();
    const en = state.language === 'en';
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1.2);
    const [isPanning, setIsPanning] = useState(false);
    
    // Wire drawing state
    const [drawingWire, setDrawingWire] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
    const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

    const svgRef = useRef<SVGSVGElement>(null);

    const getGridSnap = (e: MouseEvent): Position => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const rect = svgRef.current.getBoundingClientRect();
        const rawX = (e.clientX - rect.left - pan.x) / zoom;
        const rawY = (e.clientY - rect.top - pan.y) / zoom;
        return {
            x: Math.round(rawX / 20) * 20,
            y: Math.round(rawY / 20) * 20
        };
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            setZoom(z => Math.min(Math.max(0.5, z - e.deltaY * 0.005), 3));
        } else {
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const changeZoom = (delta: number) => setZoom(current => Math.min(2.5, Math.max(0.6, Number((current + delta).toFixed(2)))));
    const resetView = () => { setZoom(1.2); setPan({ x: 0, y: 0 }); };

    const handleMouseDown = (e: MouseEvent) => {
        if (state.toolMode === 'select') {
            setSelectedCompId(null);
        }

        if (e.button === 1 || e.shiftKey || state.toolMode === 'select') {
            // Middle click or shift: Pan, or Select tool clicks empty space to clear logic, but lets assume left click empty space is pan too if not draw mode
            if (state.toolMode === 'select') {
               setIsPanning(true);
            }
            return;
        }

        if (state.toolMode === 'wire') {
            const p = getGridSnap(e);
            setDrawingWire({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
        } else {
            const p = getGridSnap(e);
            
            // Auto rotate based on hovering wire exactly like drag
            let initialRot = 0;
            for (const w of state.wires) {
                const onVertical = w.x1 === w.x2 && p.x === w.x1 && p.y >= Math.min(w.y1, w.y2) && p.y <= Math.max(w.y1, w.y2);
                const onHorizontal = w.y1 === w.y2 && p.y === w.y1 && p.x >= Math.min(w.x1, w.x2) && p.x <= Math.max(w.x1, w.x2);
                
                if (onVertical) {
                    initialRot = 90;
                    break;
                } else if (onHorizontal) {
                    initialRot = 0;
                    break;
                }
            }
            
            addComponent(state.toolMode, p, initialRot);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isPanning) {
            setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
        }

        if (drawingWire) {
            const p = getGridSnap(e);
            let { x: x2, y: y2 } = p;
            
            // Enforce orthogonal drawing unless Shift is pressed
            if (!e.shiftKey) {
                const dx = Math.abs(x2 - drawingWire.x1);
                const dy = Math.abs(y2 - drawingWire.y1);
                if (dx > dy) {
                    y2 = drawingWire.y1;
                } else {
                    x2 = drawingWire.x1;
                }
            }

            setDrawingWire(prev => prev ? { ...prev, x2, y2 } : null);
        }
        
        // Component dragging
        if (selectedCompId && state.toolMode === 'select' && e.buttons === 1) {
             const p = getGridSnap(e);
             
             // Auto-rotate if we are hovering over a vertical or horizontal wire
             let newRot = undefined;
             const comp = state.components.find(c => c.id === selectedCompId);
             
             if (comp) {
                 for (const w of state.wires) {
                     // Check if point p is approximately on the wire w
                     const onVertical = w.x1 === w.x2 && p.x === w.x1 && p.y >= Math.min(w.y1, w.y2) && p.y <= Math.max(w.y1, w.y2);
                     const onHorizontal = w.y1 === w.y2 && p.y === w.y1 && p.x >= Math.min(w.x1, w.x2) && p.x <= Math.max(w.x1, w.x2);
                     
                     if (onVertical) {
                         newRot = 90;
                         break;
                     } else if (onHorizontal) {
                         newRot = 0;
                         break;
                     }
                 }
                 
                 if (newRot !== undefined && newRot !== comp.rotation) {
                     updateComponent(selectedCompId, { x: p.x, y: p.y, rotation: newRot });
                 } else {
                     updateComponent(selectedCompId, { x: p.x, y: p.y });
                 }
             }
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);

        if (drawingWire) {
            // Add wire if valid length
            if (drawingWire.x1 !== drawingWire.x2 || drawingWire.y1 !== drawingWire.y2) {
                addWire({
                    id: crypto.randomUUID(),
                    x1: drawingWire.x1,
                    y1: drawingWire.y1,
                    x2: drawingWire.x2,
                    y2: drawingWire.y2
                });
            }
            setDrawingWire(null);
        }
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
             // Handle 'R' to rotate dragging object
             if (e.key === 'r' || e.key === 'R') {
                 if (selectedCompId) {
                     const comp = state.components.find(c => c.id === selectedCompId);
                     if (comp) {
                         updateComponent(selectedCompId, { rotation: (comp.rotation + 90) % 360 });
                     }
                 }
             }
             if (e.key === 'Backspace' || e.key === 'Delete') {
                 if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                     return; 
                 }
                 if (selectedCompId) {
                     removeEntity(selectedCompId);
                     setSelectedCompId(null);
                 }
             }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCompId, state.components, updateComponent, removeEntity]);

    const bgSize = 20 * zoom;
    const bgOffset = { x: pan.x % bgSize, y: pan.y % bgSize };

    const selectedComp = selectedCompId ? state.components.find(c => c.id === selectedCompId) : null;

    return (
        <>
        <div className="circuit-workspace" onWheel={handleWheel}>
            {/* Grid background matching absolute zoom/pan */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle, #71717A 1px, transparent 1px)`,
                    backgroundSize: `${bgSize}px ${bgSize}px`,
                    backgroundPosition: `${bgOffset.x}px ${bgOffset.y}px`
                }}
            />

            <svg 
                ref={svgRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <defs>
                    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6"/>
                    </filter>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                    <linearGradient id="metal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e4e4e7" />
                        <stop offset="50%" stopColor="#a1a1aa" />
                        <stop offset="100%" stopColor="#71717a" />
                    </linearGradient>
                    <linearGradient id="battery-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#991b1b" />
                    </linearGradient>
                    <linearGradient id="battery-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#27272a" />
                        <stop offset="100%" stopColor="#18181b" />
                    </linearGradient>
                    <linearGradient id="cap-body" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#064e3b" />
                        <stop offset="100%" stopColor="#022c22" />
                    </linearGradient>
                    <radialGradient id="glass-glare" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                        <stop offset="40%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    
                    {/* Render existing wires */}
                    {state.wires.map(w => (
                        <g key={w.id}>
                            {/* Base Wire - physics engine updates ID directly! */}
                            <line 
                                id={`wire-${w.id}`}
                                x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} 
                                stroke="#52525B" strokeWidth="3" strokeLinecap="round" 
                                className="transition-colors duration-150"
                            />
                            {/* Inner metallic highlight for 3D feel */}
                            <line 
                                x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} 
                                stroke="#A1A1AA" strokeWidth="1" strokeLinecap="round" 
                                className="transition-colors duration-150" pointerEvents="none"
                            />
                            {/* Particle Overlay Layer */}
                            <line 
                                id={`wire-particle-${w.id}`}
                                x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} 
                                stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" 
                                style={{ strokeDasharray: '4 8', display: 'none' }}
                            />
                        </g>
                    ))}

                    {/* Render active drawing wire */}
                    {drawingWire && (
                        <line 
                            x1={drawingWire.x1} y1={drawingWire.y1} 
                            x2={drawingWire.x2} y2={drawingWire.y2} 
                            stroke="#A1A1AA" strokeWidth="2" strokeDasharray="4 4" 
                        />
                    )}

                    {/* Render Components */}
                    {state.components.map(comp => {
                        const Symbol = CircuitSymbols[comp.type] as any;
                        if (!Symbol) return null;
                        const isSelected = comp.id === selectedCompId;
                        return (
                            <g key={comp.id}>
                                {isSelected && (
                                    <rect 
                                        x={comp.x - 32} y={comp.y - 28} 
                                        width={64} height={56} 
                                        fill="none" stroke="#3B82F6" strokeWidth={1/zoom} 
                                        rx={4} pointerEvents="none"
                                        strokeDasharray="4 2"
                                    />
                                )}
                                <Symbol 
                                    comp={comp} 
                                    onMouseDown={(e: MouseEvent) => {
                                        if (state.toolMode === 'select') {
                                            e.stopPropagation();
                                            setSelectedCompId(comp.id);
                                        }
                                    }}
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>

        <div className="canvas-zoom-controls" aria-label={en ? 'Circuit size' : 'Devre boyutu'}>
            <button onClick={() => changeZoom(-0.15)} aria-label={en ? 'Zoom out' : 'Devreyi küçült'} title={en ? 'Zoom out' : 'Küçült'}><Minus size={16} /></button>
            <span aria-live="polite">%{Math.round(zoom * 100)}</span>
            <button onClick={() => changeZoom(0.15)} aria-label={en ? 'Zoom in' : 'Devreyi büyüt'} title={en ? 'Zoom in' : 'Büyüt'}><Plus size={16} /></button>
            <i />
            <button onClick={resetView} aria-label={en ? 'Reset view' : 'Görünümü sıfırla'} title={en ? 'Reset view' : 'Görünümü sıfırla'}><Maximize2 size={15} /></button>
        </div>
        
        {selectedComp && (
            <div 
                className="absolute bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-[#333] rounded-lg p-1.5 shadow-xl z-30 flex items-center gap-1.5 transition-opacity duration-200"
                style={{
                    left: `${pan.x + selectedComp.x * zoom}px`,
                    top: `${pan.y + (selectedComp.y + 45) * zoom}px`,
                    transform: 'translate(-50%, 0)'
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => updateComponent(selectedComp.id, { rotation: (selectedComp.rotation + 90) % 360 })} 
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-[#2A2A2A] rounded-md text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors" 
                    title={en ? 'Rotate 90° (R)' : '90° döndür (R)'}
                >
                    <RotateCw size={14} />
                </button>
                <button 
                    onClick={() => { removeEntity(selectedComp.id); setSelectedCompId(null); }} 
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-[#2A2A2A] rounded-md text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors" 
                    title={en ? 'Delete component (Delete)' : 'Parçayı sil (Delete)'}
                >
                    <Trash2 size={14} />
                </button>
                
                {selectedComp.type !== 'switch' && (
                    <>
                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-[#333] mx-1"></div>
                        <div className="flex items-center gap-1.5">
                            <input 
                                type="number"
                                className="w-14 bg-transparent border border-zinc-300 dark:border-[#333] hover:border-zinc-400 dark:hover:border-[#555] focus:border-blue-500 rounded px-1.5 py-1 text-black dark:text-white outline-none transition-colors text-xs font-medium"
                                value={selectedComp.value}
                                onChange={(e) => updateComponent(selectedComp.id, { value: parseFloat(e.target.value) || 0 })}
                                step={selectedComp.type === 'capacitor' ? 0.01 : 1}
                            />
                            <span className="text-zinc-500 text-xs font-mono pr-1">
                                {selectedComp.type === 'battery' ? 'V' : selectedComp.type === 'capacitor' ? 'F' : 'Ω'}
                            </span>
                        </div>
                    </>
                )}
                
                <div className="w-[1px] h-4 bg-zinc-200 dark:bg-[#333] mx-1"></div>
                
                <div className="flex items-center gap-2.5 px-2 text-[10px] font-mono tracking-wide">
                    <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">I</span>
                        <span className="text-blue-400 font-medium" id={`info-current-${selectedComp.id}`}>0mA</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">V</span>
                        <span className="text-purple-400 font-medium" id={`info-voltage-${selectedComp.id}`}>0V</span>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};
