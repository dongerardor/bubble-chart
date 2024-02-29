function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      d3.selectAll('.button').classed('active', false);
      var button = d3.select(this);
      button.classed('active', true);
      var buttonId = button.attr('id');
      myBubbleChart.toggleDisplay(buttonId);

      if(buttonId === 'reset'){
        reset();
      }
    });
}

setupButtons();


function setupMonthButtons() {
  d3.select('#toolbar-months')
    .selectAll('.button')
    .on('click', function () {
      d3.selectAll('.button').classed('active', false);
      var button = d3.select(this);
      button.classed('active', true);
      var buttonId = button.attr('id');
      myBubbleChart.toggleMonth(buttonId);
    });
}

setupMonthButtons();

function setupSelectDataBlock() {
  d3.select('#toolbar-select-id')
    .selectAll('#select-block')
    .on('change', function (e) {
      const select = d3.select(this);
      selectedBlock = select._groups[0][0].selectedIndex - 1;
      myBubbleChart.redraw(selectedBlock);
    });
}

setupSelectDataBlock();

function reset(){
  const selectElement = document.getElementById("select-block");
  selectElement.selectedIndex = 0;

  const resetButton = document.getElementById("reset");
  resetButton.classList.remove('active');

  const seeAllButton = document.getElementById("together");
  seeAllButton.classList.add('active');
}
