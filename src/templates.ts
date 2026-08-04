import { CircuitComponent, WireSegment } from './types';

export interface CircuitTemplate {
    name: string;
    components: Omit<CircuitComponent, 'id'>[];
    wires: Omit<WireSegment, 'id'>[];
}

export const TEMPLATES: Record<string, CircuitTemplate> = {
    simple: {
        name: "Pil, Anahtar ve Ampul",
        components: [
            { type: 'battery', x: 200, y: 300, rotation: 90, value: 9 },
            { type: 'switch', x: 300, y: 200, rotation: 0, value: 0 },
            { type: 'bulb', x: 400, y: 300, rotation: 90, value: 10 }
        ],
        wires: [
            { x1: 200, y1: 280, x2: 200, y2: 200 },
            { x1: 200, y1: 200, x2: 280, y2: 200 },
            { x1: 320, y1: 200, x2: 400, y2: 200 },
            { x1: 400, y1: 200, x2: 400, y2: 280 },
            { x1: 400, y1: 320, x2: 400, y2: 400 },
            { x1: 400, y1: 400, x2: 200, y2: 400 },
            { x1: 200, y1: 400, x2: 200, y2: 320 }
        ]
    },
    series: {
        name: "Seri Bağlı Ampuller",
        components: [
            { type: 'battery', x: 200, y: 300, rotation: 90, value: 9 },
            { type: 'bulb', x: 400, y: 200, rotation: 180, value: 10 },
            { type: 'bulb', x: 400, y: 400, rotation: 180, value: 10 }
        ],
        wires: [
            { x1: 200, y1: 280, x2: 200, y2: 200 },
            { x1: 200, y1: 200, x2: 380, y2: 200 },
            { x1: 420, y1: 200, x2: 460, y2: 200 },
            { x1: 460, y1: 200, x2: 460, y2: 400 },
            { x1: 460, y1: 400, x2: 420, y2: 400 },
            { x1: 380, y1: 400, x2: 200, y2: 400 },
            { x1: 200, y1: 400, x2: 200, y2: 320 }
        ]
    },
    parallel: {
        name: "Paralel Bağlı Ampuller",
        components: [
            { type: 'battery', x: 200, y: 300, rotation: 90, value: 9 },
            { type: 'switch', x: 200, y: 200, rotation: 90, value: 0 },
            { type: 'bulb', x: 340, y: 300, rotation: 90, value: 10 },
            { type: 'bulb', x: 460, y: 300, rotation: 90, value: 10 }
        ],
        wires: [
            { x1: 200, y1: 280, x2: 200, y2: 220 }, // Battery to switch
            { x1: 200, y1: 180, x2: 200, y2: 120 }, // Switch to top-left corner
            { x1: 200, y1: 120, x2: 340, y2: 120 }, // Top-left to junction 1
            { x1: 340, y1: 120, x2: 460, y2: 120 }, // Junction 1 to top-right corner
            { x1: 340, y1: 120, x2: 340, y2: 280 }, // Junction 1 down to bulb 1
            { x1: 460, y1: 120, x2: 460, y2: 280 }, // Top-right to bulb 2
            
            { x1: 340, y1: 320, x2: 340, y2: 400 }, // Bulb 1 down to junction 2
            { x1: 460, y1: 320, x2: 460, y2: 400 }, // Bulb 2 down to bottom-right corner
            { x1: 460, y1: 400, x2: 340, y2: 400 }, // Bottom-right corner to junction 2
            { x1: 340, y1: 400, x2: 200, y2: 400 }, // Junction 2 to bottom-left corner
            { x1: 200, y1: 400, x2: 200, y2: 320 }  // Bottom-left corner to battery
        ]
    },
    rc: {
        name: "Direnç ve Kondansatör",
        components: [
            { type: 'battery', x: 200, y: 300, rotation: 90, value: 9 },
            { type: 'switch', x: 300, y: 200, rotation: 0, value: 0 },
            { type: 'resistor', x: 400, y: 300, rotation: 90, value: 50 },
            { type: 'capacitor', x: 300, y: 400, rotation: 0, value: 0.1 }
        ],
        wires: [
            { x1: 200, y1: 280, x2: 200, y2: 200 },
            { x1: 200, y1: 200, x2: 280, y2: 200 },
            { x1: 320, y1: 200, x2: 400, y2: 200 },
            { x1: 400, y1: 200, x2: 400, y2: 280 },
            { x1: 400, y1: 320, x2: 400, y2: 400 },
            { x1: 400, y1: 400, x2: 320, y2: 400 },
            { x1: 280, y1: 400, x2: 200, y2: 400 },
            { x1: 200, y1: 400, x2: 200, y2: 320 }
        ]
    }
};
