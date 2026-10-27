"""
inspect_inventory.py
Systematic inspection of PAS source code to generate the Phase 2 Source-of-Truth Inventory.
"""

import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. Inspect Prisma Models & Enums
schema_path = os.path.join(BASE_DIR, "prisma", "schema.prisma")
with open(schema_path, "r", encoding="utf-8") as f:
    schema = f.read()

models = re.findall(r"^model\s+(\w+)\s+\{", schema, re.MULTILINE)
enums = re.findall(r"^enum\s+(\w+)\s+\{", schema, re.MULTILINE)

# 2. Inspect API routes
api_dir = os.path.join(BASE_DIR, "app", "api")
api_routes = []
for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file in ("route.ts", "route.js"):
            rel_path = os.path.relpath(root, BASE_DIR).replace("\\", "/")
            api_routes.append(rel_path)

# 3. Inspect Pages
app_dir = os.path.join(BASE_DIR, "app")
pages = []
for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file in ("page.tsx", "page.jsx"):
            rel_path = os.path.relpath(root, BASE_DIR).replace("\\", "/")
            pages.append(rel_path)

# 4. Inspect lib/fsm.ts
fsm_path = os.path.join(BASE_DIR, "lib", "fsm.ts")
with open(fsm_path, "r", encoding="utf-8") as f:
    fsm_content = f.read()

# Extract ApplicationStatus object
status_match = re.search(r"export const ApplicationStatus\s*=\s*\{([^}]+)\}", fsm_content)
fsm_statuses = []
if status_match:
    for line in status_match.group(1).splitlines():
        line = line.strip()
        m = re.match(r"(\w+):\s*['\"]([^'\"]+)['\"]", line)
        if m:
            fsm_statuses.append(m.group(2))

# 5. Inspect Roles
roles_match = re.search(r"enum\s+Role\s*\{([^}]+)\}", schema)
roles = []
if roles_match:
    for line in roles_match.group(1).splitlines():
        line = line.strip()
        if line and not line.startswith("//"):
            roles.append(line.split()[0])

print("="*60)
print("PAS CODEBASE SOURCE-OF-TRUTH INVENTORY")
print("="*60)
print(f"Total Prisma Models: {len(models)}")
for m in models:
    print(f"  - {m}")
print(f"\nTotal Prisma Enums: {len(enums)}: {enums}")
print(f"\nUser Roles in Schema ({len(roles)}): {roles}")
print(f"\nTotal FSM States in lib/fsm.ts: {len(fsm_statuses)}")
print(f"Total API Route Files: {len(api_routes)}")
print(f"Total Page Files: {len(pages)}")
print("="*60)
