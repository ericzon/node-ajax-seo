node-ajax-seo
=============

Simple node plugin that deals with the most popular crawlers, redirecting them to static directory and serving fresh pages to human users. You must to specify where do you have your sn

## Installation

  npm install node-ajax-seo --save

## Usage

	var ajaxSeo = require("node-ajax-seo");
	
  	app.get("/*", function(req, res,next) {

	    /**
	     * It's necessary to define a pattern that matches with not ajax requests:
	     * In this case all the paths are ajax except:
	     *
	     * - /admin and /api paths.
	     * - resource requests.
	     * - root
	     **/

	    var siteConfig = {
	        ajaxCondition:{
	            pattern: /((^\/admin)|(^\/api)|(\.)|(^\/$))/			// you can specify the condition using regex or typical if condition
	            //toEval: "(req.url.indexOf('.') == -1 && req.url != '/' && req.url.indexOf('/admin') == -1)"
	        },
	        indexPath: path.join(__dirname, 'assets', 'index.html'), 	// your main angular .html by default
	        staticPages: {
	            path: path.join(__dirname, 'assets', 'dist', 'static'),	// path to your static files
	            separator: "[---]",										// in your static files, the filenames contain some token replacing "/" path.
	            basePath: {
	                url: "/",
	                file: "home.html"									// the url basepath is an special case
	            }
	        }
	    };

	    ajaxSeo.dealWithAjax(siteConfig, req, res, next);
	});
  
## Tests

  npm test (not yet)

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Authors

[Eric Lara](https://www.twitter.com/EricLaraAmat) and [Santi Pérez](https://www.twitter.com/SantiPrzF), supported by [Ondho](http://www.ondho.com).

## License

MIT
  
## Release History

* 1.0.0 Update json config to let customize some options doing it suitable for general purposes.
* 0.1.0 Add basic Readme.md and first lib version.
* 0.0.0 Initial commit with contributors.

## Roadmap

* connect with static page generator (WIP)

