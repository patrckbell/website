import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css';

let scene, camera, renderer;
let sphere1, sphere2, sphere3, sphere4, sphere5;
let angle = 0;
let mouseX = 0, mouseY = 0;
let mouseOver1 = false, mouseOver2 = false;
const titleElement = document.getElementById('title');

const video = document.getElementById('background_video');
const texture = new THREE.VideoTexture(video);

init();
animate();

function init() {
    video.play();
    // Create the scene
    scene = new THREE.Scene();
    scene.background = texture;

    // Create the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Create the renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create geometry and material for the spheres
    const geometry = new THREE.SphereGeometry(1, 5, 5);
    const geometry_sun = new THREE.SphereGeometry(6, 10, 10);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
    });
    const material_about = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    });
    const material_projects = new THREE.MeshBasicMaterial({
        color: 0x0066ff,
        wireframe: true
    });
    const material_competitions = new THREE.MeshBasicMaterial({
        color: 0xffb800,
        wireframe: true
    });
    const material_contact = new THREE.MeshBasicMaterial({
        color: 0xff5c00,
        wireframe: true
    });

    // Create the first sphere
    sphere1 = new THREE.Mesh(geometry, material_projects);
    sphere1.position.x = -2;
    scene.add(sphere1);

    // Create the second sphere
    sphere2 = new THREE.Mesh(geometry, material_about);
    sphere2.position.x = 2;
    scene.add(sphere2);

    // Third
    sphere3 = new THREE.Mesh(geometry_sun, material);
    sphere3.position.x = 0;
    scene.add(sphere3);

    sphere4 = new THREE.Mesh(geometry, material_competitions);
    sphere4.position.y = 2;
    scene.add(sphere4);

    sphere5 = new THREE.Mesh(geometry, material_contact);
    sphere5.position.y = -2;
    scene.add(sphere5);

    // const orbit1 = createOrbitPath(20, 0xff0000, -1);
    // scene.add(orbit1);

    // const orbit2 = createOrbitPath(20, 0x0066ff, 1);
    // scene.add(orbit2);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Handle mouse move
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}


function createOrbitPath(radius, col, neg) {
    const points = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        if (neg == -1) {
            points.push(new THREE.Vector3(neg*0.5*Math.cos(angle) * radius, neg*Math.sin(angle) * radius, 0));
        }
        else {
            points.push(new THREE.Vector3(neg*Math.cos(angle) * radius, 0.5*neg*Math.sin(angle) * radius, 0));
        }
        
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color: col,
        dashSize: 0.2,
        gapSize: 0.5
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();

    return line;
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate the spheres
    sphere1.rotation.x += 0.01;
    sphere1.rotation.y += 0.01;
    sphere2.rotation.x += 0.01;
    sphere2.rotation.y += 0.01;
    sphere4.rotation.x += 0.01;
    sphere4.rotation.y += 0.01;
    sphere5.rotation.x += 0.01;
    sphere5.rotation.y += 0.01;

    sphere3.rotation.y += 0.01;

    // Update the angle for orbiting
    angle += 0.01;

    // Calculate the new position of the sphere
    const radius = 20;
    sphere1.position.x = radius * Math.cos(angle);
    sphere1.position.y = radius * 0.5*Math.sin(angle);
    sphere2.position.x = -radius * 0.5*Math.cos(angle);
    sphere2.position.y = -radius * Math.sin(angle);

    sphere4.position.x = radius * 0.75*Math.cos(angle);
    sphere4.position.y = radius * 0.75*Math.sin(angle);
    sphere5.position.x = -radius * 0.75*Math.cos(angle);
    sphere5.position.y = -radius * 0.5*Math.sin(angle);

    // Update the scale based on hover state
    sphere1.scale.set(mouseOver1 ? 1.5 : 1, mouseOver1 ? 1.5 : 1, mouseOver1 ? 1.5 : 1);
    sphere2.scale.set(mouseOver2 ? 1.5 : 1, mouseOver2 ? 1.5 : 1, mouseOver2 ? 1.5 : 1);

    // Raycasting for hover detection
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5).unproject(camera);
    const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    const intersect1 = raycaster.intersectObject(sphere1);
    const intersect2 = raycaster.intersectObject(sphere2);

    mouseOver1 = intersect1.length > 0;
    mouseOver2 = intersect2.length > 0;

    // Position the title element
    const rect = renderer.domElement.getBoundingClientRect();
    if (mouseOver1) {
        const sphere1ScreenPosition = sphere1.position.clone().project(camera);
        const screenX = ((sphere1ScreenPosition.x + 1) / 2) * rect.width + rect.left;
        const screenY = ((-sphere1ScreenPosition.y + 1) / 2) * rect.height + rect.top;

        titleElement.style.display = 'block';
        titleElement.innerHTML = 'Projects/Competitions';
        titleElement.style.left = `${screenX}px`;
        titleElement.style.top = `${screenY - 20}px`; // Adjusted position to be above the element
    } else if (mouseOver2) {
        const sphere2ScreenPosition = sphere2.position.clone().project(camera);
        const screenX = ((sphere2ScreenPosition.x + 1) / 2) * rect.width + rect.left;
        const screenY = ((-sphere2ScreenPosition.y + 1) / 2) * rect.height + rect.top;

        titleElement.style.display = 'block';
        titleElement.innerHTML = 'About Me';
        titleElement.style.left = `${screenX}px`;
        titleElement.style.top = `${screenY - 20}px`; // Adjusted position to be above the element
    } else {
        titleElement.style.display = 'none';
    }

    // Render the scene
    renderer.render(scene, camera);
}
