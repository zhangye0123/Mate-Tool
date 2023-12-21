const fs = require('fs');
const path = require('path');


// 定义要搜索的文件夹和文件名
const targetFiles = [
    { subFolder: 'JavaScripts/Modified027Editor', file: 'ModifiedPlayer.ts' },
    { subFolder: 'JavaScripts', file: 'sevenAnimation.ts' }
];

function changeFile(filePath) {
    console.error("filePath", filePath);
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.log(`Error reading file: ${filePath}`);
            return;
        }

        // 替换文本
        let result = data.replace(/return stance;/g, 'return stance as any;');
        result = result.replace(/return ani;/g, 'return ani as any;');
        result = result.replace(/return anim;/g, 'return anim as any;');
        result = result.replace(/ as RpcAnimation/g, ' as any');

        // 写回文件
        fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) {
                console.log(`Error writing file: ${filePath}`);
                return;
            }
            console.log(`File updated: ${filePath}`);
        });
    });
}

function processSubdirectories(basePath) {
    fs.readdir(basePath, { withFileTypes: true }, (err, dirents) => {

        if (err) {
            console.error('Error reading directory:', basePath, dirent.name);
            return;
        }

        dirents.forEach(dirent => {
            if (dirent.isDirectory()) {
                // 遍历每个子文件夹
                targetFiles.forEach(({ subFolder, file }) => {
                    const fullFolderPath = path.join(basePath, dirent.name, subFolder);
                    const fullPath = path.join(fullFolderPath, file);
                    if (fs.existsSync(fullPath)) {
                        changeFile(fullPath);
                    }
                });
            }
        });
    });
}


const currentDir = process.cwd();
//获取当前脚本所在目录的上一级目录
const rootPat1 = path.dirname(currentDir);
processSubdirectories(rootPat1);


