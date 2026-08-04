import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { CircuitComponent, WireSegment, AppState, ViewMode, Position } from './types';
import { SimulationEngine } from './engine/simulation';
import { TEMPLATES } from './templates';

interface AppContextType {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    engine: SimulationEngine;
    addComponent: (type: CircuitComponent['type'], pos: Position, rotation?: number) => void;
    addWire: (w: WireSegment) => void;
    updateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
    removeEntity: (id: string) => void;
    clearBoard: () => void;
    loadTemplate: (templateId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>({
        components: [
            { id: 'b1', type: 'battery', x: 200, y: 300, rotation: 90, value: 9 },
            { id: 'l1', type: 'bulb', x: 400, y: 300, rotation: 90, value: 10 }
        ],
        wires: [
            { id: 'w1', x1: 200, y1: 280, x2: 200, y2: 200 },
            { id: 'w2', x1: 200, y1: 200, x2: 400, y2: 200 },
            { id: 'w3', x1: 400, y1: 200, x2: 400, y2: 280 },
            { id: 'w4', x1: 400, y1: 320, x2: 400, y2: 400 },
            { id: 'w5', x1: 400, y1: 400, x2: 200, y2: 400 },
            { id: 'w6', x1: 200, y1: 400, x2: 200, y2: 320 }
        ],
        viewMode: 'standard',
        particlesReady: true,
        isPaused: false,
        toolMode: 'select',
        theme: 'light'
    });

    const engine = useRef(new SimulationEngine()).current;

    const addComponent = useCallback((type: CircuitComponent['type'], pos: Position, rotation: number = 0) => {
        const id = crypto.randomUUID();
        const value = type === 'battery' ? 9 : type === 'capacitor' ? 0.2 : type === 'resistor' ? 50 : 10;
        setState(s => ({
            ...s,
            components: [...s.components, { id, type, x: pos.x, y: pos.y, rotation, value }],
            toolMode: 'select'
        }));
    }, []);

    const addWire = useCallback((w: WireSegment) => {
        setState(s => ({ ...s, wires: [...s.wires, w] }));
    }, []);

    const updateComponent = useCallback((id: string, updates: Partial<CircuitComponent>) => {
        setState(s => ({
            ...s,
            components: s.components.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    }, []);

    const removeEntity = useCallback((id: string) => {
        setState(s => ({
            ...s,
            components: s.components.filter(c => c.id !== id),
            wires: s.wires.filter(w => w.id !== id)
        }));
    }, []);

    const clearBoard = useCallback(() => {
        setState(s => ({ ...s, components: [], wires: [], selectedCompId: null }));
        engine.capacitorVoltages.clear();
    }, [engine]);

    const loadTemplate = useCallback((templateId: string) => {
        const template = TEMPLATES[templateId];
        if (template) {
            const mappedComponents = template.components.map(c => ({
                ...c,
                id: crypto.randomUUID()
            })) as CircuitComponent[];
            
            const mappedWires = template.wires.map(w => ({
                ...w,
                id: crypto.randomUUID()
            })) as WireSegment[];
            
            setState(s => ({ ...s, components: mappedComponents, wires: mappedWires, selectedCompId: null }));
            engine.capacitorVoltages.clear();
        }
    }, [engine]);

    return (
        <AppContext.Provider value={{ state, setState, engine, addComponent, addWire, updateComponent, removeEntity, clearBoard, loadTemplate }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppStore = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("Missing AppProvider");
    return ctx;
};
