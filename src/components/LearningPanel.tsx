import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Lightbulb, Sparkles, X } from 'lucide-react';
import { useAppStore } from '../store';

export const LearningPanel: React.FC = () => {
  const { state, engine, loadTemplate } = useAppStore();
  const [isOpen, setIsOpen] = useState(true);
  const [hasCurrent, setHasCurrent] = useState(false);
  const [hasShortCircuit, setHasShortCircuit] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const bulbIsOn = state.components
        .filter(component => component.type === 'bulb')
        .some(component => Math.abs(engine.compCurrents.get(component.id) || 0) > 0.01);
      setHasCurrent(bulbIsOn && !state.isPaused);
      const batteryOverload = state.components
        .filter(component => component.type === 'battery')
        .some(component => Math.abs(engine.compCurrents.get(component.id) || 0) > 5);
      setHasShortCircuit(batteryOverload && !state.isPaused);
    }, 180);
    return () => window.clearInterval(timer);
  }, [engine, state.components, state.isPaused]);

  const hasBattery = state.components.some(component => component.type === 'battery');
  const hasBulb = state.components.some(component => component.type === 'bulb');
  const hasWire = state.wires.length > 0;
  const completed = hasBattery && hasBulb && hasWire && hasCurrent && !hasShortCircuit;
  const resultTitle = hasShortCircuit ? 'Dikkat, kısa devre!' : completed ? 'Harika, devre tamamlandı!' : 'Henüz ışık yok';
  const resultText = hasShortCircuit
    ? 'Akım dirençle karşılaşmadan pile dönüyor. Devreyi durdurup bağlantıları kontrol et.'
    : completed ? 'Akım kapalı bir yol buldu ve ampul yandı.' : 'İpucu: Yolun iki ucu da pile bağlanmalı.';

  if (!isOpen) return (
    <button className="mission-pill" onClick={() => setIsOpen(true)}>
      <Sparkles size={18} /> Görevi aç
    </button>
  );

  return (
    <aside className="learning-panel" aria-label="Öğrenme görevi">
      <button className="panel-close" onClick={() => setIsOpen(false)} aria-label="Görev panelini kapat"><X size={18} /></button>
      <div className="mission-kicker"><Sparkles size={15} /> 1. Görev</div>
      <h2>Ampulü yak!</h2>
      <p>Pil ile ampul arasında kesintisiz bir yol kur. Elektrik başladığı yere geri dönebilmeli.</p>
      <div className="mission-steps">
        <MissionStep done={hasBattery} label="Bir pil kullan" />
        <MissionStep done={hasBulb} label="Bir ampul ekle" />
        <MissionStep done={hasWire} label="Parçaları kabloyla bağla" />
        <MissionStep done={hasCurrent} label="Akımı çalıştır" />
      </div>
      <div className={`result-card ${completed ? 'success' : ''} ${hasShortCircuit ? 'danger' : ''}`} aria-live="polite">
        <Lightbulb size={22} />
        <div>
          <strong>{resultTitle}</strong>
          <span>{resultText}</span>
        </div>
      </div>
      <button className="example-button" onClick={() => loadTemplate('simple')}>Örnek devreyi göster</button>
    </aside>
  );
};

const MissionStep: React.FC<{ done: boolean; label: string }> = ({ done, label }) => (
  <div className={done ? 'mission-step done' : 'mission-step'}>
    {done ? <CheckCircle2 size={19} /> : <Circle size={19} />}<span>{label}</span>
  </div>
);
