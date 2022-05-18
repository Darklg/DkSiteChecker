const myArgs = process.argv.slice(2);
const puppeteer = require('puppeteer');

const puppet_args = JSON.parse(myArgs[0]);

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
    var dksitechecker_hide_cookie_notices = function(puppet_args) {
        var element = document.createElement('style');
        document.head.appendChild(element);
        element.sheet.insertRule(puppet_args.hidden_elements + '{display:none!important}', 0);
    }

    console.log("# JS Errors");
    await page.goto(puppet_args.urlcurrent);
    await page.evaluate(dksitechecker_hide_cookie_notices, puppet_args);
    await page.setViewport(_viewport);

    console.log("# Invalid elements");
    var _rule_count,
        _rules = [
            '[id=""],[class=""],[name=""],[for=""]',
            'a a',
            'button:not([type])',
            'form form',
            'i[class*="icon_"]:not([aria-hidden])',
            'img:not([alt])',
            'p div',
            'p p',
        ];
    for (var _rule in _rules) {
        try {
            await page.$$(_rules[_rule])
            if (_rule_count = (await page.$$(_rules[_rule])).length) {
                console.log("- " + _rules[_rule] + " : " + _rule_count + " result(s)");
            }
        }
        catch {}
    }

    console.log("# Page Metrics");
    const gitMetrics = await page.metrics();
    if (gitMetrics.Nodes > 1500) {
        console.info("- Too many DOM nodes : " + gitMetrics.Nodes)
    }
    if (gitMetrics.ScriptDuration > 0.1) {
        console.info("- Script Duration too long : " + gitMetrics.ScriptDuration)
    }

    if (puppet_args.urlsource.length) {
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

        await page2.goto(puppet_args.urlsource);
        await page2.evaluate(dksitechecker_hide_cookie_notices, puppet_args);
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
