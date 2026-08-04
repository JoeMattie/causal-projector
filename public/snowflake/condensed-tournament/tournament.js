(() => {
  "use strict";

  const SCHEMA = "causal-projector.snowflake-tournament-public/v1";
  const navigation = document.querySelector("#version-navigation");
  const tournamentGrid = document.querySelector("#tournament-grid");
  const bracketToggle = document.querySelector("#bracket-toggle");
  const tournamentState = document.querySelector("#tournament-state");
  const candidateTitle = document.querySelector("#candidate-title");
  const candidateBadges = document.querySelector("#candidate-badges");
  const candidateLineage = document.querySelector("#candidate-lineage");
  const openVersion = document.querySelector("#open-version");
  const openJournal = document.querySelector("#open-journal");
  const summary = document.querySelector("#comparison-summary");
  const unifiedButton = document.querySelector("#unified-view");
  const splitButton = document.querySelector("#split-view");
  const focusChanges = document.querySelector("#focus-changes");
  const previousChange = document.querySelector("#previous-change");
  const nextChange = document.querySelector("#next-change");
  const changePosition = document.querySelector("#change-position");
  const viewerStatus = document.querySelector("#viewer-status");
  const viewer = document.querySelector("#diff-viewer");
  const fallback = document.querySelector("#tournament-fallback");

  if (
    !navigation ||
    !tournamentGrid ||
    !bracketToggle ||
    !tournamentState ||
    !candidateTitle ||
    !candidateBadges ||
    !candidateLineage ||
    !openVersion ||
    !openJournal ||
    !summary ||
    !unifiedButton ||
    !splitButton ||
    !focusChanges ||
    !previousChange ||
    !nextChange ||
    !changePosition ||
    !viewerStatus ||
    !viewer ||
    !fallback
  ) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 820px)");
  const manifestUrl = new URL(
    "../data/tournaments/condensed-tournament/index.json",
    window.location.href,
  );
  const pageUrl = new URL(window.location.href);
  pageUrl.search = "";
  pageUrl.hash = "";

  const state = {
    manifest: null,
    versions: [],
    versionsById: new Map(),
    versionsByKey: new Map(),
    activeVersion: null,
    activeDiff: null,
    layout: "unified",
    focusChanges: true,
    diffCache: new Map(),
    requestToken: 0,
    changeTargets: [],
    changeIndex: -1,
    bracketOpen: false,
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };

  const isPlainLinkActivation = (event) =>
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  const versionKey = (id) => id.split(":").at(-1);

  const titleCase = (value) =>
    String(value)
      .replaceAll(/[_-]+/g, " ")
      .replaceAll(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());

  const resultLabel = (version) => {
    if (version.state === "seed") return "Seed";
    if (version.state === "champion") return "Champion";
    if (version.state === "advanced") return "Advanced";
    return "Eliminated";
  };

  const safeSameOriginUrl = (raw, base = pageUrl) => {
    const url = new URL(raw, base);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== window.location.origin ||
      url.username ||
      url.password
    ) {
      throw new Error("Unsafe tournament URL");
    }
    return url;
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (!response.ok) throw new Error(`Request failed with ${response.status}`);
    return await response.json();
  };

  const normalizeVersion = (value, index) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`Invalid tournament version ${index + 1}`);
    }
    const id = String(value.id ?? "");
    const key = versionKey(id);
    if (
      !/^draft:condensed-tournament:round\d+-(?:base|[ab])$/.test(id) ||
      !/^round\d+-(?:base|[ab])$/.test(key) ||
      !Number.isInteger(value.round) ||
      value.round < 0 ||
      !["seed", "advanced", "eliminated", "champion"].includes(value.state) ||
      !["accepted", "provisional"].includes(value.status) ||
      typeof value.label !== "string" ||
      typeof value.url !== "string"
    ) {
      throw new Error(`Invalid tournament version ${index + 1}`);
    }
    return { ...value, id, key };
  };

  const normalizeManifest = (value) => {
    if (
      !value ||
      value.schema !== SCHEMA ||
      value.state !== "ready" ||
      !Array.isArray(value.versions) ||
      !Array.isArray(value.rounds)
    ) {
      throw new Error("The tournament manifest is unavailable or incompatible");
    }
    const versions = value.versions.map(normalizeVersion);
    const ids = new Set(versions.map((version) => version.id));
    const keys = new Set(versions.map((version) => version.key));
    if (
      ids.size !== versions.length ||
      keys.size !== versions.length ||
      !ids.has(value.baselineId) ||
      !ids.has(value.championId)
    ) {
      throw new Error("The tournament manifest has an inconsistent bracket");
    }
    for (const [index, round] of value.rounds.entries()) {
      if (
        round?.round !== index + 1 ||
        !ids.has(round.seedId) ||
        !Array.isArray(round.candidateIds) ||
        round.candidateIds.length !== 2 ||
        round.candidateIds.some((id) => !ids.has(id)) ||
        !round.candidateIds.includes(round.winnerId)
      ) {
        throw new Error(`Tournament round ${index + 1} is inconsistent`);
      }
    }
    return { ...value, versions };
  };

  const candidateUrl = (version, { layout = state.layout } = {}) => {
    const url = new URL(pageUrl);
    url.searchParams.set("candidate", version.key);
    if (layout === "split") url.searchParams.set("layout", "split");
    if (!state.focusChanges) url.searchParams.set("context", "all");
    return url;
  };

  const renderVersionCard = (version, symbol) => {
    const item = element("li");
    const link = element("a", "version-card");
    link.href = candidateUrl(version).href;
    link.dataset.versionId = version.id;
    link.dataset.state = version.state;
    link.append(element("span", "version-symbol", symbol));

    const copy = element("span", "version-copy");
    copy.append(
      element("strong", "", version.label.replace(/^Round \d+ · /, "")),
      element(
        "small",
        "",
        version.state === "seed"
          ? `${version.wordCount.toLocaleString()} words · baseline`
          : `${version.wordCount.toLocaleString()} words · ${version.votes} ${version.votes === 1 ? "vote" : "votes"}`,
      ),
    );
    link.append(copy, element("span", "version-result", resultLabel(version)));
    link.addEventListener("click", (event) => {
      if (!isPlainLinkActivation(event)) return;
      event.preventDefault();
      selectVersion(version, { historyMode: "push", focus: true });
    });
    item.append(link);
    return item;
  };

  const renderBracket = () => {
    navigation.replaceChildren();
    const seed = state.versionsById.get(state.manifest.baselineId);
    const seedBlock = element("section", "bracket-seed");
    const seedHeading = element("div", "round-heading");
    seedHeading.append(
      element("strong", "", "Round 0"),
      element("span", "", "Original seed"),
    );
    const seedList = element("ol", "version-list");
    seedList.append(renderVersionCard(seed, "00"));
    seedBlock.append(seedHeading, seedList);
    navigation.append(seedBlock);

    for (const round of state.manifest.rounds) {
      const section = element("section", "bracket-round");
      const heading = element("div", "round-heading");
      heading.append(
        element("strong", "", `Round ${round.round}`),
        element("span", "", `Vote ${round.votes.A}–${round.votes.B}`),
      );
      const list = element("ol", "version-list");
      for (const [index, id] of round.candidateIds.entries()) {
        list.append(
          renderVersionCard(
            state.versionsById.get(id),
            index === 0 ? "A" : "B",
          ),
        );
      }
      section.append(heading, list);
      navigation.append(section);
    }
  };

  const syncActiveCard = () => {
    for (const link of navigation.querySelectorAll("[data-version-id]")) {
      const active = link.dataset.versionId === state.activeVersion?.id;
      if (active) {
        link.setAttribute("aria-current", "page");
      }
      else link.removeAttribute("aria-current");
    }
  };

  const renderBadges = (version) => {
    candidateBadges.replaceChildren(
      element("span", "experiment-badge", "Derived experiment"),
    );
    const status = element("span", "status-chip", titleCase(version.status));
    status.dataset.status = version.status;
    const result = element("span", "result-badge", resultLabel(version));
    result.dataset.state = version.state;
    candidateBadges.append(status, result);
  };

  const setSummary = (diff) => {
    const values = [
      [diff.stats.candidateWords.toLocaleString(), ""],
      [`+${diff.stats.addedWords.toLocaleString()}`, "is-insert"],
      [`−${diff.stats.removedWords.toLocaleString()}`, "is-delete"],
      [diff.stats.changeGroups.toLocaleString(), ""],
    ];
    [...summary.querySelectorAll("strong")].forEach((node, index) => {
      node.textContent = values[index][0];
      node.className = values[index][1];
    });
  };

  const appendParts = (target, parts, kind) => {
    const hiddenLabel = element(
      "span",
      "visually-hidden",
      kind === "delete" ? "Removed: " : kind === "insert" ? "Added: " : "",
    );
    if (hiddenLabel.textContent) target.append(hiddenLabel);
    for (const part of parts ?? []) {
      if (part.type === "equal") {
        target.append(document.createTextNode(part.text));
      } else {
        const tag = part.type === "delete" ? "del" : "ins";
        target.append(element(tag, `word-${part.type}`, part.text));
      }
    }
  };

  const displayContextText = (target, text) => {
    const heading = /^(#{1,6})\s+(.+)$/.exec(text);
    if (heading) {
      target.classList.add("is-heading");
      target.textContent = heading[2];
    } else {
      target.textContent = text;
    }
  };

  const lineNumber = (value) => {
    const node = element("span", "line-number", value ?? "");
    node.setAttribute("aria-hidden", "true");
    return node;
  };

  const unifiedLine = ({ kind, baselineLine, candidateLine, text, parts, group }) => {
    const row = element("div", "diff-row unified-line");
    row.dataset.kind = kind;
    if (group) row.dataset.changeGroup = String(group);
    const marker = element(
      "span",
      "line-marker",
      kind === "delete" ? "−" : kind === "insert" ? "+" : "",
    );
    marker.setAttribute("aria-hidden", "true");
    const content = element("span", "line-text");
    if (kind === "context") displayContextText(content, text);
    else appendParts(content, parts, kind);
    row.append(
      lineNumber(baselineLine),
      lineNumber(candidateLine),
      marker,
      content,
    );
    return row;
  };

  const splitCell = ({ kind, line, text, parts }) => {
    const cell = element("div", "split-cell");
    cell.dataset.kind = kind;
    if (kind === "empty") cell.classList.add("is-empty");
    const content = element("span", "line-text");
    if (kind === "context") displayContextText(content, text);
    else if (kind !== "empty") appendParts(content, parts, kind);
    cell.append(lineNumber(line), content);
    return cell;
  };

  const renderRow = (row) => {
    if (state.layout === "unified") {
      if (row.type === "context") {
        return [
          unifiedLine({
            kind: "context",
            baselineLine: row.baselineLine,
            candidateLine: row.candidateLine,
            text: row.text,
          }),
        ];
      }
      const output = [];
      if (row.left) {
        output.push(
          unifiedLine({
            kind: "delete",
            baselineLine: row.baselineLine,
            candidateLine: null,
            parts: row.left,
            group: row.changeGroup,
          }),
        );
      }
      if (row.right) {
        output.push(
          unifiedLine({
            kind: "insert",
            baselineLine: null,
            candidateLine: row.candidateLine,
            parts: row.right,
            group: row.changeGroup,
          }),
        );
      }
      return output;
    }

    const wrapper = element("div", "diff-row split-row");
    if (row.changeGroup) wrapper.dataset.changeGroup = String(row.changeGroup);
    if (row.type === "context") {
      wrapper.append(
        splitCell({
          kind: "context",
          line: row.baselineLine,
          text: row.text,
        }),
        splitCell({
          kind: "context",
          line: row.candidateLine,
          text: row.text,
        }),
      );
    } else {
      wrapper.append(
        splitCell({
          kind: row.left ? "delete" : "empty",
          line: row.baselineLine,
          parts: row.left,
        }),
        splitCell({
          kind: row.right ? "insert" : "empty",
          line: row.candidateLine,
          parts: row.right,
        }),
      );
    }
    return [wrapper];
  };

  const appendRows = (target, rows) => {
    for (const row of rows) target.append(...renderRow(row));
  };

  const appendContextRun = (target, rows, atStart, atEnd) => {
    if (!state.focusChanges || rows.length <= 8) {
      appendRows(target, rows);
      return;
    }
    const leading = atStart ? 0 : 3;
    const trailing = atEnd ? 0 : 3;
    if (leading) appendRows(target, rows.slice(0, leading));
    const hiddenRows = rows.slice(leading, rows.length - trailing);
    const omission = element("div", "context-omission");
    const button = element(
      "button",
      "",
      `Show ${hiddenRows.length.toLocaleString()} unchanged ${hiddenRows.length === 1 ? "line" : "lines"}`,
    );
    button.type = "button";
    button.addEventListener("click", () => {
      const fragment = document.createDocumentFragment();
      appendRows(fragment, hiddenRows);
      omission.replaceWith(fragment);
      refreshChangeTargets();
    });
    omission.append(button);
    target.append(omission);
    if (trailing) appendRows(target, rows.slice(-trailing));
  };

  const refreshChangeTargets = () => {
    const seen = new Set();
    state.changeTargets = [
      ...viewer.querySelectorAll("[data-change-group]"),
    ].filter((node) => {
      const group = node.dataset.changeGroup;
      if (!group || seen.has(group)) return false;
      seen.add(group);
      return true;
    });
    state.changeIndex = -1;
    const count = state.changeTargets.length;
    previousChange.disabled = count === 0;
    nextChange.disabled = count === 0;
    changePosition.textContent = count
      ? `${count.toLocaleString()} ${count === 1 ? "change" : "changes"}`
      : "No changes";
  };

  const renderDiff = () => {
    const diff = state.activeDiff;
    viewer.replaceChildren();
    viewer.dataset.layout = state.layout;
    if (!diff || diff.stats.changeGroups === 0) {
      const empty = element("div", "diff-empty");
      const copy = element("div");
      copy.append(
        element("strong", "", "This is the Round 0 baseline"),
        element(
          "p",
          "",
          "Choose any candidate from the bracket to see what changed from this first version.",
        ),
      );
      empty.append(copy);
      viewer.append(empty);
      refreshChangeTargets();
      return;
    }

    const lines = element("div", "diff-lines");
    for (let index = 0; index < diff.rows.length; ) {
      if (diff.rows[index].type !== "context") {
        lines.append(...renderRow(diff.rows[index]));
        index += 1;
        continue;
      }
      const start = index;
      while (index < diff.rows.length && diff.rows[index].type === "context") {
        index += 1;
      }
      appendContextRun(
        lines,
        diff.rows.slice(start, index),
        start === 0,
        index === diff.rows.length,
      );
    }
    viewer.append(lines);
    refreshChangeTargets();
  };

  const goToChange = (direction) => {
    if (state.changeTargets.length === 0) return;
    for (const target of state.changeTargets) {
      target.classList.remove("is-targeted");
    }
    if (state.changeIndex === -1) {
      state.changeIndex = direction > 0 ? 0 : state.changeTargets.length - 1;
    } else {
      state.changeIndex =
        (state.changeIndex + direction + state.changeTargets.length) %
        state.changeTargets.length;
    }
    const target = state.changeTargets[state.changeIndex];
    target.classList.add("is-targeted");
    target.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "center",
    });
    changePosition.textContent = `${state.changeIndex + 1} of ${state.changeTargets.length}`;
  };

  const normalizeDiff = (value, version) => {
    if (
      !value ||
      value.schema !== SCHEMA ||
      value.baselineId !== state.manifest.baselineId ||
      value.candidateId !== version.id ||
      !Array.isArray(value.rows) ||
      !value.stats ||
      !Number.isInteger(value.stats.changeGroups)
    ) {
      throw new Error("The selected comparison is invalid");
    }
    return value;
  };

  const loadDiff = async (version) => {
    if (!state.diffCache.has(version.id)) {
      const url = safeSameOriginUrl(version.url, manifestUrl);
      state.diffCache.set(
        version.id,
        fetchJson(url).then((value) => normalizeDiff(value, version)),
      );
    }
    try {
      return await state.diffCache.get(version.id);
    } catch (error) {
      state.diffCache.delete(version.id);
      throw error;
    }
  };

  const renderViewerError = (version, error) => {
    viewer.replaceChildren();
    const panel = element("div", "diff-error");
    const copy = element("div");
    const retry = element("button", "", "Retry comparison");
    retry.type = "button";
    retry.addEventListener("click", () => {
      state.diffCache.delete(version.id);
      selectVersion(version, { historyMode: "none", focus: false, force: true });
    });
    copy.append(
      element("strong", "", "The comparison did not load"),
      element("p", "", error.message || "The generated diff is unavailable."),
      retry,
    );
    panel.append(copy);
    viewer.append(panel);
    viewer.setAttribute("aria-busy", "false");
    viewerStatus.textContent = `Comparison failed for ${version.label}.`;
  };

  const selectVersion = async (
    version,
    { historyMode = "none", focus = false, force = false } = {},
  ) => {
    if (!version) return;
    if (!force && version.id === state.activeVersion?.id && state.activeDiff) {
      if (focus) candidateTitle.focus({ preventScroll: true });
      return;
    }
    state.activeVersion = version;
    state.activeDiff = null;
    const token = ++state.requestToken;
    syncActiveCard();
    renderBadges(version);
    candidateTitle.textContent = version.label;
    const basedOn = version.basedOnId
      ? state.versionsById.get(version.basedOnId)
      : null;
    candidateLineage.textContent =
      version.state === "seed"
        ? "The original Round 0 seed. Select a candidate to compare against it."
        : `Compared with Round 0 · evolved from ${basedOn?.label ?? "the prior winner"} · ${version.votes} ${version.votes === 1 ? "vote" : "votes"}`;
    openVersion.href = safeSameOriginUrl(version.documentUrl).href;
    if (state.manifest.logDocumentUrl) {
      openJournal.href = safeSameOriginUrl(state.manifest.logDocumentUrl).href;
      openJournal.hidden = false;
    } else {
      openJournal.hidden = true;
    }
    tournamentState.textContent = "Loading";
    viewer.setAttribute("aria-busy", "true");
    viewer.replaceChildren();
    const loading = element("div", "diff-loading");
    loading.append(
      element("span", "", "∆"),
      element("strong", "", "Building the comparison"),
      element("p", "", "Loading the exact build-generated prose diff…"),
    );
    viewer.append(loading);

    if (historyMode !== "none") {
      history[historyMode === "replace" ? "replaceState" : "pushState"](
        { candidate: version.key },
        "",
        candidateUrl(version),
      );
    }
    if (mobileLayout.matches) {
      state.bracketOpen = false;
      syncBracketVisibility();
    }

    try {
      const diff = await loadDiff(version);
      if (token !== state.requestToken) return;
      state.activeDiff = diff;
      setSummary(diff);
      renderDiff();
      viewer.setAttribute("aria-busy", "false");
      tournamentState.textContent = "Ready";
      viewerStatus.textContent = `${version.label} loaded: ${diff.stats.addedWords} words added, ${diff.stats.removedWords} removed, across ${diff.stats.changeGroups} change groups.`;
      if (focus) candidateTitle.focus({ preventScroll: true });
    } catch (error) {
      if (token !== state.requestToken) return;
      tournamentState.textContent = "Error";
      renderViewerError(version, error);
    }
  };

  const setLayout = (layout, { updateUrl = true } = {}) => {
    state.layout = layout === "split" && !mobileLayout.matches ? "split" : "unified";
    unifiedButton.setAttribute("aria-pressed", String(state.layout === "unified"));
    splitButton.setAttribute("aria-pressed", String(state.layout === "split"));
    if (state.activeDiff) renderDiff();
    if (updateUrl && state.activeVersion) {
      history.replaceState(
        { candidate: state.activeVersion.key },
        "",
        candidateUrl(state.activeVersion),
      );
    }
  };

  const syncBracketVisibility = () => {
    const collapsed = mobileLayout.matches && !state.bracketOpen;
    navigation.hidden = collapsed;
    bracketToggle.setAttribute("aria-expanded", String(!collapsed));
  };

  const versionFromUrl = () => {
    const url = new URL(window.location.href);
    return (
      state.versionsByKey.get(url.searchParams.get("candidate")) ??
      state.versionsById.get(state.manifest.championId)
    );
  };

  const initialize = async () => {
    tournamentGrid.hidden = false;
    try {
      const manifest = normalizeManifest(await fetchJson(manifestUrl));
      state.manifest = manifest;
      state.versions = manifest.versions;
      state.versionsById = new Map(
        manifest.versions.map((version) => [version.id, version]),
      );
      state.versionsByKey = new Map(
        manifest.versions.map((version) => [version.key, version]),
      );
      const url = new URL(window.location.href);
      state.focusChanges = url.searchParams.get("context") !== "all";
      focusChanges.checked = state.focusChanges;
      state.layout = url.searchParams.get("layout") === "split" ? "split" : "unified";
      if (mobileLayout.matches) state.layout = "unified";
      renderBracket();
      syncBracketVisibility();
      fallback.hidden = true;
      const version = versionFromUrl();
      const requestedKey = url.searchParams.get("candidate");
      const invalidKey = requestedKey && !state.versionsByKey.has(requestedKey);
      setLayout(state.layout, { updateUrl: false });
      await selectVersion(version, {
        historyMode: invalidKey || !requestedKey ? "replace" : "none",
      });
      if (invalidKey) {
        viewerStatus.textContent = `Unknown candidate ${requestedKey}; showing the champion instead.`;
      }
    } catch (error) {
      tournamentState.textContent = "Unavailable";
      viewer.replaceChildren();
      const panel = element("div", "diff-error");
      const copy = element("div");
      copy.append(
        element("strong", "", "The tournament is unavailable"),
        element("p", "", error.message || "The public snapshot could not be read."),
      );
      panel.append(copy);
      viewer.append(panel);
      viewer.setAttribute("aria-busy", "false");
    }
  };

  unifiedButton.addEventListener("click", () => setLayout("unified"));
  splitButton.addEventListener("click", () => setLayout("split"));
  focusChanges.addEventListener("change", () => {
    state.focusChanges = focusChanges.checked;
    if (state.activeDiff) renderDiff();
    if (state.activeVersion) {
      history.replaceState(
        { candidate: state.activeVersion.key },
        "",
        candidateUrl(state.activeVersion),
      );
    }
  });
  previousChange.addEventListener("click", () => goToChange(-1));
  nextChange.addEventListener("click", () => goToChange(1));
  bracketToggle.addEventListener("click", () => {
    state.bracketOpen = !state.bracketOpen;
    syncBracketVisibility();
  });
  mobileLayout.addEventListener("change", () => {
    if (mobileLayout.matches) state.layout = "unified";
    setLayout(state.layout);
    syncBracketVisibility();
  });
  window.addEventListener("popstate", () => {
    if (!state.manifest) return;
    const url = new URL(window.location.href);
    state.focusChanges = url.searchParams.get("context") !== "all";
    focusChanges.checked = state.focusChanges;
    setLayout(url.searchParams.get("layout") === "split" ? "split" : "unified", {
      updateUrl: false,
    });
    selectVersion(versionFromUrl(), { historyMode: "none" });
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      /^(?:INPUT|TEXTAREA|SELECT|BUTTON)$/.test(event.target?.tagName ?? "")
    ) {
      return;
    }
    if (event.key.toLocaleLowerCase() === "j") {
      event.preventDefault();
      goToChange(1);
    } else if (event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      goToChange(-1);
    }
  });

  initialize();
})();
