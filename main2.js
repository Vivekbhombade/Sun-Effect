function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;  // Enable physically correct lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping;  // Use ACES tone mapping
    renderer.outputEncoding = THREE.sRGBEncoding;  // Ensure correct color space
  
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 5, 20);
  
    const scene = new THREE.Scene();
  
    // Physical material for the cube
    const cubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x44aa88,
      roughness: 0.2,
      metalness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.5,
    });
  
    // Create the cube
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = false;
    cube.position.set(0, 1, 0);
    scene.add(cube);
  
    // Create a ground plane
    const planeGeometry = new THREE.PlaneGeometry(40, 40);
    const planeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x00808080 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    scene.add(plane);
  
    // Add a directional light
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
  
    // Fixed intensity point lights
    const pointLight1 = new THREE.PointLight(0x00ff00, 0, 50);  // Green light initially off
    const pointLight2 = new THREE.PointLight(0xff0000, 0, 50);  // Red light initially off
  
    let isMousePressed = false;  // Track when the mouse is pressed
    let activePoint = null;  // Track which point is being moved
  
    // Create point 1 (left of the cube)
    const point1Geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const point1Material = new THREE.MeshPhysicalMaterial({ color: 0x00ff00 });
    const point1 = new THREE.Mesh(point1Geometry, point1Material);
    point1.position.set(-9, 1, 0);
    scene.add(point1);
    pointLight1.position.copy(point1.position);  // Position light at point1's initial position
    scene.add(pointLight1);  // Add the green light to the scene
  
    // Create point 2 (right of the cube)
    const point2Geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const point2Material = new THREE.MeshPhysicalMaterial({ color: 0xff0000 });
    const point2 = new THREE.Mesh(point2Geometry, point2Material);
    point2.position.set(9, 1, 0);
    scene.add(point2);
    pointLight2.position.copy(point2.position);  // Position light at point2's initial position
    scene.add(pointLight2);  // Add the red light to the scene
  
    // Add raycaster for detecting clicks on the points
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
  
    function onMouseMove(event) {
      if (isMousePressed && activePoint) {
        // Convert mouse position to normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        // Project the mouse coordinates into 3D space using the camera and raycaster
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(plane);  // Project onto the ground plane
  
        if (intersects.length > 0) {
          const intersectPoint = intersects[0].point;
  
          // Set the new position of the active point
          activePoint.position.set(intersectPoint.x, intersectPoint.y, intersectPoint.z);
  
          // Update the corresponding light's position based on the active point's new position
          if (activePoint === point1) {
            pointLight1.position.copy(activePoint.position);  // Light follows point1
          } else if (activePoint === point2) {
            pointLight2.position.copy(activePoint.position);  // Light follows point2
          }
        }
      }
    }
  
    function onMouseDown(event) {
      isMousePressed = true;  // Set the flag to indicate the mouse is pressed
  
      // Convert mouse position to normalized device coordinates (-1 to +1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
      // Update the raycaster with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);
  
      // Check if the raycaster intersects with the points
      const intersects = raycaster.intersectObjects([point1, point2]);
  
      if (intersects.length > 0) {
        const clickedPoint = intersects[0].object;
        activePoint = clickedPoint;  // Set the active point that will move
  
        // Turn on the light when the point is clicked
        if (clickedPoint === point1) {
          pointLight1.intensity = 20;  // Turn on the green light
        } else if (clickedPoint === point2) {
          pointLight2.intensity = 20;  // Turn on the red light
        }
      }
    }
  
    function onMouseUp() {
      isMousePressed = false;  // Reset the flag when the mouse is released
      activePoint = null;  // Stop moving any point after releasing the mouse
  
      // Turn off the lights when the mouse is released
      pointLight1.intensity = 0;
      pointLight2.intensity = 0;
    }
  
    // Attach the event listeners for mouse movements and clicks
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
  
    // Render loop
    function render() {
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
  
    requestAnimationFrame(render);
  }
  
  main();
  