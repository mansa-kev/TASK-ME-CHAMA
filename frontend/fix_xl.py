import os
import re

dir_path = "/home/billionaire_kevin/Documents/antigravity/Taskme Chama/frontend/src/components"

for filename in os.listdir(dir_path):
    if not filename.endswith(".tsx"): continue
    path = os.path.join(dir_path, filename)
    with open(path, "r") as f:
        content = f.read()
    
    # Replace text-xl font-extrabold text-gray-800
    new_content = re.sub(r'text-xl font-extrabold text-gray-800 tracking-tight', r'text-xl font-extrabold text-brand-accent tracking-tight', content)
    
    if new_content != content:
        with open(path, "w") as f:
            f.write(new_content)
        print(f"Updated {filename}")
