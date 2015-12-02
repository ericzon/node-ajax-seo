
var path = require('path');

exports.dealWithAjax = function(siteConfig, req, res, next, cbk){
    //console.log("Receiving request! query: ", req.query, " URL: ", req.url);
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

    //console.log("node-ajax-seo", siteConfig);

    var fragment = req.query._escaped_fragment_;
    var crawlers = ['FacebookExternalHit', 'Twitterbot', 'Pinterest', 'Baiduspider', 'LinkedInBot', 'FlipboardProxy', 'WhatsApp'];

    // google crawler checking
    var isCrawler = (fragment != undefined);

    // crawler checking
    // We don't put Google here because interferes with Google Img Proxy, with more time we can try to tune better (TODO)
    crawlers.forEach(function(c){
        var patt = new RegExp(c,"i");
        isCrawler = isCrawler || (patt.test(req.headers['user-agent'])) ;
    });

    if(siteConfig.debug) console.log(siteConfig.appPrefix+'isCrawler',isCrawler);

    if (isAjaxAllowedRequest(siteConfig, req)) {
        //console.log(siteConfig.appPrefix+"asking for Ajax? -> "+ajaxCondition);
        if (!isCrawler) {
            if(siteConfig.debug) console.log(siteConfig.appPrefix+"sending to ajaxpath: ", siteConfig.ajaxPath);
            res.setHeader('Content-Type', 'text/html');
            res.sendfile(siteConfig.ajaxPath);
        }else{
            fragment = req._parsedUrl.pathname;
            if(siteConfig.debug) console.log(siteConfig.appPrefix+"Dealing with escaped fragments. Entering with: ",req);
            dealWithEscapedFragments(siteConfig, fragment, res, cbk);
        }
    } else {
        next();
    }
};

function isAjaxAllowedRequest(siteConfig, req){
    var ajaxCondition = false;
    if(siteConfig.nonAjaxCondition instanceof RegExp){
        //if(siteConfig.ajaxCondition.pattern){
        // /((^\/admin)|(\.)|(^\/$))/gi
        // var urlTest = req.url.match(urlRegex);
        // console.log("URLTEST -[[",urlTest,"]] test: ",(urlTest == null || urlTest.length == 0));
        ajaxCondition = !siteConfig.nonAjaxCondition.test(req.url);
        if(siteConfig.debug) console.log(siteConfig.appPrefix+"using REGEX condition",req.url);

    }else if(siteConfig.nonAjaxCondition !== ""){
        // using EVAL condition
        //ajaxCondition = (req.url.indexOf('.') == -1 && req.url != '/' && req.url.indexOf('/admin') == -1);
        ajaxCondition = eval(siteConfig.nonAjaxCondition);
    }

    return ajaxCondition;
}

function dealWithEscapedFragments(siteConfig, fragment, res, cbk) {
    console.log(siteConfig.appPrefix+"FRAGMENT! ", fragment);

    // If the fragment is empty, serve the default page
    if (fragment === "" || fragment === "/" || fragment === siteConfig.staticPages.basePath.url)
        fragment = siteConfig.staticPages.basePath.file;

    // If fragment does not start with '/' prepend it to our fragment
    /*if (fragment.charAt(0) !== "/")
     fragment = '/' + fragment;*/
    if(fragment.charAt(0) == "/"){
        fragment = fragment.substring(1);
    }
    fragment = fragment.replace(/\//g, siteConfig.staticPages.separator);
    //console.log("ESCAPED FRAGMENT, replace result: ", fragment);

    // If fragment does not end with '.html' append it to the fragment
    if (fragment.indexOf('.html') == -1){
        fragment += ".html";
    }

    // Serving the static html snapshot
    try {
        var filePath = siteConfig.staticPages.path;
        console.log(siteConfig.appPrefix+"ESCAPED FRAGMENT! trying to serve file: ", path.join(filePath,fragment));
        res.setHeader('Content-Type', 'text/html');
        var options = {
            root: filePath,
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendfile(fragment, options, cbk);
    } catch (err) {
        console.log(siteConfig.appPrefix+"static page is not found! :( ",err);
        res.send(404);
    }
}
