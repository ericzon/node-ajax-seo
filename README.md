node-ajax-seo
=============

Simple node plugin that deals with the most popular crawlers (Google, Facebook, Twitter, Baidu, LinkedIn), redirecting them to static snapshots while serves fresh pages to human users. **It doesn't generate your snapshots, only routes.** For that sort of things we have [other nice modules](https://www.github.com/ericzon/node-ajax-snapshot) ;-)

[npmjs page](https://www.npmjs.com/package/node-ajax-seo)

## Installation

  npm install node-ajax-seo --save

## Usage

  Options:

    -nonAjaxCondition    (regex|string) regex condition (better choice this) or typical "if condition" as string to delimite non-ajax pages.
    
    For example: 
	/((^\/admin)|(^\/api)|(\.)|(^\/$))/ 
    Same result as:
        "(req.url.indexOf('/admin') == -1 && req.url.indexOf('/api') == -1 && req.url.indexOf('.') == -1 && req.url != '/')"

    -ajaxPath    (string) path to your main SPA .html by default.

    -staticPages.path    (string) path to your static files.

    -staticPages.separator    (string) in your static snapshots, filenames contain some token replacing "/" path ("[---]" by default).

    -staticPages.basePath.url    (string) basepath is an special case: "when path is X, serve file Y" ("/" by default).

    -staticPages.basePath.file    (string) ("index.html" by default). 

    -debug		(boolean) Enables debug messages (false by default).

## Examples
```javascript

	var ajaxSeo = require("node-ajax-seo");
```
Minimal config:
```javascript

	var siteConfig = {
        nonAjaxCondition: /((^\/admin)|(^\/api)|(\.)|(^\/$))/,
        ajaxPath: path.join(__dirname, 'assets', 'index.html'),
        staticPages: {
            path: path.join(__dirname, 'assets', 'dist', 'static'),
        }
    };

    ajaxSeo.dealWithAjax(siteConfig, req, res, next, function cbk(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(siteConfig.appPrefix+'Sent:', path.join(filePath,fragment));
        }
    });
```
  Normal config:
```javascript
	
  	app.get("/*", function(req, res,next) {

	    /**
	     * It's necessary to define a pattern that matches with non ajax requests:
	     * In this example all the paths are ajax except:
	     *
	     * - /admin and /api paths.
	     * - resource requests.
	     * - root
	     **/

	    var siteConfig = {
	        nonAjaxCondition: /((^\/admin)|(^\/api)|(\.)|(^\/$))/,
	        ajaxPath: path.join(__dirname, 'assets', 'index.html'),
	        staticPages: {
	            path: path.join(__dirname, 'assets', 'dist', 'static'),
	            separator: "[---]",
	            basePath: {
	                url: "/",
	                file: "home.html"
	            }
	        },
	        debug: false
	    };

	    ajaxSeo.dealWithAjax(siteConfig, req, res, next, function cbk(err) {
	        if (err) {
	            console.log(err);

	            // if we don't have snapshot, we can serve 404 page, log miss request into DB, send a mail... whatevevr,
	            // but the best option in this case is to generate it and serve it on-the-fly (WIP).
	            console.log(siteConfig.appPrefix+"We serve the  default file caused by the inexistence of the requested one.");
	            //res.status(err.status).end();
	            res.sendfile(path.join(siteConfig.staticPages.path,siteConfig.staticPages.basePath.file));
	        }
	        else {
	            console.log(siteConfig.appPrefix+'Sent:', path.join(filePath,fragment));
	        }
	    });
	});
``` 

## Tests

  npm test (not yet)

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Authors

[Eric Lara](https://www.twitter.com/EricLaraAmat) and [Santi Pérez](https://www.twitter.com/SantiPrzF), powered by [Ondho](http://www.ondho.com).

## License

MIT
  
## Roadmap

* Connect with [node-ajax-snapshot](https://www.github.com/ericzon/node-ajax-snapshot) (WIP).

