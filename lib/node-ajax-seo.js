
var path = require('path');

exports.dealWithAjax = function(siteConfig, req, res, next){
	console.log("Node ajax seo INIT. Config: ", siteConfig);

    //console.log("Receiving request! query: ", req.query, " URL: ", req.url);
    var fragment = req.query._escaped_fragment_;

    var crawlers=['facebookexternalhit','Twitterbot','Pinterest'];

    //Check if is google crawler
    var isCrawler=(fragment!=undefined);

    //Check if is crawler
    crawlers.forEach(function(c){
        var patt = new RegExp(c);
        isCrawler =isCrawler || (patt.test(req.headers['user-agent'])) ;
    });

    console.log('isCrawler',isCrawler);

    if (!isCrawler) {

        if (isAjaxAllowedRequest(siteConfig, req)) {
            console.log("envio al ajaxpath: ", siteConfig.indexPath);
            res.setHeader('Content-Type', 'text/html');
            res.sendfile(siteConfig.indexPath);
        } else {

            next();
        }
    }else{
         if (isAjaxAllowedRequest(siteConfig, req)) {

            fragment = req._parsedUrl.pathname;

            console.log("Dealing with escaped fragments. Entering with: ",req);
            dealWithEscapedFragments(siteConfig, fragment, res);
        }else{
            next();
        }
    }
};

function isAjaxAllowedRequest(siteConfig, req){
    var ajaxCondition = false;
    if(siteConfig.ajaxCondition.pattern){
        var urlRgx = new RegExp(siteConfig.ajaxCondition.pattern);
        // /((^\/admin)|(\.)|(^\/$))/gi
        // var urlTest = req.url.match(urlRegex);
        // console.log("URLTEST -[[",urlTest,"]] test: ",(urlTest == null || urlTest.length == 0));
        ajaxCondition = !urlRgx.test(req.url);

        console.log("using REGEX condition",req.url,ajaxCondition);
    }else if(siteConfig.ajaxCondition.toEval !== ""){
        //ajaxCondition = (req.url.indexOf('.') == -1 && req.url != '/' && req.url.indexOf('/admin') == -1);
        ajaxCondition = eval(siteConfig.ajaxCondition.toEval);
        //console.log("using EVAL condition");
    }

    return ajaxCondition;
}

function dealWithEscapedFragments(siteConfig, fragment, res) {
    console.log("FRAGMENT! ", fragment);
    //console.log("dealWithEscapedFragments > __dirname: ", __dirname);

    // If the fragment is empty, serve the
    // index page
    if (fragment === "" || fragment === "/" || fragment === siteConfig.staticBasePath.url)
        fragment = siteConfig.staticBasePath.file;

    // If fragment does not start with '/'
    // prepend it to our fragment
    /*if (fragment.charAt(0) !== "/")
     fragment = '/' + fragment;*/
    if(fragment.charAt(0) == "/"){
        fragment = fragment.substring(1);
    }
    var staticPagesSeparator = "[---]";
    fragment = fragment.replace(/\//g, staticPagesSeparator);
    //console.log("ESCAPED FRAGMENT, replace result: ", fragment);

    // If fragment does not end with '.html'
    // append it to the fragment
    if (fragment.indexOf('.html') == -1)
        fragment += ".html";

    // Serve the static html snapshot
    try {
        var filePath = path.join(__dirname, '..', 'assets', 'dist', 'static');
        console.log("ESCAPED FRAGMENT! trying to serve file: ", path.join(filePath,fragment));
        res.setHeader('Content-Type', 'text/html');
        var options = {
            root: filePath,
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendfile(fragment, options, function (err) {
            if (err) {
                console.log(err);
                console.log("We serve the  default file caused by inexistence of the requested.");
                //res.status(err.status).end();
                res.sendfile(path.join(filePath,siteConfig.staticBasePath.file));
            }
            else {
                console.log('Sent:', path.join(filePath,fragment));
            }
        });
    } catch (err) {
        console.log("static page is not found! :( ",err);
        res.send(404);
    }
}
