import React, { useEffect } from 'react';
import { useAppStore } from '../../store';

export const PhysicsEngine: React.FC = () => {
    const { state, engine } = useAppStore();

    useEffect(() => {
        let frame: number;
        let lastTime = performance.now();

        const loop = (time: number) => {
            frame = requestAnimationFrame(loop);
            if (state.isPaused) {
                lastTime = time;
                return;
            }

            const dt = (time - lastTime) / 1000;
            lastTime = time;
            const safeDt = Math.max(0.001, Math.min(dt, 0.05));

            engine.tick(state.components, state.wires, safeDt);

            // Update View Modes + Particles
            state.wires.forEach(w => {
                const wEl = document.getElementById(`wire-${w.id}`);
                const pEl = document.getElementById(`wire-particle-${w.id}`) as any;
                
                if (wEl) {
                    if (state.viewMode === 'voltage') {
                        const v1 = engine.nodeVoltages.get(`${w.x1},${w.y1}`) || 0;
                        const v2 = engine.nodeVoltages.get(`${w.x2},${w.y2}`) || 0;
                        wEl.style.stroke = engine.getVoltageGradientColor((v1 + v2) / 2);
                    } else {
                        wEl.style.stroke = '#71717A'; // default wire color
                    }
                }

                if (pEl) {
                    if (state.particlesReady && state.viewMode !== 'voltage') {
                        pEl.style.display = 'inline';
                        const current = engine.wireCurrents.get(w.id) || 0;
                        
                        // We use the raw value. Remember positive flows to p2, negative flows to p1.
                        // For strokeDashoffset, decreasing moves the pattern forward (from stat to end).
                        // wait, actually, if current > 0, it flows from p1 to p2.
                        // So offset should decrease.
                        // I had: (pEl._accum || 0) - current * 15; -> this moves backward if current > 0.
                        pEl._accum = (pEl._accum || 0) - current * 15; 
                        pEl.style.strokeDashoffset = `${pEl._accum}`;
                        pEl.style.opacity = Math.min(1, Math.abs(current) * 0.5 + 0.1).toString();
                    } else {
                        pEl.style.display = 'none';
                    }
                }
            });

            // Update Components Glows & DOM
            state.components.forEach(c => {
                const current = engine.compCurrents.get(c.id) || 0;
                const vdrop = engine.compVoltages.get(c.id) || 0;
                const meterReading = document.getElementById(`meter-reading-${c.id}`);
                if (meterReading) meterReading.textContent = c.type === 'ammeter'
                    ? `${(Math.abs(current) * 1000).toFixed(0)} mA`
                    : `${Math.abs(vdrop).toFixed(1)} V`;
                
                if (c.type === 'bulb' || c.type === 'led') {
                    // Nominal power for 9V, 10ohm is 8.1W
                    const power = Math.abs(current * vdrop);
                    const lightArea = document.getElementById(`${c.type}-glow-${c.id}`);
                    if (lightArea) {
                        const opacity = Math.min(1, power / 6); 
                        lightArea.style.opacity = opacity.toString();
                    }
                } else if (c.type === 'motor') {
                    const rotor = document.getElementById(`motor-rotor-${c.id}`);
                    if (rotor) {
                        const speed = Math.min(20, Math.abs(current) * 80);
                        rotor.style.transform = `rotate(${time * speed * 0.04}deg)`;
                    }
                } else if (c.type === 'buzzer') {
                    const soundWaves = document.getElementById(`buzzer-wave-${c.id}`);
                    if (soundWaves) soundWaves.style.opacity = Math.abs(current) > 0.01 ? '1' : '0';
                } else if (c.type === 'capacitor') {
                     const capV = engine.capacitorVoltages.get(c.id) || 0;
                     const fillArea = document.getElementById(`cap-fill-${c.id}`);
                     if (fillArea) {
                          const chargeRatio = Math.min(1, Math.abs(capV) / Math.max(5, Math.abs(vdrop)));
                          fillArea.style.opacity = (chargeRatio * 0.9).toString();
                          fillArea.style.transform = 'none';
                     }
                }
                
                // Info Box Update if Component is selected
                const infoI = document.getElementById(`info-current-${c.id}`);
                const infoV = document.getElementById(`info-voltage-${c.id}`);
                if (infoI) infoI.innerText = `${(Math.abs(current) * 1000).toFixed(1)} mA`;
                if (infoV) infoV.innerText = `${Math.abs(vdrop).toFixed(2)} V`;
            });
        };

        frame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frame);
    }, [state.components, state.wires, state.isPaused, state.viewMode, state.particlesReady, engine]);

    return null;
};
