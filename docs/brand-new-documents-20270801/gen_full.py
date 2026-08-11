import os
d="docs/brand-new-documents-20270801"
def read(p):
 with open(f"{d}/{p}", encoding="utf-8") as f: return f.read()
def write(p, c):
 with open(f"{d}/{p}", "w", encoding="utf-8") as f: f.write(c)
print("ready")