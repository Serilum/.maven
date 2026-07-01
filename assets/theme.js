"use strict";

(function () {
	document.addEventListener("DOMContentLoaded", function () {
		var btn = document.getElementById("theme");
		if (!btn) return;

		function current() {
			return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
		}
		function label() {
			btn.textContent = current() === "light" ? "☾" : "☀";
		}
		label();

		btn.addEventListener("click", function () {
			var next = current() === "light" ? "dark" : "light";
			if (next === "light") {
				document.documentElement.setAttribute("data-theme", "light");
			} else {
				document.documentElement.removeAttribute("data-theme");
			}
			try { localStorage.setItem("mavenTheme", next); } catch (e) {}
			label();
		});
	});
})();
