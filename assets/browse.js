"use strict";

(function () {
	var override = null;
	var cache = {};

	document.addEventListener("DOMContentLoaded", function () {
		var btn = document.getElementById("sort");
		if (btn) {
			btn.addEventListener("click", function () {
				override = currentDir() === "desc" ? "asc" : "desc";
				applySort();
				updateButton();
			});
		}
		applySort();
		updateButton();
		document.addEventListener("click", onClick);
		window.addEventListener("popstate", onPop);
	});

	function defaultDir() {
		var firstDir = document.querySelector("#listing li.dir");
		var name = firstDir ? firstDir.getAttribute("data-name") : "";
		return /^[0-9]/.test(name) ? "desc" : "asc";
	}

	function currentDir() {
		return override || defaultDir();
	}

	function updateButton() {
		var btn = document.getElementById("sort");
		if (!btn) return;
		var desc = currentDir() === "desc";
		btn.innerHTML = (desc ? "Z-A" : "A-Z") + ' <span class="arrow">' + (desc ? "↓" : "↑") + "</span>";
	}

	function applySort() {
		var list = document.getElementById("listing");
		if (!list) return;
		var items = Array.prototype.slice.call(list.querySelectorAll("li:not(.up)"));
		var dirs = items.filter(function (li) { return li.classList.contains("dir"); });
		var files = items.filter(function (li) { return !li.classList.contains("dir"); });

		var cmp = function (a, b) {
			return a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"), undefined, { numeric: true, sensitivity: "base" });
		};
		dirs.sort(cmp);
		files.sort(cmp);
		if (currentDir() === "desc") {
			dirs.reverse();
			files.reverse();
		}
		dirs.concat(files).forEach(function (li) { list.appendChild(li); });
	}

	function isDirLink(href) {
		return href && href.charAt(0) === "/" && href.slice(0, 4) === "/com" && href.charAt(href.length - 1) === "/";
	}

	function onClick(e) {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		var a = e.target.closest("a");
		if (!a) return;
		var href = a.getAttribute("href");
		if (!isDirLink(href)) return;
		e.preventDefault();
		go(href, true);
	}

	function onPop() {
		if (isDirLink(location.pathname)) {
			go(location.pathname, false);
		} else {
			location.reload();
		}
	}

	function go(href, push) {
		var render = function (doc) {
			var newList = doc.getElementById("listing");
			var newCrumbs = doc.querySelector(".crumbs");
			if (!newList || !newCrumbs) {
				location.href = href;
				return;
			}
			document.getElementById("listing").replaceWith(document.importNode(newList, true));
			document.querySelector(".crumbs").innerHTML = newCrumbs.innerHTML;
			document.title = doc.title;
			if (push) history.pushState({}, "", href);
			override = null;
			applySort();
			updateButton();
			window.scrollTo(0, 0);
		};

		if (cache[href]) {
			render(cache[href]);
			return;
		}
		fetch(href)
			.then(function (r) { return r.text(); })
			.then(function (html) {
				var doc = new DOMParser().parseFromString(html, "text/html");
				cache[href] = doc;
				render(doc);
			})
			.catch(function () { location.href = href; });
	}
})();
