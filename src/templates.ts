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
    },
    led: {
        name: "LED ve Koruma Direnci",
        components: [
            { type: 'battery', x: 220, y: 300, rotation: 90, value: 9 },
            { type: 'led', x: 420, y: 220, rotation: 0, value: 30 },
            { type: 'resistor', x: 420, y: 380, rotation: 180, value: 50 }
        ],
        wires: [
            { x1: 220, y1: 280, x2: 220, y2: 220 }, { x1: 220, y1: 220, x2: 400, y2: 220 },
            { x1: 440, y1: 220, x2: 480, y2: 220 }, { x1: 480, y1: 220, x2: 480, y2: 380 },
            { x1: 480, y1: 380, x2: 440, y2: 380 }, { x1: 400, y1: 380, x2: 220, y2: 380 },
            { x1: 220, y1: 380, x2: 220, y2: 320 }
        ]
    },
    motor: {
        name: "Anahtarlı DC Motor",
        components: [
            { type: 'battery', x: 220, y: 300, rotation: 90, value: 9 },
            { type: 'switch', x: 340, y: 200, rotation: 0, value: 0, state: { closed: true } },
            { type: 'motor', x: 460, y: 300, rotation: 90, value: 18 }
        ],
        wires: [
            { x1: 220, y1: 280, x2: 220, y2: 200 }, { x1: 220, y1: 200, x2: 320, y2: 200 },
            { x1: 360, y1: 200, x2: 460, y2: 200 }, { x1: 460, y1: 200, x2: 460, y2: 280 },
            { x1: 460, y1: 320, x2: 460, y2: 400 }, { x1: 460, y1: 400, x2: 220, y2: 400 },
            { x1: 220, y1: 400, x2: 220, y2: 320 }
        ]
    },
    buzzer: {
        name: "Sesli Uyarı Devresi",
        components: [
            { type: 'battery', x: 220, y: 300, rotation: 90, value: 9 },
            { type: 'switch', x: 340, y: 200, rotation: 0, value: 0, state: { closed: true } },
            { type: 'buzzer', x: 460, y: 300, rotation: 90, value: 40 }
        ],
        wires: [
            { x1: 220, y1: 280, x2: 220, y2: 200 }, { x1: 220, y1: 200, x2: 320, y2: 200 },
            { x1: 360, y1: 200, x2: 460, y2: 200 }, { x1: 460, y1: 200, x2: 460, y2: 280 },
            { x1: 460, y1: 320, x2: 460, y2: 400 }, { x1: 460, y1: 400, x2: 220, y2: 400 },
            { x1: 220, y1: 400, x2: 220, y2: 320 }
        ]
    },
    resistorBulb: {
        name: "Dirençli Ampul Devresi",
        components: [
            { type: 'battery', x: 220, y: 300, rotation: 90, value: 9 },
            { type: 'resistor', x: 340, y: 200, rotation: 0, value: 50 },
            { type: 'bulb', x: 460, y: 300, rotation: 90, value: 10 }
        ],
        wires: [
            { x1: 220, y1: 280, x2: 220, y2: 200 }, { x1: 220, y1: 200, x2: 320, y2: 200 },
            { x1: 360, y1: 200, x2: 460, y2: 200 }, { x1: 460, y1: 200, x2: 460, y2: 280 },
            { x1: 460, y1: 320, x2: 460, y2: 400 }, { x1: 460, y1: 400, x2: 220, y2: 400 },
            { x1: 220, y1: 400, x2: 220, y2: 320 }
        ]
    },
    finalLab: {
        name: "Büyük Final Devresi",
        components: [
            { type: 'battery', x: 180, y: 320, rotation: 90, value: 9 },
            { type: 'switch', x: 260, y: 180, rotation: 0, value: 0, state: { closed: true } },
            { type: 'resistor', x: 360, y: 180, rotation: 0, value: 30 },
            { type: 'led', x: 460, y: 180, rotation: 0, value: 30 },
            { type: 'bulb', x: 560, y: 260, rotation: 90, value: 10 },
            { type: 'motor', x: 560, y: 380, rotation: 90, value: 18 },
            { type: 'buzzer', x: 440, y: 460, rotation: 180, value: 40 },
            { type: 'capacitor', x: 300, y: 460, rotation: 180, value: 0.1 }
        ],
        wires: [
            { x1: 180, y1: 300, x2: 180, y2: 180 }, { x1: 180, y1: 180, x2: 240, y2: 180 },
            { x1: 280, y1: 180, x2: 340, y2: 180 }, { x1: 380, y1: 180, x2: 440, y2: 180 },
            { x1: 480, y1: 180, x2: 560, y2: 180 }, { x1: 560, y1: 180, x2: 560, y2: 240 },
            { x1: 560, y1: 280, x2: 560, y2: 360 }, { x1: 560, y1: 400, x2: 560, y2: 460 },
            { x1: 560, y1: 460, x2: 460, y2: 460 }, { x1: 420, y1: 460, x2: 320, y2: 460 },
            { x1: 280, y1: 460, x2: 180, y2: 460 }, { x1: 180, y1: 460, x2: 180, y2: 340 }
        ]
    },
    measurementLab: {
        name: "Akım ve Gerilim Ölçüm Laboratuvarı",
        components: [
            { type: 'battery', x: 180, y: 300, rotation: 90, value: 9 },
            { type: 'fuse', x: 280, y: 180, rotation: 0, value: 0.001 },
            { type: 'ammeter', x: 400, y: 180, rotation: 0, value: 0.001 },
            { type: 'resistor', x: 520, y: 300, rotation: 90, value: 50 },
            { type: 'voltmeter', x: 640, y: 300, rotation: 90, value: 1000000 }
        ],
        wires: [
            { x1: 180, y1: 280, x2: 180, y2: 180 }, { x1: 180, y1: 180, x2: 260, y2: 180 },
            { x1: 300, y1: 180, x2: 380, y2: 180 }, { x1: 420, y1: 180, x2: 520, y2: 180 },
            { x1: 520, y1: 180, x2: 520, y2: 280 }, { x1: 520, y1: 320, x2: 520, y2: 420 },
            { x1: 520, y1: 420, x2: 180, y2: 420 }, { x1: 180, y1: 420, x2: 180, y2: 320 },
            { x1: 520, y1: 280, x2: 640, y2: 280 }, { x1: 640, y1: 280, x2: 640, y2: 280 },
            { x1: 640, y1: 320, x2: 520, y2: 320 }
        ]
    },
    voltageDivider: {
        name: "Ayarlanabilir Gerilim Bölücü",
        components: [
            { type: 'battery', x: 180, y: 300, rotation: 90, value: 9 },
            { type: 'switch', x: 300, y: 180, rotation: 0, value: 0, state: { closed: true } },
            { type: 'potentiometer', x: 460, y: 240, rotation: 90, value: 100 },
            { type: 'potentiometer', x: 460, y: 380, rotation: 90, value: 220 },
            { type: 'voltmeter', x: 620, y: 380, rotation: 90, value: 1000000 },
            { type: 'led', x: 600, y: 240, rotation: 0, value: 30 }
        ],
        wires: [
            { x1: 180, y1: 280, x2: 180, y2: 180 }, { x1: 180, y1: 180, x2: 280, y2: 180 },
            { x1: 320, y1: 180, x2: 460, y2: 180 }, { x1: 460, y1: 180, x2: 460, y2: 220 },
            { x1: 460, y1: 260, x2: 460, y2: 360 }, { x1: 460, y1: 400, x2: 460, y2: 460 },
            { x1: 460, y1: 460, x2: 180, y2: 460 }, { x1: 180, y1: 460, x2: 180, y2: 320 },
            { x1: 460, y1: 260, x2: 580, y2: 260 }, { x1: 620, y1: 260, x2: 620, y2: 360 },
            { x1: 620, y1: 400, x2: 460, y2: 400 }
        ]
    },
    protectedMotor: {
        name: "Korumalı Motor Kontrolü",
        components: [
            { type: 'battery', x: 180, y: 320, rotation: 90, value: 9 },
            { type: 'fuse', x: 280, y: 180, rotation: 0, value: 0.001 },
            { type: 'switch', x: 400, y: 180, rotation: 0, value: 0, state: { closed: true } },
            { type: 'ammeter', x: 520, y: 180, rotation: 0, value: 0.001 },
            { type: 'motor', x: 620, y: 320, rotation: 90, value: 18 },
            { type: 'diode', x: 500, y: 420, rotation: 180, value: 15 }
        ],
        wires: [
            { x1: 180, y1: 300, x2: 180, y2: 180 }, { x1: 180, y1: 180, x2: 260, y2: 180 },
            { x1: 300, y1: 180, x2: 380, y2: 180 }, { x1: 420, y1: 180, x2: 500, y2: 180 },
            { x1: 540, y1: 180, x2: 620, y2: 180 }, { x1: 620, y1: 180, x2: 620, y2: 300 },
            { x1: 620, y1: 340, x2: 620, y2: 460 }, { x1: 620, y1: 460, x2: 180, y2: 460 },
            { x1: 180, y1: 460, x2: 180, y2: 340 }, { x1: 620, y1: 340, x2: 620, y2: 420 },
            { x1: 620, y1: 420, x2: 520, y2: 420 }, { x1: 480, y1: 420, x2: 620, y2: 300 }
        ]
    }
};
