fs = require \fs
path = require \path
mkdirp = require \mkdirp

require \callsite
require \sync

exports.time = (id,fn)-->
	loc = __stack.2
	->
		try
			process.stdout.write "#{path.basename loc.get-file-name!}[#{loc.get-line-number!}]: #id\n"
			start = Date.now!
			return fn ...
		finally process.stdout.write "#{path.basename loc.get-file-name!}[#{loc.get-line-number!}]: #id: #{Date.now! - start}ms\n"

tree = exports.tree = (.async!) (dir)->
	fs.readdir.sync fs, dir
	|> map path.join dir,_
	|> partition ->fs.stat.sync fs, it .is-directory!
	|> ([dirs,files])->(concat-map tree,dirs) +++ files
	|> (+++ dir)

cp = exports.cp = (a,b)-->
	let l = (fs.create-read-stream a),
			r = (fs.create-write-stream b)
	then l.pipe r .on \error console~warn # don't exit the process

cp-r = exports.cp-r = (a,b)-->
	tree.sync null a
	|> partition ->fs.stat.sync fs, it .is-directory!
	|> ([dirs,files])->
		mkdirp b
		files |> each ->cp it, path.join b,path.basename it

rm-rf = exports.rm-rf = compose do
	tree
	partition ->fs.stat.sync fs, it .is-directory!
	([dirs,files])->
		files |> each fs.unlink~sync fs,_
		dirs  |> each fs.rmdir~sync fs,_