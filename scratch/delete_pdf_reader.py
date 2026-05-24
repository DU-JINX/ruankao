# author du
import os
import shutil
import stat

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

# 定义要删除的文件夹路径
target_path = r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\pdf-mobile-reader"

if os.path.exists(target_path):
    print(f"Starting deletion of {target_path}...")
    try:
        shutil.rmtree(target_path, onerror=remove_readonly)
        print("Deletion successful!")
    except Exception as e:
        print("Error encountered:", e)
else:
    print("Target path does not exist.")
