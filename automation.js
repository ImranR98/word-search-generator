const fs = require('fs')
const path = require('path')
const os = require('os')
const { remote } = require('webdriverio')

const getLatestFileInDir = (dir) => {
    const files = fs.readdirSync(dir)
    return files.reduce((prev, current) => {
        const prevTimestamp = fs.statSync(path.join(dir, prev)).mtime.getTime()
        const currentTimestamp = fs.statSync(path.join(dir, current)).mtime.getTime()
        return prevTimestamp > currentTimestamp ? prev : current
    })
}

const automateGenSimple = async (input, filename) => {
    const browser = await remote({
        capabilities: {
            browserName: 'chrome', // You can use other browsers as well
            'goog:chromeOptions': {
                prefs: {
                    'profile.default_content_setting_values.automatic_downloads': 1,
                },
            },
        },
    })

    try {
        // Skip if okay
        const downloadsDir = path.join(os.homedir(), 'Downloads')
        const saveName = path.join(downloadsDir, `${filename}.png`);
        const solvedSaveName = path.join(downloadsDir, `${filename}_solved.png`);
        if (fs.existsSync(saveName) && fs.existsSync(solvedSaveName)) {
            console.log(`${saveName} and solution already exist, skipping...`)
            return
        }

        // Init
        await browser.url('https://wsg.imranr.dev/')
        await browser.waitUntil(async () => {
            const elem = await browser.$('#word-list')
            return await elem.isExisting()
        }, { timeout: 10000, timeoutMsg: 'Element #word-list not found' })

        // Generate
        await (await browser.$('#word-list')).setValue(input)
        await (await browser.$('#generate-btn')).click()

        // Save unsolved
        await (await browser.$('#save-btn')).click()
        await browser.acceptAlert()
        await browser.pause(500)
        fs.renameSync(path.join(downloadsDir, getLatestFileInDir(downloadsDir)), saveName)

        // Solve
        await (await browser.$('#solve-btn')).click()

        // Save solved
        await (await browser.$('#save-btn')).click()
        await browser.acceptAlert()
        await browser.pause(500)
        fs.renameSync(path.join(downloadsDir, getLatestFileInDir(downloadsDir)), solvedSaveName)
    } catch (error) {
        console.error('An error occurred:', error)
    } finally {
        await browser.deleteSession()
    }
}

const main = async (inputFile) => {
    const entries = fs.readFileSync(inputFile).toString().split('\n').map(s => s.trim()).filter(s => s.length > 0).map(s => {
        var parts = s.split(':').map(p => p.trim())
        if (parts.length == 1) {
            parts = [(Math.random() * 10000).toString(), parts[0]]
        } else if (parts.length > 2) {
            parts = [parts[0], parts.slice(1).join(':')]
        }
        return {
            filename: parts[0],
            inputText: parts[1].split(' ').join('\n')
        }
    })
    for (let i = 0; i < entries.length; i++) {
        await automateGenSimple(entries[i].inputText, entries[i].filename)
    }
}

main(process.argv[2] || 'automation-example.txt').then(() => console.log('Done!')).catch(e => console.error(e))
