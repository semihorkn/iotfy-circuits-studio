import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Flag, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import { useAppStore } from '../store';
import type { ComponentType } from '../types';

type Mission = {
  title: string;
  concept: string;
  templateId: string;
  checks: string[];
  en: { title: string; concept: string; checks: string[] };
  validate: (context: MissionContext) => boolean;
};

type MissionContext = {
  counts: Record<ComponentType, number>;
  currents: Record<ComponentType, number[]>;
  capacitorVoltage: number;
  switchClosed: boolean;
  paused: boolean;
};

const hasCurrent = (values: number[], threshold = 0.01) => values.some(value => value > threshold);

const MISSIONS: Mission[] = [
  { title: 'İlk ışığını yak', concept: 'Kapalı devre ve anahtar', templateId: 'simple', checks: ['Pil, anahtar ve ampul kullan', 'Anahtarı kapat', 'Ampulden akım geçir'], en: { title: 'Light your first bulb', concept: 'Closed circuit and switch', checks: ['Use a battery, switch and bulb', 'Close the switch', 'Pass current through the bulb'] }, validate: c => c.counts.battery >= 1 && c.counts.switch >= 1 && c.counts.bulb >= 1 && c.switchClosed && hasCurrent(c.currents.bulb) && !c.paused },
  { title: 'Akımı sakinleştir', concept: 'Direnç', templateId: 'resistorBulb', checks: ['Direnci seri bağla', 'Ampul ve pili koru', 'Akımı gözlemle'], en: { title: 'Tame the current', concept: 'Resistance', checks: ['Connect a resistor in series', 'Protect the bulb and battery', 'Observe the current'] }, validate: c => c.counts.resistor >= 1 && c.counts.bulb >= 1 && hasCurrent(c.currents.resistor) && hasCurrent(c.currents.bulb) },
  { title: 'İki ampul, tek yol', concept: 'Seri bağlantı', templateId: 'series', checks: ['İki ampul kullan', 'Tek akım yolu kur', 'İki ampulü de yak'], en: { title: 'Two bulbs, one path', concept: 'Series circuit', checks: ['Use two bulbs', 'Build one current path', 'Light both bulbs'] }, validate: c => c.counts.bulb >= 2 && c.currents.bulb.filter(value => value > 0.1 && value < 0.7).length >= 2 },
  { title: 'Akımı ikiye böl', concept: 'Paralel bağlantı', templateId: 'parallel', checks: ['İki paralel kol oluştur', 'Her kola bir ampul yerleştir', 'İki ampulü tam parlaklıkta yak'], en: { title: 'Split the current', concept: 'Parallel circuit', checks: ['Create two parallel branches', 'Place a bulb on each branch', 'Light both bulbs fully'] }, validate: c => c.counts.bulb >= 2 && c.currents.bulb.filter(value => value > 0.7).length >= 2 },
  { title: 'LED sinyali oluştur', concept: 'LED ve kutuplama', templateId: 'led', checks: ['LED ekle', 'Koruma direnci kullan', 'LED’den akım geçir'], en: { title: 'Create an LED signal', concept: 'LED polarity', checks: ['Add an LED', 'Use a protection resistor', 'Pass current through the LED'] }, validate: c => c.counts.led >= 1 && c.counts.resistor >= 1 && hasCurrent(c.currents.led) },
  { title: 'Enerjiyi depola', concept: 'Kondansatör', templateId: 'rc', checks: ['Direnç ve kondansatörü bağla', 'Anahtarı kapat', 'Kondansatörü 5 V üzerine şarj et'], en: { title: 'Store energy', concept: 'Capacitor', checks: ['Connect a resistor and capacitor', 'Close the switch', 'Charge above 5 V'] }, validate: c => c.counts.capacitor >= 1 && c.counts.resistor >= 1 && c.capacitorVoltage > 5 },
  { title: 'Harekete geçir', concept: 'DC motor', templateId: 'motor', checks: ['Motoru devreye bağla', 'Anahtarı kapat', 'Motoru döndür'], en: { title: 'Set it in motion', concept: 'DC motor', checks: ['Connect the motor', 'Close the switch', 'Spin the motor'] }, validate: c => c.counts.motor >= 1 && hasCurrent(c.currents.motor) },
  { title: 'Sesli uyarı ver', concept: 'Buzzer', templateId: 'buzzer', checks: ['Buzzer ekle', 'Anahtarla kontrol et', 'Buzzerı çalıştır'], en: { title: 'Sound an alert', concept: 'Buzzer', checks: ['Add a buzzer', 'Control it with a switch', 'Run the buzzer'] }, validate: c => c.counts.buzzer >= 1 && hasCurrent(c.currents.buzzer) },
  { title: 'Akım ve gerilimi ölç', concept: 'Ölçüm laboratuvarı', templateId: 'measurementLab', checks: ['Ampermetreyi seri bağla', 'Voltmetreyi ölçüm noktasına bağla', 'Devrede akımı gözlemle'], en: { title: 'Measure current and voltage', concept: 'Measurement lab', checks: ['Connect the ammeter in series', 'Connect the voltmeter across the load', 'Observe current in the circuit'] }, validate: c => c.counts.ammeter >= 1 && c.counts.voltmeter >= 1 && c.counts.resistor >= 1 && hasCurrent(c.currents.ammeter) },
  { title: 'Gerilimi ayarla', concept: 'Gerilim bölücü', templateId: 'voltageDivider', checks: ['İki potansiyometre kullan', 'Voltmetreyi bağla', 'Bölücüde akım oluştur'], en: { title: 'Adjust the voltage', concept: 'Voltage divider', checks: ['Use two potentiometers', 'Connect the voltmeter', 'Create current through the divider'] }, validate: c => c.counts.potentiometer >= 2 && c.counts.voltmeter >= 1 && hasCurrent(c.currents.potentiometer) },
  { title: 'Motoru koru', concept: 'Sigorta ve diyot', templateId: 'protectedMotor', checks: ['Sigortayı seri bağla', 'Koruma diyodu ekle', 'Motoru çalıştır ve akımı ölç'], en: { title: 'Protect the motor', concept: 'Fuse and diode', checks: ['Connect the fuse in series', 'Add a protection diode', 'Run the motor and measure current'] }, validate: c => c.counts.fuse >= 1 && c.counts.diode >= 1 && c.counts.motor >= 1 && c.counts.ammeter >= 1 && hasCurrent(c.currents.motor) },
  { title: 'Büyük final', concept: 'Sistem tasarımı', templateId: 'finalLab', checks: ['Tüm sekiz temel parçayı kullan', 'Anahtarı kapat', 'Işık, hareket ve uyarıyı birlikte çalıştır'], en: { title: 'Grand finale', concept: 'System design', checks: ['Use all eight core components', 'Close the switch', 'Run light, motion and alert together'] }, validate: c => (['battery', 'bulb', 'led', 'resistor', 'capacitor', 'switch', 'motor', 'buzzer'] as const).every(type => c.counts[type] >= 1) && hasCurrent(c.currents.bulb) && hasCurrent(c.currents.led) && hasCurrent(c.currents.motor) && hasCurrent(c.currents.buzzer) && c.capacitorVoltage > 2 },
];

const emptyCounts = (): Record<ComponentType, number> => ({ battery: 0, bulb: 0, led: 0, resistor: 0, capacitor: 0, switch: 0, motor: 0, buzzer: 0, ammeter: 0, voltmeter: 0, potentiometer: 0, diode: 0, fuse: 0 });
const emptyCurrents = (): Record<ComponentType, number[]> => ({ battery: [], bulb: [], led: [], resistor: [], capacitor: [], switch: [], motor: [], buzzer: [], ammeter: [], voltmeter: [], potentiometer: [], diode: [], fuse: [] });

export const LearningPanel: React.FC = () => {
  const { state, engine, loadTemplate, clearBoard, setState } = useAppStore();
  const en = state.language === 'en';
  const [isOpen, setIsOpen] = useState(true);
  const [missionIndex, setMissionIndex] = useState(() => Math.min(Number(localStorage.getItem('iotfy-mission') || 0), MISSIONS.length - 1));
  const [completedMissions, setCompletedMissions] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('iotfy-completed-missions') || '[]'); } catch { return []; }
  });
  const [completed, setCompleted] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('iotfy-completed-missions') || '[]') as number[]).includes(Math.min(Number(localStorage.getItem('iotfy-mission') || 0), MISSIONS.length - 1)); } catch { return false; }
  });
  const [journeyComplete, setJourneyComplete] = useState(localStorage.getItem('iotfy-mission-complete') === 'true');
  const mission = MISSIONS[missionIndex];
  const missionCopy = en ? mission.en : mission;

  useEffect(() => {
    if (completed) return;
    const timer = window.setInterval(() => {
      const counts = emptyCounts();
      const currents = emptyCurrents();
      state.components.forEach(component => {
        counts[component.type] += 1;
        currents[component.type].push(Math.abs(engine.compCurrents.get(component.id) || 0));
      });
      const liveContext: MissionContext = { counts, currents, capacitorVoltage: Math.max(0, ...Array.from(engine.capacitorVoltages.values()).map(Math.abs)), switchClosed: state.components.some(component => component.type === 'switch' && component.state?.closed), paused: state.isPaused };
      if (mission.validate(liveContext)) {
        setCompleted(true);
        setCompletedMissions(previous => {
          const next = Array.from(new Set([...previous, missionIndex])).sort((a, b) => a - b);
          localStorage.setItem('iotfy-completed-missions', JSON.stringify(next));
          return next;
        });
        if (missionIndex === MISSIONS.length - 1) {
          setJourneyComplete(true);
          localStorage.setItem('iotfy-mission-complete', 'true');
        }
      }
    }, 220);
    return () => window.clearInterval(timer);
  }, [mission, missionIndex, completed, state.components, state.isPaused, engine]);

  const goToMission = (index: number) => {
    if (index < 0 || index >= MISSIONS.length) return;
    setMissionIndex(index);
    localStorage.setItem('iotfy-mission', String(index));
    setCompleted(completedMissions.includes(index));
  };

  const resetJourney = () => {
    localStorage.removeItem('iotfy-mission'); localStorage.removeItem('iotfy-mission-complete'); localStorage.removeItem('iotfy-completed-missions');
    setMissionIndex(0); setJourneyComplete(false); setCompleted(false); setCompletedMissions([]); clearBoard();
  };

  if (!isOpen) return <button className="mission-pill" onClick={() => setIsOpen(true)}><Sparkles size={18} /> {en ? 'Mission' : 'Görev'} {missionIndex + 1}/{MISSIONS.length}</button>;

  return (
    <aside className="learning-panel" aria-label={en ? 'Learning mission' : 'Öğrenme görevi'}>
      <button className="panel-close" onClick={() => setIsOpen(false)} aria-label={en ? 'Close mission panel' : 'Görev panelini kapat'}><X size={18} /></button>
      <div className="mission-kicker"><Flag size={14} /> {en ? 'Mission' : 'Görev'} {missionIndex + 1} / {MISSIONS.length}</div>
      <div className="mission-progress"><span style={{ width: `${(completedMissions.length / MISSIONS.length) * 100}%` }} /></div>
      <small className="mission-concept">{missionCopy.concept}</small><h2>{missionCopy.title}</h2>
      <div className="mission-steps">
        {missionCopy.checks.map((check, index) => <div className={completed ? 'mission-step done' : 'mission-step'} key={check}>{completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span>{index + 1}. {check}</span></div>)}
      </div>
      <div className={`result-card ${completed ? 'success' : ''}`} aria-live="polite">
        {journeyComplete && missionIndex === MISSIONS.length - 1 ? <Trophy size={22} /> : completed ? <CheckCircle2 size={22} /> : <Sparkles size={22} />}<div><strong>{journeyComplete && missionIndex === MISSIONS.length - 1 ? (en ? 'You are a Circuit Master!' : 'Devre Ustası oldun!') : completed ? (en ? 'Mission complete!' : 'Görev tamamlandı!') : (en ? 'Your turn' : 'Sıra sende')}</strong><span>{completed ? (en ? 'Your circuit stays in the workspace. Review the measurements, then continue when ready.' : 'Devre çalışma alanında kalacak. Ölçümleri inceleyip hazır olduğunda sonraki göreve geç.') : (en ? 'Build the circuit or load the starter circuit and experiment.' : 'Devreyi kur veya başlangıç devresini yükleyip üzerinde çalış.')}</span></div>
      </div>
      <button className="example-button mission-load" onClick={() => { loadTemplate(mission.templateId); setState(current => ({ ...current, isPaused: false })); }}>
        {en ? 'Load starter circuit' : 'Başlangıç devresini yükle'} <ChevronRight size={16} />
      </button>
      <div className="mission-navigation">
        <button onClick={() => goToMission(missionIndex - 1)} disabled={missionIndex === 0}><ChevronLeft size={15} /> {en ? 'Previous' : 'Önceki'}</button>
        <span>{completedMissions.length}/{MISSIONS.length} {en ? 'complete' : 'tamamlandı'}</span>
        <button onClick={() => goToMission(missionIndex + 1)} disabled={!completed || missionIndex === MISSIONS.length - 1}>{en ? 'Next' : 'Sonraki'} <ChevronRight size={15} /></button>
      </div>
      <button className="journey-reset" onClick={resetJourney}><RotateCcw size={12} /> {en ? 'Reset progress' : 'İlerlemeyi sıfırla'}</button>
    </aside>
  );
};
