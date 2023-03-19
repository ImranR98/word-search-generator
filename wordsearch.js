const directions = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal up-right
]

// Function to generate a grid of a given size
function generateGrid(size) {
    const grid = []
    for (let i = 0; i < size; i++) {
        grid.push([])
        for (let j = 0; j < size; j++) {
            grid[i].push('.')
        }
    }
    return grid
}

// Function to place words in a grid
function placeWords(grid, words) {
    for (const word of words) {
        let placed = false
        while (!placed) {
            // Choose a random starting position and direction
            const startX = Math.floor(Math.random() * grid.length)
            const startY = Math.floor(Math.random() * grid.length)
            const direction = directions[Math.floor(Math.random() * directions.length)]

            // Try to place the word in that direction
            placed = tryPlaceWord(grid, word, startX, startY, direction)
        }
    }
    return grid
}

// Function to try to place a word in a given direction
function tryPlaceWord(grid, word, startX, startY, direction) {
    const dx = [0, 1, 1, 1, 0]
    const dy = [-1, -1, 0, 1, 1]
    const len = word.length
    const endX = startX + direction[0] * (len - 1)
    const endY = startY + direction[1] * (len - 1)
    if (endX < 0 || endX >= grid.length || endY < 0 || endY >= grid.length) {
        // Word doesn't fit in the grid in this direction
        return false
    }
    for (let i = 0; i < len; i++) {
        const x = startX + direction[0] * i
        const y = startY + direction[1] * i
        if (grid[x][y] !== '.' && grid[x][y] !== word[i]) {
            // Word intersects with another word
            return false
        }
    }
    for (let i = 0; i < len; i++) {
        const x = startX + direction[0] * i
        const y = startY + direction[1] * i
        grid[x][y] = word[i]
    }
    return true
}

function fillEmptyCells(grid) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === '.') {
                const randomIndex = Math.floor(Math.random() * alphabet.length)
                grid[row][col] = alphabet[randomIndex]
            }
        }
    }

    return grid
}

function solveWordSearch(grid, words) {
    const wordIndices = {}
    for (let word of words) {
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === word[0]) {
                    const foundIndices = checkWord(i, j, word, grid)
                    if (foundIndices) {
                        wordIndices[word] = foundIndices
                    }
                }
            }
        }
    }
    return wordIndices
}

function checkWord(row, col, word, grid) {
    const res = [[row, col]]
    for (let [deltaRow, deltaCol] of directions) {
        let r = row + deltaRow
        let c = col + deltaCol
        let i = 1
        for (; i < word.length && r >= 0 && r < grid.length && c >= 0 && c < grid[r].length; i++) {
            if (grid[r][c] !== word[i]) {
                break
            }
            res.push([r, c])
            r += deltaRow
            c += deltaCol

        }
        if (i === word.length) {
            return res
        }
    }
    return null
}

function renderWordSearch(grid, answers) {
    const cellSizeRem = 3
    const borderSize = 4
    const font = ['https://fonts.googleapis.com/css2?family=Poppins&display=swap', 'Poppins']
    const numRows = grid.length
    const numCols = grid[0].length

    let html = `<link href="${font[0]}" rel="stylesheet"><table style="border-collapse: collapse; font-family: ${font[1]}, sans-serif">`
    for (let i = 0; i < numRows; i++) {
        html += '<tr>'
        for (let j = 0; j < numCols; j++) {
            let isBold = false
            const cell = grid[i][j]
            let color = 'black'
            if (!answers) {
                answers = {}
            }
            const solutions = Object.values(answers)
            for (let k = 0; k < solutions.length; k++) {
                const solution = solutions[k]
                for (let l = 0; l < solution.length; l++) {
                    const coords = solution[l]
                    if (coords[0] === i && coords[1] === j) {
                        color = getColor(k)
                        isBold = true
                        break
                    }
                }
            }
            html += '<td style="width: ' + cellSizeRem + 'rem; height: ' + cellSizeRem + 'rem; border: ' + borderSize + 'px solid black; background-color: ' + (isBold ? color : 'White') + '; font-weight: ' + (isBold ? 'bold' : 'normal') + '; text-align: center; font-size: ' + (cellSizeRem * 10) + 'px;">' + cell + '</td>'
        }
        html += '</tr>'
    }
    html += '</table>'

    return html
}

function getColor(index) {
    const colors = ['Aquamarine', 'Chartreuse', 'CornflowerBlue', 'Cyan', 'Gold', 'GreenYellow', 'PaleVioletRed', 'SpringGreen']
    return colors[index % colors.length]
}

// Select elements from the DOM
const wordListInput = document.getElementById("word-list")
const generateButton = document.getElementById("generate-btn")
const solveButton = document.getElementById("solve-btn")
const wordSearchContainer = document.getElementById("word-search-container")

// Add event listeners to buttons
generateButton.addEventListener("click", () => {
    const words = wordListInput.value.split(',').join('\n').split("\n").map((word) => word.trim()).filter((word) => word.length > 0)
    const size = Math.max(Math.ceil(Math.sqrt(words.reduce((sum, word) => sum + word.length, 0) * 2)), 10)
    const grid = fillEmptyCells(placeWords(generateGrid(size), words))
    const wordSearchHtml = renderWordSearch(grid)
    wordSearchContainer.innerHTML = wordSearchHtml
    solveButton.style.display = 'block'
})
solveButton.addEventListener("click", () => {
    // Get the current word search grid
    const table = wordSearchContainer.querySelector("table")
    const numRows = table.rows.length
    const numCols = table.rows[0].cells.length
    const grid = []
    for (let i = 0; i < numRows; i++) {
        const row = []
        for (let j = 0; j < numCols; j++) {
            row.push(table.rows[i].cells[j].textContent)
        }
        grid.push(row)
    }

    // Get the list of words from the input
    const words = wordListInput.value.split(',').join('\n').split("\n").map((word) => word.trim()).filter((word) => word.length > 0)
    // Solve the word search
    const solutions = solveWordSearch(grid, words)

    // Render the word search
    const wordSearchHtml = renderWordSearch(grid, solutions)
    wordSearchContainer.innerHTML = wordSearchHtml
})