const directions = [
    [0, 1, 'right', String.fromCodePoint(0x27A1), 17],
    [0, -1, 'left', String.fromCodePoint(0x2B05), 0],
    [1, 0, 'down', String.fromCodePoint(0x2B07), 13],
    [-1, 0, 'up', String.fromCodePoint(0x2B06), 0],
    [1, 1, 'down-right', String.fromCodePoint(0x2198), 8],
    [-1, 1, 'up-right', String.fromCodePoint(0x2197), 11],
    [1, -1, 'down-left', String.fromCodePoint(0x2199), 0],
    [-1, -1, 'up-left', String.fromCodePoint(0x2196), 0]
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

// Function to place words in a grid given predefined indices
function placeWordsManual(grid, words) {
    for (const word in words) {
        var i = 0
        for (var [x, y] of words[word]) {
            grid[x][y] = word[i++]
        }
    }
    return grid
}

// Function to place words in a grid
function placeWordsAuto(grid, words, directions, sparse = false, maxAttemptsPerWord = 1000) {
    for (const word of words) {
        let placed = false
        let attempts = 0
        while (!placed && (maxAttemptsPerWord === null || attempts < maxAttemptsPerWord)) {
            // Choose a random starting position and direction
            const startX = Math.floor(Math.random() * grid.length)
            const startY = Math.floor(Math.random() * grid.length)
            const direction = directions[Math.floor(Math.random() * directions.length)]

            // Try to place the word in that direction
            placed = tryPlaceWord(grid, word, startX, startY, direction, sparse)
            attempts++
        }
        if (!placed) {
            return null
        }
    }
    return grid
}

// Function to try to place a word in a given direction
function tryPlaceWord(grid, word, startX, startY, direction, sparse) {
    const len = word.length
    const endX = startX + direction[0] * (len - 1)
    const endY = startY + direction[1] * (len - 1)
    // First see if the proposed placement would event fit
    if (endX < 0 || endX >= grid.length || endY < 0 || endY >= grid.length) {
        return false
    }
    // Then see if it would overlap with any existing word (and if the overlapping letters are the same)
    for (let i = 0; i < len; i++) {
        const x = startX + direction[0] * i
        const y = startY + direction[1] * i
        if (grid[x][y] !== '.') {
            // Word intersects with another word
            if (grid[x][y] !== word[i]) {
                return false
            }
            if (grid[x][y] === word[i] && sparse) {
                return false
            }
        }
        if (sparse) { // Aside from avoiding direct overlaps, 'sparse' also means a 1-cell gap in all non-diagonal directions
            var gapDirs = directions.filter(d => ['up', 'down', 'left', 'right'].indexOf(d[2]) >= 0)
            gapDirs = gapDirs.filter(d => !((d[0] == (direction[0] * -1)) && (d[1] == (direction[1] * -1)))) // Not including the current word's own letters
            for (let ind = 0; ind < gapDirs.length; ind++) {
                var gapCell = [x + gapDirs[ind][0], y + gapDirs[ind][1]]
                if (
                    (gapCell[0] >= 0 && gapCell[1] >= 0) &&
                    (gapCell[0] < grid.length && gapCell[1] < grid.length) &&
                    grid[gapCell[0]][gapCell[1]] !== '.'
                ) {
                    return false
                }
            }
        }
    }
    // Place the word
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
                if (grid[i][j].toLowerCase() === word[0].toLowerCase()) {
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
    for (let [deltaRow, deltaCol, dirName] of directions) {
        const res = [[row, col]]
        let r = row + deltaRow
        let c = col + deltaCol
        let i = 1
        for (; i < word.length && r >= 0 && r < grid.length && c >= 0 && c < grid[r].length; i++) {
            if (grid[r][c].toLowerCase() !== word[i].toLowerCase()) {
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