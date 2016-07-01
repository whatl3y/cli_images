var fs = require("fs");
var path = require("path");
var async = require("async");
var lwip = require("lwip");

module.exports = ProcessImages = function(filePath,options) {
  options = options || {};

  var self = this;
  this.WIDTH = Number(options.width || 1920);
  this.QUALITY = Number(options.quality || 50);

  this.outputPath = options.output || path.dirname(filePath);
  this.path = filePath;

  this.commandProcessFunction = function(image,command) {
    console.log(command);
    return function(newImage,path,_callback) {
      path = path || "";
      self.commands[command](newImage || image,path,_callback);
    }
  }

  this.process = function(command,cb) {
    cb = (typeof command === "function") ? command : cb;
    command = (typeof command === "function") ? null : command;

    var go = function(image,callback) {
      var processParallelFunctions = [function(_callback) {_callback(null,image,"")}];
      if (typeof command === "string" && command) {
        processParallelFunctions.push(self.commandProcessFunction(image,command));
      } else if (command instanceof Array) {
        for (var _i = 0; _i<command.length; _i++) {
          processParallelFunctions.push((function() {
            var co = command[_i];
            return self.commandProcessFunction(image,co);
          })());
        }
      } else {
        var newFilePaths = [];
        return async.eachOf(self.commands,function(foo,co,_callback) {
          async.waterfall([].concat(processParallelFunctions,
            self.commandProcessFunction(null,co),
            function(image,appendToFile,__callback) {
              var newpath = self.newPath(appendToFile);
              self.write(image,newpath,function(err) {
                return __callback(err,newpath);
              });
            }),
          function(err,newFilePath) {
            if (err) return _callback(err);

            newFilePaths.push(newFilePath);
            _callback();
          });
        },
          function(err) {
            return callback(err,newFilePaths);
          }
        );

        // for (var _command in self.commands) {
        //   processParallelFunctions.push((function() {
        //     var co = _command;
        //     return self.commandProcessFunction(image,co);
        //   })());
        // }
        //
        // return callback(err,results);
      }

      async.waterfall([].concat(processParallelFunctions,
        function(image,appendToFile,_callback) {
          var newpath = self.newPath(appendToFile);
          self.write(image,newpath,function(err) {
            return _callback(err,newpath);
          });
        }),
      function(err,results) {
        return callback(err,results);
      });
    }

    async.waterfall([
      function(callback) {
        lwip.open(self.path,callback);
      },
      go
    ],
      function(err,newFilePaths) {
        return (typeof cb === "function") ? cb(err,newFilePaths) : null;
      }
    );
  }

  this.write = function(image,path,cb) {
    image.writeFile(path,{quality:this.QUALITY},cb);
  }

  this.heightWidthRatio = function(image) {
    return image.height()/image.width();
  }

  this.resize = function(image,cb) {
    var newHeight = Math.floor(this.heightWidthRatio(image) * this.WIDTH);
    image.resize(this.WIDTH,newHeight,function(err,newImage) {
      return cb(err,newImage);
    });
  }

  this.cropSquare = function(image,appendToFile,left,top,right,bottom,cb) {
    async.waterfall([
      function(callback) {
        image.crop(left,top,right,bottom,callback);
      },
      function(newImage,callback) {
        self.resize(newImage,callback);
      }
    ],
      function(err,newImage) {
        return cb(err,newImage,appendToFile);
      }
    );
  }

  this.rotate = function(image, appendToFile, degrees, cb) {
    async.waterfall([
      function(callback) {
        image.rotate(degrees,callback);
      },
      function(newImage,callback) {
        self.resize(newImage,callback);
      }
    ],
      function(err,newImage) {
        return cb(err,newImage,appendToFile);
      }
    );
  }

  this.sharpen = function(image, appendToFile, amplitude, cb) {
    async.waterfall([
      function(callback) {
        image.sharpen(amplitude,callback);
      },
      function(newImage,callback) {
        self.resize(newImage,callback);
      }
    ],
      function(err,newImage) {
        return cb(err,newImage,appendToFile);
      }
    );
  }

  this.saturate = function(image, appendToFile, delta, cb) {
    async.waterfall([
      function(callback) {
        image.saturate(delta,callback);
      },
      function(newImage,callback) {
        self.resize(newImage,callback);
      }
    ],
      function(err,newImage) {
        return cb(err,newImage,appendToFile);
      }
    );
  }

  this.lighten = function(image, appendToFile, ratio, cb) {
    async.waterfall([
      function(callback) {
        image.lighten(ratio,callback);
      },
      function(newImage,callback) {
        self.resize(newImage,callback);
      }
    ],
      function(err,newImage) {
        return cb(err,newImage,appendToFile);
      }
    );
  }

  this.newPath = function(newpathstring) {
    var outputPathDir = this.outputPath;

    try {
      fs.lstatSync(outputPathDir);
    } catch(e) {
      //assume an error means doesn't exist, so we need to create the directory here
      fs.mkdirSync(outputPathDir);
    }

    var filename = path.basename(this.path);
    var extension = path.extname(this.path);
    var lastPeriod = filename.lastIndexOf(".");

    return path.join(this.outputPath,filename.substring(0,lastPeriod)) + newpathstring + extension;
  }

  this.commands = {
    resize: function(image,append,cb) {
      async.waterfall([
        function(callback) {
          self.resize(image,callback);
        }
      ],
        function(err,newImage) {
          return cb(err,newImage,append + "_resized");
        }
      );
    },

    sharpenBy20: function(image,append,cb) {
      self.sharpen(image,append + "_sharpenBy20",20,cb);
    },

    sharpenBy40: function(image,append,cb) {
      self.sharpen(image,append + "_sharpenBy40",40,cb);
    },

    sharpenBy60: function(image,append,cb) {
      self.sharpen(image,append + "_sharpenBy60",60,cb);
    },

    lightenBy20: function(image,append,cb) {
      self.lighten(image,append + "_lightenBy20",0.2,cb);
    },

    lightenBy40: function(image,append,cb) {
      self.lighten(image,append + "_lightenBy40",0.4,cb);
    },

    lightenBy60: function(image,append,cb) {
      self.lighten(image,append + "_lightenBy60",0.6,cb);
    },

    saturateBy20: function(image,append,cb) {
      self.saturate(image,append + "_saturateBy20",0.2,cb);
    },

    saturateBy40: function(image,append,cb) {
      self.saturate(image,append + "_saturateBy40",0.4,cb);
    },

    saturateBy60: function(image,append,cb) {
      self.saturate(image,append + "_saturateBy60",0.6,cb);
    },

    rotate90: function(image,append,cb) {
      self.rotate(image,append + "_rotate90",90,cb);
    },

    rotate180: function(image,append,cb) {
      self.rotate(image,append + "_rotate180",180,cb);
    },

    rotate270: function(image,append,cb) {
      self.rotate(image,append + "_rotate270",270,cb);
    },

    cropSquareTopLeft: function(image,append,cb) {
      var hw = self.heightWidthRatio(image);
      var totalWidth = (hw <= 1) ? Math.floor(image.width()*hw) : image.width();
      var totalHeight = (hw <= 1) ? image.height() : Math.floor(image.width()*(1/hw));

      var left = 0;
      var top = 0;
      var right = totalWidth;
      var bottom = totalHeight;

      self.cropSquare(image,append + "_topleft",left,top,right,bottom,cb);
    },

    cropSquareTopRight: function(image,append,cb) {
      var hw = self.heightWidthRatio(image);
      var totalWidth = (hw <= 1) ? Math.floor(image.width()*hw) : image.width();
      var totalHeight = (hw <= 1) ? image.height() : Math.floor(image.width()*(1/hw));

      var left = image.width() - totalWidth;
      var top = 0;
      var right = image.width();
      var bottom = totalHeight;

      self.cropSquare(image,append + "_topright",left,top,right,bottom,cb);
    },

    cropSquareBottomLeft: function(image,append,cb) {
      var hw = self.heightWidthRatio(image);
      var totalWidth = (hw <= 1) ? Math.floor(image.width()*hw) : image.width();
      var totalHeight = (hw <= 1) ? image.height() : Math.floor(image.width()*(1/hw));

      var left = 0;
      var top = totalHeight - image.height();
      var right = totalWidth;
      var bottom = image.height();

      self.cropSquare(image,append + "_bottomleft",left,top,right,bottom,cb);
    },

    cropSquareBottomRight: function(image,append,cb) {
      var hw = self.heightWidthRatio(image);
      var totalWidth = (hw <= 1) ? Math.floor(image.width()*hw) : image.width();
      var totalHeight = (hw <= 1) ? image.height() : Math.floor(image.width()*(1/hw));

      var left = image.width() - totalWidth;
      var top = totalHeight - image.height();
      var right = image.width();
      var bottom = image.height();

      self.cropSquare(image,append + "_bottomright",left,top,right,bottom,cb);
    },

    cropSquareCenter: function(image,append,cb) {
      var hw = self.heightWidthRatio(image);
      var totalWidth = (hw <= 1) ? Math.floor(image.width()*hw) : image.width();
      var totalHeight = (hw <= 1) ? image.height() : Math.floor(image.width()*(1/hw));

      var left = Math.floor((image.width() - totalWidth)/2);
      var top = Math.floor((image.height() - totalHeight)/2);
      var right = left + totalWidth;
      var bottom = top + totalHeight;

      self.cropSquare(image,append + "_center",left,top,right,bottom,cb);
    }
  }
}
