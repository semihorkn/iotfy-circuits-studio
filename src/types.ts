export type ComponentType = 'battery' | 'bulb' | 'led' | 'resistor' | 'capacitor' | 'switch' | 'motor' | 'buzzer' | 'ammeter' | 'voltmeter' | 'potentiometer' | 'diode' | 'fuse';
export type ViewMode = 'standard' | 'voltage' | 'power';

export interface Position {
    x: number;
    y: number;
}

export interface CircuitComponent {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    rotation: number; // degrees: 0, 90, 180, 270
    value: number; // voltage, resistance, capacitance
    state?: { closed?: boolean };
}

export interface WireSegment {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface AppState {
    components: CircuitComponent[];
    wires: WireSegment[];
    viewMode: ViewMode;
    particlesReady: boolean;
    isPaused: boolean;
    toolMode: ComponentType | 'wire' | 'select';
    theme: 'dark' | 'light';
    language: 'tr' | 'en';
}
