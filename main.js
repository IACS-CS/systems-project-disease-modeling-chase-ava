/* Main game file: main.js */
/* Game: [Your Game Name Here] */
/* Authors: [Your Name(s) Here] */
/* Description: [Short description of your game here] */
/* Citations: [List any resources, libraries, tutorials, etc you used here] */
/* AI Use: describe what you asked, what it gave you, and what you changed. */
/* Mark AI-generated sections: // AI-generated: ... // end AI-generated   */

import "./style.css";
import { GameInterface } from "simple-canvas-library";

let gi = new GameInterface();

/* --- STATE ------------------------------------------------------------ */

let infectionRate = 0.5;
let population = [];
let introvertPercentage = 0.3;
let extrovertedNumber = 3;
let contacts = [];
let roundData = [];
// let roundCount = 0;
// let infectedPerRound = [1];

/* --- COORDINATE HELPER ------------------------------------------------
 *
 * Positions in your simulation are "percent coordinates": x and y
 * run from 0 to 100, where (0,0) is the top-left of any region.
 * percentToPixels() converts those to actual canvas pixels for a
 * given bounds object: { top, bottom, left, right }
 *
 * Examples (bounds = { top:0, bottom:400, left:0, right:800 }):
 *   percentToPixels(  0,   0, bounds) --> { x:   0, y:   0 }
 *   percentToPixels(100, 100, bounds) --> { x: 800, y: 400 }
 *   percentToPixels( 50,  50, bounds) --> { x: 400, y: 200 }
 *
 * @param {number} x
 * @param {number} y
 * @param {{top:number, bottom:number, left:number, right:number}} bounds
 * @returns {{x:number, y:number}}
 */
function percentToPixels(x, y, bounds) {
  return {
    x: bounds.left + (x / 100) * (bounds.right - bounds.left),
    y: bounds.top + (y / 100) * (bounds.bottom - bounds.top),
  };
}

/* --- DRAWING: SIMULATION ----------------------------------------------
 *
 * Draw your agents inside the simulation area.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{top:number, bottom:number, left:number, right:number}} bounds
 * @param {number} elapsed - ms since simulation started
 */
function drawSimulation(ctx, bounds, elapsed) {
  // Draw a border around the simulation area...
  let topLeft = percentToPixels(0, 0, bounds);
  let bottomRight = percentToPixels(100, 100, bounds);
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y,
  );

  // Example: utility function to draw a person as a circle
  // draw a person using person variables in population array
  // draw normal people as gray
  // draw introverted people as blue
  // draw infected people as red
  function drawPerson(person) {
    let { x, y } = percentToPixels(person.x, person.y, bounds);
    ctx.beginPath();
    ctx.fillStyle = "gray";
    let radius = 5;
    if (person.infected) {
      ctx.fillStyle = "red";
    }
    if (person.introverted) {
      ctx.strokeStyle = "blue";
    } else {
      ctx.strokeStyle = "orange";
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  /*   function drawPersonInfected(px, py, color) {
    let { x, y } = percentToPixels(px, py, bounds);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
*/
//Ai generated: This code uses lines to represent who is paired with who

  // Draw pairings as lines first
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  for (let pair of contacts) {
    let personA = pair[0];
    let personB = pair[1];
    if (!personA || !personB) {
      continue;
    }
    let pA = percentToPixels(personA.x, personA.y, bounds);
    let pB = percentToPixels(personB.x, personB.y, bounds);
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
  }
//end of Ai code

  // Now we draw some people...
  // (in your real code you'll replace this with a loop)
  // like...
  // for (let person of population) {...}
  for (let person of population) {
    drawPerson(person);
  }

  // YOUR CODE HERE
}
function generatePopulation(size) {
  // generate array of person values, and each person includes an x-value, a y-value,
  // an introvert-value, a paired-value, and a pairseed-value.
  population = [];
  let introvertSize = Math.floor(introvertPercentage * size);
  for (let i = 0; i < size; i++) {
    let introverted = i < introvertSize;
    population.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      introverted: introverted,
      paired: false,
      pairseed: Math.random(),
    });
  }
  population[0].infected = true;
}

// start with an initial population
generatePopulation(100);

/* PERSON PAIRING
  for each person:
    check if they are introverted, and if they are then make them not seek out any pairing partner
    if they are extroverted, then choose a number of people to talk to based on a slider control */

function personPairing() {
  contacts = [];

  for (let person of population) {
    if (!person.introverted) {
      for (let i=0; i<extrovertedNumber; i++) {
        let randomIndex = Math.floor (Math.random() * population.length)
        let randomPerson = population[randomIndex]
        if (randomPerson !== person)
          contacts.push([person, randomPerson])
      }
    }
  }

}

    //Ai generated/edited: This function pairs people in the population based on their introversion/extroversion.
// Introverted people are paired with one other person who is not already paired, while extroverted people can be paired with 
// a number of people based on the extrovertedNumber variable.
// The function also resets the pairing state for each round and updates the contacts array with the new pairings.
// If an introverted person cannot find an unmatched partner, they will be paired with a random person from the population.
function personPairingOld() {
  contacts = [];

  // reset pairing state for each round
  for (let i = 0; i < population.length; i++) {
    population[i].paired = false;
  }

  for (let i = 0; i < population.length; i++) {
    let person = population[i];

    if (person.introverted) {
      // introverts get exactly one pair with someone not already paired, if possible
      let foundPartner = false;
      for (let j = 0; j < population.length; j++) {
        if (i === j) {
          continue;
        }
        let candidate = population[j];
        if (!candidate.paired) {
          contacts.push([person, candidate]);
          person.paired = true;
          candidate.paired = true;
          foundPartner = true;
          break;
        }
      }
      if (!foundPartner) {
        // If no unmatched partner remains, we still can pair with a random person.
        let randomIndex = Math.floor(Math.random() * population.length);
        if (randomIndex !== i) {
          contacts.push([person, population[randomIndex]]);
          person.paired = true;
        }
      }
    } else {
      // extroverts can pair with extrovertedNumber people
      let pairCount = 0;
      for (
        let k = 0;
        k < population.length && pairCount < extrovertedNumber;
        k++
      ) {
        if (k === i) {
          continue;
        }
        let candidate = population[k];
        // extroverts can pair with anyone, including already paired people
        contacts.push([person, candidate]);
        pairCount++;
      }
      if (pairCount > 0) {
        person.paired = true;
      }
    }
  }
}
//end of Ai code
// start of AI infections code
function updateInfections() {
  for (let pair of contacts) {
    let personA = pair[0];
    let personB = pair[1];
    if (personA.infected && !personB.infected) {
      if (Math.random() < infectionRate) {
        personB.infected = true;

      }
    } else if (!personA.infected && personB.infected) {
      if (Math.random() < infectionRate) {
        personA.infected = true;
      }
    }
  }
}
function calculateRoundData() {
  if (person.infected === true) {
    if (person.introverted === true) {
      roundData.push(introvertedInfected)
    }
  }
}
// end AI infections code
/* --- DRAWING: GRAPH ---------------------------------------------------
 *
 * Draw a bar chart in the graph area.
 * data[] is a list of values (e.g. infectedPerRound).
 * dataMax is the largest possible value (e.g. population.length).
 *
 * This is a good CREATE task candidate -- try calling it with
 * fake data to see how changing the arguments changes the output.
 *
 * @param {number[]} data
 * @param {number} dataMax
 * @param {CanvasRenderingContext2D} ctx
 * @param {{top:number, bottom:number, left:number, right:number}} bounds
 */
function drawGraph(data, dataMax, ctx, bounds) {
  // Axes
  let topLeft = percentToPixels(0, 0, bounds);
  let bottomLeft = percentToPixels(0, 100, bounds);
  let bottomRight = percentToPixels(100, 100, bounds);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(topLeft.x, topLeft.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.stroke();

  // YOUR CODE HERE
  // Hint: let pct = (data[i] / dataMax) * 100;
}

/* --- DRAWING: HUD -----------------------------------------------------
 *
 * Optional text overlay. Delete if you don't need it.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 */
function drawHUD(ctx, width, height) {
  // YOUR CODE HERE
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "red";
  let text = `Simulation - Infection Rate: ${infectionRate.toFixed(2)}`;
  ctx.font = "16pt sans-serif";
  ctx.strokeText(text, 15, 25);
  ctx.fillText(text, 15, 25);
}

/* --- REGISTERED DRAWING CALLBACKS -------------------------------------
 * You shouldn't need to change these.
 * Adjust the bounds values if you want to resize the regions.
 */

gi.addDrawing(function ({ ctx, width, height, elapsed }) {
  let simBounds = {
    top: 30,
    bottom: height / 2 - 10,
    left: 10,
    right: width - 10,
  };
  drawSimulation(ctx, simBounds, elapsed);
});

gi.addDrawing(function ({ ctx, width, height }) {
  let graphBounds = {
    top: height / 2 + 10,
    bottom: height - 50,
    left: 50,
    right: width - 50,
  };
  drawGraph([], 1, ctx, graphBounds); // <- replace [] and 1 with your real data
});

gi.addDrawing(function ({ ctx, width, height }) {
  drawHUD(ctx, width, height);
});

/* --- SIMULATION LOGIC -------------------------------------------------
 *
 * Write functions to update your population each round.
 * Your CREATE task function must have a parameter that affects
 * its behavior, sequencing, selection (if/else), iteration (loop),
 * and an explicit call with arguments somewhere in your code.
 */

// YOUR CODE HERE

/* --- CONTROLS --------------------------------------------------------- */

let topBar = gi.addTopBar();

topBar.addButton({
  text: "Next Round",
  onclick: function () {
    personPairing();
    updateInfections();
    // TODO: add your update logic here (e.g. updateInfections())
  },
});

topBar.addSlider({
  label: "Infection Rate",
  min: 0,
  max: 1,
  step: 0.01,
  value: infectionRate,
  oninput: function (value) {
    infectionRate = value;
  },
});

//Ai generated
topBar.addSlider({
  label: "Extrovert Pair Count",
  min: 1,
  max: 10,
  value: extrovertedNumber,
  oninput: function (value) {
    extrovertedNumber = value;
  },
});
//end of Ai code

topBar.addSlider({
  label: "Initial Population",
  min: 16,
  max: 2048,
  oninput: function (value) {
    generatePopulation(value);
  },
});

topBar.addButton({
  text: "Reset",
  onclick: function () {
    contacts = [];
    generatePopulation(100);

  },
});

// TODO: add sliders or inputs for your own parameters here

gi.run();
