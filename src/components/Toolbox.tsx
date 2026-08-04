import React from 'react';
import { useAppStore } from '../store';
import { Battery, Lightbulb, ToggleLeft, Minus, MousePointer2, Activity, CircleDot, Fan, Volume2, Gauge, CircleGauge, SlidersHorizontal, Triangle, ShieldCheck } from 'lucide-react';
import { ComponentType } from '../types';

export const Toolbox: React.FC = () => {
    const { state, setState } = useAppStore();

    const tools: { mode: ComponentType | 'wire' | 'select', icon: React.FC<any>, label: string }[] = [
        { mode: 'select', icon: MousePointer2, label: 'Seç ve taşı' },
        { mode: 'wire', icon: Minus, label: 'Kablo' },
        { mode: 'battery', icon: Battery, label: 'Pil' },
        { mode: 'bulb', icon: Lightbulb, label: 'Ampul' },
        { mode: 'led', icon: CircleDot, label: 'LED' },
        { mode: 'resistor', icon: Activity, label: 'Direnç' },
        { mode: 'capacitor', icon: Minus, label: 'Kondansatör' },
        { mode: 'switch', icon: ToggleLeft, label: 'Anahtar' },
        { mode: 'motor', icon: Fan, label: 'Motor' },
        { mode: 'buzzer', icon: Volume2, label: 'Buzzer' },
        { mode: 'ammeter', icon: Gauge, label: 'Ampermetre' },
        { mode: 'voltmeter', icon: CircleGauge, label: 'Voltmetre' },
        { mode: 'potentiometer', icon: SlidersHorizontal, label: 'Potansiyometre' },
        { mode: 'diode', icon: Triangle, label: 'Diyot' },
        { mode: 'fuse', icon: ShieldCheck, label: 'Sigorta' },
    ];

    return (
        <div className="kid-toolbox">
            <div className="toolbox-title">Parçalar</div>
            {tools.map(t => {
                const isActive = state.toolMode === t.mode;
                return (
                    <button
                        key={t.mode}
                        onClick={() => setState(s => ({ ...s, toolMode: t.mode }))}
                        className={`tool-button ${isActive ? 'active' : ''}`}
                        title={t.label}
                    >
                        <t.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{t.label}</span>
                        
                        {/* Tooltip */}
                        <div className="tool-tooltip">
                            {t.label} 
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
