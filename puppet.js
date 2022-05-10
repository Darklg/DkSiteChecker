const myArgs = process.argv.slice(2);
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    var okresponses = [200, 206, 302, 301],
        _viewport = {
            width: 1080,
            height: 2560
        },
        _viewportmob = {
            width: 360,
            height: 2560
        };

    /* Trigger errors */
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
            if (okresponses.includes(response.status())) {
                return;
            }
            console.log(`${response.status()} ${response.url()}`)
        })
        .on('requestfailed', function(request) {
            console.log(`${request.failure().errorText} ${request.url()}`);
        });


    /* Helper : hide cookie */
    var dksitechecker_hide_cookie_notices = function(){
        var element = document.createElement('style');
        document.head.appendChild(element);
        element.sheet.insertRule('.qc-cmp2-container,body>.cookie-notice,.modal[data-visible="1"]{display:none!important}', 0);
    }

    console.log("# JS Errors");
    await page.goto(myArgs[0]);
    await page.evaluate(dksitechecker_hide_cookie_notices);
    await page.setViewport(_viewport);

    console.log("# Page Metrics");
    const gitMetrics = await page.metrics();
    if (gitMetrics.Nodes > 1500) {
        console.info("- Too many DOM nodes : " + gitMetrics.Nodes)
    }
    if (gitMetrics.ScriptDuration > 0.1) {
        console.info("- Script Duration too long : " + gitMetrics.ScriptDuration)
    }

    if (myArgs[1].length) {
        /* Screenshot current URL */
        console.log("- Screenshot current");
        await page.waitForTimeout(3000);
        await page.screenshot({
            path: `page-current.png`
        });
        await page.setViewport(_viewportmob);
        await page.waitForTimeout(500);
        await page.screenshot({
            path: `pagemobile-current.png`
        });

        /* Screenshot source URL */
        console.log("- Screenshot source");
        const browser2 = await puppeteer.launch();
        const page2 = await browser2.newPage();

        await page2.goto(myArgs[1]);
        await page2.evaluate(dksitechecker_hide_cookie_notices);
        await page2.setViewport(_viewport);
        await page2.waitForTimeout(3000);
        await page2.screenshot({
            path: `page-source.png`
        });
        await page2.setViewport(_viewportmob);
        await page2.waitForTimeout(500);
        await page2.screenshot({
            path: `pagemobile-source.png`
        });
        await browser2.close();

    }

    await browser.close();
})();
