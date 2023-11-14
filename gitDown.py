import json

name = '"description"'
createTime = '"created_at"'
httpGit = '"http_url_to_repo"'

# 逐行读取文本文件内容，并解析每一行的JSON数据
data = []

        # "description": "策划 - 清华 程序 - 张鑫 、澳林",
        # "name": "hauntedParadise",
        # "name_with_namespace": "metaApp / metaGame / metabluets / Games / hauntedParadise",
        # "path": "hauntedparadise",
        # "path_with_namespace": "metaApp/metagame/metabluets/games/hauntedparadise",
        # "created_at": "2023-11-03T03:40:02.451Z",
        # "default_branch": "main",
        # "tag_list": [],
        # "topics": [],
        # "ssh_url_to_repo": "git@gitlab.appshahe.com:metaApp/metagame/metabluets/games/hauntedparadise.git",
        # "http_url_to_repo": "http://gitlab.appshahe.com/metaApp/metagame/metabluets/games/hauntedparadise.git",
# 读取该行信息
def readLine(txt):
    index = txt.index(':')
    txt = txt[index+1:]
    txt = txt.strip()
    txt = txt.replace('"', '')
    txt = txt.replace(',', '')
    txt = txt.replace(' ', '')
    return txt
    


with open('pathJson.txt', 'r', encoding='utf-8') as file:
    for line in file:
        # 判断是否该行包括createTime
        if name in line:
            nData = {}
            description = readLine(line)
            nData[name] = description
        elif createTime in line:
            createTime = readLine(line)
            nData[createTime] = createTime
        elif httpGit in line:
            httpGit = readLine(line)
            nData[httpGit] = httpGit
            data.append(nData)
            nData = {}
    
    print(data)
            
