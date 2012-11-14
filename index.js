(function(){
  var fs, path, mkdirp, tree, cp, cpR, rmRf, slice$ = [].slice;
  fs = require('fs');
  path = require('path');
  mkdirp = require('mkdirp');
  require('callsite');
  require('sync');
  exports.time = curry$(function(id, fn){
    var loc;
    loc = __stack[2];
    return function(){
      var start;
      try {
        process.stdout.write(path.basename(loc.getFileName()) + "[" + loc.getLineNumber() + "]: " + id + "\n");
        start = Date.now();
        return fn.apply(this, arguments);
      } finally {
        process.stdout.write(path.basename(loc.getFileName()) + "[" + loc.getLineNumber() + "]: " + id + ": " + (Date.now() - start) + "ms\n");
      }
    };
  });
  tree = exports.tree = function(it){
    return it.async();
  }(function(dir){
    return (function(it){
      return it.concat(dir);
    })(
    function(arg$){
      var dirs, files;
      dirs = arg$[0], files = arg$[1];
      return concatMap(tree, dirs).concat(files);
    }(
    partition(function(it){
      return fs.stat.sync(fs, it).isDirectory();
    })(
    map(partialize$(path.join, [dir, void 8], [1]))(
    fs.readdir.sync(fs, dir)))));
  });
  cp = exports.cp = curry$(function(a, b){
    return (function(l, r){
      return l.pipe(r).on('error', bind$(console, 'warn'));
    }.call(this, fs.createReadStream(a), fs.createWriteStream(b)));
  });
  cpR = exports.cpR = curry$(function(a, b){
    return function(arg$){
      var dirs, files;
      dirs = arg$[0], files = arg$[1];
      each(function(it){
        return mkdirp.sync(path.join(b, path.relative(a, it)));
      })(
      dirs);
      return each(function(it){
        return cp(it, path.join(b, path.relative(a, it)));
      })(
      files);
    }(
    partition(function(it){
      return fs.stat.sync(fs, it).isDirectory();
    })(
    tree.sync(null, a)));
  });
  rmRf = exports.rmRf = compose(tree, partition(function(it){
    return fs.stat.sync(fs, it).isDirectory();
  }), function(arg$){
    var dirs, files;
    dirs = arg$[0], files = arg$[1];
    each(partialize$(bind$(fs.unlink, 'sync'), [fs, void 8], [1]))(
    files);
    return each(partialize$(bind$(fs.rmdir, 'sync'), [fs, void 8], [1]))(
    dirs);
  });
  function curry$(f, args){
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      return params.push.apply(params, arguments) < f.length && arguments.length ?
        curry$.call(this, f, params) : f.apply(this, params);
    } : f;
  }
  function partialize$(f, args, where){
    return function(){
      var params = slice$.call(arguments), i,
          len = params.length, wlen = where.length,
          ta = args ? args.concat() : [], tw = where ? where.concat() : [];
      for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
      return len < wlen && len ? partialize$(f, ta, tw) : f.apply(this, ta);
    };
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
