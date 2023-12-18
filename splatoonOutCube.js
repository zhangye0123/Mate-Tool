const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const filePath = path.join(__dirname, 'NewLevel.level');
const readFileAsync = promisify(fs.readFile);

let endPos = {
    "18_15":[],
};
let endStr = '';

function traversePos(obj) {
    if (typeof obj === 'object' && obj !== null) {
        if ("ParentGuid" in obj) {
            let parent = obj.ParentGuid;
            if (parent == "280FF867" || parent == "016028E0") {
                let root = obj.RootComponent;
                let transform = root.Transform;
                let position = transform.Position;
                let guid = obj.Guid;
                //将position的X,Y,Z取整
                position.X = Math.round(position.X);
                position.Y = Math.round(position.Y);
                position.Z = Math.round(position.Z);
                if (!position.X) position.X = 0;
                if (!position.Y) position.Y = 0;
                if (!position.Z) position.Z = 0;
                let currentStr = '"' + guid + '": new Vector(' + position.X + ', ' + position.Y + ', ' + position.Z + ')';
                endStr += currentStr + ',\n';
            }
        }
        for (const value of Object.values(obj)) {
            traversePos(value);
        }
    } else if (Array.isArray(obj)) {
        for (const item of obj) {
            traversePos(item);
        }
    }
}


function traverseMesh(obj) {
    if (typeof obj === 'object' && obj !== null) {
        if ("ParentGuid" in obj) {
            let parent = obj.ParentGuid;
            if (parent == "280FF867" || parent == "016028E0") {
                let guid = obj.Guid;
                let mesh = obj.StaticMesh;
                if (!mesh) {
                    return;
                }
                let material = mesh.Materials;
                let endMate = material["0"];
                let currentStr = '"' + guid + '": "' + endMate + '"';
                endStr += currentStr + ',\n';
            }
        }
        for (const value of Object.values(obj)) {
            traverseMesh(value);
        }
    } else if (Array.isArray(obj)) {
        for (const item of obj) {
            traverseMesh(item);
        }
    }
}


// 读取NewLevel.level文件 并输出所有元素
async function readLevel() {
    try {
        let str1 = await readFileAsync(filePath, 'utf8');
        // 去除BOM字符
        if (str1.charCodeAt(0) === 0xFEFF) str1 = str1.slice(1);
        const data = JSON.parse(str1);
        traverseMesh(data);
    } catch (error) {
        error && console.error(error);
    }
}

async function main() {
    await readLevel();
    // 去除最后一个逗号
    endStr = endStr.slice(0, -1);
    let newStr = 'const colorCubePos = {\n' + endStr + '\n}';
    //将map写入outScript.ts文件
    fs.writeFileSync(path.join(__dirname, 'outScript.ts'), newStr);
}

main();


