var fs = require('fs');
var readline = require('readline');
var path = "TreasureHunter.project";
var str = "";

String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        str = val;
    }
});

readFileToArr(path, function (data) {
    for (let i = 0; i < data.length; i++) {
        console.log(data[i]);
    }
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
    var temp = 0;
    var isOpen = false;
    var pos = "";
    objReadline.on('line', function (line) {
        if (line.indexOf(str) != -1) {
            isOpen = true;
        }
        if (isOpen) {
            temp++;
            switch (temp) {
                case 9:
                    if (line.indexOf("X") != -1) {
                        num = getNum1(line);
                        pos = pos + num;
                    }
                    break;
                case 10:
                    if (line.indexOf("Y") != -1) {
                        num = getNum1(line);
                        pos = pos + num;
                    }
                    break;
                case 11:
                    if (line.indexOf("Z") != -1) {
                        num = getNum1(line);
                        pos = pos + num;
                        arr.push(pos);
                    }
                    break;
                case 12:
                    isOpen = false;
                    temp = 0;
                    break;
            }
        }
    });

    objReadline.on('close', function () {
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

// /**
//  * 提取字符串中的数字(整数)
//  */
// function getNum(str) {
//     var reg = /\d+(.\d+)?/g + (-\d+)?/g;
//     var arr = str.match(reg);
//     return parseInt(arr[0]);
// }

/**提取字符串中的数字保留符号 */
function getNum1(str) {
    var reg = /\d+(.\d+)? + (-\d+)?/g;
    var arr = str.match(reg);
    return arr[0];
}