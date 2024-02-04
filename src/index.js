/*
 * LightningChartJS example that showcases a simulated ECG signal.
 */
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
    .setTitle("ECG");

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

  // setTimeout(() => {
  //   setInterval(() => {
  //     var context = new (window.AudioContext || window.webkitAudioContext)();
  //     var osc = context.createOscillator(); // instantiate an oscillator
  //     osc.type = "square"; // this is the default - also square, sawtooth, triangle
  //     osc.frequency.value = 640; // Hz
  //     osc.connect(context.destination); // connect it to the destination
  //     osc.start(); // start the oscillator
  //     osc.stop(context.currentTime + 0.15); // stop 2 seconds after the current time
  //   }, 970);
  // }, 326);
};

const button = document.createElement("button");
button.textContent = "Dead";
button.style.backgroundColor = "white";
button.style.color = "black";
button.style.fontSize = "16px";
button.style.padding = "10px 20px";
button.style.border = "1px solid gray";
button.style.borderRadius = "5px";
button.style.cursor = "pointer";
button.style.marginRight = "1rem";
button.addEventListener("click", () => {
  if (chart) {
    chart.dispose();
  }

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
});
document.body.appendChild(button);

const button2 = document.createElement("button");
button2.textContent = "Normal";
button2.style.backgroundColor = "white";
button2.style.color = "black";
button2.style.fontSize = "16px";
button2.style.padding = "10px 20px";
button2.style.border = "1px solid gray";
button2.style.borderRadius = "5px";
button2.style.cursor = "pointer";
button2.style.marginRight = "1rem";
button2.addEventListener("click", () => {
  if (chart) {
    chart.dispose();
  }

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

  const numPoints = 3000; // Número de puntos para el ECG (3 segundos con 1000 puntos por segundo)
  const amplitude = 500; // Amplitud de la onda
  const frequency = 5; // Frecuencia de la onda (2 ciclos por segundo)
  const phaseShift = Math.PI / 2; // Desplazamiento de fase para obtener una onda inicialmente positiva

  const coordinates = generateECGCoordinates(numPoints, amplitude, frequency, phaseShift);

  useChart(coordinates);
});
document.body.appendChild(button2);
