'use strict';

var fs = require('fs'),
    _ = require('underscore');

var config = [
  'sites.error.ok',
  'sites.error.error',
  'sites.error.problem',
  'sites.error.down',
  'sites.error.harvest',
  'sites.error.no_groups',
  'sites.error.warning',
  'item.error.ok',
  'item.error.error',
  'item.error.problem',
  'item.error.warning',
  'item.error.down',
  'item.error.harvest',
  'item.error.unsupported_type',
  'item.error.single_layer',
  'item.error.missing_title'
];

main();

function main() {
  //process all the files in the source directory
  fs.readdir(process.cwd()+'/source', function (err, files) {
    if (err) {
      console.log(err);
      return;
    }

    processSrcFiles(files);
  });
  
  //Or just process one file
  //processSrcFile('cs.js');
}

//process all the passed files
function processSrcFiles(files) {
  _.each(files, function (fileName) {
    if (fileName.indexOf('.js') > -1) {
      processSrcFile(fileName);
    }
  });
}

//get an object attribute from a dotted string, ie 'sites.error.ok'
function ref(obj, str) {
  str = str.split(".");
  for (var i = 0; i < str.length; i++)
    obj = obj[str[i]];
  return obj;
}

//convert the src key to the target format
function convertKey(key) {
  return key.toUpperCase().replace(/\./gi, '_');
}

//read the src file, get the part we're interested in and pass it off
function processSrcFile(fileName) {
  fs.readFile(process.cwd()+'/source/'+fileName, function (err, data) {
    if (err) {
      return console.log(err);
    }
    var srcObj = JSON.parse(data);
    srcObj = srcObj[_.keys(srcObj)[0]];

    var newObj = {}, key, val;

    _.each(config, function (prop) {
      val = ref(srcObj, prop);
      if (val) {
        key = convertKey(prop);
        newObj[key] = val;
      }
    });

    processTargetFile(fileName, newObj);
  });
}

//open the target file synchronously, extend it with newObje and write it
function processTargetFile(srcFileName, newObj) {
  try {
    var targetFileName = process.cwd()+'/target/locale-' + srcFileName + 'on';
    //console.log(targetFileName);

    var targetFile = fs.readFileSync(targetFileName);
    //console.log(targetFile.toString());




    //since this isn't working - just write the new stuff to a new file
    // fs.writeFile(process.cwd()+'/target/locale-new-' + srcFileName + 'on', JSON.stringify(newObj, null, 2), function (err) {
    //   if(err) {
    //     console.log(err);
    //   } else {
    //     console.log('Saved ' + targetFileName);
    //   }
    // });



    
    var targetObj = JSON.parse(targetFile.toString());

    targetObj = _.extend(targetObj, newObj);
    var str = JSON.stringify(targetObj, null, 2);

    fs.writeFile(targetFileName, str, function (err) {
      if(err) {
        console.log(err);
      } else {
        console.log('Saved ' + targetFileName);
      }
    });
  }
  catch (err) {
    console.log("Error processing " + srcFileName + ': ' + err);
  }
}