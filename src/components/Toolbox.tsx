import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Battery, Lightbulb, ToggleLeft, Minus, MousePointer2, Activity, CircleDot, Fan, Volume2, PackageOpen, X } from 'lucide-react';
import { ComponentType } from '../types';

type ToolIconProps = React.SVGProps<SVGSVGElement> & { size?: number };
const ToolSvg: React.FC<ToolIconProps & { children: React.ReactNode }> = ({ size = 20, children, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
);
const CapacitorIcon: React.FC<ToolIconProps> = props => <ToolSvg {...props}><path d="M3 12h6M15 12h6M9 6v12M15 6v12" /></ToolSvg>;
const AmmeterIcon: React.FC<ToolIconProps> = props => <ToolSvg {...props}><circle cx="12" cy="12" r="9" /><path d="m9 16 3-9 3 9M10 13h4" /></ToolSvg>;
const VoltmeterIcon: React.FC<ToolIconProps> = props => <ToolSvg {...props}><circle cx="12" cy="12" r="9" /><path d="m8.5 7 3.5 10 3.5-10" /></ToolSvg>;
const PotentiometerIcon: React.FC<ToolIconProps> = props => <ToolSvg {...props}><path d="M3 14h3l2-4 3 8 3-8 2 4h5M16 3v7M13 6l3-3 3 3" /></ToolSvg>;
const DiodeIcon: React.FC<ToolIconProps> = props => <ToolSvg {...props}><path d="M3 12h4M17 12h4M7 6v12l10-6-10-6ZM17 6v12" /></ToolSvg>;
const FuseIcon: React.FC<ToolIconProps> = props => <ToolSvg {...props}><path d="M3 12h4M17 12h4M7 8h10v8H7zM9 12h2l1-2 1 4 1-2h1" /></ToolSvg>;

export const Toolbox: React.FC = () => {
    const { state, setState } = useAppStore();
    const en = state.language === 'en';
    const [isOpen, setIsOpen] = useState(true);

    const tools: { mode: ComponentType | 'wire' | 'select', icon: React.FC<any>, label: string }[] = [
        { mode: 'select', icon: MousePointer2, label: en ? 'Select & move' : 'Seç ve taşı' },
        { mode: 'wire', icon: Minus, label: en ? 'Wire' : 'Kablo' },
        { mode: 'battery', icon: Battery, label: en ? 'Battery' : 'Pil' },
        { mode: 'bulb', icon: Lightbulb, label: en ? 'Bulb' : 'Ampul' },
        { mode: 'led', icon: CircleDot, label: 'LED' },
        { mode: 'resistor', icon: Activity, label: en ? 'Resistor' : 'Direnç' },
        { mode: 'capacitor', icon: CapacitorIcon, label: en ? 'Capacitor' : 'Kondansatör' },
        { mode: 'switch', icon: ToggleLeft, label: en ? 'Switch' : 'Anahtar' },
        { mode: 'motor', icon: Fan, label: 'Motor' },
        { mode: 'buzzer', icon: Volume2, label: 'Buzzer' },
        { mode: 'ammeter', icon: AmmeterIcon, label: en ? 'Ammeter' : 'Ampermetre' },
        { mode: 'voltmeter', icon: VoltmeterIcon, label: en ? 'Voltmeter' : 'Voltmetre' },
        { mode: 'potentiometer', icon: PotentiometerIcon, label: en ? 'Potentiometer' : 'Potansiyometre' },
        { mode: 'diode', icon: DiodeIcon, label: en ? 'Diode' : 'Diyot' },
        { mode: 'fuse', icon: FuseIcon, label: en ? 'Fuse' : 'Sigorta' },
    ];

    if (!isOpen) return <button className="components-pill" onClick={() => setIsOpen(true)}><PackageOpen size={18} />{en ? 'Components' : 'Parçalar'}</button>;

    return (
        <div className="kid-toolbox">
            <div className="toolbox-header"><div className="toolbox-title">{en ? 'Components' : 'Parçalar'}</div><button className="toolbox-close" onClick={() => setIsOpen(false)} aria-label={en ? 'Close components' : 'Parçaları kapat'}><X size={15} /></button></div>
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
