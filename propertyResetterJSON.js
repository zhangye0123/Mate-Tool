const fs = require('fs');

// 026Level文件
const file_path = "026NewLevel.level";
// 027Level文件
const file_path2 = "NewLevel.level";
const replace_data_dict = {};
const static_replace_data_dict = {};

function traverseJSON(obj) {
    if (typeof obj === 'object' && obj !== null) {
        if ("Script" in obj) {
            const script = obj["Script"];
            if (script) {
                const scriptComponent = script["ScriptComponent"];
                if (scriptComponent) {
                    for (const [k, v] of Object.entries(scriptComponent)) {
                        replace_data_dict[k] = v;
                    }
                }
                const staticScriptComponent = script["StaticScriptComponent"];
                if (staticScriptComponent) {
                    for (const [k, v] of Object.entries(staticScriptComponent)) {
                        static_replace_data_dict[k] = v;
                    }
                }
            }
        }
        for (const value of Object.values(obj)) {
            traverseJSON(value);
        }
    } else if (Array.isArray(obj)) {
        for (const item of obj) {
            traverseJSON(item);
        }
    }
}

function writeTraverseJSON(obj) {
    if (typeof obj === 'object' && obj !== null) {
        if ("Script" in obj) {
            const script = obj["Script"];
            if (script) {
                const scriptComponent = script["ScriptComponent"];
                if (scriptComponent) {
                    for (const [k, v] of Object.entries(scriptComponent)) {
                        scriptComponent[k] = replace_data_dict[k] || v;
                    }
                }
                const staticScriptComponent = script["StaticScriptComponent"];
                if (staticScriptComponent) {
                    for (const [k, v] of Object.entries(staticScriptComponent)) {
                        staticScriptComponent[k] = static_replace_data_dict[k] || v;
                    }
                }
            }
        }
        for (const value of Object.values(obj)) {
            writeTraverseJSON(value);
        }
    } else if (Array.isArray(obj)) {
        for (const item of obj) {
            writeTraverseJSON(item);
        }
    }
    return obj;
}

function main() {

    let str1 = fs.readFileSync(file_path, 'utf-8')
    // 去除BOM字符
    if (str1.charCodeAt(0) === 0xFEFF) str1 = str1.slice(1);
    const data = JSON.parse(str1);
    traverseJSON(data);

    let str2 = fs.readFileSync(file_path2, 'utf-8');
    // 去除BOM字符
    if (str2.charCodeAt(0) === 0xFEFF) str2 = str2.slice(1);
    let data2 = JSON.parse(str2);
    data2 = writeTraverseJSON(data2);

    const outStr = JSON.stringify(data2, null, 2);
    fs.writeFileSync(file_path2, outStr, 'utf-8');

    console.log("脚本修改完成！");
}

main();