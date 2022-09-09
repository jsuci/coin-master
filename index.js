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
    await getFollowers(page, 'https://twitter.com/BentalbSimo')

    console.log('taking screenshot.')
    await delay(5000);
    await page.screenshot({ path: 'test-screenshot.jpg' , type: 'jpeg' });

}

async function getFollowers(page, url) {

    console.log('opening followers page.')
    await page.goto(url, {
        waitUntil: 'load',
    });

    console.log("getting total followers.")
    await page.waitForSelector("div:nth-child(2) > a[role='link'] > span > span", {
        timeout: 60000,
        visible: true,
    }).then(async (element) => {
        const followersCount = await page.$eval("div:nth-child(2) > a[role='link'] > span > span", (el) => {
            function convertToInt(num) {
                let value = 0;
    
                if (num.includes("M")) {
                    value = parseInt(parseFloat(num) * 1000000);
                } else if (num.includes("K")) {
                    value = parseInt(parseFloat(num) * 10000);
                } else {
                    value = parseInt(num.replace(",", ""))
                }

                return value;
    
            }
            return convertToInt(el.innerText);
        })

        console.log(`total followers: ${followersCount}`);

        console.log("clicking followers list.")
        await page.click("div:nth-child(2) > a[role='link'] > span > span")
        console.log("5sec delay.")
        await delay(5000)

        await page.waitForSelector("div[data-testid='cellInnerDiv']", {
            timeout: 60000,
            visible: true,
        }).then(async () => {

            const followers = await page.evaluate((followersCount) => {

                async function filterDuplicate(arr) {
                   const results =  Array.from(new Set(arr.map(x => x.id))).map(id => {
                        return {
                            id: id,
                            link: arr.find(s => s.id === id).link
                        }
                    })

                    return results;
                }

                async function getIDLInk(followersCount) {
                    let entries = []

                    while (await new Promise(resolve => setTimeout(() => resolve(entries.length), 20000)) <= followersCount) {

                        await Promise.all([
                            setTimeout(() => {
                                console.log("scroll page.");
                                window.scrollTo(0, window.document.body.scrollHeight)
                            }, 3000),
                            setTimeout(() => {
                                console.log("get cells.");
                                let cells = document.querySelectorAll("div[data-testid='cellInnerDiv']");
                                for (let i = 0; i < (cells.length - 1); i++) {
                                    const idLink = cells[i].querySelectorAll(
                                        "div:nth-child(1) > a[role='link'][tabindex='-1']")[1];
                                    const twitterID = idLink.innerText;
                                    const twitterLink = idLink.href;
        
                                    entries.push({id: twitterID, link: twitterLink});
                                }

                            }, 9000),
                        ])
                        
                        console.log(entries);
                    }

                    return await filterDuplicate(entries)
                    
                }

                return getIDLInk(followersCount);


            }, followersCount)

            console.log(followers)
        })
    })

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

            console.log('home page loaded.\n\n')
        }).catch(async () => {
            await page.waitForXPath("//*[text()='Home']", {
                timeout: 60000,
                visible: true,
            }).then(()=> {
                console.log('home page loaded.\n\n')
            })
        })

        console.log("10sec delay.")
        await delay(10000);


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

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

startBot();