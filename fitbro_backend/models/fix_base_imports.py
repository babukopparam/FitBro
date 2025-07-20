# fix_base_imports.py
import os

MODELS_DIR = "."

for filename in os.listdir(MODELS_DIR):
    if filename.endswith(".py"):
        file_path = os.path.join(MODELS_DIR, filename)
        with open(file_path, "r") as f:
            content = f.read()
        # Replace the import line
        new_content = content.replace("from ..database import Base", "from ..database import Base")
        with open(file_path, "w") as f:
            f.write(new_content)
print("All imports fixed!")
