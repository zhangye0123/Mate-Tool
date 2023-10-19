import json
import os

# 026Level文件
file_path = "026NewLevel.level"
# 027Level文件
file_path2 = "NewLevel.level"
replace_data_dict = {}
static_replace_data_dict = {}


def traverse_json(obj):
    if isinstance(obj, dict):
        if "Script" in obj:
            script = obj["Script"]
            if script:
                script_component = script.get("ScriptComponent")
                if script_component:
                    for k, v in script_component.items():
                        replace_data_dict[k] = v
                static_script_component = script.get("StaticScriptComponent")
                if static_script_component:
                    for k, v in static_script_component.items():
                        static_replace_data_dict[k] = v

        for value in obj.values():
            traverse_json(value)
    elif isinstance(obj, list):
        for item in obj:
            traverse_json(item)

def write_traverse_json(obj):
    if isinstance(obj, dict):
        if "Script" in obj:
            script = obj["Script"]
            if script:
                script_component = script.get("ScriptComponent")
                if script_component:
                    for k, v in script_component.items():
                        script_component[k] = replace_data_dict.get(k, v)
                static_script_component = script.get("StaticScriptComponent")
                if static_script_component:
                    for k, v in static_script_component.items():
                        static_script_component[k] = static_replace_data_dict.get(k, v)

        for value in obj.values():
            write_traverse_json(value)
    elif isinstance(obj, list):
        for item in obj:
            write_traverse_json(item)
    
    return obj


def main():
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
        traverse_json(data)

    with open(file_path2, 'r+', encoding='utf-8-sig') as f:
        data = json.load(f)
        # traverse_json(data)
        data = write_traverse_json(data)

        out_str = json.dumps(data)
        f.seek(0)
        f.write(out_str)
        f.truncate()

    print("脚本修改完成！")


if __name__ == '__main__':
    main()
