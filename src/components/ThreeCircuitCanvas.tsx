import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, Html, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store';
import type { CircuitComponent, WireSegment } from '../types';

const world = (x: number, y: number): [number, number, number] => [(x - 400) / 48, 0.34, (y - 320) / 48];

const LivePart: React.FC<{ component: CircuitComponent }> = ({ component }) => {
  const { engine, updateComponent, state } = useAppStore();
  const glow = useRef<THREE.PointLight>(null);
  const rotor = useRef<THREE.Group>(null);
  const position = world(component.x, component.y);
  const active = Math.abs(engine.compCurrents.get(component.id) || 0) > 0.01;
  const label = state.language === 'en' ? component.type : ({ battery:'pil', bulb:'ampul', resistor:'direnç', capacitor:'kondansatör', switch:'anahtar', ammeter:'ampermetre', voltmeter:'voltmetre', potentiometer:'potansiyometre', diode:'diyot', fuse:'sigorta' } as Record<string,string>)[component.type] || component.type;

  useFrame((_, delta) => {
    const current = Math.abs(engine.compCurrents.get(component.id) || 0);
    if (glow.current) glow.current.intensity = Math.min(2.4, current * 8);
    if (rotor.current && current > 0.01) rotor.current.rotation.y += delta * Math.min(12, current * 25);
  });

  const common = { position, rotation: [0, -component.rotation * Math.PI / 180, 0] as [number,number,number] };
  const terminals = <><mesh position={[-.48,0,0]}><cylinderGeometry args={[.055,.055,.22,12]} /><meshStandardMaterial color="#a9b2bc" metalness={.8} /></mesh><mesh position={[.48,0,0]}><cylinderGeometry args={[.055,.055,.22,12]} /><meshStandardMaterial color="#a9b2bc" metalness={.8} /></mesh></>;
  let model: React.ReactNode;
  if (component.type === 'battery') model = <RoundedBox args={[.72,.42,.34]} radius={.08}><meshStandardMaterial color="#26323c" /><Html center transform position={[0,.01,.18]} scale={.22}><b className="three-part-mark">9V</b></Html></RoundedBox>;
  else if (component.type === 'bulb' || component.type === 'led') model = <><mesh position={[0,.18,0]}><sphereGeometry args={[component.type === 'led' ? .18 : .25,24,16]} /><meshPhysicalMaterial color={active ? '#ffe45c' : component.type === 'led' ? '#d83b42' : '#dbe4e8'} emissive={active ? '#ffd52e' : '#000'} emissiveIntensity={active ? 2 : 0} transparent opacity={.9} /></mesh><pointLight ref={glow} color="#ffd52e" distance={3} /></>;
  else if (component.type === 'resistor' || component.type === 'potentiometer') model = <RoundedBox args={[.65,.23,.27]} radius={.1}><meshStandardMaterial color={component.type === 'potentiometer' ? '#169aa3' : '#d8c19c'} /><Html center transform position={[0,.13,0]} scale={.16}><b className="three-part-mark">Ω</b></Html></RoundedBox>;
  else if (component.type === 'capacitor') model = <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.2,.2,.48,24]} /><meshStandardMaterial color="#2f74a7" metalness={.25} /></mesh>;
  else if (component.type === 'switch') model = <group onClick={(event) => { event.stopPropagation(); updateComponent(component.id,{state:{closed:!component.state?.closed}}); }}><RoundedBox args={[.62,.18,.34]} radius={.06}><meshStandardMaterial color="#25313c" /></RoundedBox><mesh position={[component.state?.closed ? .1 : -.08,.17,0]} rotation={[0,0,component.state?.closed ? 0 : -.55]}><boxGeometry args={[.4,.08,.12]} /><meshStandardMaterial color={component.state?.closed ? '#2bc97f' : '#e6ad2e'} metalness={.45} /></mesh></group>;
  else if (component.type === 'motor') model = <group><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.32,.32,.42,28]} /><meshStandardMaterial color="#b8c7cf" metalness={.5} /></mesh><group ref={rotor} position={[0,.33,0]}><mesh><boxGeometry args={[.72,.05,.08]} /><meshStandardMaterial color="#19a9b2" /></mesh><mesh rotation={[0,Math.PI/2,0]}><boxGeometry args={[.72,.05,.08]} /><meshStandardMaterial color="#19a9b2" /></mesh></group></group>;
  else if (component.type === 'buzzer') model = <mesh><cylinderGeometry args={[.3,.3,.22,28]} /><meshStandardMaterial color="#172a52" /><Html center transform position={[0,.13,0]} scale={.16}><b className="three-part-mark">♫</b></Html></mesh>;
  else if (component.type === 'ammeter' || component.type === 'voltmeter') model = <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.3,.3,.18,28]} /><meshStandardMaterial color="#eef7f8" /><Html center transform position={[0,.1,0]} scale={.15}><b className="three-meter">{component.type === 'ammeter' ? 'A' : 'V'}</b></Html></mesh>;
  else if (component.type === 'diode') model = <mesh rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.24,.5,3]} /><meshStandardMaterial color="#149ba4" /></mesh>;
  else model = <RoundedBox args={[.6,.2,.25]} radius={.08}><meshStandardMaterial color="#f0c84b" /><Html center transform position={[0,.12,0]} scale={.13}><b className="three-part-mark">FUSE</b></Html></RoundedBox>;

  return <group {...common} aria-label={label}>{terminals}{model}<Html center position={[0,.62,0]} className="three-label"><span>{label}</span></Html></group>;
};

const CurrentDot: React.FC<{ wire: WireSegment }> = ({ wire }) => {
  const { engine, state } = useAppStore();
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const a = useMemo(() => new THREE.Vector3(...world(wire.x1,wire.y1)), [wire]);
  const b = useMemo(() => new THREE.Vector3(...world(wire.x2,wire.y2)), [wire]);
  useFrame((_,delta) => {
    const current = engine.wireCurrents.get(wire.id) || 0;
    progress.current = (progress.current + delta * Math.max(.12,Math.abs(current)*2.5) * Math.sign(current || 1)) % 1;
    if (progress.current < 0) progress.current += 1;
    ref.current?.position.lerpVectors(a,b,progress.current);
    if (ref.current) ref.current.visible = !state.isPaused && state.particlesReady && Math.abs(current) > .001;
  });
  return <mesh ref={ref}><sphereGeometry args={[.055,12,8]} /><meshBasicMaterial color="#5eeafa" /></mesh>;
};

const Scene = () => {
  const { state, addComponent, setState } = useAppStore();
  return <>
    <ambientLight intensity={.9} /><directionalLight position={[5,9,4]} intensity={2} castShadow />
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow onPointerDown={(event) => {
      if (state.toolMode !== 'select' && state.toolMode !== 'wire') {
        const x = Math.round((event.point.x * 48 + 400) / 20) * 20;
        const y = Math.round((event.point.z * 48 + 320) / 20) * 20;
        addComponent(state.toolMode, {x,y}); setState(current => ({...current,toolMode:'select'}));
      }
    }}><planeGeometry args={[22,16]} /><meshStandardMaterial color={state.theme === 'dark' ? '#0b1728' : '#eaf5f5'} roughness={.88} /></mesh>
    <Grid args={[22,16]} cellSize={.42} cellThickness={.45} cellColor={state.theme === 'dark' ? '#20505b' : '#91c7cb'} sectionSize={2.1} sectionColor="#1598a1" fadeDistance={24} position={[0,.012,0]} />
    {state.wires.map(wire => { const a=world(wire.x1,wire.y1), b=world(wire.x2,wire.y2); a[1]=b[1]=.27; return <React.Fragment key={wire.id}><Line points={[a,b]} color={state.viewMode === 'voltage' ? '#a877ff' : '#65798a'} lineWidth={3} /><CurrentDot wire={wire} /></React.Fragment>; })}
    {state.components.map(component => <LivePart key={component.id} component={component} />)}
    <OrbitControls makeDefault minDistance={5} maxDistance={22} maxPolarAngle={Math.PI/2.15} target={[0,0,0]} />
  </>;
};

export const ThreeCircuitCanvas: React.FC = () => {
  const { state } = useAppStore();
  return <div className="three-workspace" aria-label={state.language === 'en' ? '3D circuit workspace' : '3D devre çalışma alanı'}><Canvas shadows camera={{position:[7,8,9],fov:42}} dpr={[1,1.6]}><Scene /></Canvas><div className="three-hint">{state.language === 'en' ? 'Drag to orbit · Scroll to zoom · Choose a component, then click the board' : 'Döndürmek için sürükle · Yakınlaştırmak için kaydır · Parça seçip tablaya tıkla'}</div></div>;
};
