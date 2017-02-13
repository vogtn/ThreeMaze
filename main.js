//defining global vars
var width = window.innerWidth;
var height = window.innerHeight;
var aspect = width/height;
var unitsize = 250;
var wallheight = unitsize;
var movespeed = 100;
var lookspeed = 0.075;
var score = 0;

var t= THREE, scene, cam, renderer, controls, clock, projector, model, skin;
var runAnim = true,
mouse = {x:0, y:0};
var runBoost, lastRunBoost = false;


//Time handling
var time = 3000;

if(time == 0){
  console.log('game over');
}

// map is x index (1-9), y index (0-9)
// 0 is ok location, 1 is wall, 2 is innerwall

var map = [
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
           [1, 1, 0, 2, 0, 0, 0, 1, 1, 1,],
           [1, 1, 0, 0, 0, 2, 0, 1, 1, 1,],
           [1, 1, 0, 2, 0, 2, 0, 1, 1, 1,],
           [1, 1, 0, 2, 0, 2, 0, 1, 1, 1,],
           [1, 1, 0, 2, 0, 2, 0, 1, 1, 1,],
           [1, 1, 0, 2, 0, 0, 0, 0, 0, 1,],
           [1, 0, 0, 2, 0, 2, 0, 0, 0, 1,],
           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,],
           [1, 2, 2, 0, 2, 2, 0, 0, 1, 1,],
           [1, 1, 1, 0, 0, 0, 0, 1, 1, 1,],
           [1, 1, 1, 0, 0, 1, 0, 0, 1, 1,],
           [1, 1, 1, 1, 1, 1, 0, 0, 1, 1,],
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
           ], mapW = map.length, mapH = map[0].length;


$(document).ready(function(){
  $('body').append('<div id="intro">START</div>');
  $('#intro').css({height: height}).on('click', function(e){
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
  scene.fog = new t.FogExp2(0xD6F1FF, 0.0010); //adds fog

  //camera
  cam = new t.PerspectiveCamera(60, aspect, 1, 10000); // FOV,
  cam.position.y = unitsize * 0.2;
  scene.add(cam);

  //camera controls
  controls = new t.FirstPersonControls(cam);
  controls.movementSpeed = movespeed;
  controls.lookSpeed = lookspeed;
  controls.lookVertical = false;
  controls.noFly = true;

  //world objects
  setupScene();

  renderer = new t.WebGLRenderer();
  renderer.setSize(width, height);

  renderer.domElement.style.backgroundColor = '#d11d1d';
  document.body.appendChild(renderer.domElement);

  //Track Mouse position
  document.addEventListener('mousemove', onDocumentMouseMove, false);

  //display
  $('body').append('<canvas id="radar" width="200" height="200"></canvas>');
  $('body').append('<div id="hud">Score: <span id="score">'+score+'</span></div>');
  $('body').append('<div id="timer">Time: <span id="times">'+time+'</span></div>');

  //win condition
  $('body').append('<div id="win"></div>');
  $('#win').css({width: width, height: height});

  //Countdown timer
}

function countdownTimer(){
  time--;
  $('#times').remove();
  $('#timer').append('<span id="times">'+time+'</span></div>');
  console.log(time)
}

function animate() {
  if(runAnim){
    requestAnimationFrame(animate);
  }
  render();
}
function refreshScore(){
  $('#score').remove()
  $('#hud').append('<span id="score">'+score+'</span></div>');
}
function getSpeedBoost(){
  $('body').append('<div id="speedBoostMsg">SPEED BOOST GET</div>');
  $('body').append('<div id="addPoints">+200</div>');
  $('#addPoints').delay(1000).fadeOut();
  $('#speedBoostMsg').delay(2000).fadeOut();
  removeSpeedBoost();
}
function removeSpeedBoost(){
  $('#addPoints').remove;
  $('#speedBoostMsg').remove;
}

function render() {
  var delta = clock.getDelta(), speed = delta;
  controls.update(delta);
  setTimeout(countdownTimer(), 10000);

  speedcube.rotation.x += 0.1;
  speedcube.rotation.y += 0.1;

  //win condition
  if(distance(cam.position.x, cam.position.z, endportal.position.x, endportal.position.z) < 180){
    console.log('winner');
  }

  //delay for speed pickup
  if(!lastRunBoost){
    if(distance(cam.position.x, cam.position.z, speedcube.position.x, speedcube.position.z) < 15){
      movespeed = movespeed + 300;
      controls.movementSpeed = movespeed;
      lastRunBoost = true;
      score += 200;
      refreshScore();
      getSpeedBoost();
    }
    speedcube.material.wireframe = false;
  }else{
    speedcube.material.wireframe = true;
  }

  renderer.render(scene, cam);
}

function setupScene(){
  var units = mapW;

  var floor = new t.Mesh(
    new t.CubeGeometry(units * unitsize, 10, units *  unitsize),
    new t.MeshLambertMaterial({map: t.ImageUtils.loadTexture('images/lava-floor.jpg')})
  );
  scene.add(floor);

  var cube = new t.CubeGeometry(unitsize, wallheight, unitsize);
  var materials = [
    new t.MeshLambertMaterial({map: t.ImageUtils.loadTexture('images/jungle.jpg')}),
    new t.MeshLambertMaterial({map: t.ImageUtils.loadTexture('images/wall-2.jpg')}),
  ];

  for(var i=0; i< mapW; i++){
    for(var j=0, m=map[i].length; j<m; j++){
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
    new t.CubeGeometry(20, 20, 20),
    new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/speed.png')})
  );
  speedcube.position.set(-unitsize-15, 35, -unitsize-15);
  scene.add(speedcube);

  //end portal
  endportal = new t.Mesh(
    new t.CubeGeometry(100, 100, 100),
    new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/door.gif')})
  );
  endportal.position.set(80, 50, -1500);
  scene.add(endportal);

  //lights
  var directionalLight1 = new t.DirectionalLight( 0xF7EFBE, 0.7);
  directionalLight1.position.set(0.5, 1, 0.5);
  scene.add(directionalLight1);
  var directionalLight2 = new t.DirectionalLight( 0xF7EFBE, 0.5);
  directionalLight2.position.set(-0.5, -1, -0.5);
  scene.add(directionalLight2);
}

function distance(x1, y1, x2, y2) {
  //slope
	return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}
function getMapSector(v) {
	var x = Math.floor((v.x + unitsize / 2) / unitsize + mapW/2);
	var z = Math.floor((v.z + unitsize / 2) / unitsize + mapW/2);
	return {x: x, z: z};
}
function checkWallCollision(v) {
	var c = getMapSector(v);
	return map[c.x][c.z] > 0;
}
// Radar For dev purposes
function drawRadar() {
	var c = getMapSector(cam.position), context = document.getElementById('radar').getContext('2d');
	context.font = '10px Helvetica';
	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {
			var d = 0;
			if (i == c.x && j == c.z) {
				context.fillStyle = '#43ff32';
				context.fillRect(i * 20, j * 20, (i+1)*20, (j+1)*20);
			}
			else if (map[i][j] > 0) {
				context.fillStyle = '#666666';
				context.fillRect(i * 20, j * 20, (i+1)*20, (j+1)*20);
			}
			else {
				context.fillStyle = '#CCCCCC';
				context.fillRect(i * 20, j * 20, (i+1)*20, (j+1)*20);
			}
		}
	}
}

function onDocumentMouseMove(e){
  e.preventDefault();
  mouse.x = (e.clientX/ width) * 2 -1;
  mouse.y = -(e.clientY/ height) * 2 + 1;
}
//window resize

$(window).resize(function(){
  width = window.innerWidth;
  height = window.innerHeight;
  aspect = width/height;
  if(cam){
    cam.aspect = aspect;
    cam.updateProjectionMatrix();
  }
  if(renderer){
    renderer.setSize(width, height);
  }
  $('#intro, #win').css({width: width, height: height});
});

//removes moving when window isn in focus
$(window).focus(function() {
	if (controls) controls.freeze = false;
});
$(window).blur(function() {
	if (controls) controls.freeze = true;
});
