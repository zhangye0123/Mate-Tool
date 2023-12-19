import os

# 定义要搜索的文件夹和文件名
folder_path = 'JavaScripts/Modified027Editor'
file_name = 'ModifiedPlayer.ts'

# 构建文件的完整路径
file_path = os.path.join(os.getcwd(), folder_path, file_name)

# 读取文件内容并替换文本
try:
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        content = content.replace('return stance;', 'return stance as any;')
        content = content.replace('return ani;', 'return ani as any;')
        content = content.replace('return anim;', 'return anim as any;')

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

    print("文件修改成功")
except IOError as e:
    print(f"发生错误: {e}")