// sketch.js - purpose and description here
// Author: Chase Houske

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
}

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

function preload() {
  tilesetImage = loadImage(
    "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
  );
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  select("#seedReport").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    let chars = lines[i].split("");
    for (let j = 0; j < chars.length; j++) {
      row.push(chars[j]);
    }
    grid.push(row);
  }
  return grid;
}

function setup() {
  numCols = select("#asciiBox").attribute("rows") | 0;
  numRows = select("#asciiBox").attribute("cols") | 0;

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  select("#reseedButton").mousePressed(reseed);
  select("#asciiBox").input(reparseGrid);

  reseed();
}


function draw() {
  randomSeed(seed);
  drawGrid(currentGrid);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}

/* exported generateGrid, drawGrid */
/* global placeTile */

function generateGrid(numCols, numRows) {
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push("_");
    }
    grid.push(row);
  }
  //Generate two random biomes
  for(let z = 0; z < 20; z++){//Number of biome generation attempts/creations
    let start = floor(random(numCols));
    let end = floor(random(numCols));
    let whichBiome = floor(random(3));
    for(let y = floor(random(numRows)); y < floor(random(numRows)); y++){
      for(let x = start; x < end; x++){
        let row = grid[y];   
        //console.log("check");
        if(whichBiome == 0){
          row[x] = "d";
        }
        else if(whichBiome == 1){
          row[x] = "b";
        }
        else{
          row[x] = "s";
        }
        
      }
    } 
  }
  //Done with random biomes;
  let start = floor(random(5, 8));
  let end = floor(numCols - random(5,8));
  for(let y = floor(random(5, 8)); y < floor(numRows - random(5,8)); y++){
    for(let x = start; x < end; x++){
      let row = grid[y];
      row[x] = ".";
    }
  }
  return grid;
}
//I IS ROW J IS COL, this is rendering
let cloudData = [];
function drawGrid(grid) {
  background(128);
  let cloudColor = color('#ffffff');
  noStroke();
  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      if(random() < 0.01){
        placeTile(i, j, 5, 29);
      }
      else if (grid[i][j] == '_') {
        //placeTile(i, j, (floor(random(4))), 0);
        drawContext(grid, i, j, "_", 0, 0);
      }
      else if (grid[i][j] == 'd'){
        drawContext(grid, i, j, "d", 0, 18);
      }
      else if (grid[i][j] == 'b'){
        drawContext(grid, i, j, "b", 0, 13);
      }
      else if (grid[i][j] == 's'){
        drawContext(grid, i, j, "s", 0, 12);
      }
      else{
        placeTile(i, j, 1, 21);
        //drawContext(grid, i, j, "_", 1, 21); //This is x, y, it's different
      }
      if(cloudData.length != ((grid.length)*(grid[i].length))){
        cloudData.push(noise(millis())*150);
      }
      if((millis()%5000) > 4900){
        cloudData = [];
      }
      cloudColor.setAlpha(cloudData[i + (20*j)]);
      fill(cloudColor);
      rect(j*16, i*16, 16, 16);
      
    }
  
  }
}
function gridCheck(grid,i,j,target){//Confirmed works
  //i is x, j is y
  if((i < 0) || (i >= grid[0].length)){//Number of columns
    return false;
  }
  if((j < 0) || (i >= grid.length)){//Number of rows
    return false;
  }
  if(grid[i][j] == target){
    return true;
  }
  return false;
}
function gridCode(grid, i, j, target) {
  //If there's a target piece, bit is 1
  let northBit = 0;
  let southBit = 0;
  let eastBit = 0;
  let westBit = 0;
  if(gridCheck(grid, i-1, j, target)){
    northBit = 1;
  }
  if(gridCheck(grid, i+1, j, target)){
    southBit = 1;
  }
  if(gridCheck(grid, i, j-1, target)){
    westBit = 1;
  }
  if(gridCheck(grid, i, j+1, target)){
    eastBit = 1;
  }
  let code = (northBit<<0)+(southBit<<1)+(eastBit<<2)+(westBit<<3);
  return code;
}
const lookup = [
  null, //0 Nothing
  null,  //1 North 
  null,  //2 South
  null,  //3 North and South, ex: room is north and south of grass 
  null,  //4 East
  null,  //5 East and North
  null, //6 East and South
  null, //7 East, South, and North
  null, //8 West
  null, //9 West and North
  null, //10 West and South
  null, //11 West, South, and North
  null, //12 West and East
  null, //13 West, East, and North
  null, //14 West, East, and South
  null //15 West, East, South, North
];

function drawContext(grid, i, j, target, ti, tj) {
  let code = gridCode(grid, i, j, target);
  //console.log(i + " " + j + " " + code)
  let [tiOffset, tjOffset] = [0, 0];
  if(lookup[code] != null){
    [tiOffset, tjOffset] = lookup[code];     
  }
  else{
    if(target == '_'){
      if(gridCheck(grid, i, j, '_')){//Grass
        tiOffset = floor(random(4));
        tjOffset = 0; 
      }
    }
    if(target == 'd'){
      if(gridCheck(grid, i, j, 'd')){//Desert
        tiOffset = floor(random(4));
        tjOffset = 0; 
      }
    }
    if(target == 'b'){
      if(gridCheck(grid, i, j, 'b')){//Blue
        tiOffset = floor(random(4));
        tjOffset = 0; 
      }
    }
    if(target == 's'){
      if(gridCheck(grid, i, j, 's')){//Snow
        tiOffset = floor(random(4));
        tjOffset = 0; 
      }
    }
  }
  placeTile(i, j, ti + tiOffset, tj + tjOffset);
}



