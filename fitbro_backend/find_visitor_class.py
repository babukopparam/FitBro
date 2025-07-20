import os

search_root = "."  # Change this to your code base directory if needed
search_str = "class Visitor(Base)"

for dirpath, dirnames, filenames in os.walk(search_root):
    for filename in filenames:
        if filename.endswith(".py"):
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    for lineno, line in enumerate(f, 1):
                        if search_str in line:
                            print(f"Found in {filepath} (line {lineno})")
            except Exception as e:
                print(f"Could not read {filepath}: {e}")
