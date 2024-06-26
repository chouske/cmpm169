"use strict";

/* global p5 */
/* exported preload, setup, draw, mouseClicked */

// Project base code provided by {amsmith,ikarth}@ucsc.edu


let tile_width_step_main; // A width step is half a tile's width
let tile_height_step_main; // A height step is half a tile's height

// Global variables. These will mostly be overwritten in setup().
let tile_rows, tile_columns;
let camera_offset;
let camera_velocity;
/////////////////////////////
// Transforms between coordinate systems
// These are actually slightly weirder than in full 3d...
/////////////////////////////
function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i + camera_x, j + camera_y];
}

function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i, j];
}

function tileRenderingOrder(offset) {
  return [offset[1] - offset[0], offset[0] + offset[1]];
}

function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
  screen_x -= camera_x;
  screen_y -= camera_y;
  screen_x /= tile_width_step_main * 2;
  screen_y /= tile_height_step_main * 2;
  screen_y += 0.5;
  return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
}

function cameraToWorldOffset([camera_x, camera_y]) {
  let world_x = camera_x / (tile_width_step_main * 2);
  let world_y = camera_y / (tile_height_step_main * 2);
  return { x: Math.round(world_x), y: Math.round(world_y) };
}

function worldOffsetToCamera([world_x, world_y]) {
  let camera_x = world_x * (tile_width_step_main * 2);
  let camera_y = world_y * (tile_height_step_main * 2);
  return new p5.Vector(camera_x, camera_y);
}

function preload() {
  
  if (window.p3_preload) {
    window.p3_preload();
  }
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("container");

  camera_offset = new p5.Vector(-width / 2, height / 2);
  camera_velocity = new p5.Vector(0, 0);

  if (window.p3_setup) {
    window.p3_setup();
  }

  let label = createP();
  label.html("World key: ");
  label.parent("container");

  let input = createInput("xyzzy");
  input.parent(label);
  input.input(() => {
    rebuildWorld(input.value());
  });

  createP("Arrow keys scroll. Clicking changes tiles.").parent("container");

  rebuildWorld(input.value());
}

function rebuildWorld(key) {
  if (window.p3_worldKeyChanged) {
    window.p3_worldKeyChanged(key);
  }
  tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
  tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
  tile_columns = Math.ceil(width / (tile_width_step_main * 2));
  tile_rows = Math.ceil(height / (tile_height_step_main * 2));
}

function mouseClicked() {
  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );

  if (window.p3_tileClicked) {
    window.p3_tileClicked(world_pos[0], world_pos[1]);
  }
  return false;
}
let cloudAlpha;
function draw() {
  // Keyboard controls!
  if (keyIsDown(LEFT_ARROW)) {
    camera_velocity.x -= 1;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    camera_velocity.x += 1;
  }
  if (keyIsDown(DOWN_ARROW)) {
    camera_velocity.y -= 1;
  }
  if (keyIsDown(UP_ARROW)) {
    camera_velocity.y += 1;
  }

  let camera_delta = new p5.Vector(0, 0);
  camera_velocity.add(camera_delta);
  camera_offset.add(camera_velocity);
  camera_velocity.mult(0.95); // cheap easing
  if (camera_velocity.mag() < 0.01) {
    camera_velocity.setMag(0);
  }

  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

  background(100);

  if (window.p3_drawBefore) {
    window.p3_drawBefore();
  }

  let overdraw = 0.1;

  let y0 = Math.floor((0 - overdraw) * tile_rows);
  let y1 = Math.floor((1 + overdraw) * tile_rows);
  let x0 = Math.floor((0 - overdraw) * tile_columns);
  let x1 = Math.floor((1 + overdraw) * tile_columns);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
        camera_offset.x,
        camera_offset.y
      ]); // odd row
    }
    for (let x = x0; x < x1; x++) {
      drawTile(
        tileRenderingOrder([
          x + 0.5 + world_offset.x,
          y + 0.5 - world_offset.y
        ]),
        [camera_offset.x, camera_offset.y]
      ); // even rows are offset horizontally
    }
  }

  describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);
  let cloudColor = color('#0000FF');
  if(cloudAlpha == undefined){
     cloudAlpha = noise(millis())*100;
  }
  cloudColor.setAlpha(cloudAlpha);
  fill(cloudColor);
  rect(0, 0, 800, 400);
  if((millis()%1000) > 900){
    cloudAlpha = noise(millis())*100; 
  }
  if (window.p3_drawAfter) {
    window.p3_drawAfter();
  }
}

// Display a discription of the tile at world_x, world_y.
function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
}

function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
  push();
  translate(screen_x, screen_y);
  if (window.p3_drawSelectedTile) {
    window.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
  }
  pop();
}

// Draw a tile, mostly by calling the user's drawing code.
function drawTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  push();
  translate(0 - screen_x, screen_y);
  if (window.p3_drawTile) {
    window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
  }
  pop();
}
"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/
let jaguarImg;
let parrotImg;
let monkeyImg;
function p3_preload() {
  jaguarImg = loadImage('https://cdn.glitch.global/8e50f576-88e9-4149-8ebc-3918b7e69c66/06505948-7f6b-4684-b25b-ca65c7b98f45.image.png?v=1714255399019');
  parrotImg = loadImage('https://cdn.glitch.global/8e50f576-88e9-4149-8ebc-3918b7e69c66/252bde0e-8fff-4eab-b518-fd2772364da6.image.png?v=1714255661982');
  monkeyImg = loadImage('https://cdn.glitch.global/8e50f576-88e9-4149-8ebc-3918b7e69c66/54242482-a5b5-48d8-b9fe-8f96eb0ab7fb.image.png?v=1714256172216');
}

function p3_setup() {}

let worldSeed;
let trees = {};
function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 96;
}
function p3_tileHeight() {
  return 32;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];


//let toppings = {};
function p3_tileClicked(i, j) {
  let key = [i, j];
  if(trees[key] == 0){
    trees[key] = 1;
  }
  else{
    trees[key] = 0;
  }
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  noStroke();
  let whichTile = XXH.h32("tile:" + [i, j], worldSeed) % 4;
  let whichColor = XXH.h32("groundcolor:", worldSeed) % 2;
  if (whichTile != 3){
    fill('#377F03');
  }else if(whichTile == 3){
    if(whichColor == 0){
      fill('#2AAA8A');
    }
    else{
      fill('#416bdf');
    }
  }
  push();

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);
  let treeX = (XXH.h32("treePos" + [i, j], worldSeed) % 40) - 20; 
  let isTree = XXH.h32("isTree" + [i, j], worldSeed);//Do tree
  if(trees[[i,j]] == undefined){
      if(((isTree.toNumber()%10) <= 7) && (whichTile != 3)){
        trees[[i,j]] = 1;
      }
      else{
        trees[[i,j]] = 0;
      }
  }
  
  if(trees[[i,j]] == 1){
    fill('#964B00');
    rect(-2.5 + treeX, -50, 5, 60);
    fill('#13742E');
    rect(-2.5 + treeX-25, -50, 60, 10);
  }
  else{
    if(((XXH.h32("isAnimal" + [i, j], worldSeed) % 25) == 24) && (whichTile != 3)){
      let whichAnimal = (XXH.h32("isTree" + [i, j], worldSeed) % 3)
      if(whichAnimal == 0){
        image(jaguarImg, -25, -25, 50, 50);
      }
      else if(whichAnimal == 1){
        image(parrotImg, -25, -25, 50, 50);
      }
      else{
        image(monkeyImg, -25, -25, 50, 50);
      }
    }
  }
  pop();
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
  text("tile " + [i, j], 0, 0);
}

function p3_drawAfter() {}
