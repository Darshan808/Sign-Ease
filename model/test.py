import os

def delete_all_files():
    directory = r"D:\MachineLearning\IPL_Dataset(main_env)\New folder\asl-handsigns\Sign-Ease\clips"
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting {file_path}: {e}")
delete_all_files()