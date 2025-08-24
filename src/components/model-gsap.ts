import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ModelViewerOptions } from './types';

gsap.registerPlugin(ScrollTrigger);


let hudText: HTMLSpanElement;
let hud: HTMLDivElement;

function initHUD(container: HTMLElement, logs: string[]) {
  hud = document.createElement('div');
  hud.style.cssText = 'position:absolute;top:8px;left:8px;background:rgba(0,0,0,.7);color:#0f0;font:12px monospace;padding:6px 8px;border-radius:4px;z-index:10;';
  const btn = document.createElement('button');
  btn.textContent = 'Download Logs';
  btn.style.cssText = 'margin-left:8px;padding:2px 6px;font:12px monospace;';
  const hudBar = document.createElement('div');
  hudBar.style.cssText = 'display:flex;align-items:center;';
  hudText = document.createElement('span');
  hudBar.appendChild(hudText);
  hudBar.appendChild(btn);
  hud.appendChild(hudBar);
  container.appendChild(hud);

  btn.onclick = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `glb-viewer-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
}

function setHUD(o: { prog?: number; scrollY?: number; active?: boolean; dir?: number; stuck?: boolean; x?: number }) {
  if (hudText) {
    hudText.textContent = `prog:${o.prog?.toFixed(3)} | y:${o.scrollY} | active:${o.active} | dir:${o.dir} | stuck:${o.stuck} | x:${o.x?.toFixed?.(3)}`;
  }
}

export function initViewer(
  containerId: string,
  modelPath: string,
  opts: ModelViewerOptions = {}
): () => void {
    const {
        pin = true,
        debugMarkers = true,
        endScroll = 3000,
        showHelpers = true,
        desiredSize = 2.0,
        padding = 1.25,
        cameraDistanceMul = 1.8,
        startX = -2,
        endX = 2,
        forcePinType = null,
        watchdogMs = 120,
        recenter = true,
    } = opts;

    const logs: string[] = [];
    const t0 = performance.now();
    const log = (msg: string, obj?: unknown) => {
        const line = `[glb-viewer +${(performance.now()-t0).toFixed(1)}ms] ${msg} ${obj ? JSON.stringify(obj) : ""}`;
        console.log(line);
        logs.push(line);
    };

        const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[glb-viewer] #${containerId} not found`);
        return () => {};
    }
    if (container.clientHeight < 50) {
        container.style.height = '100vh';
        log('container height < 50px; forcing 100vh');
    }
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    initHUD(container, logs);

    const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera(3, container.clientWidth / container.clientHeight, 0.01, 5000);

    const aspect = container.clientWidth / container.clientHeight;
const frustumSize = 250; // Adjust for your scene scale
const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2, // left
  frustumSize * aspect / 2,  // right
  frustumSize / 2,           // top
  -frustumSize / 2,          // bottom
  0.01,                      // near
  5000                       // far
);

    camera.position.set(-500,500,500);
  
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
  
    if (showHelpers) {
    const axes = new THREE.AxesHelper(100);
    axes.position.y = -1;
    scene.add(axes);
    const grid = new THREE.GridHelper(20, 20);
    grid.position.y = -1;
    scene.add(grid);
    }
    
    const root = new THREE.Group();
    scene.add(root);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.1);
    hemi.position.set(0, 2, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(3, 5, 4);
    dir.castShadow = true;
    scene.add(dir);
    
    

    const camTarget = new THREE.Vector3(-10, 70, 10);

    function render() {
        camera.lookAt(camTarget);
        renderer.render(scene, camera);
    }

    root.position.set(0, 0, 0);

    // Load GLB
    const loader = new GLTFLoader();
    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene || gltf.scenes?.[0];
            if (!model) {
                log('GLTF has no scene, abort');
                return;
            }

      model.traverse((o: THREE.Object3D) => {
            if ((o as THREE.Mesh).isMesh) {
                const mesh = o as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                // keep original material (optional) so you can restore or dispose later
                mesh.userData._origMaterial = mesh.material;

                // render the mesh into the depth buffer only (no color) so edges get occluded correctly
                // use colorWrite=false + depthWrite=true to guarantee depth-only pass
                const depthOnly = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                colorWrite: false,   // don't write color
                depthWrite: true,    // do write depth
                transparent: false,
                side: THREE.DoubleSide
                });
                mesh.material = depthOnly;

                // create edges geometry that only includes "visible" silhouette/feature edges
                // thresholdAngle controls which edges are included (15° here)
                const thresholdAngle = 15 * Math.PI / 180;
                const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
                const edgeMat = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1,
                depthTest: true,   
                depthWrite: false  
                });
                const edges = new THREE.LineSegments(edgesGeo, edgeMat);

                // ensure lines render after the depth-only surface has written depth
                edges.renderOrder = 999;
                edges.frustumCulled = false;

                // attach edges to the mesh so they follow transforms
                mesh.add(edges);
            }
            });


            root.add(model);

            render();

            log('GLB loaded', { children: (model as THREE.Group).children?.length || 0 });
        },
        (xhr: ProgressEvent<EventTarget>) => {
            const loaded = (xhr as any).loaded;
            const total = (xhr as any).total;
            const pct = total ? (loaded / total * 100).toFixed(1) : '—';
            log('GLB loading', { loaded, total, pct });
        },
        (err: unknown) => {
            console.error(err);
            log('GLB error', { message: String(err) });
        }
    );
      const mapX = gsap.utils.mapRange(0, 1, startX, endX);
  const toX = gsap.quickSetter(camera.position, 'x');
  let lastProg = 0;
  let lastActive = false;
  let lastUpdateTs = performance.now();
  let stuck = false;

  const stVars: Record<string, any> = {
    id: 'glbST',
    trigger: container,
    start: 'top top',
    end: `+=${endScroll}`,
    scrub: true,
    pin,
    pinSpacing: true,
    pinReparent: true,
    markers: debugMarkers,
    anticipatePin: 1,
    invalidateOnRefresh: false,
    onUpdate: (self: any) => {
      const x = mapX(self.progress);
      toX(x);
      render();
      lastActive = self.isActive;
      lastProg = self.progress;
      lastUpdateTs = performance.now();
    //   setHUD({ prog: self.progress, scrollY: getScrollY(), active: self.isActive, dir: self.direction, stuck, x });
      log('ST onUpdate', { prog: self.progress, x, dir: self.direction, active: self.isActive });
    },
    onLeave: (self: any) => {
      toX(endX);
      render();
      log('ST onLeave -> lock end', { prog: self.progress });
    },
    onEnterBack: (self: any) => {
      toX(startX);
      render();
      log('ST onEnterBack -> lock start', { prog: self.progress });
    },
    onToggle: (self: any) => { log('ST onToggle', { active: self.isActive }); },
    onRefreshInit: () => log('ST refreshInit'),
    onRefresh: () => log('ST refresh'),
    onKill: () => log('ST kill'),
    onScrubComplete: () => log('ST scrubComplete')
  };
  if (forcePinType) stVars.pinType = forcePinType;

//   const st = ScrollTrigger.create(stVars);

//   ScrollTrigger.addEventListener('scrollEnd', () => {
//     const prog = st.progress;
//     if (prog >= 1) {
//       toX(endX);
//       render();
//       log('scrollEnd -> enforce end', { prog });
//     } else if (prog <= 0) {
//       toX(startX);
//       render();
//       log('scrollEnd -> enforce start', { prog });
//     } else {
//       log('scrollEnd mid', { prog });
//     }
//   });

//   const getScrollY = (): number =>
//     window.pageYOffset ||
//     document.documentElement.scrollTop ||
//     document.body.scrollTop || 0;

//   // Watchdog
//   let lastScrollY = getScrollY();
//   function watchdog() {
//     const y = getScrollY();
//     const now = performance.now();

//     if (y !== lastScrollY) {
//       if (now - lastUpdateTs > watchdogMs) {
//         stuck = true;
//         log('WATCHDOG kick: ST stale, forcing update', { y, prog: st.progress });
//         ScrollTrigger.update();

//         requestAnimationFrame(() => {
//           if (performance.now() - lastUpdateTs > watchdogMs) {
//             log('WATCHDOG hard refresh');
//             ScrollTrigger.refresh();
//             const p = st.progress;
//             const x = mapX(p);
//             toX(x);
//             render();
//             log('WATCHDOG enforced', { p, x });
//           } else {
//             stuck = false;
//           }
//         });
//       } else {
//         stuck = false;
//       }
//     }

//     lastScrollY = y;
//     setHUD({ prog: st.progress, scrollY: y, active: lastActive, dir: 0, stuck, x: root.position.x });
//     requestAnimationFrame(watchdog);
//   }
//   requestAnimationFrame(watchdog);

//   // Wake ST on any user intent
//   const wake = () => { log('wake'); ScrollTrigger.update(); };
//   window.addEventListener('scroll', wake, { passive: true });
//   window.addEventListener('wheel', wake, { passive: true });
//   window.addEventListener('touchmove', wake, { passive: true });
//   window.addEventListener('keydown', wake, { passive: true });

//   // RAF
//   function animate() {
//     requestAnimationFrame(animate);
//     render();
//   }
//   animate();

  return () => {
    //   window.removeEventListener('scroll', wake);
    //   window.removeEventListener('wheel', wake);
    //   window.removeEventListener('touchmove', wake);
    //   window.removeEventListener('keydown', wake);
      ScrollTrigger.getAll().forEach((t: any) => t.kill());
  
      root.traverse((o: THREE.Object3D) => {
        // dispose Mesh geometry/materials
        if ((o as THREE.Mesh).isMesh) {
          (o as THREE.Mesh).geometry?.dispose?.();
          const m = (o as THREE.Mesh).material;
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose?.());
          else m?.dispose?.();
        }

        // dispose LineSegments (edge overlays)
        if ((o as THREE.LineSegments).isLineSegments) {
          (o as THREE.LineSegments).geometry?.dispose?.();
        }
      });
  
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      if (hud.parentNode === container) container.removeChild(hud);
      log('viewer disposed');
    };
}

