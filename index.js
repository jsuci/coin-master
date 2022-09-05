const puppeteer = require('puppeteer');


async function startBot() {
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 50,
        defaultViewport: null,
        executablePath: '.\\node_modules\\puppeteer\\.local-chromium\\win64-1036745\\chrome-win\\chrome.exe',
        userDataDir: process.env.LOCALAPPDATA + '\\Chromium\\User Data',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--mute-audio',
            '--disable-web-security',
            '--profile-directory=Profile 1',
        ],
    });


    // create page
    const [page] = await browser.pages();


    // connect to Chrome DevTools
    // const client = await page.target().createCDPSession()

    // set throttling property
    // await client.send('Network.emulateNetworkConditions', {
    //     'offline': false,
    //     'downloadThroughput': 50 * 1024 / 8,
    //     'uploadThroughput': 20 * 1024 / 8,
    //     'latency': 500
    // })

    await login(page);

}



async function login(page) {
    try {

        // login
        await page.goto('https://mobile.twitter.com/i/flow/login', {
            waitUntil: 'networkidle0',
        });

        await page.waitForSelector("input[name='text']", {
            timeout: 60000,
            visible: true,
        }).then(async () => {
            console.log('typing username.')
            await page.type("input[name='text']", 'coinmasterfan6', {delay: 100})

            console.log('clicking next.')
            const nextButton = await page.$x("//*[text()='Next']")
            await Promise.all([
                nextButton[0].click(),
                page.waitForSelector("input[name='password']")
            ])

            console.log('typing password.')
            await page.type("input[name='password']", 'twitter-Jsuci#0', {delay: 100})

            console.log('clicking log in.')
            const loginButton = await page.$x("//*[text()='Log in']")
            await Promise.all([
                loginButton[0].click(),
            ])

        });

        // home page
        await page.waitForXPath("//*[text()='Next']", {
            timeout: 30000,
            visible: true,
        }).then(async () => {
            console.log('already logged in.')
            const homePage = await page.$x("//*[text()='Next']");

            console.log('clicking next.')
            await Promise.all([
                homePage[0].click(),
                page.waitForXPath("//*[text()='Home']")
            ])

            console.log('home page loaded.')
        }).catch(async () => {
            await page.waitForXPath("//*[text()='Home']", {
                timeout: 60000,
                visible: true,
            }).then(()=> {
                console.log('home page loaded.')
            })
        })

        page.screenshot({ path: 'test-screenshot.jpg' , type: 'jpeg' })

    } catch (e) {
        console.log(`error: ${e}`);
        console.log('restarting bot.')
        await restartBot(browser);
    }

}

async function restartBot(browser) {
    await browser.close();
    await startBot();
}

startBot();