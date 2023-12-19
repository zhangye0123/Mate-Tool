const fs = require('fs');
const path = require('path');

// 定义要搜索的文件夹和文件名
const folderPath = path.join(__dirname, 'JavaScripts/Modified027Editor');
const fileName = 'ModifiedPlayer.ts';

// 构建文件的完整路径
const filePath = path.join(folderPath, fileName);

// 读取文件内容
fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
        return console.log("this file is not exist");
    }

    // 替换文本
    let result = data.replace(/return stance;/g, 'return stance as any;');
    result = result.replace(/return ani;/g, 'return ani as any;');
    result = result.replace(/return anim;/g, 'return anim as any;');
    
    // 写回文件
    fs.writeFile(filePath, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});