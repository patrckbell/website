import * as THREE from './three/src/Three.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import TWEEN from './@tweenjs/tween.js';

let scene, camera, renderer, controls, effectComposer, customPass;
let sphere1, sphere2, sphere3, sphere4, sphere5;
let angle = 0;
let mouseX = 0, mouseY = 0;
let mouseOver1 = false, mouseOver2 = false, mouseOver4 = false, mouseOver5 = false;
let selectedSphere = null;
const titleElement = document.getElementById('title');
const infoElement = document.getElementById('info');

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  '/zpos.png',  // right
  '/zpos.png',   // left
  '/zpos.png',    // top
  '/zpos.png', // bottom
  '/zpos.png',  // front
  '/zpos.png'   // back
]);

const spheres = [];
let currentSphereIndex = -1;
const sphereData = {};

init();
animate();

function init() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = texture;

    // Create the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;

    // Create the renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create geometry and material for the spheres
    const geometry = new THREE.SphereGeometry(1, 8, 8);
    const geometry_sun = new THREE.SphereGeometry(6, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const material_about = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const material_projects = new THREE.MeshBasicMaterial({ color: 0x0066ff, wireframe: true });
    const material_competitions = new THREE.MeshBasicMaterial({ color: 0xffb800, wireframe: true });
    const material_contact = new THREE.MeshBasicMaterial({ color: 0xff5c00, wireframe: true });

    // Create the spheres
    sphere1 = new THREE.Mesh(geometry, material_projects);
    sphere1.position.x = -2;
    sphere1.userData = { 
        name: 'Projects', 
        info: 'Check out my projects to see what I’ve been working on and how I’ve learned along the way. Each entry reflects the challenges I’ve tackled and the skills I’ve developed. It’s a mix of successes and lessons, showing how my approach evolves with every new endeavor.' };
    scene.add(sphere1);
    spheres.push(sphere1);

    sphere2 = new THREE.Mesh(geometry, material_about);
    sphere2.position.x = 2;
    sphere2.userData = { 
        name: 'About Me', 
        info: "Hey! I’m Patrick, a mathematical physics student with a talent "
        + "for turning coffee into code. Care to learn more about my background "
        +  " passions, and hobbies? Click here to get to know me better!"};
    scene.add(sphere2);
    spheres.push(sphere2);

    sphere3 = new THREE.Mesh(geometry_sun, material);
    sphere3.position.x = 0;
    sphere3.userData = { 
        name: 'Sun', 
        info: 'Information about the sun.' };
    scene.add(sphere3);

    sphere4 = new THREE.Mesh(geometry, material_competitions);
    sphere4.position.y = 2;
    sphere4.userData = { 
        name: 'Competitions', 
        info: "Here’s a snapshot of my competition history where I’ve put my skills "
        + "to the test and sometimes come out with a story to tell. Each entry highlights "
        + "key moments and achievements from various contests, showcasing how I handle "
        + "challenges and strive for results under pressure. Dive in to see where I’ve made "
        + "an impact and learned a few lessons along the way." };
    scene.add(sphere4);
    spheres.push(sphere4);

    sphere5 = new THREE.Mesh(geometry, material_contact);
    sphere5.position.y = -2;
    sphere5.userData = { 
        name: 'Contact', 
        info: "Looking to see more of my work or get details on specific projects? This is where "
        + "you can reach out for additional information or access to my portfolio. If you’re "
        + "interested in diving deeper into what I do, just drop a message, and I’ll be happy to "
        + "share more." };
    scene.add(sphere5);
    spheres.push(sphere5);

    // Add OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;

    // Handle mouse events
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentMouseClick, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentMouseClick(event) {
    if (selectedSphere) return;

    const vector = new THREE.Vector3(mouseX, mouseY, 0.5).unproject(camera);
    const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        selectedSphere = intersects[0].object;
        if(selectedSphere != sphere3){
            currentSphereIndex = spheres.indexOf(selectedSphere);
            const sphereData = selectedSphere.userData;

            document.removeEventListener('mousemove', onDocumentMouseMove, false);

            // Animate zoom in on the selected sphere
            new TWEEN.Tween(camera.position)
                .to({ x: selectedSphere.position.x, y: selectedSphere.position.y, z: selectedSphere.position.z + 5 }, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

            new TWEEN.Tween(controls.target)
                .to({ x: selectedSphere.position.x, y: selectedSphere.position.y, z: selectedSphere.position.z }, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

            controls.update();

            // Display the info box
            const sphereId = Object.keys(sphereData).find(id => sphereData[id] === selectedSphere.userData);
            const sphereInfo = sphereId ? sphereData[sphereId] : sphereData;

            infoElement.style.display = 'block';
            infoElement.innerHTML = `
            <h2>${sphereInfo.name}</h2>
            <p>${sphereInfo.info}</p>
            <button id="moreBtn" class="${sphereInfo.name}">See More</button>
            <div id="buttonbox"></div>
            <button id="prevBtn">Previous</button>
            <button id="nextBtn">Next</button>
            `;
            
            document.getElementById('prevBtn').addEventListener('click', showPreviousSphere);
            document.getElementById('nextBtn').addEventListener('click', showNextSphere);
            
            const moreBtn = document.getElementById('moreBtn');
            moreBtn.addEventListener('click', function() {
                if (moreBtn.classList.contains("About")) {
                    window.location.href = 'about.html';
                }
                if (moreBtn.classList.contains("Contact")) {
                    window.location.href = 'contact.html';
                }
                if (moreBtn.classList.contains("Projects")) {
                    window.location.href = 'projects.html';
                }
                if (moreBtn.classList.contains("Competitions")) {
                    window.location.href = 'competitons.html';
                }
            });
        
        }
    }
}

function onDocumentKeyDown(event) {
    if (event.key === 'Escape' && selectedSphere) {
        // Animate camera zoom out
        new TWEEN.Tween(camera.position)
            .to({ x: 0, y: 0, z: 50 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        new TWEEN.Tween(controls.target)
            .to({ x: 0, y: 0, z: 0 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        controls.update();

        // Hide the info box
        infoElement.style.display = 'none';

        document.addEventListener('mousemove', onDocumentMouseMove, false);

        selectedSphere = null;
        currentSphereIndex = -1;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function showNextSphere() {
    if (currentSphereIndex === -1) return;
    currentSphereIndex = (currentSphereIndex + 1) % spheres.length;
    selectedSphere = spheres[currentSphereIndex];
    updateView();
}

function showPreviousSphere() {
    if (currentSphereIndex === -1) return;
    currentSphereIndex = (currentSphereIndex - 1 + spheres.length) % spheres.length;
    selectedSphere = spheres[currentSphereIndex];
    updateView();
}

function updateView() {
    const sphereData = selectedSphere.userData;

    // Animate zoom in on the selected sphere
    new TWEEN.Tween(camera.position)
        .to({ x: selectedSphere.position.x, y: selectedSphere.position.y, z: selectedSphere.position.z + 5 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    new TWEEN.Tween(controls.target)
        .to({ x: selectedSphere.position.x, y: selectedSphere.position.y, z: selectedSphere.position.z }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    controls.update();

    // Update the info box
    const sphereId = Object.keys(sphereData).find(id => sphereData[id] === selectedSphere.userData);
    const sphereInfo = sphereId ? sphereData[sphereId] : sphereData;

    infoElement.innerHTML = `
    <h2>${sphereInfo.name}</h2>
    <p>${sphereInfo.info}</p>
    <button id="moreBtn" class="${sphereInfo.name}">See More</button>
    <div id="buttonbox"></div>
    <button id="prevBtn">Previous</button>
    <button id="nextBtn">Next</button>
    `;
    
    document.getElementById('prevBtn').addEventListener('click', showPreviousSphere);
    document.getElementById('nextBtn').addEventListener('click', showNextSphere);
    
    const moreBtn = document.getElementById('moreBtn');
    moreBtn.addEventListener('click', function() {
        if (moreBtn.classList.contains("About")) {
            window.location.href = 'about.html';
        }
        if (moreBtn.classList.contains("Contact")) {
            window.location.href = 'contact.html';
        }
        if (moreBtn.classList.contains("Projects")) {
            window.location.href = 'projects.html';
        }
        if (moreBtn.classList.contains("Competitions")) {
            window.location.href = 'competitons.html';
        }
    });

}

function animate() {
    requestAnimationFrame(animate);

    TWEEN.update();  // Ensure TWEEN animations are updated

    const offset = -2

    if (selectedSphere) {
        camera.position.set(selectedSphere.position.x - offset, selectedSphere.position.y, selectedSphere.position.z + 5);
        controls.target.set(selectedSphere.position.x - offset, selectedSphere.position.y, selectedSphere.position.z);
        controls.update();
        titleElement.style.display = 'none';
    }

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
    sphere1.position.y = radius * 0.5 * Math.sin(angle);
    sphere2.position.x = -radius * 0.5 * Math.cos(angle);
    sphere2.position.y = -radius * Math.sin(angle);

    sphere4.position.x = radius * 0.75 * Math.cos(angle);
    sphere4.position.y = radius * 0.75 * Math.sin(angle);
    sphere5.position.x = -radius * 0.75 * Math.cos(angle);
    sphere5.position.y = -radius * 0.5 * Math.sin(angle);

    // Raycasting for hover detection
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5).unproject(camera);
    const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    const intersect1 = raycaster.intersectObject(sphere1);
    const intersect2 = raycaster.intersectObject(sphere2);
    const intersect4 = raycaster.intersectObject(sphere4);
    const intersect5 = raycaster.intersectObject(sphere5);

    mouseOver1 = intersect1.length > 0;
    mouseOver2 = intersect2.length > 0;
    mouseOver4 = intersect4.length > 0;
    mouseOver5 = intersect5.length > 0;

    // Position the title element
    const rect = renderer.domElement.getBoundingClientRect();
    if(!selectedSphere){
        sphere1.scale.set(mouseOver1 ? 1.5 : 1, mouseOver1 ? 1.5 : 1, mouseOver1 ? 1.5 : 1);
        sphere2.scale.set(mouseOver2 ? 1.5 : 1, mouseOver2 ? 1.5 : 1, mouseOver2 ? 1.5 : 1);
        sphere4.scale.set(mouseOver4 ? 1.5 : 1, mouseOver4 ? 1.5 : 1, mouseOver4 ? 1.5 : 1);
        sphere5.scale.set(mouseOver5 ? 1.5 : 1, mouseOver5 ? 1.5 : 1, mouseOver5 ? 1.5 : 1);
        if (mouseOver1) {
            const sphere1ScreenPosition = sphere1.position.clone().project(camera);
            const screenX = ((sphere1ScreenPosition.x + 1) / 2) * rect.width + rect.left;
            const screenY = ((-sphere1ScreenPosition.y + 1) / 2) * rect.height + rect.top;

            titleElement.style.display = 'block';
            titleElement.innerHTML = 'Projects';
            titleElement.style.left = `${screenX + 12}px`;
            titleElement.style.top = `${screenY - 20}px`; // Adjusted position to be above the element
            titleElement.style.color = `#0066ff`;
        } else if (mouseOver2) {
            const sphere2ScreenPosition = sphere2.position.clone().project(camera);
            const screenX = ((sphere2ScreenPosition.x + 1) / 2) * rect.width + rect.left;
            const screenY = ((-sphere2ScreenPosition.y + 1) / 2) * rect.height + rect.top;

            titleElement.style.display = 'block';
            titleElement.innerHTML = 'About Me';
            titleElement.style.left = `${screenX+12}px`;
            titleElement.style.top = `${screenY - 20}px`; // Adjusted position to be above the element
            titleElement.style.color = `#ff0000`;
        } else if (mouseOver4) {
            const sphere4ScreenPosition = sphere4.position.clone().project(camera);
            const screenX = ((sphere4ScreenPosition.x + 1) / 2) * rect.width + rect.left;
            const screenY = ((-sphere4ScreenPosition.y + 1) / 2) * rect.height + rect.top;

            titleElement.style.display = 'block';
            titleElement.innerHTML = 'Competitions';
            titleElement.style.left = `${screenX+12}px`;
            titleElement.style.top = `${screenY - 20}px`; // Adjusted position to be above the element
            titleElement.style.color = `#ffb800`;
        } else if (mouseOver5) {
            const sphere5ScreenPosition = sphere5.position.clone().project(camera);
            const screenX = ((sphere5ScreenPosition.x + 1) / 2) * rect.width + rect.left;
            const screenY = ((-sphere5ScreenPosition.y + 1) / 2) * rect.height + rect.top;

            titleElement.style.display = 'block';
            titleElement.innerHTML = 'Contact';
            titleElement.style.left = `${screenX+12}px`;
            titleElement.style.top = `${screenY - 20}px`; // Adjusted position to be above the element
            titleElement.style.color = `#ff5c00`;
        } else {
            titleElement.style.display = 'none';
        }
    }
    // Render the scene
    renderer.render(scene, camera);
}
