import assert from 'node:assert/strict';
import { SimulationEngine } from './simulation';
import { TEMPLATES } from '../templates';
import type { CircuitComponent, WireSegment } from '../types';

const instantiate = (templateId: keyof typeof TEMPLATES) => {
  const template = TEMPLATES[templateId];
  return {
    components: template.components.map((component, index) => ({ ...component, id: `c-${index}` })) as CircuitComponent[],
    wires: template.wires.map((wire, index) => ({ ...wire, id: `w-${index}` })) as WireSegment[]
  };
};

const run = (components: CircuitComponent[], wires: WireSegment[], frames = 4) => {
  const engine = new SimulationEngine();
  for (let index = 0; index < frames; index += 1) engine.tick(components, wires, 1 / 60);
  for (const value of [...engine.compCurrents.values(), ...engine.compVoltages.values(), ...engine.wireCurrents.values()]) {
    assert.ok(Number.isFinite(value), 'Simülasyon sonlu değerler üretmeli');
  }
  return engine;
};

const simple = instantiate('simple');
const openEngine = run(simple.components, simple.wires);
const openBulb = simple.components.find(component => component.type === 'bulb')!;
assert.ok(Math.abs(openEngine.compCurrents.get(openBulb.id) || 0) < 0.001, 'Açık anahtarda ampul sönük olmalı');

const closedComponents = simple.components.map(component => component.type === 'switch' ? { ...component, state: { closed: true } } : component);
const closedEngine = run(closedComponents, simple.wires);
assert.ok(Math.abs(closedEngine.compCurrents.get(openBulb.id) || 0) > 0.1, 'Kapalı anahtarda ampul yanmalı');

for (const templateId of ['series', 'parallel', 'rc', 'led', 'motor', 'buzzer', 'resistorBulb', 'finalLab', 'measurementLab', 'voltageDivider', 'protectedMotor'] as const) {
  const circuit = instantiate(templateId);
  const components = circuit.components.map(component => component.type === 'switch' ? { ...component, state: { closed: true } } : component);
  const engine = run(components, circuit.wires, templateId === 'rc' ? 12 : 4);
  assert.equal(engine.compCurrents.size, components.length, `${templateId} devresi bütün parçaları çözmeli`);
}

const shortBattery: CircuitComponent = { id: 'battery', type: 'battery', x: 200, y: 200, rotation: 0, value: 9 };
const shortWires: WireSegment[] = [
  { id: 'short-1', x1: 180, y1: 200, x2: 180, y2: 160 },
  { id: 'short-2', x1: 180, y1: 160, x2: 220, y2: 160 },
  { id: 'short-3', x1: 220, y1: 160, x2: 220, y2: 200 }
];
const shortEngine = run([shortBattery], shortWires);
assert.ok(Math.abs(shortEngine.compCurrents.get('battery') || 0) > 5, 'Kısa devre yüksek akım olarak algılanmalı');

run([], []);
console.log('IOTfy Circuits Studio: tüm simülasyon senaryoları geçti.');
