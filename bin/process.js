var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var fs = require('fs');
var async = require('async');
var ProcessImages = require('../libs/ProcessImages.js');

//example calls
//node bin/process -p ~/Pictures/DSC_0001.jpg
//node bin/process -p ~/Pictures/DSC_0001.jpg -o resize
//node bin/process -d ~/Pictures
//node bin/process -d ~/Pictures -c resize
var imageDir = argv.d || argv.directory || null;
var imagePath = argv.p || argv.path || null;
var outputDirectory = argv.o || argv.out || null;
var commands = argv.c || argv.command || null;
var newImageWidths = argv.w || argv.width || null;
var newImageQuality = argv.q || argv.quality || null;

var validImageExtension = {'.png':true, '.jpg':true, '.gif':true};

var isValidExtension = function(file) {
  return !!validImageExtension[path.extname(file).toLowerCase()];
}

var sendInfo = function(err,imageFilePaths) {
  if (process.send) return process.send({error:err, paths:imageFilePaths});
  console.log(err,imageFilePaths);
}

if (imageDir) {
  try {
    var newFilePaths = [];
    async.each(fs.readdirSync(imageDir),function(file,callback) {
      if (isValidExtension(file)) {
        new ProcessImages(path.join(imageDir,file),{output:outputDirectory, width:newImageWidths, quality:newImageQuality}).process(commands,function(err,newPaths) {
          if (err) return callback(err);

          newFilePaths = newFilePaths.concat(newPaths);
          return callback();
        });
      } else {
        newFilePaths.push("INVALID EXTENSION: " + file);
        return callback();
      }
    },
    function(err) {
      sendInfo(err,newFilePaths);
    })
  } catch(err) {
    return sendInfo(err);
  }
} else if (imagePath) {
  if (isValidExtension(imagePath)) new ProcessImages(imagePath,{output:outputDirectory, width:newImageWidths, quality:newImageQuality}).process(commands,sendInfo);
  else sendInfo(new Error("INVALID EXTENSION: " + imagePath));
} else {
  sendInfo(new Error("No image path or directory provided. Please use -d/--directory or -p/--path arguments to specify a directory or path to process."));
}
