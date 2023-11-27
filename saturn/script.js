/**
 * @file
 * The main scene.
 */

/**
 * Define constants.
 */
const TEXTURE_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123879/';

/**
 * Set our global variables.
 */
var camera,
    scene,
    renderer,
    effect,
    controls,
    element,
    container,
    sphere,
    sphereCloud,
    rotationPoint;
var enceladusRotationPoint;
var rheaRotationPoint;
var titanRotationPoint;
var saturnX = 3500;
var saturnY = 0;
var saturnZ = -3500;
var degreeOffset = 90;
var enceladusRadius = 80;
var textureFlare0;
var textureFlare2;
var textureFlare3;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

init();
animate(); 

/**
 * Initializer function.
 */
function init() {
  // Build the container
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // Create the scene.
  scene = new THREE.Scene();

  // Create a rotation point.
  saturnRotationPoint = new THREE.Object3D();
  saturnRotationPoint.position.set( saturnX, saturnY, saturnZ ); 
  scene.add( saturnRotationPoint );
  
  // Create the Enceladus rotation point.
  enceladusRotationPoint = new THREE.Object3D();
  enceladusRotationPoint.position.set( saturnX, saturnY, saturnZ );
  scene.add( enceladusRotationPoint );
  
  // Create world rotation point. Helps the camera focus on the moon.
  worldRotationPoint = new THREE.Object3D();
  worldRotationPoint.position.set( saturnX * -1, saturnY * -1, saturnZ * -1 );
  enceladusRotationPoint.add( worldRotationPoint );

  rotationPoint = new THREE.Object3D();
  rotationPoint.position.set( 0, 0, enceladusRadius * 9 );
  worldRotationPoint.add( rotationPoint );

  // Create the camera.
  camera = new THREE.PerspectiveCamera(
   45, // Angle
    window.innerWidth / window.innerHeight, // Aspect Ratio.
    1, // Near view.
    23000 // Far view.
  );
  rotationPoint.add( camera );

  // Build the renderer.
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  element = renderer.domElement;
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled;
  container.appendChild( element );

  // Build the controls.
  controls = new THREE.OrbitControls( camera, element );
  controls.enablePan = true;
  controls.enableZoom = true; 
  controls.maxDistance = 4000; //enceladusRadius * 14;
  controls.minDistance = enceladusRadius * 2;
  controls.target.copy( new THREE.Vector3( 0, 0, -1 * enceladusRadius * 9 ));

  function setOrientationControls(e) {
    if (!e.alpha) {
     return;
    }

    controls = new THREE.DeviceOrientationControls( camera );
    controls.connect();

    window.removeEventListener('deviceorientation', setOrientationControls, true);
  }
  window.addEventListener('deviceorientation', setOrientationControls, true);

  // Ambient lights
  var ambient = new THREE.AmbientLight( 0x222222 );
  scene.add( ambient );

  // The sun.
  var light = new THREE.PointLight( 0xffffff, 1, 10000, 0 );
  light.position.set( -8000, 0, 0 );
  scene.add( light );

  // Add the Enceladus sphere model.
  var geometry = new THREE.SphereGeometry( enceladusRadius, 128, 128 );

  // Create materials for Enceladus. 
  loader = new THREE.TextureLoader();
  loader.setCrossOrigin( 'https://s.codepen.io' );
  var texture = loader.load( TEXTURE_PATH + 'enceladus_large.jpg' );

  var bump = null;
  bump = loader.load( TEXTURE_PATH + 'enceladus_bump.jpg' );

  var material = new THREE.MeshPhongMaterial({
    color: "#ffffff",
    shininess: 10,
    map: texture,
    specular: "#000000",
    bumpMap: bump,
  });

  sphere = new THREE.Mesh( geometry, material );
  sphere.position.set( 0, 0, 0 );
  sphere.rotation.y = Math.PI;

  // Focus initially on the prime meridian.
  sphere.rotation.y = -1 * (8.7 * Math.PI / 17);

  // Add the Earth to the scene.
  worldRotationPoint.add( sphere );

  // Add the skymap.
  addSkybox();
  
  // Add Saturn.
  addSaturn();
  
  // Add the sun.
  createSun();
  
  // Create a lensflare effect.
  createLensflare();
  
  /*// Add Titan and create a rotation point.
  titanRotationPoint = new THREE.Object3D();
  titanRotationPoint.position.set( saturnX, saturnY, saturnZ );
  scene.add( titanRotationPoint );
  createMoon( titanRotationPoint, 200, 0, 0, -8500, 'titan.jpg' );
  
  // Add Rhea and create a rotation point.
  rheaRotationPoint = new THREE.Object3D();
  rheaRotationPoint.position.set( saturnX, saturnY, saturnZ );
  scene.add( rheaRotationPoint );
  createMoon( rheaRotationPoint, 130, -1000, 0, 7500 );*/

  window.addEventListener('resize', onWindowResize, false);
}

/**
 * Events to fire upon window resizing.
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Add the sun to the scene.
 */
function createSun() {
  // Add the Sun sphere model.
  var sunGeometry = new THREE.SphereGeometry( 100, 16, 16 );

  // Create the Sun materials.
  var sunMaterial = new THREE.MeshLambertMaterial({
    color: '#ffff55',
    emissive: '#ffff55',
  });

  sun = new THREE.Mesh( sunGeometry, sunMaterial );
  sun.castShadow = false;
  sun.receiveShadow = false;
  sun.position.set( -11600, 0, 0 );
  sun.rotation.y = Math.PI;

  // Add the Sun to the scene.
  scene.add( sun );
}

/**
 * Updates to apply to the scene while running.
 */
function update() {
  camera.updateProjectionMatrix();
  
  // Rotate the camera around the moon.
  worldRotationPoint.rotation.y -= 0.00025;
  
  // Rotate the moon around Saturn.
  enceladusRotationPoint.rotation.y -= 0.00025;
  
  // Rotate the moon Titan.
  sphere.rotation.y -= 0.00015;
  
  // Rotate the moon Rhea.
  //rheaRotationPoint.rotation.y -= 0.00020;
  
  // Rotate titan.
  //titanRotationPoint.rotation.y -= 0.00015;
}

/**
 * Render the scene.
 */
function render() {
  renderer.render(scene, camera);
}

/**
 * Animate the scene.
 */
function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}

/**
 * Add the skybox, the stars wrapper.
 */
function addSkybox() {
  var urlPrefix = TEXTURE_PATH;
  var urls = [
    urlPrefix + 'test.jpg',
    urlPrefix + 'test.jpg',
    urlPrefix + 'test.jpg',
    urlPrefix + 'test.jpg',
    urlPrefix + 'test.jpg',
    urlPrefix + 'test.jpg',
  ];

  var loader = new THREE.CubeTextureLoader();
  loader.setCrossOrigin( 'https://s.codepen.io' );
  
  var textureCube = loader.load( urls );
  textureCube.format = THREE.RGBFormat;

  var shader = THREE.ShaderLib[ "cube" ];
  shader.uniforms[ "tCube" ].value = textureCube;

  var material = new THREE.ShaderMaterial( {
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
  } );

  var geometry = new THREE.BoxGeometry( 20000, 20000, 20000 );

  var skybox = new THREE.Mesh( geometry, material );
  //skybox.position.x = -30;

  scene.add( skybox );
}

/**
 * Add Saturn to the scene.
 */
function addSaturn() {
  // Set Saturn's radius.
  var saturnRadius = 1500;
  
  // Add the Saturn sphere model.
  var saturnGeometry = new THREE.SphereGeometry( saturnRadius, 32, 32 );

  // Create the Saturn materials. 
  loader = new THREE.TextureLoader();
  loader.setCrossOrigin( 'https://s.codepen.io' );
  var texture = loader.load( TEXTURE_PATH + 'saturn.jpg' );
  
  var saturnMaterial = new THREE.MeshLambertMaterial({
    color: '#ffffff',
    map: texture,
  });

  saturn = new THREE.Mesh( saturnGeometry, saturnMaterial );
  saturn.castShadow = false;
  saturn.receiveShadow = false;
  saturn.position.set( 0, 0, 0 );
  saturn.rotation.z = Math.PI/8;

  // Add Saturn to the scene.
  saturnRotationPoint.add( saturn );
  
  // Lets create the rings! 
  // Used this project for reference: https://github.com/owntheweb/cosmic-cruise
  loader = new THREE.TextureLoader();
  loader.setCrossOrigin( 'https://s.codepen.io' );
  var ringTexture = loader.load( TEXTURE_PATH + 'saturnrings.png' );
  
  var ringGeometry = new THREE.XRingGeometry(1.4 * saturnRadius, 2.5 * saturnRadius, 2 * 32, 5, 0, Math.PI * 2);
  var ringMaterial = new THREE.MeshBasicMaterial({
			map: ringTexture,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.7,
  });
  
  var ring = new THREE.Mesh( ringGeometry, ringMaterial );
  
  // Add the ring to the scene.
  saturn.add( ring );
}

/**
 * Create the lens flare effect.
 * 
 * Code from https://threejs.org/examples/webgl_lensflares.html
 */
function createLensflare() {
  var textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin( 'https://s.codepen.io' );
  textureFlare0 = textureLoader.load( TEXTURE_PATH + "sun.png" );
  textureFlare2 = textureLoader.load( TEXTURE_PATH + "lensflare2.png" );
  textureFlare3 = textureLoader.load( TEXTURE_PATH + "lensflare3.png" );

  addLight( 0.55, 0.9, 0.5, -11400, 100, 0 );  
}

/**
 * Add the lens flare to the scene.
 * 
 * Code from https://threejs.org/examples/webgl_lensflares.html
 */
function addLight( h, s, l, x, y, z ) {
  var flareColor = new THREE.Color( 0xffffff );
  flareColor.setHSL( h, s, l + 0.5 );

  var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

  lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
  lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
  lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
  lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

  lensFlare.customUpdateCallback = lensFlareUpdateCallback;
  lensFlare.position.set( x, y, z );

  scene.add( lensFlare );
}

/**
 * Update the lens flare.
 * 
 * Code from https://threejs.org/examples/webgl_lensflares.html
 */
function lensFlareUpdateCallback( object ) {
  var f, fl = object.lensFlares.length;
  var flare;
  var vecX = -object.positionScreen.x * 2;
  var vecY = -object.positionScreen.y * 2;

  for( f = 0; f < fl; f++ ) {
    flare = object.lensFlares[ f ];
    flare.x = object.positionScreen.x + vecX * flare.distance;
    flare.y = object.positionScreen.y + vecY * flare.distance;
    flare.rotation = 0;
  }

  object.lensFlares[ 2 ].y += 0.025;
  object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
}

/**
 * Build a moon.
 *
 * @params
 * moonRotationPoint 3dObject
 *  The rotation object the moon will be based from.
 * radius int
 *  The radius of the moon.
 * x int
 *  The X position of the moon based off of rotation point.
 * y int
 *  The X position of the moon based off of rotation point.
 * z int
 *  The Z position of the moon based off of rotation point.
 * image string
 *  The name of the image to use as a texture.
 * bump string
 *  The name of the bump map to use.
 */
function createMoon(moonRotationPoint, radius, x, y, z, image = null, bump = null) { 
   // Set Saturn's radius.
  var moonRadius = radius;
  
  // Add the Saturn sphere model.
  var moonGeometry = new THREE.SphereGeometry( moonRadius, 32, 32 );
  
  var color = '#ffffff';
  
  // Create the Saturn materials.
  if (image != null) {
    loader = new THREE.TextureLoader();
    loader.setCrossOrigin( 'https://s.codepen.io' );
    var texture = loader.load( TEXTURE_PATH + image );
  }
  else {
    texture = null;
    color = '#dddddd';
  }
  var moonMaterial = new THREE.MeshLambertMaterial({
    color: '#ffffff',
    map: texture,
  });

  moon = new THREE.Mesh( moonGeometry, moonMaterial );
  moon.castShadow = false;
  moon.receiveShadow = false;
  moon.position.set( x, y, z );

  // Add Saturn to the scene.
  moonRotationPoint.add( moon );
}



function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}