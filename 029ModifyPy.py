import os

# 定义要搜索的文件夹和文件名
folder_path = 'JavaScripts/Modified027Editor'
file_name = 'ModifiedPlayer.ts'

folder_path1 = 'JavaScripts'
file_name1 = 'sevenAnimation.ts'

# 构建文件的完整路径
file_path = os.path.join(os.getcwd(), folder_path, file_name)
file_path1 = os.path.join(os.getcwd(), folder_path1, file_name1)

# 将下述功能写成函数，并调用
def changeTxt(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
        content = content.replace('return stance;', 'return stance as any;')
        content = content.replace('return ani;', 'return ani as any;')
        content = content.replace('return anim;', 'return anim as any;')
        content = content.replace(' as RpcAnimation', ' as any')

    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)

# 读取文件内容并替换文本
try:
    changeTxt(file_path)
    changeTxt(file_path1)
    print("文件修改成功")
except IOError as e:
    print(f"发生错误: {e}")