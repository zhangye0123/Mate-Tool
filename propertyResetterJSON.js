const fs = require('fs');

// 026Level文件
const file_path = "026NewLevel.level";
// 027Level文件
const file_path2 = "NewLevel.level";
const replaceDataDict = {};

function main() {
    // 读取第一个文件
    fs.readFile(file_path, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        // 去除BOM字符
        if (data.charCodeAt(0) === 0xFEFF) {
            data = data.slice(1);
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
            // 在这里可以使用 jsonData 对象
        } catch (err) {
            console.error("JSON解析错误: " + err);
            return;
        }
        const sceneList = jsonData["Scene"];

        for (const sceneItem of sceneList) {
            const script = sceneItem["Script"];

            if (script) {
                const scriptComponent = script["ScriptComponent"];

                if (scriptComponent) {
                    for (const key of Object.keys(scriptComponent)) {
                        const value = scriptComponent[key];

                        if (value["cameraMode"] && value["springArmRelativeLocation"]) {
                            continue;
                        }

                        replaceDataDict[key] = value;
                    }
                }
            }
        }

        // 读取第二个文件
        fs.readFile(file_path2, 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            // 去除BOM字符
            if (data.charCodeAt(0) === 0xFEFF) {
                data = data.slice(1);
            }

            let jsonData;
            try {
                jsonData = JSON.parse(data);
                // 在这里可以使用 jsonData 对象
            } catch (err) {
                console.error("JSON解析错误: " + err);
                return;
            }
            const sceneList2 = jsonData["Scene"];

            for (const sceneItem of sceneList2) {
                const script = sceneItem["Script"];

                if (script) {
                    const scriptComponent = script["ScriptComponent"];

                    if (scriptComponent) {
                        for (const key of Object.keys(scriptComponent)) {
                            if (replaceDataDict[key]) {
                                scriptComponent[key] = replaceDataDict[key];
                            }
                        }
                    }
                }
            }

            // 写入更新后的数据
            const outStr = JSON.stringify(jsonData, null, 4);
            fs.writeFile(file_path2, outStr, 'utf-8', (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("文件已更新。");
                }
            });
        });
    });
}

main();