const directions = [
    [0, 1],   // right
    [0, -1],   // left
    [1, 0],   // down
    [-1, 0],   // up
    [1, 1],   // down-right
    [-1, 1],  // up-right
    [1, -1],   // down-left
    [-1, -1],  // up-left
    
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