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

Note that Page attributes which are Array(`views`, `style`, `code`) or Object(`variables`) and are present in `defaultPageAtrributes` will be appened/merged with the `defaultPageAttributes`. However `Page.defaults` will override those arrays/objects.

## Page ##

    var Page = require("expressSite/Page");

    var MyPage = module.exports = Page.extend({
      // attributes
      defaults: {
        name: String,
        root: String,
        url: String,
        code: Array[String],
        views: Array[String],
        viewsEngine: String,
        style: Array[String],
        content: String,
        variables: Object
      },

      extendDefaults: {
        views: Array[String],
        code: Array[String],
        ...
      }
    });

### attributes ###
Note that all paths except `root` can be full or relative(starting with `./`, `../` or without `/`), in case of relative usage, `root` value will be prepended. 

`extendDefaults` object if present will override primitive variables and append(push at the end) to arrays for defaults.
example:

    var MyPage = Page.extend({
      defaults : {
        variable: "A",
        list: [1, 2]
      },
      extendDefaults : {
        variable: "B",
        list: [3]
      }
    });

    var p = new MyPage();
    console.log(p.attributes.variable); // output: B
    console.log(p.attributes.list); // output: [1,2,3]

- `url` -> uri to which `expressSite.addPage` should mount given page, if missing `addPage` won't mount the page in express router.
- `name` -> Page's name, value used when generating code & style tags otherwise self generated unique names will be in place.

- `root` -> full path to page's assets (code, styles, templates, views), if missing content/body parent directory will be used as root.
- `content` -> path to template file to be rendered /must be provided/
- `layout` -> path to template file to be used as layout, if missing only the content/body will be rendered and send as response.

- `code` -> path or array of paths to page's code/javascripts/coffeescript & etc. It is mainly been passed directly to `packageme`. `Page.renderCode(app)` is magically used by `expressSite.addPage` to register route handler for those code assets.

- `style` -> path or array of paths to page's stylesheets. It is again send directly to `packageme`. And there is `Page.renderStyle(app)` for providing packaged version of those assets.

- `views` -> array of paths to page's client-side templates. Folders or Files which `packageme` will combine and inject to the page's content within `views` local variable. Those views/templates can be used within browser and as such to minify client requests to the site.
- `viewsEngine` -> string, defaults to "html", can be set to 'jade' which instructs packageme to compile jade views to html instead

- `variables` -> object of variables which will be used as data source when rendering the page's templated content.

## Page.initialize(attributes, options) ##
## Page.registerStyleHandlers(app) ##
## Page.registerCodeHandlers(app) ##
## Page.compileViews(callback) ##
## Page.compileCode(callback) ##
## Page.compileStyle(callback) ##
## Page.render(req, res, next) ##