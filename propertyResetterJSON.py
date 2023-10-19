import json

# 026Level文件
file_path = "026NewLevel.level"
# 027Level文件
file_path2 = "NewLevel.level"
replace_data_dict = dict()


def main():
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
        scene_list = data["Scene"]
        for scene_item in scene_list:
            script = scene_item.get("Script")
            # 判空
            if script:
                script_component = script.get("ScriptComponent")
            # 去除空数据
            if script_component:
                # 遍历所有guid对应的json对象（key为guid）
                for k, v in script_component.items():
                    # 跳过包含“相机”的项
                    # if v.get("cameraMode"):
                    #     continue
                    replace_data_dict[k] = v
            # print(script_component)

        f.close()
    out_str = ""
    with open(file_path2, 'r+', encoding='utf-8-sig') as f:
        data = json.load(f)
        scene_list = data["Scene"]
        for scene_item in scene_list:
            script = scene_item.get("Script")
            # 判空
            if script:
                script_component = script.get("ScriptComponent")
            if script_component:
                # 遍历所有guid对应的json对象（key为guid）
                for k, v in script_component.items():
                    script_component[k] = replace_data_dict[k]
        out_str = json.dumps(data)
        f.close()

    with open(file_path2, 'w', encoding='utf-8') as f:
        f.write(out_str)
        f.close()


if __name__ == '__main__':
    main()
