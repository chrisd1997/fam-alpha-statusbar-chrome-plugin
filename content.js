(() => {
  const script = document.getElementById("build-info");
  if (!script) return;

  let data;
  try {
    data = JSON.parse(script.textContent);
  } catch {
    return;
  }

  const bar = document.createElement("div");
  bar.id = "build-info-bar";

  const groups = [
    { label: "Core", build: data.CORE_BUILD, commit: data.CORE_COMMIT, branch: data.CORE_BRANCH },
    { label: "Stramien", build: data.STRAMIEN_BUILD, commit: data.STRAMIEN_COMMIT, branch: data.STRAMIEN_BRANCH, path: data.STRAMIEN_PATH },
    { label: "Site", build: data.SITE_BUILD, commit: data.SITE_COMMIT, branch: data.SITE_BRANCH, path: data.SITE_PATH },
  ];

  for (const g of groups) {
    if (!g.build && !g.commit) continue;

    const section = document.createElement("span");
    section.className = "build-info-section";

    const labelEl = document.createElement("strong");
    labelEl.textContent = g.label;
    section.appendChild(labelEl);

    if (g.build) {
      section.appendChild(document.createTextNode(` #${g.build}`));
    }
    if (g.branch) {
      const branchEl = document.createElement("span");
      branchEl.className = "build-info-branch";
      branchEl.textContent = g.branch;
      section.appendChild(branchEl);
    }
    if (g.commit) {
      const commitEl = document.createElement("span");
      commitEl.className = "build-info-commit";
      commitEl.textContent = g.commit.substring(0, 7);
      commitEl.title = g.commit;
      section.appendChild(commitEl);
    }
    if (g.path) {
      const pathEl = document.createElement("span");
      pathEl.className = "build-info-path";
      pathEl.textContent = g.path;
      section.appendChild(pathEl);
    }

    bar.appendChild(section);
  }

  // Controls container
  const controls = document.createElement("span");
  controls.id = "build-info-controls";

  // Position toggle button
  const toggle = document.createElement("button");
  toggle.title = "Move bar to top/bottom";

  function applyPosition(position) {
    bar.classList.remove("build-info-top", "build-info-bottom");
    bar.classList.add(`build-info-${position}`);
    toggle.textContent = position === "top" ? "\u2193" : "\u2191";
    toggle.title = position === "top" ? "Move bar to bottom" : "Move bar to top";

    // Adjust body margin so bar doesn't overlap content
    document.body.style.marginTop = position === "top" ? bar.offsetHeight + "px" : "";
    document.body.style.marginBottom = position === "bottom" ? bar.offsetHeight + "px" : "";
  }

  toggle.addEventListener("click", () => {
    const newPos = bar.classList.contains("build-info-top") ? "bottom" : "top";
    applyPosition(newPos);
    chrome.storage.local.set({ buildInfoPosition: newPos });
  });

  // Close button
  const close = document.createElement("button");
  close.textContent = "\u00d7";
  close.title = "Hide build info bar";
  close.addEventListener("click", () => {
    bar.remove();
    document.body.style.marginTop = "";
    document.body.style.marginBottom = "";
  });

  controls.appendChild(toggle);
  controls.appendChild(close);
  bar.appendChild(controls);

  document.body.prepend(bar);

  // Load saved position (default: top)
  chrome.storage.local.get({ buildInfoPosition: "top" }, (result) => {
    applyPosition(result.buildInfoPosition);
  });
})();
