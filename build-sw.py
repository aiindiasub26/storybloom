# Regenerates sw.js with the full list of files to cache for offline use.
import os, json, hashlib
root = os.path.dirname(os.path.abspath(__file__))
files, h = ["./", "index.html", "manifest.webmanifest"], hashlib.md5()
for d in ["css", "js", "assets"]:
    for dp, _, fs in os.walk(os.path.join(root, d)):
        for f in sorted(fs):
            p = os.path.relpath(os.path.join(dp, f), root).replace(os.sep, "/")
            files.append(p); h.update(open(os.path.join(root, p), "rb").read())
h.update(open(os.path.join(root, "index.html"), "rb").read())
ver = h.hexdigest()[:10]
sw = open(os.path.join(root, "sw.template.js")).read().replace("__VERSION__", ver).replace("__FILES__", json.dumps(sorted(set(files))))
open(os.path.join(root, "sw.js"), "w").write(sw)
print("sw.js", ver, len(files), "files")
