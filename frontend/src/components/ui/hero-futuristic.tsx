'use client';
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="@react-three/fiber" />
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { Mesh } from 'three';
import {
  abs, blendScreen, float, mod, mx_cell_noise_float,
  oneMinus, smoothstep, texture, uniform, uv, vec2, vec3,
  pass, mix, add,
} from 'three/tsl';

// INVISIGUARD branded images — fintech/security themed
const TEXTUREMAP = { src: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80' };
const DEPTHMAP   = { src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80' };

extend(THREE as any);

// ─── Post Processing ──────────────────────────────────────────────────────────
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    const postProcessing = new (THREE as any).PostProcessing(gl as any);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    // Purple scan line instead of red — matches INVISIGUARD brand
    const purpleOverlay = vec3(0.66, 0.2, 0.94).mul(oneMinus(scanLine)).mul(0.4);
    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, purpleOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0,
    );
    const final = withScanEffect.add(bloomPass);
    postProcessing.outputNode = final;
    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    progressRef.current.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    render.renderAsync();
  }, 1);

  return null;
};

// ─── Scene ────────────────────────────────────────────────────────────────────
const WIDTH  = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);
  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rawMap && depthMap) setVisible(true);
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer  = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);
    const strength  = 0.01;

    const tDepthMap = texture(depthMap);
    const tMap = texture(rawMap, uv().add(tDepthMap.r.mul(uPointer).mul(strength)));

    const aspect   = float(WIDTH).div(HEIGHT);
    const tUv      = vec2(uv().x.mul(aspect), uv().y);
    const tiling   = vec2(120.0);
    const tiledUv  = mod(tUv.mul(tiling), 2.0).sub(1.0);
    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));
    const dist     = float(tiledUv.length());
    const dot      = float(smoothstep(0.5, 0.49, dist)).mul(brightness);
    const depth    = tDepthMap.r;  // use red channel as float
    const flow     = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));
    // Purple mask instead of red
    const mask     = dot.mul(flow).mul(vec3(0.66, 0.2, 0.94));
    const final    = blendScreen(tMap, mask);

    const material = new (THREE as any).MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      opacity: 0,
    });

    return { material, uniforms: { uPointer, uProgress } };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    if (meshRef.current && 'material' in meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as any;
      if ('opacity' in mat) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, visible ? 1 : 0, 0.07);
      }
    }
  });

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  const scaleFactor = 0.40;
  // Cast to any to bypass R3F JSX type augmentation issue with strict TSC
  const Mesh3D = 'mesh' as any;
  const PlaneGeo = 'planeGeometry' as any;
  return (
    <Mesh3D ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <PlaneGeo />
    </Mesh3D>
  );
};

// ─── HTML Overlay ─────────────────────────────────────────────────────────────
export const HeroFuturistic = () => {
  const titleWords = 'INVISIGUARD'.split('');
  const subtitle   = 'Behavioral fraud detection powered by AI.';

  const [visibleChars,    setVisibleChars]    = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays,          setDelays]          = useState<number[]>([]);
  const [subtitleDelay,   setSubtitleDelay]   = useState(0);

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.04));
    setSubtitleDelay(Math.random() * 0.08);
  }, []);

  useEffect(() => {
    if (visibleChars < titleWords.length) {
      const t = setTimeout(() => setVisibleChars(v => v + 1), 80);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setSubtitleVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [visibleChars, titleWords.length]);

  return (
    <div style={{ height: '100svh', position: 'relative', overflow: 'hidden' }}>
      {/* Text overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', padding: '0 2rem', textAlign: 'center',
      }}>
        {/* Title — character by character */}
        <div style={{
          fontSize: 'clamp(2.5rem, 10vw, 7rem)', fontWeight: 900,
          letterSpacing: '0.15em', fontFamily: 'Space Grotesk, sans-serif',
          display: 'flex', overflow: 'hidden',
        }}>
          {titleWords.map((char, i) => (
            <span key={i} style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #93C5FD 50%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              opacity: i < visibleChars ? 1 : 0,
              transform: i < visibleChars ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.4s ease ${i * 0.06 + (delays[i] || 0)}s, transform 0.4s ease ${i * 0.06 + (delays[i] || 0)}s`,
              filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.6))',
            }}>
              {char}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 'clamp(0.875rem, 2vw, 1.25rem)', fontWeight: 500,
          color: 'rgba(240,238,255,0.75)', marginTop: '1rem',
          fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em',
          opacity: subtitleVisible ? 1 : 0,
          transform: subtitleVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 0.6s ease ${subtitleDelay}s, transform 0.6s ease ${subtitleDelay}s`,
        }}>
          {subtitle}
        </div>

        {/* Scan line indicator */}
        <div style={{
          marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          opacity: subtitleVisible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.8s',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            System Active
          </span>
        </div>
      </div>

      {/* WebGL Canvas */}
      <Canvas
        flat
        gl={((props: any) => {
          const renderer = new (THREE as any).WebGPURenderer(props);
          renderer.init();
          return renderer;
        }) as any}
        style={{ position: 'absolute', inset: 0 }}
      >
        <PostProcessing fullScreenEffect={true} />
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroFuturistic;
