import os
import re

current_directory = os.getcwd()

file_path_026 = os.path.join(current_directory,'026NewLevel.level')
file_path_027 = os.path.join(current_directory, 'NewLevel.level')

script_property = []

# 判断当前字符是否符合条件
def is_match(data, i, string):
    for j in range(len(string)):
        if data[i + j] != string[j]:
            return False
    return True

# 读取026NewLevel.level文件，并将所有的'"ScriptComponent":{}'的元素存入数组
def read_026():
    with open(file_path_026, 'r', encoding='utf-8') as file:
        data = file.read()
        recording = False
        current_record = ''
        for i in range(len(data)):
            if is_match(data, i, '"ScriptComponent":{'):
                if recording:
                    current_record = ''
                else:
                    recording = True
            elif is_match(data, i, '"StaticScriptComponent"'):
                if recording:
                    script_property.append(current_record)
                    current_record = ''
                    recording = False
            if recording:
                current_record += data[i]
        
        # 将数组中的元素有包含'"ScriptComponent":{}'的元素去掉
        script_property[:] = [item for item in script_property if not '"ScriptComponent":{}' in item]

# 读取NewLevel.level文件，并将所有的'"ScriptComponent":{}'的元素替换为数组中的元素
def write_027():
    print("----------开始替换027level文件----------", len(script_property))
    print("替换进度", j + 1, "/", len(script_property))
    string = script_property[j]
    # 将字符串的前30个字符取出来作为判断条件
    string_30 = string[:30]
    try:
        with open(file_path_027, 'r', encoding='utf-8') as file:
            data = file.read()
            for j in range(len(script_property)):
                recording = False
                is_match_aa = False
                current_record = ''
                for i in range(len(data)):
                    if is_match(data, i, string_30):
                        if recording:
                            pass
                        else:
                            recording = True
                    elif is_match(data, i, '"StaticScriptComponent"'):
                        if recording:
                            current_record += string
                            current_record += '"'
                            is_match_aa = True
                            recording = True
                    if not recording:
                        current_record += data[i]
                    if is_match_aa:
                        recording = False
                        is_match_aa = False
                data = current_record
                
            with open(file_path_027, 'w', encoding='utf-8') as file:
                file.write(current_record)
                print('写入成功')
                current_record = ''
    except Exception as error:
        print(error)
        

def main():
    read_026()
    write_027()

if __name__ == '__main__':
    main()
