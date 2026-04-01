(function () {
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var commandInput = document.getElementById("commandInput");
  var commandLinks = Array.from(document.querySelectorAll(".command-link"));
  var hintLinks = Array.from(document.querySelectorAll(".hint-link"));
  var panels = Array.from(document.querySelectorAll(".terminal-output .output-panel"));
  var aboutOutputPanel = document.getElementById("panel-about-output");
  var focusSignal = document.getElementById("focusSignal");
  var outputRoute = document.getElementById("outputRoute");
  var outputStatus = document.getElementById("outputStatus");
  var outputLog = document.getElementById("outputLog");
  var copyButtons = Array.from(document.querySelectorAll(".copy-button"));
  var storageKey = "portfolio-theme";
  var commandHistory = ["/about"];
  var historyIndex = commandHistory.length;
  var activeTimer = null;

  var commands = {
    about: "load_about()",
    experience: "load_experience()",
    projects: "load_projects()",
    skills: "show_skills()",
    artifacts: "load_artifacts()",
    education: "load_education()",
    contact: "init_contact()",
    help: "help()"
  };

  var focusSignals = [
    "spark_migration",
    "airflow_reliability",
    "b2b_monetization",
    "incident_monitoring"
  ];

  var savedTheme = localStorage.getItem(storageKey);
  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
  }

  function updateThemeLabel() {
    if (themeToggle) {
      themeToggle.textContent = root.dataset.theme === "light" ? "dark" : "light";
    }
  }

  updateThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var nextTheme = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = nextTheme;
      localStorage.setItem(storageKey, nextTheme);
      updateThemeLabel();
    });
  }

  function setOutputMeta(target, status, message) {
    if (outputRoute) {
      outputRoute.textContent = "/" + target;
    }

    if (outputStatus) {
      outputStatus.textContent = status;
    }

    if (outputLog) {
      outputLog.textContent = message;
    }
  }

  function setActiveCommand(target) {
    panels.forEach(function (panel) {
      var isAboutOutput = panel === aboutOutputPanel;
      var active = isAboutOutput ? target === "about" : panel.dataset.panel === target;
      panel.classList.toggle("active", active);
      panel.hidden = !active;

      if (active && !isAboutOutput && window.innerWidth <= 960) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    commandLinks.forEach(function (button) {
      button.classList.toggle("active", button.dataset.target === target);
    });

    if (commandInput) {
      commandInput.value = "/" + target;
    }
  }

  function normalizeCommand(rawValue) {
    return rawValue.trim().replace(/^\//, "").toLowerCase();
  }

  function pushHistory(rawValue) {
    var normalized = rawValue.trim().startsWith("/") ? rawValue.trim() : "/" + normalizeCommand(rawValue);
    if (commandHistory[commandHistory.length - 1] !== normalized) {
      commandHistory.push(normalized);
    }
    historyIndex = commandHistory.length;
  }

  function runCommand(rawValue) {
    var value = normalizeCommand(rawValue);
    if (!value) {
      return;
    }

    if (activeTimer) {
      window.clearTimeout(activeTimer);
      activeTimer = null;
    }

    if (value === "clear") {
      pushHistory("/clear");
      setActiveCommand("about");
      setOutputMeta("about", "idle", "[system] output cleared; summary pinned on left panel");
      return;
    }

    if (!commands[value]) {
      pushHistory(rawValue);
      setActiveCommand("help");
      setOutputMeta("help", "error", "[error] unknown command; run /help");
      return;
    }

    pushHistory(rawValue);
    setOutputMeta(value, "loading", "[system] loading " + commands[value]);

    activeTimer = window.setTimeout(function () {
      setActiveCommand(value);
      if (value === "about") {
        setOutputMeta("about", "idle", "[system] summary pinned on left panel");
      } else {
        setOutputMeta(value, "ready", "[ok] module rendered for /" + value);
      }
    }, 180);
  }

  commandLinks.forEach(function (button) {
    button.addEventListener("click", function () {
      runCommand(button.dataset.target);
    });
  });

  hintLinks.forEach(function (button) {
    button.addEventListener("click", function () {
      runCommand(button.dataset.target);
    });
  });

  if (commandInput) {
    commandInput.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        commandInput.value = "";
        return;
      }

      if (event.key === "ArrowUp") {
        if (!commandHistory.length) {
          return;
        }
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        commandInput.value = commandHistory[historyIndex];
        return;
      }

      if (event.key === "ArrowDown") {
        if (!commandHistory.length) {
          return;
        }
        event.preventDefault();
        historyIndex = Math.min(commandHistory.length, historyIndex + 1);
        commandInput.value = historyIndex >= commandHistory.length ? "" : commandHistory[historyIndex];
        return;
      }

      if (event.key === "Enter") {
        runCommand(commandInput.value);
      }
    });
  }

  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.dataset.copy || "";
      copyButtons.forEach(function (item) {
        item.dataset.copied = "false";
        if (item.textContent !== "copy") {
          item.textContent = "copy";
        }
      });

      if (!navigator.clipboard || !value) {
        setOutputMeta("contact", "ready", "[warn] clipboard unavailable");
        return;
      }

      navigator.clipboard.writeText(value).then(function () {
        button.dataset.copied = "true";
        button.textContent = "copied";
        setOutputMeta("contact", "ready", "[ok] copied to clipboard :: " + value);
        window.setTimeout(function () {
          button.dataset.copied = "false";
          button.textContent = "copy";
        }, 1400);
      }, function () {
        setOutputMeta("contact", "ready", "[warn] copy failed");
      });
    });
  });

  if (focusSignal) {
    var signalIndex = 0;
    var focusInterval = window.setInterval(function () {
      signalIndex = (signalIndex + 1) % focusSignals.length;
      focusSignal.textContent = focusSignals[signalIndex];
    }, 2400);
  }

  setOutputMeta("about", "idle", "[system] summary pinned on left panel");
})();
