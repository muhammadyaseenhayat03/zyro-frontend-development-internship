const NAME = "Muhammad Yaseen Hayat";
const nameEl = document.getElementById("typed-name");

function typeName(text, el, speed = 70) {
  let i = 0;
  el.textContent = "";
  const interval = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

typeName(NAME, nameEl);

const btn = document.getElementById("run-btn");
const log = document.getElementById("log");
const status = document.getElementById("status");

const checks = [
  { label: "HTML structure", ok: true },
  { label: "CSS linked", ok: true },
  { label: "JavaScript linked", ok: true },
  { label: "Responsive layout", ok: true },
];

btn.addEventListener("click", () => {
  btn.disabled = true;
  status.textContent = "running...";
  log.innerHTML = "";

  checks.forEach((check, index) => {
    setTimeout(() => {
      const line = document.createElement("p");
      line.className = "log-line " + (check.ok ? "ok" : "warn");
      line.textContent = `✔ ${check.label} — OK`;
      log.appendChild(line);

      if (index === checks.length - 1) {
        const done = document.createElement("p");
        done.className = "log-line ok";
        done.textContent = "✔ All checks passed. Ready for Week 2.";
        log.appendChild(done);
        status.textContent = "done";
        btn.disabled = false;
      }
    }, index * 350);
  });
});

console.log(
  "Week 1 environment loaded. index.html, style.css, script.js are linked correctly.",
);
