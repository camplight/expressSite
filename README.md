expressSite
===========
"Addon" nodejs module for expressjs framework providing lightweight 'pages' support, or other called client-side app single-page apps.

Includes:
- packageme (https://github.com/camplight/packageme/) for packaging directories of files needed by client-side apps
- Backbone-like class implementation of client-side app (a Page).
- consolidate.js for server-side template engines 

# Usage #

add "expressSite" to dependencies in package.json
add your prefered template engine, for example "jade" to dependencies in package.json
add "consolidate" to dependencies in package.json

Create `app.js` with the following example code:

    var app = require("expressSite");

    var cons = require("consolidate");
    app.engine('jade', cons.jade);

    app.set('view engine', 'jade');

    app.configure(function(){
      app.useExpressSiteMiddleware();
    });

    app.defaultPageAttributes({
      root: __dirname+"/client",
      layout: "./templates/layout.jade",
    });

    app.addPage({
      url: "/",
      content: "./templates/index",
      variables: {
        title: "Index Page"
      }
    });

    app.listen(8000, function(){
      console.log("listening on 8000");
    });

Create `client` and `client/templates` folders.

Place your layout template containing these as minimum at `/client/templates/layout.jade`:

    !!! html
    head
      !{javascripts}
      !{stylesheets}
    body
      !{views}
      !{content}

`{javascripts}`, `{stylesheets}` & `{views}` will be replaced by expressSite with appropiate path to packaged javascripts, stylesheets & views.
`{content}` will be replaced with the content of the pages using that layout.

Create `/client/templates/index.jade` file with content as you like.

Launch the application or refer to the demo for additional usage examples.

# Reference #
## expressSite ##
- `addPage`(`Page Class` or `Page attributes object`)
- `defaultPageAttributes`(`Page attributes object`)

Note that Page attributes which are Array(`views`, `style`, `code`) or Object(`variables`) and are present in `defaultPageAtrributes` will be appened/merged with the `defaultPageAttributes`. However `Page.defaults` will override those arrays/objects.

## Page ##

    var Page = require("expressSite/Page");

    var MyPage = module.exports = Page.extend({
      // attributes
      defaults: {
        root: String,
        url: String,
        code: Array[String] or String,
        views: Array[String] or String,
        style: Array[String] or String,
        content: String,
        variables: Object
      }

      // methods
      initialize: function(){ ... },
      renderCode: function(app || req, res, next) { ... },
      renderStyle: function(app || req, res, next) { ... },
      compileViews: function(callback(data)) { ... },
      render: function(app || req, res, next) { ... }
    });

### attributes ###
Note that all paths except `root` can be full or relative(starting with `./`, `../` or without `/`), in case of relative usage, `root` value will be prepended. 

- `root` -> full path to page's assets (code, styles, templates, views), if missing content/body parent directory will be used as root.
- `content` or `body` -> path to template file to be rendered /must be provided/
- `layout` -> path to template file to be used as layout, if missing only the content/body will be rendered and send as response.
- `url` -> uri to which `expressSite.addPage` should mount given page, if missing `addPage` won't mount the page in express router.
- `code` or `javascripts` -> path or array of paths to page's code/javascripts/coffeescript & etc. It is mainly been passed directly to `packageme`. `Page.renderCode(app)` is magically used by `expressSite.addPage` to register route handler for those code assets.
- `style` or `stylesheets` -> path or array of paths to page's stylesheets. It is again send directly to `packageme`. And there is `Page.renderStyle(app)` for providing packaged version of those assets.
- `views` -> array of paths to page's client-side templates. Folders or Files which `packageme` will combine and inject to the page's content within `views` local variable. Those views/templates can be used within browser and as such to minify client requests to the site.
- `variables` -> object of variables which will be used as data source when rendering the page's templated content.

## Page.renderCode(app) ##
## Page.renderStyle(app) ##
## Page.render(req, res, next) ##
## Page.initialize(attributes, options) ##