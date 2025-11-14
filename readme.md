
# 🌌 **Galaxy Generator (Three.js Journey Lesson)**



A parametric spiral-galaxy generator built using **Three.js**, **Vite**, and **lil-gui**, following Bruno Simon's _Three.js Journey_ course.
This project generates tens of thousands of stars using `THREE.BufferGeometry`, custom color interpolation, randomness, and mathematical patterns.

---

## 🚀 **What I Learned (Important Concepts)**

### **1. BufferGeometry — The Heart of Performance**

- Instead of creating thousands of `Mesh` objects, we store everything in **one** `BufferGeometry`.
- Positions for all stars are stored in **one long Float32Array**.
- Each point needs **3 values (x, y, z)**.
  Example for `count = 5`:

```
i: 0 → positions[0,1,2] = x0, y0, z0
i: 1 → positions[3,4,5] = x1, y1, z1
i: 2 → positions[6,7,8] = x2, y2, z2
...
```

Formula:

```
index = i * 3
positions[index + 0] = x
positions[index + 1] = y
positions[index + 2] = z
```

This pattern is critical for all particle systems.

---

### **2. Branching Structure (Galaxy Arms)**

Stars form spiral arms using:

```
branchAngle = (i % branches) / branches * 2π
```

- `% branches` groups stars into repeating arms
- Dividing & multiplying by `2π` gives their angle
- **This is what forms the iconic galaxy spiral shape**

---

### **3. Spin**

Creates spiral curvature:

```
spinAngle = radius * spin
```

- Farther stars spin more
- Closer stars spin less
- Negative spin inverts direction

---

### **4. Randomness (With Power Control)**

To avoid a “perfectly clean” computer-generated look:

```
randomX = (random^randomnessPower) * (±1)
```

- Low randomness → clean spiral
- High randomness → nebula-like clouds
- Higher power → points cluster near center

This is a beautiful technique you'll reuse for smoke, fireflies, dust, fog, etc.

---

### **5. Color Interpolation (Inside → Outside)**

Stars shift color based on distance from center:

```
colorInside.lerp(colorOutside, radius / maxRadius)
```

- Center: warm & bright
- Outer region: cold & darker

This technique = crucial for all gradients in 3D shaders.

---

### **6. Disposal Is Required**

When regenerating:

```js
geometry.dispose();
material.dispose();
scene.remove(points);
```

If you don't do this, memory leaks occur.
This is extremely important for procedural systems.

---

## 🎮 GUI Controls

You can interactively modify:

- Star count
- Point size
- Galaxy radius
- Branch count
- Spin intensity
- Randomness & randomness power
- Inside & outside colors

This makes experimenting fun and educational.

---

## 📄 Final Refactored Code (Clean + Commented)

> **Copy of the final implementation, reorganized and polished for readability & future reference.**

```js
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/* ------------------------------------------------
 * Debug GUI
 * ------------------------------------------------ */
const gui = new GUI();

/* ------------------------------------------------
 * Canvas & Scene
 * ------------------------------------------------ */
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

/* ------------------------------------------------
 * Parameters
 * ------------------------------------------------ */
const parameters = {
  count: 60000,
  size: 0.0016,
  radius: 8,
  branches: 4,
  spin: -1.4,
  randomness: 0.2,
  randomnessPower: 4,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

let geometry = null;
let material = null;
let points = null;

/* ------------------------------------------------
 * Galaxy Generator
 * ------------------------------------------------ */
const generateGalaxy = () => {
  // Clean up old galaxy (avoid memory leaks)
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  // Geometry
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position math
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    // Randomness
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? -1 : 1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? -1 : 1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? -1 : 1);

    positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color interpolation
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Material
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Points
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

/* ------------------------------------------------
 * GUI Controls
 * ------------------------------------------------ */
gui.add(parameters, "count", 100, 100000, 100).onFinishChange(generateGalaxy);
gui.add(parameters, "size", 0.001, 0.1, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius", 0.01, 20, 0.01).onFinishChange(generateGalaxy);
gui.add(parameters, "branches", 2, 20, 1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin", -5, 5, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomness", 0, 2, 0.001).onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomnessPower", 1, 10, 0.001)
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

/* ------------------------------------------------
 * Lights
 * ------------------------------------------------ */
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#ffffff", 1.5);
directionalLight.position.set(3, 2, -8);
scene.add(directionalLight);

/* ------------------------------------------------
 * Camera
 * ------------------------------------------------ */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 2, 5);
scene.add(camera);

/* ------------------------------------------------
 * Controls
 * ------------------------------------------------ */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/* ------------------------------------------------
 * Renderer
 * ------------------------------------------------ */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#000");

/* ------------------------------------------------
 * Responsive
 * ------------------------------------------------ */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});

/* ------------------------------------------------
 * Animation Loop
 * ------------------------------------------------ */
const clock = new THREE.Clock();

const tick = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();
```
## 🛠 How to Run
```bash
npm install
npm run dev
```

