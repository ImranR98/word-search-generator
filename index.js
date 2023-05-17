const wordListInput = document.getElementById("word-list")
const generateButton = document.getElementById("generate-btn")
const solveButton = document.getElementById("solve-btn")
const saveButton = document.getElementById("save-btn")
const wordSearchContainer = document.getElementById("word-search-container")
const cellSizeInput = document.getElementById("cell-size-input")
const borderThicknessInput = document.getElementById("border-thickness-input")
const fontSizeInput = document.getElementById("font-size-input")

function fillDirectionsDiv() {
    let directionsDiv = document.getElementById("directionsDiv")
    directions.forEach(([dx, dy, dirName]) => {
        let label = document.createElement("label")
        let checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.name = dirName
        checkbox.value = dirName
        checkbox.checked = true
        label.style="margin-right: 0.5rem; margin-bottom: 1rem"
        label.appendChild(checkbox)
        label.appendChild(document.createTextNode(dirName))
        directionsDiv.appendChild(label)
    })
}

function getPickedDirections() {
    var checkedValues = []
    var checkboxes = directionsDiv.getElementsByTagName("input")
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type === "checkbox" && checkboxes[i].checked) {
            checkedValues.push(checkboxes[i].value)
        }
    }
    return directions.filter(([dx, dy, n]) => checkedValues.includes(n))
}

function renderWordSearch(grid, answers) {
    const cellSizePx = !!cellSizeInput.value ? cellSizeInput.value : 64
    const borderSizePx = !!borderThicknessInput.value ? borderThicknessInput.value : 2
    const fontSizePx = !!fontSizeInput.value ? fontSizeInput.value : 32
    const numRows = grid.length
    const numCols = grid[0].length

    let html = `<table id="word-search-table" style="border-spacing: 0; border-collapse: separate; border: ${borderSizePx}px solid black;">`
    for (let i = 0; i < numRows; i++) {
        html += '<tr">'
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
            html += '<td style="min-width: ' + cellSizePx + 'px; width: ' + cellSizePx + 'px; height: ' + cellSizePx + 'px; border: ' + borderSizePx + 'px solid black; background-color: ' + (isBold ? color : 'White') + '; font-weight: ' + (isBold ? 'bold' : 'normal') + '; text-align: center; font-size: ' + fontSizePx + 'px;">' + cell + '</td>'
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

const getWords = () => {
    return wordListInput.value.split(',').join('\n').split("\n").map((word) => word.toLowerCase().trim()).filter((word) => word.length > 0)
}

// Add event listeners to buttons
generateButton.addEventListener("click", () => {
    const words = getWords()
    console.log('Words: ', words)
    const size = Math.max(...[...words.map(w => w.length), Math.ceil(Math.sqrt(words.reduce((sum, word) => sum + word.length, 0) * 2))])
    console.log('Size: ' + size)
    const dirs = getPickedDirections()
    console.log('Picked directions: ', dirs)
    const grid = fillEmptyCells(placeWords(generateGrid(size), words, dirs))
    const wordSearchHtml = renderWordSearch(grid)
    wordSearchContainer.innerHTML = wordSearchHtml
    solveButton.style.display = 'block'
    saveButton.style.display = 'block'
    toggleSolved(false)
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
    const words = getWords()
    // Solve the word search
    const solutions = solveWordSearch(grid, words)

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