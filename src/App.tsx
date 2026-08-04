import { useEffect } from 'react';
import { AppProvider, useAppStore } from './store';
import { CircuitCanvas } from './components/CircuitCanvas';
import { Toolbox } from './components/Toolbox';
import { TopBar } from './components/TopBar';
import { PhysicsEngine } from './components/engine/PhysicsEngine';
import { LearningPanel } from './components/LearningPanel';
import { ComponentLibrary } from './components/ComponentLibrary';

function MainApp() {
  const { state } = useAppStore();
  const themeClass = state.theme === 'dark' ? 'studio-app dark' : 'studio-app';
  
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#fafafa';
    }
  }, [state.theme]);

  return (
    <div className={`relative w-screen h-screen overflow-hidden font-sans select-none ${themeClass}`}>
      <CircuitCanvas />
      <Toolbox />
      <TopBar />
      <LearningPanel />
      <ComponentLibrary />
      <PhysicsEngine />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
