
var path = require('path');

exports.dealWithAjax = function(externalConfig, req, res, next, cbk){
    
    var siteConfig = getConfig(externalConfig);
    var fragment = req.query._escaped_fragment_;
    var isCrawler = checkCrawler(siteConfig, req);

    if(siteConfig.debug) console.log(siteConfig.appPrefix+'isCrawler',isCrawler);

    if (isAjaxAllowedRequest(siteConfig, req)) {
        if (!isCrawler) {
            if(siteConfig.debug) console.log(siteConfig.appPrefix+"sending to ajaxpath: ", siteConfig.ajaxPath);
            res.setHeader('Content-Type', 'text/html');
            res.sendFile(siteConfig.ajaxPath);
        }else{
            fragment = req._parsedUrl.pathname;
            // if(siteConfig.debug) console.log(siteConfig.appPrefix+"Dealing with escaped fragments. Entering with: ",req);
            dealWithEscapedFragments(siteConfig, fragment, res, cbk);
        }
    } else {
        next();
    }
};

function getConfig(externalConfig) {
    var siteConfig = externalConfig;
    siteConfig.appPrefix = "[node-ajax-seo] ";
    siteConfig.debug = siteConfig.debug || false;
    var defaultSeparator = "[---]";
    var defaultBasePath = {};
    var defaultPath = path.join(__dirname, '..', '..', '..', 'assets', 'dist', 'static');
    defaultBasePath.url = '/';
    defaultBasePath.file = 'index.html';

    siteConfig.staticPages = siteConfig.staticPages || {};

    // ajaxPath is compulsory
    if(siteConfig.staticPages === undefined){
        // full equip
        siteConfig.staticPages = {};
        siteConfig.staticPages.basePath = defaultBasePath;
        siteConfig.staticPages.path = defaultPath;
    }else{
        siteConfig.staticPages.path = siteConfig.staticPages.path || defaultPath;
        siteConfig.staticPages.separator = siteConfig.staticPages.separator || defaultSeparator;
        if(siteConfig.staticPages.basePath === undefined){
            siteConfig.staticPages.basePath = defaultBasePath;
        }else{
            if(siteConfig.staticPages.basePath.url === undefined || siteConfig.staticPages.basePath.file === undefined ){
                siteConfig.staticPages.basePath = defaultBasePath;
            }
        }
    }
    return siteConfig;
}

function checkCrawler(siteConfig, req) {
    var fragment = req.query._escaped_fragment_;
    var crawlers = ['Alexa', 'ia_archiver', 'FacebookExternalHit', 'FacebookBot', 'Twitterbot', 'Googlebot', 'Bingbot', 'Yahoo', 'Applebot', 'SemrushBot', 'Pinterest', 'Baiduspider', 'LinkedInBot', 'FlipboardProxy', 'FlipboardBot', 'WhatsApp', 'Telegram', 'Slackbot', 'Screaming Frog SEO Spider', 'UptimeRobot', 'Feedly', 'PaperLiBot', 'LoadImpact', 'GTmetrix', 'woobot'];

    // google crawler checking
    var isCrawler = (fragment != undefined);
    // crawler checking
    // We don't put here Google because interferes with Google Img Proxy, TODO: keep on tunning
    if(!isCrawler) {
        var ua = req.headers['user-agent'];
        var i = 0;
        do {
            var crawlerUA = crawlers[i];
            var patt = new RegExp(crawlerUA,"i");
            if(patt.test(ua)) {
                console.log(siteConfig.appPrefix+"crawler matched [" + crawlerUA + "]");
                isCrawler = true;
            }
            i++;
        } while( i < crawlers.length && !isCrawler );
    }
    return isCrawler;
}

function isAjaxAllowedRequest(siteConfig, req) {
    var ajaxCondition = false;
    if(siteConfig.nonAjaxCondition instanceof RegExp){
        ajaxCondition = !siteConfig.nonAjaxCondition.test(req.url);
        if(siteConfig.debug) console.log(siteConfig.appPrefix+"using REGEX condition",req.url);

    }else if(siteConfig.nonAjaxCondition !== ""){
        // Example using EVAL condition
        //ajaxCondition = (req.url.indexOf('.') == -1 && req.url != '/' && req.url.indexOf('/admin') == -1);
        ajaxCondition = eval(siteConfig.nonAjaxCondition);
    }

    return ajaxCondition;
}

function dealWithEscapedFragments(siteConfig, fragment, res, cbk) {
    console.log(siteConfig.appPrefix+"FRAGMENT: ", fragment);

    // If the fragment is empty, serve the default page
    if (fragment === "" || fragment === "/" || fragment === siteConfig.staticPages.basePath.url)
        fragment = siteConfig.staticPages.basePath.file;

    // If fragment does not start with '/' prepend it to our fragment
    if(fragment.charAt(0) == "/"){
        fragment = fragment.substring(1);
    }
    fragment = fragment.replace(/\//g, siteConfig.staticPages.separator);

    // If fragment does not end with '.html' append it to the fragment
    if (fragment.indexOf('.html') == -1){
        fragment += ".html";
    }

    // Serving the static html snapshot
    try {
        var filePath = siteConfig.staticPages.path;
        console.log(siteConfig.appPrefix+"Trying to serve file: ", path.join(filePath,fragment));
        res.setHeader('Content-Type', 'text/html');
        var options = {
            root: filePath,
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile(fragment, options, cbk);
    } catch (err) {
        console.log(siteConfig.appPrefix+"Static page not found! :( ",err);
        res.send(404);
    }
}
