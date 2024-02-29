function bubbleChart() {
  var tooltip = floatingTooltip('tooltip', 180);

  const themeCenters = {
    T1: { x: (CONST.width / 5) * 1.9, y: CONST.height / 2 },
    T2: { x: (CONST.width / 5) * 2.4, y: CONST.height / 2 },
    T3: { x: (CONST.width / 5) * 2.7, y: CONST.height / 2 },
    T4: { x: (CONST.width / 5) * 3, y: CONST.height / 2 },
    TX: { x: 0, y: 0 }
  }

  /////////////////////////////////
  /////////////////////////////////
  /////////////////////////////////

  function charge(d) {
    return -Math.pow(d.radius, 2.1) * CONST.forceStrength;
  }

  // Here we create a force layout
  const simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(CONST.forceStrength).x(CONST.center.x))
    .force('y', d3.forceY().strength(CONST.forceStrength).y(CONST.center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  // @v4 Force starts up automatically, which we don't want as there aren't any nodes yet.
  simulation.stop();

  const fillColor = d3.scaleOrdinal()
    .domain(['TX', 'T1', 'T2', 'T3', 'T4'])
    .range(['#CCC', '#4285f4', '#FBBC05', '#34a853', '#EA4335']);

  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  //Provides a x value for each node to be used with the split by theme x force.
  function nodeThemePos(d) {
    const theme = d.tema;
    const center = theme ? themeCenters[theme].x : 0;
    return center;
  }

  /////////////////////////////////
  /////////////////////////////////
  /////////////////////////////////

  let svg = null;
  let bubbles = null;
  let nodes = [];
  let model = {};
  let displayMode = "all";

  //Main entry point to the bubble chart.
  const chart = function chart(selector, rawData) {
    model = new dataModel(rawData);
    nodes = model.getAllNodes();

    svg = d3.select(selector)
      .append('svg')
      .attr('width', CONST.width)
      .attr('height', CONST.height);

    showChart(nodes);
  };

  function showChart(nodes) {
    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble').data(nodes, d => d.id);

    bubbles.exit().remove();

    bubbles.attr('r', function (d) { return d.radius; });

    bubblesE = bubbles.enter().append('circle')
      .attr('class', d => {
        const theme = d.tema;
        const active = d.active ? 'active' : 'dimmed';
        return `bubble ${theme} ${active}`;
      })
      .attr('r', 0)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    bubbles.attr('class', d => {
      const theme = d.tema;
      const active = d.active ? 'active' : 'dimmed';
      return `bubble ${theme} ${active}`;
    })

    // Transition to make bubbles appear, ending with the correct radius
    bubbles.transition().duration(2000).attr('r', function (d) { return d.radius; });

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!
    simulation.nodes(nodes);

    // Set initial layout to single group.
    displayChart(displayMode);
  }

  chart.reset = function () {
    const nodes = model.setResetNodes();
    showChart(nodes);
  };

  chart.redraw = function (blockIndex) {
    const nodes = model.setNodesByBlockId(blockIndex);
    showChart(nodes);
  };

  chart.toggleMonth = function (month) {
    const nodes = model.setMonth(month);
    showChart(nodes);
  }

  ///KIND OF DISPLAY
  function displayChart(displayMode) {
    if (displayMode === 'theme') {
      displayThemes();
    } else if (displayMode === 'all') {
      displayEverything();
    }
  }

  function displayEverything() {
    // @v4 Reset the 'x' force to draw the bubbles to the center.
    simulation.force('x', d3.forceX().strength(CONST.forceStrength).x(CONST.center.x));
    simulation.alpha(1).restart();
  }

  function displayThemes() {
    // @v4 Reset the 'x' force to draw the bubbles to their month centers
    simulation.force('x', d3.forceX().strength(CONST.forceStrength).x(nodeThemePos));
    simulation.alpha(1).restart();
  }

  //Externally accessible function
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'theme') {
      displayThemes();
    } else if (displayName === 'together') {
      displayEverything();
    } else if (displayName === 'reset') {
      displayMode = 'all';
      chart.reset();
    }
  };


  ////////////////////////////////////////////
  ///TOOLTIP
  ////////////////////////////////////////////
  function showDetail(d) {
    const temaObj = CONST.themes.find(theme => theme.name === d.tema);
    const { label: tema } = temaObj;
    const { id, monthLabel, value, indicador, pergunta } = d;

    const content = `
    <p><strong>ID</strong>: ${id}</p>
    <p><strong>Mês</strong>: ${monthLabel}</p>
    <p><strong>Tema</strong>: ${tema}</p>
    <p><strong>Indicador</strong>: ${indicador}</p>
    <p><strong>Pergunta</strong>: ${pergunta}</p>
    <p><strong>Valor:</strong>${value}</p>
    `;
    tooltip.showTooltip(content, d3.event);
  }

  //Hides tooltip
  function hideDetail(d) {
    tooltip.hideTooltip();
  }

  // return the chart function from closure.
  return chart;
}
//////////////// end BubbleChart fnc

///INIT
let myBubbleChart;
async function start() {
  try {
      const data = await d3.csv("/bubble_chart_assets/data/indicadores.csv");
      myBubbleChart = bubbleChart();
      myBubbleChart('#vis', data);
  } catch (error) {
      console.error('Error loading data:', error);
  }
}

start();