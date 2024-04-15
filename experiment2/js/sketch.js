// sketch.js - purpose and description here
// Author: Your Name
// Date:

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
  createButton("reimagine").mousePressed(() => seed++);
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

// draw() function is called repeatedly, it's the main animation loop
let seed = 0;
function draw() {
  randomSeed(seed);
  console.log("seed: " + seed)
  //background(100);
  noStroke();
  fill('#89ade4'); //Sky
  rect(0, 0, width, height * 3/5);
  fill('#75F336'); //Grass
  rect(0, height * 3/5, width, height * 3/ 5);
  fill('#FFFFFF');
  for(let i = 0; i < 3; i++){ //Clouds
    ellipse(random(50, width-50), random(0, 20) + 20, 50, 30)
  }
  fill('#C6BfB8'); //Rocks
  for(let i = 0; i < 5; i++){
    ellipse(random(20, width-20), random(-10 + height*3/5, 30 + height*3/5) + 20, 30, 20)
  }
  for(let i = 0; i < 10; i++){
    fill('#725C42');
    let randy = random(0,30);
    let randx = random(0, width-20);
    rect(randx, (height/5)-10 + randy, 20, height * 3/5);
    fill('#42692F');
    triangle(randx + 10, (height/5) + (randy-50), randx-10, (height/5) + randy - 9, randx+30, (height/5) + randy - 9);
  }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}