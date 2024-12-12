const gridContainer = document.getElementById('grid')
const resetButton = document.getElementById('reset-button')
const autoPlayButton = document.getElementById('auto-play')
const gridSizeInput = document.getElementById('grid-size-input')
const robot1ScoreElement = document.getElementById('robot1-score')
const robot2ScoreElement = document.getElementById('robot2-score')

let grid = []
let gridSize = 5
let robot1 = { row: 0, col: 0, score: 0 }
let robot2 = { row: 0, col: gridSize - 1, score: 0 }
let isRobot1Turn = true
let robot1Path = []
let robot2Path = []

function generateGrid(size) {
  grid = Array.from(
    { length: size },
    (_, rowIndex) =>
      rowIndex === 0
        ? Array.from({ length: size }, () => 0) // First row is empty
        : Array.from({ length: size }, () => Math.floor(Math.random() * 10) + 1) // Other rows have random chocolates
  )
  grid.push(Array.from({ length: size }, () => Math.floor(Math.random() * 10) + 1))
  console.log(grid)
  gridSize = size
  resetPaths()
  renderGrid()
}

function renderGrid() {
  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`
  gridContainer.innerHTML = ''

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div')
      cell.textContent = grid[row][col] > 0 ? grid[row][col] : ''
      if (cell.textContent === '') cell.classList.add('start-cell')

      if (robot1.row === row && robot1.col === col) {
        cell.classList.add('robot1')
        if (isRobot1Turn) cell.classList.add('highlight-robot1')
      } else if (robot2.row === row && robot2.col === col) {
        cell.classList.add('robot2')
        if (!isRobot1Turn) cell.classList.add('highlight-robot2')
      }

      if (robot1Path.some(([r, c]) => r === row && c === col)) {
        cell.classList.add('robot1-path')
      }
      if (robot2Path.some(([r, c]) => r === row && c === col)) {
        cell.classList.add('robot2-path')
      }

      gridContainer.appendChild(cell)
    }
  }
}

function resetPaths() {
  robot1Path = [[0, 0]]
  robot2Path = [[0, gridSize - 1]]
}

function resetGame() {
  robot1 = { row: 0, col: 0, score: 0 }
  robot2 = { row: 0, col: gridSize - 1, score: 0 }
  isRobot1Turn = true
  const newSize = parseInt(gridSizeInput.value, 10) || gridSize
  generateGrid(newSize)
  updateScores()
}

function updateScores() {
  robot1ScoreElement.textContent = robot1.score
  robot2ScoreElement.textContent = robot2.score
}

function moveRobot(robot, direction) {
  let newRow = robot.row + 1
  let newCol = robot.col

  if (direction === 'left') newCol--
  else if (direction === 'right') newCol++

  if (newRow < gridSize + 1 && newCol >= 0 && newCol < gridSize) {
    robot.row = newRow
    robot.col = newCol
    collectChocolates(robot)
    if (robot === robot1) {
      robot1Path.push([newRow, newCol])
    } else {
      robot2Path.push([newRow, newCol])
    }
    renderGrid()
    updateScores()
  }
}

function collectChocolates(robot) {
  const chocolates = grid[robot.row][robot.col]
  robot.score += chocolates
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault()
    isRobot1Turn = !isRobot1Turn
    renderGrid()
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const direction =
      event.key === 'ArrowLeft' ? 'left' : event.key === 'ArrowRight' ? 'right' : 'down'
    const robot = isRobot1Turn ? robot1 : robot2
    moveRobot(robot, direction)
    isRobot1Turn = !isRobot1Turn
    renderGrid()
  }
})

function autoPlay() {
  while (robot1.row < gridSize || robot2.row < gridSize) {
    console.log('autoPlay', robot1, robot2, gridSize)
    if (robot1.row < gridSize) {
      moveRobotBasedOnMax(robot1)
    }

    if (robot2.row < gridSize) {
      moveRobotBasedOnMax(robot2)
    }

    renderGrid()
    updateScores()
  }
}

// Helper function to determine the best direction
function moveRobotBasedOnMax(robot) {
  const currentRow = robot.row
  const currentCol = robot.col

  const directions = [
    { rowOffset: 1, colOffset: -1, direction: 'left' }, // Bottom-left
    { rowOffset: 1, colOffset: 0, direction: 'down' }, // Bottom
    { rowOffset: 1, colOffset: 1, direction: 'right' } // Bottom-right
  ]

  let maxChocolates = -1
  let bestDirection = null

  for (const { rowOffset, colOffset, direction } of directions) {
    const newRow = currentRow + rowOffset
    const newCol = currentCol + colOffset

    if (newRow >= 0 && newRow <= gridSize && newCol >= 0 && newCol <= gridSize) {
      const chocolates = grid[newRow][newCol]
      if (chocolates > maxChocolates) {
        maxChocolates = chocolates
        bestDirection = direction
      }
    }
  }

  // Move robot in the determined best direction
  if (bestDirection) {
    moveRobot(robot, bestDirection)
  }
}

resetButton.addEventListener('click', resetGame)
autoPlayButton.addEventListener('click', autoPlay)

gridSizeInput.addEventListener('change', () => {
  const newSize = parseInt(gridSizeInput.value, 10)
  if (newSize && newSize > 0) {
    resetGame()
  }
})

generateGrid(gridSize)
updateScores()
