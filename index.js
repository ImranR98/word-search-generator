const wordListInput = document.getElementById("word-list")
const generateButton = document.getElementById("generate-btn")
const solveButton = document.getElementById("solve-btn")
const saveButton = document.getElementById("save-btn")
const wordSearchContainer = document.getElementById("word-search-container")
const cellSizeInput = document.getElementById("cell-size-input")
const borderThicknessInput = document.getElementById("border-thickness-input")
const minGridSizeInput = document.getElementById("minimum-grid-size-input")
const fontSizeInput = document.getElementById("font-size-input")
const isManualCheckbox = document.getElementById("manual-checkbox")
const sparseCheckbox = document.getElementById("sparse-checkbox")

cellSizeInput.value = localStorage.getItem('cell-size-val') || cellSizeInput.value
borderThicknessInput.value = localStorage.getItem('border-size-val') || borderThicknessInput.value
fontSizeInput.value = localStorage.getItem('font-size-val') || fontSizeInput.value
minGridSizeInput.value = localStorage.getItem('minimum-grid-size-val') || minGridSizeInput.value

sparseCheckbox.checked = true

function fillDirectionsDiv() {
    let directionsDiv = document.getElementById("directionsDiv")
    directions.forEach(([dx, dy, dirName, symbol, defaultProbability]) => {
        let label = document.createElement("label")
        let numInput = document.createElement("input")
        let emoji = document.createElement("span")
        numInput.type = "number"
        numInput.name = dirName
        numInput.value = localStorage.getItem(numInput.name + '-val') || defaultProbability
        numInput.min = 0
        numInput.style = 'width: 3rem; margin-right: 0.3rem;'
        label.style = "margin-right: 2rem; margin-bottom: 1rem"
        label.appendChild(numInput)
        label.appendChild(document.createTextNode(dirName))
        emoji.appendChild(document.createTextNode(symbol))
        emoji.style = "margin-left: 0.3rem"
        label.appendChild(emoji)
        directionsDiv.appendChild(label)
    })
}

function getRepeatedDirs() {
    let repeatedDirections = []
    var numInputs = directionsDiv.getElementsByTagName("input")
    for (var i = 0; i < numInputs.length; i++) {
        localStorage.setItem(numInputs[i].name + '-val',
            numInputs[i].value || 0)
        const dir = directions.filter(([dx, dy, n]) => numInputs[i].name == n)[0]
        for (let j = 0; j < (numInputs[i].value || 0); j++) {
            repeatedDirections.push(dir)
        }
    }
    return repeatedDirections
}

function renderWordSearch(grid) {
    const cellSizePx = !!cellSizeInput.value ? cellSizeInput.value : 64
    const borderSizePx = !!borderThicknessInput.value ? borderThicknessInput.value : 2
    const fontSizePx = !!fontSizeInput.value ? fontSizeInput.value : 32
    const minGridSize = !!minGridSizeInput.value ? minGridSizeInput.value : 10
    const numRows = grid.length
    const numCols = grid[0].length

    localStorage.setItem('cell-size-val', cellSizePx)
    localStorage.setItem('border-size-val', borderSizePx)
    localStorage.setItem('font-size-val', fontSizePx)
    localStorage.setItem('minimum-grid-size-input', minGridSize)

    let html = `<table id="word-search-table" style="border-spacing: 0; border-collapse: separate; border: ${borderSizePx}px solid black;">`
    for (let i = 0; i < numRows; i++) {
        html += '<tr">'
        for (let j = 0; j < numCols; j++) {
            let cell = grid[i][j]
            const upperCase = document.getElementById('uppercase-checkbox').checked
            cell = upperCase ? cell.toUpperCase() : cell.toLowerCase()
            html += '<td style="min-width: ' + cellSizePx + 'px; width: ' + cellSizePx + 'px; height: ' + cellSizePx + 'px; border: ' + borderSizePx + 'px solid black; background-color: White; font-weight: normal; text-align: center; font-size: ' + fontSizePx + 'px;" class="tooltip">'
                + cell
                + '<span class="tooltiptext" style="width: ' + cellSizePx + 'px; font-size: ' + fontSizePx + 'px;">' + i + ',' + j + '</span>'
                + '</td>'
        }
        html += '</tr>'
    }
    html += '</table>'
    return html
}

const clearAnswerLines = () => {
    const canvas = document.getElementById('answers-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const positionAnswersCanvas = () => {
    const table = document.getElementById('word-search-table');
    const canvas = document.getElementById('answers-canvas');
    const rect = table.getBoundingClientRect();
    canvas.style.left = `${rect.left}px`;
    canvas.style.top = `${rect.top}px`;
    canvas.width = table.offsetWidth;
    canvas.height = table.offsetHeight;
}

function synchronizeAnswersCanvas() {
    const container = document.getElementById('word-search-container-container');
    const canvas = document.getElementById('answers-canvas');
    canvas.style.transform = `translate(${-container.scrollLeft}px, ${-container.scrollTop}px)`;
}

const updateAnswerLines = (grid) => {
    const getAnswerCoordinates = (row, col) => {
        const table = document.getElementById('word-search-table');
        const cell = table.rows[row].cells[col];
        const rect = cell.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        return {
            x: rect.left - tableRect.left + rect.width / 2,
            y: rect.top - tableRect.top + rect.height / 2
        };
    }
    const drawAnswerLine = (startRow, startCol, endRow, endCol) => {
        const canvas = document.getElementById('answers-canvas');
        const ctx = canvas.getContext('2d');
        const start = getAnswerCoordinates(startRow, startCol);
        const end = getAnswerCoordinates(endRow, endCol);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
    clearAnswerLines()
    if (solved) {
        positionAnswersCanvas();
        const solutions = isManualCheckbox.checked ? getWordsManual() : solveWordSearch(grid, getWordsAuto())
        console.log(solutions)
        Object.keys(solutions).forEach(key => {
            const startCell = solutions[key][0]
            const endCell = solutions[key][solutions[key].length - 1]
            drawAnswerLine(startCell[0], startCell[1], endCell[0], endCell[1])
        })
    }
}

function getColor(index) {
    const colors = ['Aquamarine', 'Chartreuse', 'CornflowerBlue', 'Cyan', 'Gold', 'GreenYellow', 'PaleVioletRed', 'SpringGreen']
    return colors[index % colors.length]
}

var solved = false
const toggleSolved = (override) => {
    solved = override == undefined ? !solved : override
    solveButton.innerHTML = (solved ? 'Unsolve' : 'Solve') + ' Word Search'
    if (solved) {
        updateAnswerLines(getCurrentGrid())
    } else {
        clearAnswerLines()
    }
}

const isManualFormat = () => {
    var lines = wordListInput.value.trim().split('\n')
    for (var i in lines) {
        var items = lines[i].split(',')
        if (
            items.length != 4 ||
            !Number.isInteger(Number.parseInt(items[1])) ||
            !Number.isInteger(Number.parseInt(items[2])) ||
            directions.filter(d =>
                (d[2].toLowerCase() == items[3].toLowerCase()) ||
                (d[2].toLowerCase().split('-').map(seg => seg[0]).join('') == items[3].toLowerCase())
            ).length != 1
        ) {
            return false
        }
    }
    return true
}

const getWordsManual = () => {
    var words = wordListInput.value.trim().split('\n').map(line => {
        var items = line.split(',')
        return {
            word: items[0],
            x: Number.parseInt(items[1]),
            y: Number.parseInt(items[2]),
            direction: directions.filter(d =>
                (d[2].toLowerCase() == items[3].toLowerCase()) ||
                (d[2].toLowerCase().split('-').map(seg => seg[0]).join('') == items[3].toLowerCase())
            )[0]
        }
    })
    var solutions = {}
    words.forEach(word => {
        solutions[word.word] = []
        var letters = word.word.split('')
        for (let i = 0; i < letters.length; i++) {
            solutions[word.word].push([word.x + (word.direction[0] * i), word.y + (word.direction[1] * i)])
        }
    })
    return solutions
}

const getCurrentGrid = () => {
    const table = wordSearchContainer.querySelector("table")
    const numRows = table.rows.length
    const numCols = table.rows[0].cells.length
    const grid = []
    for (let i = 0; i < numRows; i++) {
        const row = []
        for (let j = 0; j < numCols; j++) {
            row.push(table.rows[i].cells[j].innerText)
        }
        grid.push(row)
    }
    return grid
}

const getWordsAuto = () => {
    return wordListInput.value.split(',').join('\n').split("\n").map((word) => word.trim().split(' ').join('')).filter((word) => word.length > 0)
}

const hashString = (str, seed = 0) => { // https://stackoverflow.com/a/52171480/9253127
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

const findLargestOrSmallestNumber = (arr, smallest) => {
    return arr.reduce((fin, currentArray) => {
        const bestInArray = currentArray.reduce((bestInArr, num) => smallest ? Math.min(bestInArr, num) : Math.max(bestInArr, num), smallest ? Infinity : -Infinity);
        return smallest ? Math.min(fin, bestInArray) : Math.max(fin, bestInArray);
    }, smallest ? Infinity : -Infinity);
}

// Add event listeners to buttons
generateButton.addEventListener("click", () => {
    var grid = null
    var canContinue = true
    if (!isManualCheckbox.checked) {
        const words = getWordsAuto()
        const wordBasedSize = Math.max(...[...words.map(w => w.length), Math.ceil(Math.sqrt(words.reduce((sum, word) => sum + word.length, 0) * 2))])
        const size = Number.parseInt(minGridSizeInput.value > wordBasedSize ? minGridSizeInput.value : wordBasedSize)
        const dirs = getRepeatedDirs()
        var generated = false
        var attempts = 0
        while (!generated) {
            const finalSize = size + (Math.floor(attempts / (size * 100)))
            attempts++
            grid = generateGrid(finalSize)
            grid = placeWordsAuto(grid, words, dirs, sparseCheckbox.checked)
            if (grid) {
                generated = true
            } else {
                console.log(`Could not finish placing words (attempt ${attempts}) with grid size ${finalSize}`)
            }
        }
        grid = fillEmptyCells(grid)
    } else {
        var words = null
        try {
            words = getWordsManual()
        } catch (e) {
            console.error(e)
            alert('In manual mode, each input line must conform to the manual format: word,X,Y,direction')
        }
        var size = 0
        var outOfBounds = []
        for (var word in words) {
            var largestIndex = findLargestOrSmallestNumber(words[word])
            var lowestIndex = findLargestOrSmallestNumber(words[word], true)
            if (largestIndex > size) {
                size = largestIndex
            }
            if (lowestIndex < 0) {
                outOfBounds.push(word)
            }
        }
        if (outOfBounds.length > 0) {
            canContinue = false
            alert('The following words go out of bounds: ' + outOfBounds)
        }
        size += 1
        grid = fillEmptyCells(placeWordsManual(generateGrid(size), words))
    }
    if (canContinue) {
        const wordSearchHtml = renderWordSearch(grid)
        wordSearchContainer.innerHTML = wordSearchHtml
        solveButton.style.display = 'block'
        saveButton.style.display = 'block'
        clearAnswerLines()
        toggleSolved(false)
    }
})
solveButton.addEventListener("click", () => {
    const grid = getCurrentGrid()
    const wordSearchHtml = renderWordSearch(grid)
    wordSearchContainer.innerHTML = wordSearchHtml
    toggleSolved()
})
saveButton.addEventListener("click", () => {
    saveAsImage(`word_search_${hashString(wordListInput.value.trim())}${solved ? '_solved' : ''}`)
})

const saveAsImage = async (filename) => {
    const table = document.getElementById('word-search-table');
    const highlightCanvas = document.getElementById('answers-canvas');

    const defaultScale = 5
    let scale = prompt('Enter size multiplier (default is ' + defaultScale + ')') || defaultScale
    try {
        Number.parseInt(scale)
    } catch (e) {
        scale = defaultScale
    }

    const tableCanvas = await html2canvas(table, { scale, backgroundColor: null });

    // Create a new canvas to merge the table and highlights
    const mergedCanvas = document.createElement('canvas');
    const ctx = mergedCanvas.getContext('2d');

    // Set the merged canvas dimensions to match the scaled table canvas
    mergedCanvas.width = tableCanvas.width;
    mergedCanvas.height = tableCanvas.height;

    // Scale the highlight canvas to match the table canvas
    const tempHighlightCanvas = document.createElement('canvas');
    const tempHighlightCtx = tempHighlightCanvas.getContext('2d');
    tempHighlightCanvas.width = tableCanvas.width;
    tempHighlightCanvas.height = tableCanvas.height;

    // Draw the highlight canvas onto the temporary scaled canvas
    tempHighlightCtx.drawImage(
        highlightCanvas,
        0, 0, highlightCanvas.width, highlightCanvas.height, // Source dimensions
        0, 0, tempHighlightCanvas.width, tempHighlightCanvas.height // Target dimensions
    );

    // Draw the table canvas onto the merged canvas
    ctx.drawImage(tableCanvas, 0, 0);

    // Draw the scaled highlight canvas on top of the merged canvas
    ctx.drawImage(tempHighlightCanvas, 0, 0);

    // Convert the merged canvas to an image
    const finalImage = mergedCanvas.toDataURL('image/png');

    // Open the image in a new tab or save it
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = filename + '.png';
    link.click();
}

fillDirectionsDiv()

const container = document.getElementById('word-search-container-container').addEventListener('scroll', synchronizeAnswersCanvas);
window.addEventListener('resize', () => {
    positionAnswersCanvas()
    synchronizeAnswersCanvas()
});