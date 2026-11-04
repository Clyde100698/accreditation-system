import os
import sys

root_dir = 'BSCS_REAL_DATA'
inventory = {}

for root, dirs, files in os.walk(root_dir):
    rel_path = os.path.relpath(root, root_dir)
    inventory[rel_path] = {
        'dirs': dirs,
        'files': files
    }

total_folders = len(inventory)
total_files = sum(len(v['files']) for v in inventory.values())

# Write full inventory to Markdown file
out_file = 'BSCS_REAL_DATA_INVENTORY.md'
with open(out_file, 'w', encoding='utf-8') as f:
    f.write("# BSCS Real Data Inventory\n\n")
    f.write(f"- **Total Directories:** {total_folders}\n")
    f.write(f"- **Total Files:** {total_files}\n\n")

    for folder, contents in sorted(inventory.items()):
        depth = 0 if folder == '.' else folder.count(os.sep) + 1
        indent = '  ' * depth
        folder_name = 'BSCS_REAL_DATA (Root)' if folder == '.' else folder
        f.write(f"{indent}- **📁 `{folder_name}`** ({len(contents['files'])} files)\n")
        for file_name in sorted(contents['files']):
            f.write(f"{indent}  - 📄 `{file_name}`\n")

print(f"Scanned successfully!")
print(f"Total Folders: {total_folders}")
print(f"Total Files: {total_files}")
print(f"Full inventory saved to: {out_file}")

# Print high-level breakdown per top area
top_areas = sorted([d for d in os.listdir(root_dir) if os.path.isdir(os.path.join(root_dir, d))])
print("\n=== TOP LEVEL BREAKDOWN ===")
for area in top_areas:
    area_files = []
    area_path = os.path.join(root_dir, area)
    for r, d, fls in os.walk(area_path):
        area_files.extend(fls)
    print(f"[{area}]: {len(area_files)} files")

root_files = [f for f in os.listdir(root_dir) if os.path.isfile(os.path.join(root_dir, f))]
print(f"[Root Files]: {root_files}")
