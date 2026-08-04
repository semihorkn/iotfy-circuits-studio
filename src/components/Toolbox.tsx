import React from 'react';
import { useAppStore } from '../store';
import { Minus, MousePointer2 } from 'lucide-react';

export const Toolbox: React.FC = () => {
    const { state, setState } = useAppStore();

    const tools: { mode: 'wire' | 'select', icon: React.FC<any>, label: string }[] = [
        { mode: 'select', icon: MousePointer2, label: 'Seç ve taşı' },
        { mode: 'wire', icon: Minus, label: 'Kablo' },
    ];

    return (
        <div className="kid-toolbox">
            <div className="toolbox-title">Araçlar</div>
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
