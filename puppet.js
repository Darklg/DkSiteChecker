const myArgs = process.argv.slice(2);
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page
        .on('console', function(message) {
            var oktypes = ['LOG'];
            var _type = message.type().substr(0, 3).toUpperCase();
            if (oktypes.includes(_type)) {
                return;
            }
            console.log(`${_type} ${message.text()}`);
        })
        .on('pageerror', function(message) {
            console.log(message);
        })
        .on('response', function(response) {
            var okresponses = [200, 206, 302, 301];
            if (okresponses.includes(response.status())) {
                return;
            }
            console.log(`${response.status()} ${response.url()}`)
        })
        .on('requestfailed', function(request) {
            console.log(`${request.failure().errorText} ${request.url()}`);
        });


    console.log("# JS Errors");
    await page.goto(myArgs[0]);

    console.log("# Page Metrics");
    const gitMetrics = await page.metrics();
    if(gitMetrics.Nodes > 1500){
        console.info("- Too many DOM nodes : " + gitMetrics.Nodes)
    }
    if(gitMetrics.ScriptDuration > 0.1){
        console.info("- Script Duration too long : " + gitMetrics.ScriptDuration)
    }


    await browser.close();
})();
