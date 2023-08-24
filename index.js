const wordListInput = document.getElementById("word-list")
const generateButton = document.getElementById("generate-btn")
const solveButton = document.getElementById("solve-btn")
const saveButton = document.getElementById("save-btn")
const wordSearchContainer = document.getElementById("word-search-container")
const cellSizeInput = document.getElementById("cell-size-input")
const borderThicknessInput = document.getElementById("border-thickness-input")
const fontSizeInput = document.getElementById("font-size-input")
const isManualCheckbox = document.getElementById("manual-checkbox")

cellSizeInput.value = localStorage.getItem('cell-size-val') || cellSizeInput.value
borderThicknessInput.value = localStorage.getItem('border-size-val') || borderThicknessInput.value
fontSizeInput.value = localStorage.getItem('font-size-val') || fontSizeInput.value

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

function renderWordSearch(grid, answers) {
    const cellSizePx = !!cellSizeInput.value ? cellSizeInput.value : 64
    const borderSizePx = !!borderThicknessInput.value ? borderThicknessInput.value : 2
    const fontSizePx = !!fontSizeInput.value ? fontSizeInput.value : 32
    const numRows = grid.length
    const numCols = grid[0].length

    localStorage.setItem('cell-size-val', cellSizePx)
    localStorage.setItem('border-size-val', borderSizePx)
    localStorage.setItem('font-size-val', fontSizePx)

    let html = `<table id="word-search-table" style="border-spacing: 0; border-collapse: separate; border: ${borderSizePx}px solid black;">`
    for (let i = 0; i < numRows; i++) {
        html += '<tr">'
        for (let j = 0; j < numCols; j++) {
            let isBold = false
            let cell = grid[i][j]
            const upperCase = document.getElementById('uppercase-checkbox').checked
            cell = upperCase ? cell.toUpperCase() : cell.toLowerCase()
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
            html += '<td style="min-width: ' + cellSizePx + 'px; width: ' + cellSizePx + 'px; height: ' + cellSizePx + 'px; border: ' + borderSizePx + 'px solid black; background-color: ' + (isBold ? color : 'White') + '; font-weight: ' + (isBold ? 'bold' : 'normal') + '; text-align: center; font-size: ' + fontSizePx + 'px;" class="tooltip">'
                + cell
                + '<span class="tooltiptext" style="width: ' + cellSizePx + 'px; font-size: ' + fontSizePx + 'px;">' + i + ',' + j + '</span>'
                + '</td>'
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

var solved = false
const toggleSolved = (override) => {
    solved = override == undefined ? !solved : override
    solveButton.innerHTML = (solved ? 'Unsolve' : 'Solve') + ' Word Search'
}

const isManualFormat = () => {
    var lines = wordListInput.value.split('\n')
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
    var words = wordListInput.value.split('\n').map(line => {
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
    console.log(words)
    var solutions = {}
    words.forEach(word => {
        solutions[word.word] = []
        var letters = word.word.split('')
        for (let i = 0; i < letters.length; i++) {
            solutions[word.word].push([word.x + (word.direction[0] * i), word.y + (word.direction[1] * i)])
        }
    })
    console.log(solutions)
    return solutions
}

const getWordsAuto = () => {
    return wordListInput.value.split(',').join('\n').split("\n").map((word) => word.trim().split(' ').join('')).filter((word) => word.length > 0)
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
        const size = Math.max(...[...words.map(w => w.length), Math.ceil(Math.sqrt(words.reduce((sum, word) => sum + word.length, 0) * 2))])
        const dirs = getRepeatedDirs()
        grid = fillEmptyCells(placeWordsAuto(generateGrid(size), words, dirs))
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
        toggleSolved(false)
    }
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
            row.push(table.rows[i].cells[j].innerText)
        }
        grid.push(row)
    }
    // Solve the word search
    const solutions = isManualCheckbox.checked ? getWordsManual() : solveWordSearch(grid, getWordsAuto())
    // Render the word search
    const wordSearchHtml = renderWordSearch(grid, solved ? null : solutions)
    wordSearchContainer.innerHTML = wordSearchHtml
    toggleSolved()
})
saveButton.addEventListener("click", () => {
    saveDivAsPng('word-search-table', 'word_search_' + Math.ceil((Math.random() * 10000)).toString(), 5)
})
function saveDivAsPng(divId, filename) {
    const defaultScale = 5
    let scale = prompt('Enter size multiplier (default is ' + defaultScale + ')') || defaultScale
    const element = document.getElementById(divId)
    try {
        Number.parseInt(scale)
    } catch (e) {
        scale = defaultScale
    }
    html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
    }).then(function (canvas) {
        const link = document.createElement('a')
        link.download = filename + '.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
    })
}


fillDirectionsDiv()