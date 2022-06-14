const myArgs = process.argv.slice(2);
const puppeteer = require('puppeteer');

const puppet_args = JSON.parse(myArgs[0]);

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    var okresponses = [200, 204, 206, 302, 301],
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
            var ignoredtypes = ['LOG'];
            var _type = message.type().substr(0, 3).toUpperCase();
            if (ignoredtypes.includes(_type)) {
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
            var ignoredtypes = ['net::ERR_ABORTED'];
            if (ignoredtypes.includes(request.failure().errorText)) {
                return;
            }
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

    await page.evaluate(function(puppet_args) {
        var _cookies = ['_ga', '_gid', '_fbp', '__hstc'];
        for (var i = 0, len = _cookies.length; i < len; i++) {
            if (document.cookie.indexOf(_cookies[i] + '=') > -1) {
                console.error('The cookie “' + _cookies[i] + '” should not be present without user consent.');
            }
        }
    });

    var _rules_list = {
        'access': {
            'name': 'Accessibility problems',
            'rules': [
                'button:not([title]) > [class*="icon"]:only-child',
                'a[href="#"]:not([role])',
                'i[class*="icon"]:not([aria-hidden])',
            ]
        },
        'perf': {
            'name': 'Performance problems',
            'rules': [
                'img:not([loading])',
                'iframe:not([loading])',
            ]
        },
        'security': {
            'name': 'Security problems',
            'rules': [
                'a[target]:not([rel])',
            ]
        },
        'various': {
            'name': 'Various problems',
            'rules': [
                '[id=""],[class=""],[name=""],[for=""]',
                '[onclick],[onload],[onkeydown]',
                'a[href=""],a[href=" "]',
                'button:not([type])',
                'form:not([action])',
                'input:not([name])',
                'input:not([type])',
                'html:not([lang])',
                'title:empty',
            ]
        }
    }

    console.log("# Invalid elements");

    var _rule_count,
        _rules;
    for (var _rule_item in _rules_list) {
        console.log('- ' + _rules_list[_rule_item].name);
        _rules = _rules_list[_rule_item].rules;
        for (var _rule in _rules) {
            try {
                await page.$$(_rules[_rule])
                if (_rule_count = (await page.$$(_rules[_rule])).length) {
                    console.log(" --- " + _rules[_rule] + " : " + _rule_count + " result(s)");
                }
            }
            catch {}
        }
    }

    /* Add special rules */
    var _special_rules = [function() {
        if (document.querySelectorAll('meta[charset]').length < 1) {
            console.error('The meta charset is missing.');
        }
    }, function() {
        if (document.querySelectorAll('h1').length < 1) {
            console.error('There is no H1 element.');
        }
    }, function() {
        if (document.querySelectorAll('h1').length > 1) {
            console.error('There is more than H1 element.');
        }
    }];
    for (var _rule_test in _special_rules) {
        await page.evaluate(_special_rules[_rule_test]);
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
