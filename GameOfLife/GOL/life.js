var rows = 75;
var cols = 75;
///is the game playing or not
var playing = false;
var timer;
var reproductionTime = 120;


//states
var grid = new Array(rows);
var nextGrid = new Array(rows);
//add an array to both grid and next grid
function initializeGrids() {
	for(var i = 0; i < rows; i++) {
		grid[i] = new Array(cols);
		nextGrid[i] = new Array(cols);
	}
}

function resetGrids() {
	//loops over every row and column
	//resets both grid to all dead cells
	for (var i = 0; i < rows; i++) {
		for(var j = 0; j < cols; j++) {
			grid[i][j] = 0;
			nextGrid[i][j] = 0;
		}
	}
}

//copies values in the nextGrid array to the Grid array
//(copies new state into Grid)
//reset nextGrid array to all 0's
//(fresh for another new state)
function copyAndResetGrid() {
	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			grid[i][j] = nextGrid[i][j];
			nextGrid[i][j] = 0;
		}
	}
}

//initialize
function initialize() {
	createTable();
	initializeGrids();
	resetGrids();
	setupControlButtons();
}

//lay out the board
function createTable() {
	var gridContainer = document.getElementById("gridContainer");
	//make sure the element actually exists
	if (!gridContainer) {
		//throw error
		console.error("No div for the grid table!");
	}
	var table = document.createElement("table");

//i = rows, iterate through each row
	for (var i = 0; i < rows; i++) {
		//create tr element
		var tr = document.createElement("tr");
		//iterate through j columns
		for (var j = 0; j < cols; j++) {
			var cell = document.createElement("td");
			//each sell needs unique id (I_J)
			cell.setAttribute("id", i + "_" + j);
			//correct css class (dead or live)
			cell.setAttribute("class", "dead");
			cell.onclick = cellClickhandler;
			//inner loop
			tr.appendChild(cell);

		}
		//completing outer loop
		table.appendChild(tr);
	}
	//add table to the grid container
	gridContainer.appendChild(table);
}

function cellClickhandler() {
	var rowcol = this.id.split("_");
	var row = rowcol[0];
	var col = rowcol[1];

	//get class attribute from the element using .this
	//returning a value of the string of the class attribute
	var classes = this.getAttribute("class");
	//if the string contains the class live
	if (classes.indexOf("live") > -1) {
		//then the cell is now live from being a dead cell
		this.setAttribute("class", "dead");
		grid[row][col] = 0;
	} else {
		//other wise the class attribute contains the class dead
		// and we change it to live by setting the attribute to live
		this.setAttribute("class", "live");
		grid[row][col] = 1;
	}
}

//looks through all cells in GridArray (current state) and updates view
//match table in the view to table in the model
function updateView() {
	for(var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			//get cell from the page
			var cell = document.getElementById(i + "_" + j);
			if (grid[i][j] == 0) {
				cell.setAttribute("class", "dead");
				//update class attribute to dead
			} else {
				//update class attribute to live
				cell.setAttribute("class", "live");
			}
		}
	}
}

function setupControlButtons() {
	//button to start
	var startButton = document.getElementById("start");
	startButton.onclick = startButtonHandler;
	//button to clear
	var clearButton = document.getElementById("clear");
	clearButton.onclick = clearButtonHandler;
	//button to set random initial state
	var randomButton = document.getElementById("random");
	randomButton.onclick = randomButtonHandler;
}	

function randomButtonHandler() {
	if (playing) return;
	//clear out the current view and model state
	clearButtonHandler();
	//loop through every cell in grid and randomly assign live or dead
	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			var isLive = Math.round(Math.random());
			if (isLive == 1) {
				var cell = document.getElementById(i + "_" + j);
				cell.setAttribute("class", "live");
				grid[i][j] = 1;
			}
		}
	}
}
function clearButtonHandler() {
	console.log("Clear the game: stop playing, clear the grid");
	//cleared the game so no longer playing
	playing = false;
	//get start button from the DOM, set state to start
	var startButton = document.getElementById("start");
	//set content to start
	startButton.innerHTML = "start";

	clearTimeout(timer);

	//returns a node list of elements
	//need to copy elements to an array first
	var cellsList = document.getElementsByClassName("live");
	var cells = [];
	//copy each element into list into array
	for (var i = 0; i < cellsList.length; i++) {
		cells.push(cellsList[i]);
	}
	for (var i = 0; i < cells.length; i++) {	
		cells[i].setAttribute("class", "dead");
	}
	//check state arrays (grid and nextGrid)
	resetGrids();
}

function startButtonHandler() {
	//if playing variable is set to true...
	if (playing) {
		//pause the game
		console.log("pause the game");
		//set playing variable to false
		playing = false;
		//use this to access the button element object
		this.innerHTML = "continue"; 
		clearTimeout(timer);
		} else {
			console.log("continue the game");
			playing = true;
			//update content of the button to say pause
			this.innerHTML = "pause";
			//call function play
			play();	
		}
}

function play() {
	console.log("Play the game");
	computeNextGen();

	if (playing) {
		timer = setTimeout(play, reproductionTime);
	}
}

//iterating through all cells in the grid and applying rules
function computeNextGen() {
	//loop through all rows and columns and implement apply rules
	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			applyRules(i,j);
		}
	}

	//copy nextGrid to grid, and reset nextGrid
	copyAndResetGrid();
	//copy all 1 values to "live" in the table
	updateView();
}

//RULES
// any live cell with fewer than 2 live neighbors dies, as if caused by under-population
//any live cell with 2 or 3 live neighbors lives on to the next generation
//any live cell with more than 3 live neightbors dies, as if by overcrowding
//any dead cell with exactly 3 live neighbors becomes live if by reproduction

function applyRules(row, col) {
	//count number of live neighbors
	var numNeighbors = countNeighbors(row,col);
	//if current cell is live
	if (grid[row][col] ==1) {
		//if num of live neighbors is 2 then cell dies
		if(numNeighbors < 2) {
			//store 0 in nextGrid (or next state)
			nextGrid[row][col] = 0;
		} else if (numNeighbors == 2 || numNeighbors == 3) {
			nextGrid[row][col] = 1;
		} else if (numNeighbors > 3) {
			nextGrid[row][col] = 0;
		}
		//if current cell is dead
	} else if (grid[row][col] == 0){
		//if has 3 live neighbors then cell becomes alive and store a 
		//1 in the next grid (or next state)
		if (numNeighbors == 3) {
			nextGrid[row][col] = 1;
		}
	}
}

function countNeighbors(row, col) {
	var count = 0;
	if (row-1 >=0) {
		//passing in the row and col of cell we are checking
		if (grid[row-1][col] == 1) count++;
	}
	//check upper left neighbor
	if (row-1 >=0 && col-1 >=0) {
		//check to see if it is a 1 and if so, increase count
		if (grid[row-1][col-1] == 1) count++;
	}
	//check upper right
	if (row-1 >=0 && col+1 < cols) {
		if (grid[row-1][col+1] == 1) count++;
	}
	//check to the left
	if (col-1 >=0) {
		if (grid[row][col-1] == 1) count++;
	}
	//check to the right
	if (col+1 < cols) {
		if (grid[row][col+1] == 1) count++;
	}
	//check directly below
	if (row + 1 < rows) {
		if (grid[row+1][col] == 1) count++;
	}
	//check lower left
	if (row + 1< rows && col-1 >=0) {
		if (grid[row+1][col-1] ==1) count++;
	}
	//check lower right
	if (row + 1< rows && col+1 < cols) {
		if (grid[row+1][col+1] ==1) count++;
	}
	return count;
}		


//start everything
window.onload = initialize;

