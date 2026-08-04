import React, { useMemo, useState } from 'react';
import { Battery, ChevronDown, CircleGauge, Lightbulb, Search, ToggleLeft, Waves, X } from 'lucide-react';
import { useAppStore } from '../store';
import type { ComponentType } from '../types';

type Category = 'Tümü' | 'Temel' | 'Pasif' | 'Kontrol';

const COMPONENTS: Array<{
  type: ComponentType;
  name: string;
  category: Exclude<Category, 'Tümü'>;
  detail: string;
}> = [
  { type: 'battery', name: '9V Pil', category: 'Temel', detail: '9 volt enerji kaynağı' },
  { type: 'bulb', name: 'Ampul', category: 'Temel', detail: 'Işığa dönüştürücü' },
  { type: 'resistor', name: 'Direnç', category: 'Pasif', detail: 'Akımı sınırlar' },
  { type: 'capacitor', name: 'Kondansatör', category: 'Pasif', detail: 'Elektrik yükü depolar' },
  { type: 'switch', name: 'Anahtar', category: 'Kontrol', detail: 'Devreyi açar ve kapatır' },
];

const ICONS: Record<ComponentType, React.FC<{ size?: number }>> = {
  battery: Battery,
  bulb: Lightbulb,
  resistor: Waves,
  capacitor: CircleGauge,
  switch: ToggleLeft,
};

export const ComponentLibrary: React.FC = () => {
  const { state, setState } = useAppStore();
  const [category, setCategory] = useState<Category>('Tümü');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const filtered = useMemo(() => COMPONENTS.filter(component => {
    const matchesCategory = category === 'Tümü' || component.category === category;
    const matchesQuery = component.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'));
    return matchesCategory && matchesQuery;
  }), [category, query]);

  if (!isOpen) return (
    <button className="library-open" onClick={() => setIsOpen(true)} aria-label="Bileşen kütüphanesini aç">
      <Battery size={20} /><span>Bileşenler</span>
    </button>
  );

  return (
    <aside className="component-library" aria-label="Bileşen kütüphanesi">
      <header className="library-header">
        <div><span className="eyebrow">DEVRE PARÇALARI</span><h2>Bileşenler</h2></div>
        <button onClick={() => setIsOpen(false)} aria-label="Bileşen kütüphanesini kapat"><X size={18} /></button>
      </header>

      <label className="component-search">
        <Search size={17} />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Bileşen ara..." />
      </label>

      <div className="category-select-wrap">
        <select value={category} onChange={event => setCategory(event.target.value as Category)} aria-label="Bileşen kategorisi">
          <option>Tümü</option><option>Temel</option><option>Pasif</option><option>Kontrol</option>
        </select>
        <ChevronDown size={16} />
      </div>

      <div className="category-chips" aria-label="Hızlı kategoriler">
        {(['Tümü', 'Temel', 'Pasif', 'Kontrol'] as Category[]).map(item => (
          <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>

      <div className="component-grid">
        {filtered.map(component => {
          const Icon = ICONS[component.type];
          const active = state.toolMode === component.type;
          return (
            <button
              key={component.type}
              className={`component-card ${active ? 'active' : ''}`}
              onClick={() => setState(current => ({ ...current, toolMode: component.type }))}
              aria-label={`${component.name} bileşenini seç`}
            >
              <div className={`component-visual ${component.type}`}><Icon size={34} /></div>
              <strong>{component.name}</strong>
              <span>{component.detail}</span>
              {active && <em>Tuvale yerleştir</em>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="empty-components">Aramana uygun bileşen bulunamadı.</div>}
      <footer><span>{filtered.length} bileşen</span><small>Bir parçayı seç, sonra çalışma alanına dokun.</small></footer>
    </aside>
  );
};
