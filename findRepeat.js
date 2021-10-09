var fs = require('fs');
var readline = require('readline');
var path = "";
var str = "";

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        path = val;
    } else if (index == 3) {
        str = val;
    }
});

readFileToArr(path, function (data) {
    console.log(data);
    console.log("使用" + str + "的种类：" + data.length)
});

/**
 * 逐行读取文件
 * @param {*} fReadName 读取到的文件
 * @param {*} callback 读取之后的回调
 */
function readFileToArr(fReadName, callback) {
    var fRead = fs.createReadStream(fReadName);
    var objReadline = readline.createInterface({
        input: fRead
    });
    var arr = new Array();
    var arr1 = new Array();
    var temp = "";
    objReadline.on('line', function (line) {
        if (line.indexOf("Asset") != -1) {
            temp = line;
        } else if (line.indexOf(str) != -1) {
            arr1.push(temp);
        }
    });

    objReadline.on('close', function () {
        arr = unique(arr1);
        callback(arr);
    });
}
/**
 * 删除数组重复元素
 * @param {*} arr 原数组
 * @returns 新数组
 */
function unique(arr) {
    var len = arr.length;
    var result = []
    for (var i = 0; i < len; i++) {
        var flag = true;
        for (var j = i; j < arr.length - 1; j++) {
            if (arr[i] == arr[j + 1]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            result.push(arr[i])
        }
    }
    return result;
}