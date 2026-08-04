import { CircuitComponent, WireSegment, Position } from '../types';
import { solveGaussJordan } from './solver';

export function getTerminals(comp: CircuitComponent): [Position, Position] {
    const rad = (comp.rotation * Math.PI) / 180;
    const dx = Math.round(Math.cos(rad) * 20);
    const dy = Math.round(Math.sin(rad) * 20);
    return [
        { x: Math.round(comp.x - dx), y: Math.round(comp.y - dy) },
        { x: Math.round(comp.x + dx), y: Math.round(comp.y + dy) }
    ];
}

const ptKey = (x: number, y: number) => `${Math.round(x)},${Math.round(y)}`;

function getPointsOnSegment(x1: number, y1: number, x2: number, y2: number): Position[] {
    const pts: Position[] = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const stepCount = Math.round(distance / 20);
    if (stepCount <= 0) return [{x: x1, y: y1}];
    for(let i=0; i<=stepCount; i++) {
        pts.push({
            x: Math.round(x1 + (dx * i) / stepCount),
            y: Math.round(y1 + (dy * i) / stepCount)
        });
    }
    return pts;
}

export class SimulationEngine {
    public nodeVoltages = new Map<string, number>();
    public compCurrents = new Map<string, number>();
    public compVoltages = new Map<string, number>(); // voltage drop
    public wireCurrents = new Map<string, number>();
    public capacitorVoltages = new Map<string, number>(); // V_last for caps
    
    // We will store segment currents so we can render particles correctly per segment
    public wireSegmentCurrents = new Map<string, number>(); 
    
    public minV = 0;
    public maxV = 0;

    public tick(components: CircuitComponent[], wires: WireSegment[], dt: number) {
        // Gathering terminals
        const pointSet = new Set<string>();
        components.forEach(c => {
            const [p1, p2] = getTerminals(c);
            pointSet.add(ptKey(p1.x, p1.y));
            pointSet.add(ptKey(p2.x, p2.y));
        });

        // Break wires into segments and filter out those hidden inside components
        const validWireSegments: {x1: number, y1: number, x2: number, y2: number, wireId: string, segKey: string}[] = [];
        
        wires.forEach(w => {
            const pts = getPointsOnSegment(w.x1, w.y1, w.x2, w.y2);
            for(let i=0; i<pts.length - 1; i++) {
                const x1 = pts[i].x, y1 = pts[i].y;
                const x2 = pts[i+1].x, y2 = pts[i+1].y;
                
                // Check if segment is inside any component
                let inside = false;
                components.forEach(c => {
                    const [p1, p2] = getTerminals(c);
                    const cx = Math.round(c.x), cy = Math.round(c.y);
                    
                    const match1 = (x1 === p1.x && y1 === p1.y && x2 === cx && y2 === cy);
                    const match2 = (x2 === p1.x && y2 === p1.y && x1 === cx && y1 === cy);
                    const match3 = (x1 === cx && y1 === cy && x2 === p2.x && y2 === p2.y);
                    const match4 = (x2 === cx && y2 === cy && x1 === p2.x && y1 === p2.y);
                    
                    if (match1 || match2 || match3 || match4) inside = true;
                });

                if (!inside) {
                    pointSet.add(ptKey(x1, y1));
                    pointSet.add(ptKey(x2, y2));
                    validWireSegments.push({
                        x1, y1, x2, y2, wireId: w.id, segKey: `${x1},${y1}-${x2},${y2}`
                    });
                }
            }
        });

        const nodes = Array.from(pointSet);
        const n = nodes.length;
        if (n === 0) return;

        const ptToIdx = new Map<string, number>();
        nodes.forEach((pt, i) => ptToIdx.set(pt, i));

        const voltageSources = components.filter(c => c.type === 'battery');
        const m = voltageSources.length;

        const size = n + m;
        const A: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
        const b: number[] = Array(size).fill(0);

        for (let i = 0; i < n; i++) {
            A[i][i] += 1e-7; 
        }

        // Process Wires as tiny resistors to track segments
        validWireSegments.forEach(ws => {
            const u = ptToIdx.get(ptKey(ws.x1, ws.y1));
            const v = ptToIdx.get(ptKey(ws.x2, ws.y2));
            if (u !== undefined && v !== undefined && u !== v) {
                const G = 1 / 0.001;
                A[u][u] += G; A[v][v] += G;
                A[u][v] -= G; A[v][u] -= G;
            }
        });

        components.forEach(comp => {
            if (comp.type === 'battery') return; 
            
            const [p1, p2] = getTerminals(comp);
            const u = ptToIdx.get(ptKey(p1.x, p1.y));
            const v = ptToIdx.get(ptKey(p2.x, p2.y));
            if (u === undefined || v === undefined) return;
            if (u === v) return; 

            let G = 0;
            let I_eq = 0;

            if (comp.type === 'resistor' || comp.type === 'bulb') {
                G = 1 / Math.max(0.001, comp.value);
            } else if (comp.type === 'switch') {
                G = comp.state?.closed ? 1 / 0.001 : 1 / 1e9;
            } else if (comp.type === 'capacitor') {
                const C = comp.value; 
                G = C / dt;
                const V_last = this.capacitorVoltages.get(comp.id) || 0;
                I_eq = G * V_last;
            }

            A[u][u] += G; A[v][v] += G;
            A[u][v] -= G; A[v][u] -= G;

            if (I_eq !== 0) {
                b[u] += I_eq;
                b[v] -= I_eq;
            }
        });

        voltageSources.forEach((comp, idx) => {
            const [p1, p2] = getTerminals(comp);
            const u = ptToIdx.get(ptKey(p1.x, p1.y)); 
            const v = ptToIdx.get(ptKey(p2.x, p2.y)); 
            
            if (u === undefined || v === undefined) return;
            
            const i_idx = n + idx;
            // The visual battery has positive terminal at p2 (right side bump)
            // So V_v - V_u = comp.value
            A[i_idx][u] -= 1;
            A[i_idx][v] += 1;
            b[i_idx] = comp.value;
            
            // x[i_idx] will be the current leaving v (positive terminal)
            A[u][i_idx] -= 1;
            A[v][i_idx] += 1;
        });

        const x = solveGaussJordan(A, b);

        this.nodeVoltages.clear();
        this.minV = 0;
        this.maxV = 0;
        for (let i = 0; i < n; i++) {
            const V = x[i];
            this.nodeVoltages.set(nodes[i], V);
            if (V > this.maxV) this.maxV = V;
            if (V < this.minV) this.minV = V;
        }
        
        if (Math.abs(this.maxV - this.minV) < 0.1) {
            this.maxV += 5;
            this.minV -= 5;
        }

        // Calculate flow for each valid segment
        this.wireSegmentCurrents.clear();
        this.wireCurrents.clear();
        
        const wireSumCurrents = new Map<string, number>();
        const wireSegCounts = new Map<string, number>();

        validWireSegments.forEach(ws => {
            const uV = this.nodeVoltages.get(ptKey(ws.x1, ws.y1)) || 0;
            const vV = this.nodeVoltages.get(ptKey(ws.x2, ws.y2)) || 0;
            const current = (uV - vV) / 0.001; // Current from x1,y1 to x2,y2
            this.wireSegmentCurrents.set(ws.segKey, current);
        });
        
        wires.forEach(w => {
            // For particles, we just need the primary bulk flow direction of the wire
            const uV = this.nodeVoltages.get(ptKey(w.x1, w.y1)) || 0;
            const vV = this.nodeVoltages.get(ptKey(w.x2, w.y2)) || 0;
            // Get actual V diff from the macro endpoints to provide consistent particle flow
            const macroCurrent = (uV - vV) / (Math.max(1, validWireSegments.filter(s => s.wireId === w.id).length) * 0.001);
            this.wireCurrents.set(w.id, macroCurrent);
        });

        components.forEach(comp => {
            const [p1, p2] = getTerminals(comp);
            const V_u = this.nodeVoltages.get(ptKey(p1.x, p1.y)) || 0;
            const V_v = this.nodeVoltages.get(ptKey(p2.x, p2.y)) || 0;
            this.compVoltages.set(comp.id, V_u - V_v);
            
            let current = 0;
            if (comp.type === 'battery') {
                const bIdx = voltageSources.findIndex(c => c.id === comp.id);
                current = x[n + bIdx];
            } else if (comp.type === 'resistor' || comp.type === 'bulb') {
                current = (V_u - V_v) / Math.max(0.001, comp.value);
            } else if (comp.type === 'switch') {
                const G = comp.state?.closed ? 1 / 0.001 : 1 / 1e9;
                current = (V_u - V_v) * G;
            } else if (comp.type === 'capacitor') {
                const G = comp.value / dt;
                const V_last = this.capacitorVoltages.get(comp.id) || 0;
                const I_eq = G * V_last;
                current = (V_u - V_v) * G - I_eq;
                
                this.capacitorVoltages.set(comp.id, V_u - V_v);
            }
            this.compCurrents.set(comp.id, current);
        });
    }

    public getVoltageGradientColor(voltage: number) {
        const range = this.maxV - this.minV;
        const normalized = range > 0.001 ? (voltage - this.minV) / range : 0.5;
        
        let r, g, b;
        if (normalized < 0.5) {
            const t = normalized * 2;
            r = Math.round(59 + t * (168 - 59));
            g = Math.round(130 + t * (85 - 130));
            b = Math.round(246 + t * (247 - 246));
        } else {
            const t = (normalized - 0.5) * 2;
            r = Math.round(168 + t * (239 - 168));
            g = Math.round(85 + t * (68 - 85));
            b = Math.round(247 + t * (68 - 247));
        }
        return `rgb(${r}, ${g}, ${b})`;
    }
}
