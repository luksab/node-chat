const compressor = require('node-minify'),
    fs = require('fs');

compressor.minify({
    compressor: 'gcc',
    input: 'public/index.js',
    output: 'public/static/indexO.js',
    callback: function(err, min) {if(err)throw err;
        else{
            console.log('js min')
            fs.copyFile('public/static/indexO.js', 'public/static/index.js', (err) => {
                if (err) throw err;
                    console.log('indexO.js was copied to index.js');
                });
            }
        }
  });

compressor.minify({
    compressor: 'html-minifier',
    input: 'public/mobile.html',
    output: 'public/index.html',
    options: {
      minifyJS: false
    }
  }).then(function(min) {
    console.log('html min');
  });

compressor.minify({
    compressor: 'sqwish',
    input: 'public/index.css',
    output: 'public/static/index.css',
    options: {
      minifyJS: false
    }
  }).then(function(min) {
    console.log('css min');
  });
