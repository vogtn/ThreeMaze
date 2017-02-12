//defining global vars

var width = window.innerWidth,
var height = window.innerHeight,
var aspect = width/height,
var unitsize = 250,
var wallheight = unitsize/3,
var movespeed = 100,
var lookspeed = 0.075,
var numai = 5,

var t= THREE, scene, cam, renderer, controls, clock, projector, model, skin;
var runAnim = true,
mouse = {x:0, y:0};
var runBoost, lastRunBoost = 0;

// map is x index (1-9), y index (0-9)
// 0 is character location 1 is wall, 2 is final area

var map = [
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
           [1, 1, 0, 0, 0, 0, 0, 1, 1, 1,],
           [1, 1, 0, 0, 2, 0, 0, 0, 0, 1,],
           [1, 0, 0, 0, 0, 2, 0, 0, 0, 1,],
           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,],
           [1, 0, 0, 0, 2, 0, 0, 0, 1, 1,],
           [1, 1, 1, 0, 0, 0, 0, 1, 1, 1,],
           [1, 1, 1, 0, 0, 1, 0, 0, 1, 1,],
           [1, 1, 1, 1, 1, 1, 0, 0, 1, 1,],
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
           ], mapW = map.length, mapH = map[0].length;


$(document).ready(function(){
  $('body').append('<div id="intro">START</div>');
  $('#intro').css({width: width, height: height}).one('click', function(e){
    e.preventDefault();
    $(this).fadeOut();
    init();
    setInterval(drawRadar, 1000);
    animate();
  });
});

//initialize game
function init() {
  clock = new t.Clock(); //timer for rendering smooth animation
  projector = new t.Projector(); //2d ray
  scene = new t.Scene(); //world
  scene.fog = new t.FogExp2(0xD6F1FF, 0.0005); //adds fog

  //camera
  cam = new t.PerspectiveCamera(60, aspect, 1, 10000); // FOV,
  cam.position.y = UNITSIZE * 0.2;
  scene.add(cam);

  //camera controls
  controls = new t.FirstPersonControls(cam);
  controls.movementSpeed = movespeed;
  controls.lookSpeed = lookspeed;
  controls.lookVertial = false;
  controls.noFly = true;

  //world objects
  setupScene();

  renderer = new t.WebGlRenderer();
  renderer.setSize(width, height);

  renderer.domElement.style.backgroundColor = '#D6F1FF';
  document.body.appendChild(renderer.domElement);

  //Track Mouse position
  document.addEventListener('mousemove', onDocumentMouseMove, false);

  //display
  $('body').append('<canvas id="radar" widht="200" height="200"></canvas>');
  $('body').append('<div id="hud">Score: <span id="score">0</span></div>');

  //win condition
  $('body').append('<div id="win"></div>');
  $('#win').css({width: width, height: height});
}

function animate() {
  if(runAnim){
    requestAnimationFrame(animate);
  }
  render();
}



function setupScene(){
  var units = mapW;

  var floor = new t.Mesh(
    new t.CubeGeometry(units * unitsize, 10, units *  unitsize),
    new t.MeshLambertMaterial({color: 0xEDCBA0})
  );
  scene.add(floor);

  var cube = new t.CubeGeometry(unitsize, wallheight, unitsize);
  var materials = [
    new t.MeshLambertMaterial({map: t.ImageUtils.loadTexture('images/wall-1.jpg')}),
    new t.MeshLambertMaterial({map: t.ImageUtils.loadTexture('images/wall-2.jpg')}),
  ];

  for(var i=0; i< mapW; i++){
    for(var j=0; m=map[i].length; j<m; j++){
      if(map[i][j]){
        var wall = new t.Mesh(cube, materials[map[i][j]-1]);
        wall.position.x = (i-units/2) * unitsize;
        wall.position.y = wallheight/2;
        wall.position.z = (j-units/2) * unitsize;
        scene.add(wall);
      }
    }
  }

  //speed cube
  speedcube = new t.Mesh(
    new t.CubeGeometry(30, 30, 30),
    new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/speed.png')})
  );
  speedcube.position.set(-unitsize-15, 35, -unitsize-15);
  scene.add(speedcube);

  //lights
  var directionalLight1 = new t.DirectionalLight( 0xF7EFBE, 0.7);
  directionalLight1.position.set(0.5, 1, 0.5);
  scene.add(directionalLight1);
  var directionalLight2 = new t.DirectionalLight( 0xF7EFBE, 0.5);
  directionalLight2.position.set(-0.5, -1, -0.5);
  scene.add(directionalLight2);
}
