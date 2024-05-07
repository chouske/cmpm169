/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;

function preload() {
  

  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}



function setup() {
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0,0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}



function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  
  if(!currentDesign) {
    return;
  }
  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  rate.innerHTML = slider.value;
  mutateDesign(currentDesign, currentInspiration, slider.value/100.0);
  
  randomSeed(1000);
  renderDesign(currentDesign, currentInspiration);
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore;
  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }
  
  fpsCounter.innerHTML = Math.round(frameRate());
}
/* exported getInspirations, initDesign, renderDesign, mutateDesign */


function getInspirations() {
  return [
    {
      name: "Saturn", 
      assetUrl: "https://cdn.glitch.global/cf921fed-d454-4929-b533-339044a079ec/saturn.png?v=1715018776735",
    },
    {
      name: "Apple", 
      assetUrl: "https://cdn.glitch.global/cf921fed-d454-4929-b533-339044a079ec/apple.png?v=1715018797832",
    },
    {
      name: "Pillars", 
      assetUrl: "https://cdn.glitch.global/cf921fed-d454-4929-b533-339044a079ec/pillars.png?v=1715018809523",
    },
  ];
}

function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width / 2, inspiration.image.height / 2);
  let design = [];
  for(let i = 0; i < 25; i++){
    design.push({x: random(width/4), y: random(2*height), w: random(width), h: random(height), r: 0, g: (millis()/1000)*1000, b: random(160)})
  }
  return design;
}

function renderDesign(design, inspiration) {
  //background(128);
  noStroke();
  for(let shape of design){
    fill(shape.r, shape.g, shape.b, 1);
    triangle(shape.x, shape.y, shape.x + width, shape.y, shape.x + (width/2), shape.y + height)
    //rect(shape.x, shape.y, shape.w, shape.h)
  }
}

function mutateDesign(design, inspiration, rate) {
  //background(128);
  for(let shape of design){
    shape.x = mut(shape.x, 0, width, rate)
    shape.y = mut(shape.y, 0, height, rate)
  }
}

function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}
