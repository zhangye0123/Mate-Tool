const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const filePath026 = path.join(__dirname, '026NewLevel.level');
const filePath027 = path.join(__dirname, 'NewLevel.level');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

let recording = false;
let currentRecord = '';

// 判断当前字符是否符合条件
function isMatch(data, i, str) {
    for (let j = 0; j < str.length; j++) {
        if (data[i + j] !== str[j]) {
            return false;
        }
    }
    return true;
}

let scriptProperty = [];


// 读取026NewLevel.level文件 并将所有的'"ScriptComponent":{}'的元素存入数组
async function read026() {
    try {
        let data = await readFileAsync(filePath026, 'utf8');
        for (let i = 0; i < data.length; i++) {
            if (isMatch(data, i, '"ScriptComponent":{')) {
                if (recording) {
                    currentRecord = '';
                } else {
                    recording = true;
                }
            } else if (isMatch(data, i, '"StaticScriptComponent"')) {
                if (recording) {
                    scriptProperty.push(currentRecord);
                    currentRecord = '';
                    recording = false;
                }
            }
            if (recording) {
                currentRecord += data[i];
            }
        }
        // 将数组中的元素有包含'"ScriptComponent":{}'的元素去掉
        scriptProperty = scriptProperty.filter((item) => {
            return !item.includes('"ScriptComponent":{}');
        });
    } catch (error) {
        error && console.error(error);
    }
}

// 读取NewLevel.level文件 并将所有的'"ScriptComponent":{}'的元素替换为数组中的元素
async function write027() {
    console.log("----------开始替换027level文件----------", scriptProperty.length);
    for (let j = 0; j < scriptProperty.length; j++) {
        console.log("替换进度", j + 1, "/", scriptProperty.length);
        let str = scriptProperty[j];
        // 将字符串的前30个字符取出来作为判断条件
        let str30 = str.substr(0, 30);
        let data = await readFileAsync(filePath027, 'utf8');
        let isMatchaa = false;
        for (let i = 0; i < data.length; i++) {
            if (isMatch(data, i, str30)) {
                if (recording) {
                    // currentRecord = '';
                } else {
                    recording = true;
                }
            } else if (isMatch(data, i, '"StaticScriptComponent"')) {
                if (recording) {
                    currentRecord += str;
                    currentRecord += '"';
                    isMatchaa = true;
                    recording = true;
                }
            }
            if (!recording) {
                currentRecord += data[i];
            }
            if (isMatchaa) {
                recording = false;
                isMatchaa = false;
            }
        }
        await writeFileAsync(filePath027, currentRecord, 'utf8');
        console.log('写入成功');
        currentRecord = '';
    }

}

async function main() {
    await read026();
    await write027();
}

main();


