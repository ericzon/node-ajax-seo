node-ajax-seo
=============

It deals with the most popular crawlers, redirecting them to static directory and serving fresh pages to human users.

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
	            pattern: /((^\/admin)|(^\/api)|(\.)|(^\/$))/,
	            //toEval: "(req.url.indexOf('.') == -1 && req.url != '/' && req.url.indexOf('/admin') == -1)"
	        },
	        indexPath: path.join(__dirname, 'assets', 'index.html'),
	        staticBasePath:{
	            url: "/",
	            file: "home.html"
	        }
	    };

	    ajaxSeo.dealWithAjax(siteConfig, req, res, next);
	});
  
## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Authors

[Eric Lara](https://www.twitter.com/EricLaraAmat) and [Santi Pérez](https://www.twitter.com/SantiPrzF), supported by [Ondho](http://www.ondho.com).

## License

  TODO
  
## Release History

* 1.1.1 Little fix.
* 1.1.0 Add basic Readme.md and first lib version.
* 1.0.0 Initial commit with contributors.
