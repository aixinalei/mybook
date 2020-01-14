var fs = require('fs');
var path = require('path');

let SUMMARY_MD_STR = '';
SUMMARY_MD_STR += `
# Table of contents

* [前言](README.md)`

/**
 * 文件遍历方法
 * @param {String} filePath 需要遍历的文件路径
 * @param {String} Path 路徑信息
 */

function fileDisplay(filePath, Path) {
  //根据文件路径读取文件，返回文件列表
  var files = fs.readdirSync(filePath);
  //遍历读取到的文件列表
  files.forEach(function (filename) {
    // 忽略到.git 文件
    if (filename !== '.git') {
      //获取当前文件的绝对路径
      var filedir = path.join(filePath, filename);
      //根据文件路径获取文件信息，返回一个fs.Stats对象
      var stats = fs.statSync(filedir);
      var isFile = stats.isFile();    //是文件
      var isDir = stats.isDirectory();//是文件夹
      if (isFile) {
        // 忽略reademe 目录文件 及 目录自动生成脚本
        if (filename !== 'README.md' && filename !== 'SUMMARY.md' && filename !== 'summary_autogeneration.js') {
          // console.log(filedir);
          SUMMARY_MD_STR += `
  * [${filename}](${Path}/${filename})`
        }
      }
      if (isDir && filename !== 'images' && filename !== 'img') {// 忽略images文件夾
        SUMMARY_MD_STR += `
* ${filename}`;
        fileDisplay(filedir, Path + filename);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
      }
    }
  });
}
fileDisplay(__dirname, '');

console.log(SUMMARY_MD_STR)
fs.writeFile('SUMMARY.md', SUMMARY_MD_STR, 'utf8', function (error) {
  if (error) {
    console.log(error);
    return false;
  }
  console.log('写入成功');
})
