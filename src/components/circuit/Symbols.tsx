import React from 'react';
import { CircuitComponent } from '../../types';
import { useAppStore } from '../../store';

interface SymbolProps {
    comp: CircuitComponent;
    onMouseDown?: (e: React.MouseEvent) => void;
}

export const BatterySymbol: React.FC<SymbolProps> = ({ comp, onMouseDown }) => {
    return (
        <g data-component-type="battery" aria-label="Pil" transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`} onMouseDown={onMouseDown} className="cursor-pointer hover:opacity-90 transition-opacity" id={`comp-${comp.id}`}>
            <rect x="-25" y="-20" width="50" height="40" fill="transparent" />
            
            <g filter="url(#shadow)">
                <rect x="-16" y="-10" width="32" height="20" rx="3" fill="url(#battery-grad)" />
                <rect x="-16" y="-10" width="8" height="20" rx="3" fill="url(#battery-dark)" />
                <rect x="16" y="-4" width="3" height="8" rx="1" fill="url(#metal-grad)" />
            </g>
            
            <line x1="-20" y1="0" x2="-16" y2="0" stroke="#71717A" strokeWidth="2" />
            <line x1="19" y1="0" x2="20" y2="0" stroke="#71717A" strokeWidth="2" />
            
            <text x="0" y="3" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="monospace">9V</text>
        </g>
    );
};

export const ResistorSymbol: React.FC<SymbolProps> = ({ comp, onMouseDown }) => {
    return (
        <g data-component-type="resistor" aria-label="Direnç" transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`} onMouseDown={onMouseDown} className="cursor-pointer hover:opacity-90 transition-opacity" id={`comp-${comp.id}`}>
            <rect x="-25" y="-15" width="50" height="30" fill="transparent" />
            
            <g filter="url(#shadow)">
                <rect x="-12" y="-5" width="24" height="10" rx="4" fill="#E2D4C0" />
                <rect x="-8" y="-5" width="2" height="10" fill="#EF4444" />
                <rect x="-4" y="-5" width="2" height="10" fill="#8B5CF6" />
                <rect x="0" y="-5" width="2" height="10" fill="#000000" />
                <rect x="6" y="-5" width="2" height="10" fill="#D97706" />
            </g>
            
            <line x1="-20" y1="0" x2="-12" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
            <line x1="12" y1="0" x2="20" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
        </g>
    );
};

export const BulbSymbol: React.FC<SymbolProps> = ({ comp, onMouseDown }) => {
    return (
        <g data-component-type="bulb" aria-label="Ampul" transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`} onMouseDown={onMouseDown} className="cursor-pointer hover:opacity-90 transition-opacity" id={`comp-${comp.id}`}>
            <rect x="-25" y="-20" width="50" height="40" fill="transparent" />
            
            <circle id={`bulb-glow-${comp.id}`} cx="4" cy="0" r="18" fill="#FDE047" opacity="0" filter="blur(8px)" className="transition-opacity duration-75" />
            
            <g filter="url(#shadow)">
                <rect x="-10" y="-5" width="6" height="10" rx="1" fill="url(#metal-grad)" />
                <path d="M-8,5 L-4,5" stroke="#3F3F46" strokeWidth="1" />
                <path d="M-8,-5 L-4,-5" stroke="#3F3F46" strokeWidth="1" />
                <path d="M-8,0 L-4,0" stroke="#3F3F46" strokeWidth="1" />
            </g>
            
            <circle cx="5" cy="0" r="11" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" filter="url(#shadow)" />
            <circle cx="5" cy="0" r="11" fill="url(#glass-glare)" />
            
            <path d="M-4,0 L0,-3 L2,-4 L2,4 L0,3 L-4,0" stroke="#a1a1aa" strokeWidth="1" fill="none" />
            <circle cx="2" cy="-4" r="0.5" fill="#FDE047" />
            <circle cx="2" cy="4" r="0.5" fill="#FDE047" />
            
            <line x1="-20" y1="0" x2="-10" y2="0" stroke="#71717A" strokeWidth="2" />
            <line x1="16" y1="0" x2="20" y2="0" stroke="#71717A" strokeWidth="2" />
        </g>
    );
};

export const CapacitorSymbol: React.FC<SymbolProps> = ({ comp, onMouseDown }) => {
    return (
        <g data-component-type="capacitor" aria-label="Kondansatör" transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`} onMouseDown={onMouseDown} className="cursor-pointer hover:opacity-90 transition-opacity" id={`comp-${comp.id}`}>
            <rect x="-25" y="-20" width="50" height="40" fill="transparent" />
            
            <g filter="url(#shadow)">
                <rect x="-10" y="-12" width="20" height="24" rx="2" fill="url(#cap-body)" />
                <rect x="5" y="-12" width="5" height="24" fill="#64748B" />
                <text x="7.5" y="2" fontSize="10" fill="#0F172A" textAnchor="middle" fontWeight="bold">-</text>
            </g>
            
            <rect id={`cap-fill-${comp.id}`} x="-8" y="-10" width="10" height="20" rx="1" fill="#10B981" opacity="0" className="transition-opacity duration-150" />

            <line x1="-20" y1="0" x2="-10" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
            <line x1="10" y1="0" x2="20" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
        </g>
    );
};

export const SwitchSymbol: React.FC<SymbolProps> = ({ comp, onMouseDown }) => {
    const { updateComponent } = useAppStore();
    const isClosed = comp.state?.closed;
    
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateComponent(comp.id, { state: { closed: !isClosed } });
    };

    return (
        <g data-component-type="switch" role="button" tabIndex={0} aria-label={isClosed ? 'Anahtarı aç' : 'Anahtarı kapat'} transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`} onMouseDown={onMouseDown} onClick={handleToggle} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') handleToggle(event as unknown as React.MouseEvent); }} className="cursor-pointer hover:opacity-90 transition-opacity" id={`comp-${comp.id}`}>
            <rect x="-25" y="-20" width="50" height="40" fill="transparent" />
            
            <g filter="url(#shadow)">
                <rect x="-14" y="-8" width="28" height="16" rx="2" fill="#18181B" stroke="#3F3F46" strokeWidth="1" />
                <circle cx="-8" cy="0" r="3" fill={isClosed ? "#22C55E" : "#EF4444"} className="transition-colors duration-200" />
                
                {/* 3D Switch Toggle */}
                <rect x={isClosed ? "2" : "-2"} y="-6" width="12" height="12" rx="2" fill="url(#metal-grad)" className="transition-all duration-200" />
                <line x1={isClosed ? "6" : "2"} y1="-4" x2={isClosed ? "6" : "2"} y2="4" stroke="#71717A" strokeWidth="1" className="transition-all duration-200" />
                <line x1={isClosed ? "10" : "6"} y1="-4" x2={isClosed ? "10" : "6"} y2="4" stroke="#71717A" strokeWidth="1" className="transition-all duration-200" />
            </g>

            <line x1="-20" y1="0" x2="-14" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
            <line x1="14" y1="0" x2="20" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
        </g>
    );
};

export const LedSymbol: React.FC<SymbolProps> = ({ comp, onMouseDown }) => (
    <g data-component-type="led" aria-label="LED" transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`} onMouseDown={onMouseDown} className="cursor-pointer hover:opacity-90 transition-opacity" id={`comp-${comp.id}`}>
        <rect x="-25" y="-20" width="50" height="40" fill="transparent" />
        <circle id={`led-glow-${comp.id}`} cx="2" cy="0" r="16" fill="#ef4444" opacity="0" filter="blur(7px)" />
        <line x1="-20" y1="0" x2="-7" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
        <line x1="10" y1="0" x2="20" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
        <path d="M-7,0 A9,9 0 0 1 11,0 L11,5 L-7,5 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" filter="url(#shadow)" />
        <path d="M-4,-1 A6,6 0 0 1 7,-2" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" />
    </g>
);

export const MotorSymbol: React.FC<SymbolProps> = ({ comp, onMouseDown }) => (
    <g data-component-type="motor" aria-label="DC Motor" transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`} onMouseDown={onMouseDown} className="cursor-pointer hover:opacity-90 transition-opacity" id={`comp-${comp.id}`}>
        <rect x="-25" y="-22" width="50" height="44" fill="transparent" />
        <line x1="-20" y1="0" x2="-14" y2="0" stroke="url(#metal-grad)" strokeWidth="2" /><line x1="14" y1="0" x2="20" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
        <circle cx="0" cy="0" r="14" fill="#d9e5ea" stroke="#64748b" strokeWidth="2" filter="url(#shadow)" />
        <g id={`motor-rotor-${comp.id}`} style={{ transformOrigin: '0px 0px' }}>
            <path d="M0,-11 C5,-9 6,-4 2,0 C7,2 7,8 2,11 C-1,6 -2,3 0,0 C-6,-1 -7,-7 -4,-10 C-1,-8 0,-5 0,-1" fill="#0f929b" />
            <circle cx="0" cy="0" r="3" fill="#172a52" />
        </g>
    </g>
);

export const BuzzerSymbol: React.FC<SymbolProps> = ({ comp, onMouseDown }) => (
    <g data-component-type="buzzer" aria-label="Buzzer" transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`} onMouseDown={onMouseDown} className="cursor-pointer hover:opacity-90 transition-opacity" id={`comp-${comp.id}`}>
        <rect x="-25" y="-20" width="50" height="40" fill="transparent" />
        <line x1="-20" y1="0" x2="-12" y2="0" stroke="url(#metal-grad)" strokeWidth="2" /><line x1="12" y1="0" x2="20" y2="0" stroke="url(#metal-grad)" strokeWidth="2" />
        <rect x="-12" y="-10" width="24" height="20" rx="6" fill="#172a52" stroke="#334155" filter="url(#shadow)" />
        <circle cx="0" cy="0" r="4" fill="#07111e" /><text x="-8" y="-3" fontSize="6" fill="#e4ad26">+</text>
        <g id={`buzzer-wave-${comp.id}`} opacity="0" fill="none" stroke="#e4ad26" strokeWidth="1.5"><path d="M15,-7 Q22,0 15,7" /><path d="M18,-11 Q29,0 18,11" /></g>
    </g>
);

export const CircuitSymbols = {
    battery: BatterySymbol,
    bulb: BulbSymbol,
    led: LedSymbol,
    resistor: ResistorSymbol,
    capacitor: CapacitorSymbol,
    switch: SwitchSymbol,
    motor: MotorSymbol,
    buzzer: BuzzerSymbol
};
