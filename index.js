const puppeteer = require('puppeteer');
const csvToJson = require('convert-csv-to-json');
const ObjectsToCsv = require('objects-to-csv');


async function startBot() {

    const browser = await puppeteer.launch({
        headless: false,
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

    // global functions
    await page.exposeFunction("filterDuplicate", filterDuplicate);
    await page.exposeFunction("readCleanCSV", readCleanCSV);
    await page.exposeFunction("saveCSV", saveCSV);

    const twitterPages = [
        // "https://twitter.com/anonimoXD1_2_3",
        // "https://twitter.com/wojackol",
        // "https://twitter.com/Hoonyrock_me"
        "https://twitter.com/Todayspinlinks",
        "https://twitter.com/Arima17071520",
        "https://twitter.com/donatebtc2019",
        "https://twitter.com/coinmastercard",
        "https://twitter.com/coinmaster1978",
        "https://twitter.com/coinmaster2022f",
        "https://twitter.com/CoinmasterSpi20",
        "https://twitter.com/coinmastergifts",
        "https://twitter.com/CoinMas46556769",
        "https://twitter.com/link_SPINS",
        "https://twitter.com/BentalbSimo",
        "https://twitter.com/spinmas55376377",
        "https://twitter.com/RewardSpinLink",
        "https://twitter.com/CoinMasterShare",
        "https://twitter.com/Wins_Spins",
        "https://twitter.com/CoinMasterUS",
        "https://twitter.com/TiradasGratisCM",
        "https://twitter.com/Zara46742541",
        "https://twitter.com/FreeCoin_Master",
        "https://twitter.com/coinmaster_tool",
        "https://twitter.com/spinscheats",
        "https://twitter.com/coinmaster30",
        "https://twitter.com/makeMon58968772",
        "https://twitter.com/Generatorgames2",
        "https://twitter.com/sreyno36468144",
        "https://twitter.com/ThetanArenaN",
        "https://twitter.com/spinsandcoins",
        "https://twitter.com/freespin1k",
        "https://twitter.com/freespin_2022",
        "https://twitter.com/claimspin",
        "https://twitter.com/coinmasterxyz",
        "https://twitter.com/freespincoins",
        "https://twitter.com/DailySpins1",
        "https://twitter.com/Freesspinslinks",
        "https://twitter.com/coinmaster55165",
        "https://twitter.com/weirdnews2k",
        "https://twitter.com/coin_masterfree",
        "https://twitter.com/CoinMas83793700",
        "https://twitter.com/coinmasterusa2",
        "https://twitter.com/cmfree70spinli1",
        "https://twitter.com/CoinUnlimited",
        "https://twitter.com/CoinOfficail",
        "https://twitter.com/6djchandu",
        "https://twitter.com/freespinlink",
        "https://twitter.com/CMClaimSpins",
        "https://twitter.com/CoinMasterGamer",
        "https://twitter.com/cmspinsdaily",
        "https://twitter.com/links_coin",
        "https://twitter.com/coinmaster_spin",
        "https://twitter.com/CoinMasterLinks",
        "https://twitter.com/coinmastertweet",
        "https://twitter.com/daily_spins",
        "https://twitter.com/coin_masterss",
        "https://twitter.com/coinmaster_spn",
        "https://twitter.com/coinmasterspint",
        "https://twitter.com/coinmaster09",
        "https://twitter.com/coinmasterspind",
        "https://twitter.com/Coinmasterspi9",
        "https://twitter.com/coinmasterspins",
        "https://twitter.com/coinmaster222",
        "https://twitter.com/FloranceOlman",
        "https://twitter.com/Spingift1",
        "https://twitter.com/coinmaster_link",
        "https://twitter.com/sokly72168231",
        "https://twitter.com/Free_Spinss",
        "https://twitter.com/garden_scapes",
        "https://twitter.com/CoinMas50294009",
        "https://twitter.com/CoinMasterGame",
        "https://twitter.com/RewardSpinLink"
    ]

    try {
        await login(page, browser);

        for (const ePage of twitterPages) {
            await getFollowers(page, ePage)
        }
        
        console.log('taking screenshot.')
        await delay(5000);
        await page.screenshot({ path: 'test-screenshot.jpg' , type: 'jpeg' });
    } catch (e) {
        console.log(`error: ${e}`);
        console.log('restarting bot.')
        await restartBot(browser);
    }


}

async function getFollowers(page, url) {

    console.log(`\n\nopening ${url} page.`)
    await page.goto(url, {
        waitUntil: 'load',
    });

    console.log("getting total followers.")
    await page.waitForSelector("div:nth-child(2) > a[role='link'] > span > span", {
        timeout: 60000,
        visible: true,
    }).then(async (element) => {

        // change div:nth-child(1) to switch from followers to following
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
        // change div:nth-child(1) to switch from followers to following
        await page.click("div:nth-child(2) > a[role='link'] > span > span")
        console.log("10sec delay.")
        await delay(10000)

        await page.waitForSelector("div[data-testid='cellInnerDiv']", {
            timeout: 60000,
            visible: true,
        }).then(async () => {

            console.log("getting followers.");
            let allFollowers = []

            while (allFollowers.length < followersCount) {

                await new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        // scroll page, get partial results, log partial results, append to allFollowers
                        const partialFollowers = await page.evaluate(async () => {

                            let entries = []

                            const promise1 = new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    console.log("scroll page.");
                                    window.scrollTo(0, window.document.body.scrollHeight)
                                    resolve(true);
                                }, 3000);
                            });

                            const promise2 = new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    console.log("get cells.");
                                    let cells = document.querySelectorAll("div[data-testid='cellInnerDiv']");
                                    let temp = []
                                    for (let i = 0; i < (cells.length - 1); i++) {

                                        try {
                                            const idLink = cells[i].querySelectorAll(
                                                "div:nth-child(1) > a[role='link'][tabindex='-1']")[1];
                                            const twitterID = idLink.innerText;
                                            const twitterLink = idLink.href;
    
                                            if (twitterID !== undefined) {
                                                temp.push({id: twitterID, link: twitterLink});
                                            }
                                        } catch (e) {
                                            console.log('an error occured. continue loop')
                                            continue
                                        }

                                    }

                                    resolve(temp)
                                }, 3000);
                            });

                            await Promise.allSettled([
                                promise1,
                                promise2                   
                            ]).then(async (values) => {

                                if (values[1].status == 'fulfilled') {
                                    entries.push(...values[1].value)
                                }
                            }) //end Promise.all()

                            return entries

                        })// end page.evaluate()

                        resolve(partialFollowers)

                    }, 10000)
                }).then(async (value) => {

                    allFollowers = allFollowers.concat(value)
                    console.log(`${allFollowers.length} out of ${followersCount} completed`)

                    console.log(`saving partial followers\n`)
                    await saveCSV('followers.csv', value, true)

                })
            } // end while

            console.log('cleaning followers.csv')
            const csvEntries = await readCleanCSV('followers.csv')
            console.log(`total saved followers: ${csvEntries.length}`)
            await saveCSV('followers.csv', csvEntries, false)


        })
    })

}

async function readCleanCSV(fileName) {
    let results = []

    try {
        let json = csvToJson.fieldDelimiter(',').getJsonFromCsv(fileName);

        for(let i = 0; i < json.length; i++) {
            results.push(json[i]);
        }
    } catch (e) {
        console.log("csv not found.")
    }

    return filterDuplicate(results);
}

async function saveCSV(fileName, lst, append) {

    // let prevFollowers = await readCSV(fileName)

    // console.log("merging new data.")
    // let mergeFollowers = prevFollowers.concat(lst);
    // console.log(`total merged: ${mergeFollowers.length}`)

    // console.log("filtering data.")
    // let filteredFollowers = await filterDuplicate(mergeFollowers)
    // console.log(`total filtered: ${filteredFollowers.length}`)

    // console.log("saving data.")
    const csv = new ObjectsToCsv(lst);
    await csv.toDisk(`./${fileName}`, {append: append});

    // console.log('\n')
}

async function filterDuplicate(arr) {
    const results =  Array.from(new Set(arr.map(x => x.id))).map(id => {

        if (id !== undefined) {
            return {
                id: id,
                link: arr.find(s => s.id === id).link
            }
        } else {
            return {}
        }
    })

    return results;
}

async function login(page) {

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
    }).catch(async () => {
        await delay(5000);
    })

    console.log('home page loaded.')
    console.log("10sec delay.\n\n")
    await delay(10000);

}

async function restartBot(browser) {
    await browser.close();
    await startBot();
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

startBot();