const myArgs = process.argv.slice(2);
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page
        .on('console', message =>
            console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
        .on('pageerror', ({
            message
        }) => console.log(message))
        .on('response', function(response) {
            var okresponses = [200, 206, 302, 301];
            if (okresponses.includes(response.status())) {
                return;
            }
            console.log(`${response.status()} ${response.url()}`)
        })
        .on('requestfailed', request =>
            console.log(`${request.failure().errorText} ${request.url()}`))

    await page.goto(myArgs[0]);
    await browser.close();
})();
