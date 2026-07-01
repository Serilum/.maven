#!/usr/bin/env python3
"""Generate versions.json and per-artifact maven-metadata.xml from the com/ tree."""

import json
import re
import os
from datetime import datetime, timezone

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COM_ROOT = os.path.join(REPO_ROOT, "com")
BASE_URL = "https://maven.serilum.com"

CLASSIFIER_ORDER = {"jar": 0, "pom": 1, "sources": 2, "javadoc": 3}


def version_key(version):
	return tuple(int(n) for n in re.findall(r"\d+", version))


def is_version_dir(path):
	# maven-metadata.xml is ignored so an artifact directory (metadata + version
	# subdirs) is not itself read as a version, keeping the generator idempotent.
	try:
		return any(
			(e.endswith(".jar") or e.endswith(".pom"))
			and os.path.isfile(os.path.join(path, e))
			for e in os.listdir(path)
		)
	except OSError:
		return False


def classifier_of(name):
	if name.endswith(".pom"):
		return "pom"
	if name.endswith(".jar"):
		stem = name[:-4]
		last = stem.rsplit("-", 1)[-1] if "-" in stem else ""
		return last if last.isalpha() else "jar"
	return name.rsplit(".", 1)[-1]


def sort_files(files):
	return sorted(files, key=lambda n: (CLASSIFIER_ORDER.get(classifier_of(n), len(CLASSIFIER_ORDER)), n))


def discover_artifacts():
	artifacts = {}
	for dirpath, dirnames, filenames in os.walk(COM_ROOT):
		if not is_version_dir(dirpath):
			continue
		version = os.path.basename(dirpath)
		artifact_path = os.path.dirname(dirpath)
		artifact_rel = os.path.relpath(artifact_path, REPO_ROOT).replace(os.sep, "/")
		group_id = os.path.dirname(artifact_rel).replace("/", ".")

		files = [f for f in filenames if not f.startswith(".") and f != "maven-metadata.xml"]
		entry = artifacts.setdefault(artifact_rel, {
			"groupId": group_id,
			"artifactId": os.path.basename(artifact_path),
			"path": artifact_rel,
			"versions": {},
		})
		entry["versions"][version] = sort_files(files)
	return artifacts


def build_versions_json(artifacts):
	groups = {}
	for artifact_rel in sorted(artifacts):
		a = artifacts[artifact_rel]
		ordered = sorted(a["versions"], key=version_key, reverse=True)
		artifact_out = {
			"artifactId": a["artifactId"],
			"path": a["path"],
			"latest": ordered[0] if ordered else None,
			"versions": [{"version": v, "files": a["versions"][v]} for v in ordered],
		}
		g = groups.setdefault(a["groupId"], {
			"groupId": a["groupId"],
			"path": os.path.dirname(a["path"]),
			"artifacts": [],
		})
		g["artifacts"].append(artifact_out)

	return {
		"generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
		"baseUrl": BASE_URL,
		"groups": [groups[k] for k in sorted(groups)],
	}


def write_maven_metadata(artifacts):
	stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
	written = []
	for artifact_rel, a in artifacts.items():
		ordered = sorted(a["versions"], key=version_key)
		if not ordered:
			continue
		latest = ordered[-1]
		version_xml = "\n".join("\t\t\t<version>%s</version>" % v for v in ordered)
		xml = (
			'<?xml version="1.0" encoding="UTF-8"?>\n'
			'<metadata>\n'
			'\t<groupId>%s</groupId>\n'
			'\t<artifactId>%s</artifactId>\n'
			'\t<versioning>\n'
			'\t\t<latest>%s</latest>\n'
			'\t\t<release>%s</release>\n'
			'\t\t<versions>\n'
			'%s\n'
			'\t\t</versions>\n'
			'\t\t<lastUpdated>%s</lastUpdated>\n'
			'\t</versioning>\n'
			'</metadata>\n'
		) % (a["groupId"], a["artifactId"], latest, latest, version_xml, stamp)
		out_path = os.path.join(REPO_ROOT, artifact_rel, "maven-metadata.xml")
		with open(out_path, "w", encoding="utf-8", newline="\n") as f:
			f.write(xml)
		written.append(out_path)
	return written


def main():
	if not os.path.isdir(COM_ROOT):
		raise SystemExit("No com/ directory found at %s" % COM_ROOT)

	artifacts = discover_artifacts()
	data = build_versions_json(artifacts)

	with open(os.path.join(REPO_ROOT, "versions.json"), "w", encoding="utf-8", newline="\n") as f:
		json.dump(data, f, indent="\t")
		f.write("\n")

	metadata_files = write_maven_metadata(artifacts)

	print("Artifacts:      %d" % len(artifacts))
	print("Versions:       %d" % sum(len(a["versions"]) for a in artifacts.values()))
	print("Groups:         %d" % len(data["groups"]))
	print("metadata files: %d" % len(metadata_files))


if __name__ == "__main__":
	main()
