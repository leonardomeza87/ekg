// Import LightningChartJS
const lcjs = require("@arction/lcjs");

// Import xydata
const xydata = require("@arction/xydata");

// Extract required parts from LightningChartJS.
const { lightningChart, AxisScrollStrategies, Themes } = lcjs;

// Import data-generators from 'xydata'-library.
const { createSampledDataGenerator } = xydata;

var chart;

useChart = (point) => {
  // Create a XY Chart.
  chart = lightningChart()
    .ChartXY({
      // theme: Themes.darkGold,
    })
    .setTitle("CardioWave Simulator");

  // Create line series optimized for regular progressive X data.
  const series = chart
    .addLineSeries({
      dataPattern: {
        // pattern: 'ProgressiveX' => Each consecutive data point has increased X coordinate.
        pattern: "ProgressiveX",
        // regularProgressiveStep: true => The X step between each consecutive data point is regular (for example, always `1.0`).
        regularProgressiveStep: true,
      },
    })
    // Destroy automatically outscrolled data (old data becoming out of scrolling axis range).
    // Actual data cleaning can happen at any convenient time (not necessarily immediately when data goes out of range).
    .setDataCleaning({ minDataPointCount: 10000 });

  // Setup view nicely.
  chart
    .getDefaultAxisY()
    .setTitle("mV")
    .setInterval({ start: -1600, end: 1000, stopAxisAfter: false })
    .setScrollStrategy(AxisScrollStrategies.expansion);

  chart
    .getDefaultAxisX()
    .setTitle("milliseconds")
    .setInterval({ start: 0, end: 2500, stopAxisAfter: false })
    .setScrollStrategy(AxisScrollStrategies.progressive);

  // Create a data generator to supply a continuous stream of data.
  createSampledDataGenerator(point, 1, 10)
    .setSamplingFrequency(1)
    .setInputData(point)
    .generate()
    .setStreamBatchSize(48)
    .setStreamInterval(50)
    .setStreamRepeat(true)
    .toStream()
    .forEach((point) => {
      // Push the created points to the series.
      series.add({ x: point.timestamp, y: point.data.y });
    });
};

// ----------------------------------------------------------------------------------------------

// CSS basico
document.body.style.margin = "1rem";
document.body.style.padding = "0";
document.body.style.boxSizing = "border-box";

// Para limpiar los sonidos cuando se cambia de onda
var soundIntervalID1;
var soundIntervalID2;

const clearStuff = () => {
  if (chart) {
    chart.dispose();
    clearInterval(soundIntervalID1);
    clearInterval(soundIntervalID2);
  }
};

// Para generar los botones dinamicamente
const createButton = (text, callback) => {
  const button = document.createElement("button");

  button.textContent = text;

  button.style.backgroundColor = "white";
  button.style.color = "black";
  button.style.fontSize = "16px";
  button.style.padding = "10px 20px";
  button.style.border = "1px solid gray";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.margin = "0 1rem 1rem 0";

  button.addEventListener("click", callback);

  document.body.appendChild(button);
};

// Funciones que definen las ondas
const generateNormalWave = () => {
  clearStuff();

  function generateECGCoordinates(numPoints, amplitude, frequency, phaseShift) {
    const coordinates = [];
    for (let i = 0; i < numPoints; i++) {
      const x = i;
      const y =
        amplitude * 0.5 * Math.sin((2 * Math.PI * frequency * x) / numPoints + phaseShift) +
        amplitude * 0.3 * Math.sin((2 * Math.PI * 2 * frequency * x) / numPoints + phaseShift) +
        amplitude * 0.2 * Math.sin((2 * Math.PI * 3 * frequency * x) / numPoints + phaseShift);
      coordinates.push({ x, y });
    }
    return coordinates;
  }

  const numPoints = 4000; // Número de puntos para el ECG
  const amplitude = 500; // Amplitud de la onda
  const frequency = 6; // Frecuencia de la onda
  const phaseShift = Math.PI / 2; // Desplazamiento de fase para obtener una onda inicialmente positiva

  const coordinates = generateECGCoordinates(numPoints, amplitude, frequency, phaseShift);

  useChart(coordinates);

  soundIntervalID1 = setInterval(() => {
    var context = new (window.AudioContext || window.webkitAudioContext)();
    var osc = context.createOscillator(); // instantiate an oscillator
    osc.type = "square"; // this is the default - also square, sawtooth, triangle
    osc.frequency.value = 640; // Hz
    osc.connect(context.destination); // connect it to the destination
    osc.start(); // start the oscillator
    osc.stop(context.currentTime + 0.15); // stop 2 seconds after the current time
  }, 960);
};

const generateDeadWave = () => {
  clearStuff();

  function generateCoordinates(numPoints) {
    const coordinates = [];
    for (let i = 0; i < numPoints; i++) {
      coordinates.push({ x: i, y: 0 });
    }
    return coordinates;
  }

  const numPoints = 10; // Cambia esto al número de puntos que necesites
  const coordinates = generateCoordinates(numPoints);

  useChart(coordinates);

  soundIntervalID2 = setInterval(() => {
    var context2 = new (window.AudioContext || window.webkitAudioContext)();
    var osc2 = context2.createOscillator(); // instantiate an oscillator
    osc2.type = "square"; // this is the default - also square, sawtooth, triangle
    osc2.frequency.value = 400; // Hz
    osc2.connect(context2.destination); // connect it to the destination
    osc2.start(); // start the oscillator
    osc2.stop(context2.currentTime + 1);
  }, 1000);
};

// Final
createButton("Normal Sinus Rhythm", generateNormalWave);
createButton("Asystole", generateDeadWave);
