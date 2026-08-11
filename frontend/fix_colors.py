import os
import re

dir_path = "/home/billionaire_kevin/Documents/antigravity/Taskme Chama/frontend/src/components"

for filename in os.listdir(dir_path):
    if not filename.endswith(".tsx"): continue
    path = os.path.join(dir_path, filename)
    with open(path, "r") as f:
        content = f.read()
    
    # Replace h2 main headers text color
    new_content = re.sub(r'text-2xl font-extrabold text-gray-800', r'text-2xl font-extrabold text-brand-accent', content)
    
    # Replace subheaders text color
    new_content = re.sub(r'text-sm font-medium text-brand-amber', r'text-sm font-medium text-brand-accent', new_content)
    
    if new_content != content:
        with open(path, "w") as f:
            f.write(new_content)
        print(f"Updated {filename}")
