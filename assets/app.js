"use strict";

var ACTIVE_GROUPS = ["com.natamus.collective-ml"];

document.addEventListener("DOMContentLoaded", function () {
	loadArtifacts();
	wireCopyButtons();
	wireVersionToggles();
});

function loadArtifacts() {
	var target = document.getElementById("artifacts");

	fetch("/versions.json", { cache: "no-cache" })
		.then(function (res) {
			if (!res.ok) throw new Error("status " + res.status);
			return res.json();
		})
		.then(function (data) {
			target.innerHTML = renderGroups(data.groups || []);
			fillLatestVersion(data);
		})
		.catch(function (err) {
			target.innerHTML = '<p class="status">Could not load the artifact list (' + err.message + ").</p>";
		});
}

function renderGroups(groups) {
	var active = [];
	var legacy = [];
	groups.forEach(function (g) {
		(ACTIVE_GROUPS.indexOf(g.groupId) !== -1 ? active : legacy).push(g);
	});

	var html = "";
	active.forEach(function (g) {
		html += renderGroup(g);
	});
	if (legacy.length) {
		html += '<p class="group-label">Legacy / discontinued</p>';
		legacy.forEach(function (g) {
			html += renderGroup(g);
		});
	}
	return html;
}

function renderGroup(group) {
	var html = "";
	group.artifacts.forEach(function (a) {
		html += renderArtifact(group.groupId, a);
	});
	return html;
}

function renderArtifact(groupId, artifact) {
	var coord = groupId + ":" + artifact.artifactId;
	var latest = artifact.versions[0];
	var count = artifact.versions.length;

	var html = '<div class="artifact">';
	html += '<div class="artifact-head">';
	html += '<span class="coord">' + coord + "</span>";
	if (latest) {
		html += '<span class="chip">' + latest.version + "</span>";
		html += '<span class="files">' + renderFiles(artifact.path, latest) + "</span>";
	}
	html += "</div>";

	if (count > 1) {
		html += '<button class="toggle" type="button">Show all ' + count + " versions</button>";
		html += '<div class="versions hidden">';
		artifact.versions.forEach(function (v) {
			html += '<div class="version-row"><span class="version-name">' + v.version + "</span>";
			html += renderFiles(artifact.path, v);
			html += "</div>";
		});
		html += "</div>";
	}

	html += "</div>";
	return html;
}

function renderFiles(basePath, version) {
	return version.files
		.map(function (name) {
			var url = "/" + basePath + "/" + version.version + "/" + name;
			return '<a class="file" href="' + url + '" title="' + name + '">' + classifyFile(name) + "</a>";
		})
		.join("");
}

function classifyFile(name) {
	if (name.endsWith(".pom")) return "pom";
	if (name.endsWith(".jar")) {
		var stem = name.slice(0, -4);
		var i = stem.lastIndexOf("-");
		var last = i === -1 ? "" : stem.slice(i + 1);
		return /^[a-z]+$/i.test(last) ? last : "jar";
	}
	var dot = name.lastIndexOf(".");
	return dot === -1 ? name : name.slice(dot + 1);
}

function fillLatestVersion(data) {
	var version = latestCollectiveVersion(data);
	if (!version) return;

	document.querySelectorAll(".usage pre code").forEach(function (code) {
		if (code.textContent.indexOf("VERSION") !== -1) {
			code.textContent = code.textContent.replace(/VERSION/g, version);
		}
	});

	var span = document.getElementById("latest-ver");
	if (span) span.textContent = version;
}

function latestCollectiveVersion(data) {
	var groups = data.groups || [];
	for (var i = 0; i < groups.length; i++) {
		if (groups[i].groupId !== "com.natamus.collective-ml") continue;
		var arts = groups[i].artifacts;
		for (var j = 0; j < arts.length; j++) {
			if (arts[j].artifactId === "collective" && arts[j].latest) return arts[j].latest;
		}
	}
	return null;
}

function wireVersionToggles() {
	document.getElementById("artifacts").addEventListener("click", function (e) {
		var btn = e.target.closest(".toggle");
		if (!btn) return;
		var panel = btn.nextElementSibling;
		if (!panel) return;
		var hidden = panel.classList.toggle("hidden");
		var count = panel.querySelectorAll(".version-row").length;
		btn.textContent = (hidden ? "Show all " : "Hide ") + count + " versions";
	});
}

function wireCopyButtons() {
	document.querySelectorAll(".copy").forEach(function (btn) {
		btn.addEventListener("click", function () {
			var block = document.getElementById(btn.getAttribute("data-copy"));
			if (!block) return;
			copyText(block.textContent).then(function () {
				btn.classList.add("copied");
				btn.textContent = "Copied";
				setTimeout(function () {
					btn.classList.remove("copied");
					btn.textContent = "Copy";
				}, 1400);
			});
		});
	});
}

function copyText(text) {
	if (navigator.clipboard && navigator.clipboard.writeText) {
		return navigator.clipboard.writeText(text);
	}
	return new Promise(function (resolve) {
		var ta = document.createElement("textarea");
		ta.value = text;
		document.body.appendChild(ta);
		ta.select();
		try { document.execCommand("copy"); } catch (e) {}
		document.body.removeChild(ta);
		resolve();
	});
}
