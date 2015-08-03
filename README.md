becklyn-gulp
============

Small helper for gulp which is used internally at [Becklyn](http://www.becklyn.com).
It includes some style guide definitions in form of default jsHint and scss-lint rules.

## Installation
```bash
$ sudo npm install gulp becklyn-gulp --save-dev
```

## Compilation helpers
The library provides some helper methods:

```js
var becklyn = require("becklyn-gulp");

becklyn.js(path [, options]);
becklyn.scss(path [, options]);
becklyn.js_simple(path [, options]);
becklyn.jshint(path [, options]);
```
`path` can be a glob which can be parsed by [glob](https://www.npmjs.com/package/glob). `options` is a map of configuration parameters (for details, see task descriptions below).

These methods return functions, that actually perform the task.
The returned functions have the signature `function (isDebug)` where `isDebug` is a boolean parameter indicating whether the file should be compiled with debug parameters (like omitting the minification phase). Additionally a watcher is started in debug mode.

All these tasks can be used like this:
```js
var gulp = require("gulp");
var becklyn = require("becklyn-gulp");

var options = {
    // ...
};

var jsTask = becklyn.js("src/*/Resources/assets/js/*.js", options);

// compile in production mode
gulp.task("js", function () { jsTask(false); });

// compile in debug mode
gulp.task("dev", function () { jsTask(true); });
```


### webpack (`becklyn.js(path [, options])`)
This task compiles javascript files using [webpack](http://webpack.github.io/).
It automatically minifies file in non-debug mode, using [UglifyJS](http://lisperator.net/uglifyjs/).

Option           | Type                                     | Default                                                    | Description
---------------- | ---------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------
`externals`      | `Array.<string, string>`                 | `["jquery": "window.jQuery", "routing": "window.Routing"]` | The libraries that are shimmed by webpack.
`lint`           | `boolean`                                | `= isDebug`                                                | Flag, whether the source should be linted (using jsHint).
`logCachedFiles` | `boolean`                                | `false`                                                    | Flag, whether the task should report on files that haven't changed.
`useBabel`       | `boolean`                                | `true`                                                     | Flag, whether [Babel](https://babeljs.io/) should be used. Also activates `esnext: true` in the jsHint config.
`moduleLoaders`  | `Array.<{test: RegExp, loader: string}>` | `[]`                                                       | Additional loaders, as described in [the docs][webpack-loader-docs]. (The babel and jsHint loader will still be automatically added, depending on the `useBabel` and `lint` options.)

**Note:** If you use Babel, you probably need to add the polyfill for older browsers to all your JS entry points. Just use the ECMAScript 6 polyfill from [`babel-es6-polyfill`] and insert `require("babel-es6-polyfill/polyfill.js");` to include all required functionality.

> Alternatively you can use the polyfill directly from [`babel-core`] and do `require("babel-core/lib/babel/polyfill");` at the top of all your top-level JavaScript files. But then you will add probably unwanted ES5 polyfills (if you only support modern browser) and polyfills for ES7, which might be still in discussion and therefore unstable.


### Sass (`becklyn.scss(path [, options])`)
This task compiles Sass (SCSS) files using [libsass](http://libsass.org/).
It automatically uses [Autoprefixer](https://github.com/postcss/autoprefixer) and in production mode minification with [clean-css](https://github.com/jakubpawlowicz/clean-css).

Option     | Type             | Default                       | Description
---------- | ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------
`browsers` | `Array.<string>` | `["last 2 versions", "ie 9"]` | The supported browser, for which prefixes should be generated (by Autoprefixer)
`lint`     | `boolean`        | `= isDebug`                   | Flag, whether the source should be linted (using [scss-lint](https://github.com/causes/scss-lint)).


### Uglify (`becklyn.js_simple(path [, options])`)
This task compiles JavaScript files using UglifyJS. It does not include bundling using a system like webpack.

Option | Type      | Default      | Description
------ | --------- | ------------ | ---------------------------------------------------------
`lint` | `boolean` | `= isDebug`  | Flag, whether the source should be linted (using jsHint).


### jsHint (`becklyn.jshint(path [, options])`)
Lints your JavaScript files, without compiling them.

Option  | Type     | Default | Description
------- | -------- | ------- | ---------------------------------------------------------
`rules` | `Object` | `{}`    | All additional or overwriting rules for configuring jsHint (see [reference](http://jshint.com/docs/options/)).




## Administration tasks
There are two administration tasks, that help with deploying applications and managing separate layout projects.

```js
becklyn.layout(layoutDir, vendorDir, copyMapping);
becklyn.publish.symlink();
becklyn.publish.copy();
```


### Layout `becklyn.layout(layoutDir, vendorDir, copyMapping)`
Copies the layout files from a layout dir to a vendor dir in the current project.
You can specify the directories that should be copied in `copyMapping`.

```js
var becklyn = require("becklyn-gulp");

gulp.task("layout",
    function ()
    {
        return becklyn.layout("../test-project-layout/", "./public/vendor/layout", [
            // will copy ../test-project-layout/layout/public/* --> ./public/vendor/layout/*
            {
                from: "/layout/public",
                to:   "/"
            },
            // will copy ../test-project-layout/assets/js/* --> ./public/vendor/layout/js/*
            {
                from: "/assets/js",
                to:   "/"
            }
        ]);
    }
);
```


### Publish `becklyn.publish.*`
These are two small deployment helpers.
The idea is that the directory structure looks like this:

```
.
└── project
    ├── public          <-- here are your compiled and prepared assets
    │   ├── css
    │   ├── img
    │   └── ...
    └── web             <-- this is your document root
        └── assets      <-- you want to have your public assets copied here
            |   css         so that you can access them using http://example.org/assets/...
            |   img
            └── ...
```

*   `becklyn.publish.symlink()` will symlink `./web/assets` to point to `../public`.
*   `becklyn.publish.copy()` will recursively copy the content of `../public` to `./web/assets`.

**Warning:** Both commands will wipe the current files / directories at `./web/assets`.


## Bower / SCSS include paths

You can use bower with `becklyn-gulp`. If you run the gulp task, the current working directory (= the directory where your `gulpfile.js` is) 
is automatically added to the include paths of `node-sass`.

So in your CSS you can just do

```scss
@import "bower_components/normalize.css/normalize";
```

and it should work.


[webpack-loader-docs]: http://webpack.github.io/docs/using-loaders.html#configuration
[babel-es6-polyfill]: https://www.npmjs.com/package/babel-es6-polyfill
[babel-core]: https://www.npmjs.com/package/babel-core
