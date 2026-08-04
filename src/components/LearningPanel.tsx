import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Flag, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import { useAppStore } from '../store';
import type { ComponentType } from '../types';

type Mission = {
  title: string;
  concept: string;
  templateId: string;
  checks: string[];
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
  { title: 'İlk ışığını yak', concept: 'Kapalı devre', templateId: 'simple', checks: ['Pil ve ampul kullan', 'Kesintisiz bir yol oluştur', 'Ampulden akım geçir'], validate: c => c.counts.battery >= 1 && c.counts.bulb >= 1 && hasCurrent(c.currents.bulb) && !c.paused },
  { title: 'Kontrol sende', concept: 'Anahtar', templateId: 'simple', checks: ['Devreye anahtar ekle', 'Anahtarı kapat', 'Ampulü yeniden yak'], validate: c => c.counts.switch >= 1 && c.switchClosed && hasCurrent(c.currents.bulb) && !c.paused },
  { title: 'Akımı sakinleştir', concept: 'Direnç', templateId: 'resistorBulb', checks: ['Direnci seri bağla', 'Ampul ve pili koru', 'Akımı gözlemle'], validate: c => c.counts.resistor >= 1 && c.counts.bulb >= 1 && hasCurrent(c.currents.resistor) && hasCurrent(c.currents.bulb) },
  { title: 'İki ampul, tek yol', concept: 'Seri bağlantı', templateId: 'series', checks: ['İki ampul kullan', 'Tek akım yolu kur', 'İki ampulü de yak'], validate: c => c.counts.bulb >= 2 && c.currents.bulb.filter(value => value > 0.1 && value < 0.7).length >= 2 },
  { title: 'Akımı ikiye böl', concept: 'Paralel bağlantı', templateId: 'parallel', checks: ['İki paralel kol oluştur', 'Her kola bir ampul yerleştir', 'İki ampulü tam parlaklıkta yak'], validate: c => c.counts.bulb >= 2 && c.currents.bulb.filter(value => value > 0.7).length >= 2 },
  { title: 'LED sinyali oluştur', concept: 'LED ve kutuplama', templateId: 'led', checks: ['LED ekle', 'Koruma direnci kullan', 'LED’den akım geçir'], validate: c => c.counts.led >= 1 && c.counts.resistor >= 1 && hasCurrent(c.currents.led) },
  { title: 'Enerjiyi depola', concept: 'Kondansatör', templateId: 'rc', checks: ['Direnç ve kondansatörü bağla', 'Anahtarı kapat', 'Kondansatörü 5 V üzerine şarj et'], validate: c => c.counts.capacitor >= 1 && c.counts.resistor >= 1 && c.capacitorVoltage > 5 },
  { title: 'Harekete geçir', concept: 'DC motor', templateId: 'motor', checks: ['Motoru devreye bağla', 'Anahtarı kapat', 'Motoru döndür'], validate: c => c.counts.motor >= 1 && hasCurrent(c.currents.motor) },
  { title: 'Sesli uyarı ver', concept: 'Buzzer', templateId: 'buzzer', checks: ['Buzzer ekle', 'Anahtarla kontrol et', 'Buzzerı çalıştır'], validate: c => c.counts.buzzer >= 1 && hasCurrent(c.currents.buzzer) },
  { title: 'Büyük final', concept: 'Sistem tasarımı', templateId: 'finalLab', checks: ['Tüm sekiz temel parçayı kullan', 'Anahtarı kapat', 'Işık, hareket ve uyarıyı birlikte çalıştır'], validate: c => (['battery', 'bulb', 'led', 'resistor', 'capacitor', 'switch', 'motor', 'buzzer'] as const).every(type => c.counts[type] >= 1) && hasCurrent(c.currents.bulb) && hasCurrent(c.currents.led) && hasCurrent(c.currents.motor) && hasCurrent(c.currents.buzzer) && c.capacitorVoltage > 2 },
];

const emptyCounts = (): Record<ComponentType, number> => ({ battery: 0, bulb: 0, led: 0, resistor: 0, capacitor: 0, switch: 0, motor: 0, buzzer: 0, ammeter: 0, voltmeter: 0, potentiometer: 0, diode: 0, fuse: 0 });
const emptyCurrents = (): Record<ComponentType, number[]> => ({ battery: [], bulb: [], led: [], resistor: [], capacitor: [], switch: [], motor: [], buzzer: [], ammeter: [], voltmeter: [], potentiometer: [], diode: [], fuse: [] });

export const LearningPanel: React.FC = () => {
  const { state, engine, loadTemplate, clearBoard, setState } = useAppStore();
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

  if (!isOpen) return <button className="mission-pill" onClick={() => setIsOpen(true)}><Sparkles size={18} /> Görev {missionIndex + 1}/10</button>;

  return (
    <aside className="learning-panel" aria-label="Öğrenme görevi">
      <button className="panel-close" onClick={() => setIsOpen(false)} aria-label="Görev panelini kapat"><X size={18} /></button>
      <div className="mission-kicker"><Flag size={14} /> Görev {missionIndex + 1} / {MISSIONS.length}</div>
      <div className="mission-progress"><span style={{ width: `${(completedMissions.length / MISSIONS.length) * 100}%` }} /></div>
      <small className="mission-concept">{mission.concept}</small><h2>{mission.title}</h2>
      <div className="mission-steps">
        {mission.checks.map((check, index) => <div className={completed ? 'mission-step done' : 'mission-step'} key={check}>{completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span>{index + 1}. {check}</span></div>)}
      </div>
      <div className={`result-card ${completed ? 'success' : ''}`} aria-live="polite">
        {journeyComplete && missionIndex === 9 ? <Trophy size={22} /> : completed ? <CheckCircle2 size={22} /> : <Sparkles size={22} />}<div><strong>{journeyComplete && missionIndex === 9 ? 'Devre Ustası oldun!' : completed ? 'Görev tamamlandı!' : 'Sıra sende'}</strong><span>{completed ? 'Devre çalışma alanında kalacak. Ölçümleri inceleyip hazır olduğunda sonraki göreve geç.' : 'Devreyi kur veya başlangıç devresini yükleyip üzerinde çalış.'}</span></div>
      </div>
      <button className="example-button mission-load" onClick={() => { loadTemplate(mission.templateId); setState(current => ({ ...current, isPaused: false })); }}>
        Başlangıç devresini yükle <ChevronRight size={16} />
      </button>
      <div className="mission-navigation">
        <button onClick={() => goToMission(missionIndex - 1)} disabled={missionIndex === 0}><ChevronLeft size={15} /> Önceki</button>
        <span>{completedMissions.length}/10 tamamlandı</span>
        <button onClick={() => goToMission(missionIndex + 1)} disabled={!completed || missionIndex === MISSIONS.length - 1}>Sonraki <ChevronRight size={15} /></button>
      </div>
      <button className="journey-reset" onClick={resetJourney}><RotateCcw size={12} /> İlerlemeyi sıfırla</button>
    </aside>
  );
};
