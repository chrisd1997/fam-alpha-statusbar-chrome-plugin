(() => {
  const script = document.getElementById("build-info");
  if (!script) return;

  let data;
  try {
    data = JSON.parse(script.textContent);
  } catch {
    return;
  }

  const DEFAULTS = {
    showGitDetails: true,
    showUnknown: false,
    buildInfoPosition: "top",
  };

  const bar = document.createElement("div");
  bar.id = "build-info-bar";

  const groups = [
    { label: "Core", build: data.CORE_BUILD, commit: data.CORE_COMMIT, branch: data.CORE_BRANCH },
    { label: "Stramien", build: data.STRAMIEN_BUILD, commit: data.STRAMIEN_COMMIT, branch: data.STRAMIEN_BRANCH, path: data.STRAMIEN_PATH },
    { label: "Site", build: data.SITE_BUILD, commit: data.SITE_COMMIT, branch: data.SITE_BRANCH, path: data.SITE_PATH },
  ];

  // Sections container (re-rendered on settings change)
  const sectionsEl = document.createElement("span");
  sectionsEl.id = "build-info-sections";
  bar.appendChild(sectionsEl);

  function renderSections(settings) {
    sectionsEl.innerHTML = "";

    const isVisible = (v) => {
      if (!v) return false;
      if (!settings.showUnknown && v.toLowerCase() === "unknown") return false;
      return true;
    };

    for (const g of groups) {
      const showBuild = isVisible(g.build);
      const showBranch = settings.showGitDetails && isVisible(g.branch);
      const showCommit = settings.showGitDetails && isVisible(g.commit);
      const showPath = isVisible(g.path);

      if (!showBuild && !showBranch && !showCommit && !showPath) continue;

      const section = document.createElement("span");
      section.className = "build-info-section";

      const labelEl = document.createElement("strong");
      labelEl.textContent = g.label;
      section.appendChild(labelEl);

      if (showBuild) {
        section.appendChild(document.createTextNode(` #${g.build}`));
      }
      if (showBranch) {
        const branchEl = document.createElement("span");
        branchEl.className = "build-info-branch";
        branchEl.textContent = g.branch;
        section.appendChild(branchEl);
      }
      if (showCommit) {
        const commitEl = document.createElement("span");
        commitEl.className = "build-info-commit";
        commitEl.textContent = g.commit.substring(0, 7);
        commitEl.title = g.commit;
        section.appendChild(commitEl);
      }
      if (showPath) {
        const pathEl = document.createElement("span");
        pathEl.className = "build-info-path";
        pathEl.textContent = g.path;
        section.appendChild(pathEl);
      }

      sectionsEl.appendChild(section);
    }
  }

  function applyPosition(position) {
    bar.classList.remove("build-info-top", "build-info-bottom");
    bar.classList.add(`build-info-${position}`);
    document.body.style.marginTop = position === "top" ? bar.offsetHeight + "px" : "";
    document.body.style.marginBottom = position === "bottom" ? bar.offsetHeight + "px" : "";
  }

  // Controls
  const controls = document.createElement("span");
  controls.id = "build-info-controls";

  // Settings gear button + popup
  const settingsWrapper = document.createElement("span");
  settingsWrapper.id = "build-info-settings-wrapper";

  const gearBtn = document.createElement("button");
  gearBtn.textContent = "\u2699";
  gearBtn.title = "Settings";

  const popup = document.createElement("div");
  popup.id = "build-info-popup";

  popup.innerHTML = `
    <label><input type="checkbox" id="bi-show-git"> Show Git details</label>
    <label><input type="checkbox" id="bi-show-unknown"> Show Unknown items</label>
    <label>
      Bar Position
      <select id="bi-position">
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
      </select>
    </label>
  `;

  gearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!popup.contains(e.target) && e.target !== gearBtn) {
      popup.classList.remove("open");
    }
  });

  settingsWrapper.appendChild(gearBtn);
  settingsWrapper.appendChild(popup);

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "\u00d7";
  closeBtn.title = "Hide build info bar";
  closeBtn.addEventListener("click", () => {
    bar.remove();
    document.body.style.marginTop = "";
    document.body.style.marginBottom = "";
  });

  controls.appendChild(settingsWrapper);
  controls.appendChild(closeBtn);
  bar.appendChild(controls);

  document.body.prepend(bar);

  // Load settings, bind controls, and render
  chrome.storage.local.get(DEFAULTS, (settings) => {
    const showGitCheckbox = popup.querySelector("#bi-show-git");
    const showUnknownCheckbox = popup.querySelector("#bi-show-unknown");
    const positionSelect = popup.querySelector("#bi-position");

    showGitCheckbox.checked = settings.showGitDetails;
    showUnknownCheckbox.checked = settings.showUnknown;
    positionSelect.value = settings.buildInfoPosition;

    renderSections(settings);
    applyPosition(settings.buildInfoPosition);

    showGitCheckbox.addEventListener("change", () => {
      settings.showGitDetails = showGitCheckbox.checked;
      chrome.storage.local.set({ showGitDetails: settings.showGitDetails });
      renderSections(settings);
    });

    showUnknownCheckbox.addEventListener("change", () => {
      settings.showUnknown = showUnknownCheckbox.checked;
      chrome.storage.local.set({ showUnknown: settings.showUnknown });
      renderSections(settings);
    });

    positionSelect.addEventListener("change", () => {
      settings.buildInfoPosition = positionSelect.value;
      chrome.storage.local.set({ buildInfoPosition: settings.buildInfoPosition });
      applyPosition(settings.buildInfoPosition);
    });
  });
})();
