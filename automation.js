const fs = require('fs')
const path = require('path')
const os = require('os')
const { remote } = require('webdriverio')
const downloadsDir = path.join(os.homedir(), 'Downloads')

const downloadHelper = async (downloadTriggerFn, afterDownloadedFn) => {
    const getDownloads = () => fs.readdirSync(downloadsDir).filter(f => !(f.endsWith('crdownlaod') || f.endsWith('.part')))
    const originalItems = getDownloads()
    await downloadTriggerFn()
    var newItems = []
    while (newItems.length == 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        newItems = getDownloads().filter(e => originalItems.indexOf(e) < 0)
    }
    await afterDownloadedFn(newItems)
}

const automateGenSimple = async (input, filename, dir, inputChanges = []) => {
    var browser;
    try {
        // Skip if okay
        const saveDir = dir ?? downloadsDir
        const saveName = path.join(saveDir, `${filename}.png`);
        const solvedSaveName = path.join(saveDir, `${filename}_solved.png`);
        if (fs.existsSync(saveName) && fs.existsSync(solvedSaveName)) {
            console.log(`${saveName} and solution already exist, skipping...`)
            return
        }

        // Init
        browser = await remote({
            capabilities: {
                browserName: 'chrome', // You can use other browsers as well
                'goog:chromeOptions': {
                    prefs: {
                        'profile.default_content_setting_values.automatic_downloads': 1,
                    },
                },
            },
        })
        await browser.url('https://wsg.imranr.dev/')
        await browser.waitUntil(async () => {
            const elem = await browser.$('#word-list')
            return await elem.isExisting()
        }, { timeout: 10000, timeoutMsg: 'Element #word-list not found' })

        for (var i = 0; i < inputChanges.length; i++) {
            try {
                const input = (await browser.$(`#${inputChanges[i].id}`))
                if (typeof inputChanges[i].value === 'boolean') {
                    if ((await input.isSelected()) != inputChanges[i]) {
                        await input.click()
                    }
                } else {
                    await input.setValue(inputChanges[i].value)
                }
            } catch (e) {
                console.error(e)
            }
        }

        // Generate
        await (await browser.$('#word-list')).setValue(input)
        await (await browser.$('#generate-btn')).click()
        await browser.waitUntil(async () => {
            const elem = await browser.$('#word-search-table')
            return await elem.isExisting()
        }, { timeout: 10000, timeoutMsg: 'Element #word-search-table not found' })
        browser.pause(10000)
        // Save unsolved
        await downloadHelper(
            async () => {
                await (await browser.$('#save-btn')).click()
                await browser.acceptAlert()
            },
            async (downloadedFiles) => {
                fs.renameSync(path.join(downloadsDir, downloadedFiles[0]), saveName)
            }
        )

        // Solve
        await (await browser.$('#solve-btn')).click()

        // Save solved
        await downloadHelper(
            async () => {
                await (await browser.$('#save-btn')).click()
                await browser.acceptAlert()
            },
            async (downloadedFiles) => {
                fs.renameSync(path.join(downloadsDir, downloadedFiles[0]), solvedSaveName)
            }
        )
    } catch (error) {
        console.error('An error occurred:', error)
    } finally {
        if (browser) {
            await browser.deleteSession()
        }
    }
}

const main = async (inputFile, outputDir, inputChanges) => {
    const entries = fs.readFileSync(inputFile).toString().split('\n').map(s => s.trim()).filter(s => s.length > 0).map(s => {
        var parts = s.split(':').map(p => p.trim())
        if (parts.length == 1) {
            parts = [parseInt((Math.random() * 10000)).toString(), parts[0]]
        } else if (parts.length > 2) {
            parts = [parts[0], parts.slice(1).join(':')]
        }
        return {
            filename: parts[0],
            inputText: parts[1].split(' ').join('\n')
        }
    })
    for (let i = 0; i < entries.length; i++) {
        await automateGenSimple(entries[i].inputText, entries[i].filename, outputDir, inputChanges)
    }
}

const inputFile = process.argv[2] || '../word-search-generator/automation-example.txt'
const outputDir = process.argv[2] ? path.resolve(path.dirname(inputFile)) : null
const inputChanges = process.argv[3] ? JSON.parse(process.argv[3]) : [
    { id: 'sparse-checkbox', value: true }
]
main(inputFile, outputDir, inputChanges).then(() => console.log('Done!')).catch(e => console.error(e))
