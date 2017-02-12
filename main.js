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
