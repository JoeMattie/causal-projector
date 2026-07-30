(() => {
  "use strict";

  const content = document.querySelector("#workspace-content");
  const viewNavigation = document.querySelector("#view-navigation");
  const treeBranches = document.querySelector("#tree-branches");
  const treeToggle = document.querySelector("#tree-toggle");
  const search = document.querySelector("#library-search");
  const locationLabel = document.querySelector("#stage-location");
  const dataState = document.querySelector("#data-state");
  const stage = document.querySelector(".library-stage");
  const heroStatus = document.querySelector("#hero-status");
  const heroDetail = document.querySelector("#hero-detail");
  const currentStepLabel = document.querySelector("#current-step-label");
  const currentStepNote = document.querySelector("#current-step-note");

  if (
    !content ||
    !viewNavigation ||
    !treeBranches ||
    !treeToggle ||
    !search ||
    !locationLabel ||
    !dataState ||
    !stage ||
    !heroStatus ||
    !heroDetail ||
    !currentStepLabel ||
    !currentStepNote
  ) {
    return;
  }

  const STEP_TITLES = [
    "One-sentence summary",
    "One-paragraph summary",
    "Character sketches",
    "Expanded synopsis",
    "Character synopses",
    "Long synopsis",
    "Character bible",
    "Scene list",
    "Scene briefs",
    "Draft",
  ];

  const PHASES = [
    {
      id: "foundation",
      title: "Foundation",
      description: "Compress the story until its load-bearing shape is visible.",
      steps: [1, 2, 3, 4],
    },
    {
      id: "expansion",
      title: "Expansion",
      description: "Deepen plot, character, and causality without losing the core.",
      steps: [5, 6, 7],
    },
    {
      id: "execution",
      title: "Execution",
      description: "Turn the design into ordered scenes and draftable units.",
      steps: [8, 9, 10],
    },
  ];

  const VIEW_COPY = {
    step: {
      eyebrow: "Method sequence",
      title: "Documents by Snowflake step",
      description:
        "A document may be accepted or provisional. That status never implies that an entire step is complete.",
    },
    subject: {
      eyebrow: "Cross-cutting library",
      title: "Documents by subject",
      description:
        "Subject views gather related planning without copying it or changing its canonical owner.",
    },
    science: {
      eyebrow: "Science library",
      title: "Scientific planning",
      description:
        "Scientific references and planning gathered from the same public catalog.",
    },
    story: {
      eyebrow: "Story library",
      title: "Story planning",
      description:
        "Premise, plot, character, setting, and continuity documents gathered by family.",
    },
  };

  const VIEW_TREE = {
    step: { label: "Snowflake steps", symbol: "10" },
    subject: { label: "Subjects", symbol: "§" },
    science: { label: "Science", symbol: "⌁" },
    story: { label: "Story", symbol: "¶" },
  };

  const ALLOWED_VIEWS = new Set(["overview", ...Object.keys(VIEW_COPY)]);
  const STATUS_ORDER = { accepted: 0, provisional: 1 };
  const collator = new Intl.Collator("en", {
    numeric: true,
    sensitivity: "base",
  });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 680px)");
  const pageUrl = new URL(window.location.href);
  pageUrl.search = "";
  pageUrl.hash = "";
  const indexUrl = new URL("./data/index.json", pageUrl);

  const state = {
    records: [],
    recordsById: new Map(),
    currentStep: null,
    catalogState: "",
    activeView: "overview",
    activeDocumentId: null,
    activeGroup: null,
    query: "",
    fragmentCache: new Map(),
    requestToken: 0,
    restoreFocusId: null,
    expandedTreeIds: new Set(["tree-view-step"]),
    mobileTreeOpen: false,
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };

  const normalizedText = (value) =>
    typeof value === "string" ? value.trim() : "";

  const titleCase = (value, fallback = "General") => {
    const clean = normalizedText(value).replaceAll(/[_/-]+/g, " ");
    if (!clean) return fallback;
    return clean.replaceAll(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());
  };

  const pluralize = (count, singular, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;

  const isPlainLinkActivation = (event) =>
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  const stepTitle = (step) => STEP_TITLES[step - 1] ?? `Step ${step}`;

  const statusChip = (status) => {
    const chip = element("span", "status-chip", titleCase(status));
    chip.dataset.status = status;
    return chip;
  };

  const metadataChip = (value) => element("span", "metadata-chip", value);

  const safeSameOriginUrl = (rawUrl, baseUrl) => {
    if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
      throw new Error("Missing catalog URL");
    }
    const url = new URL(rawUrl, baseUrl);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.origin !== window.location.origin ||
      url.username ||
      url.password
    ) {
      throw new Error("Unsafe catalog URL");
    }
    return url;
  };

  const safePublicLink = (rawUrl) => {
    if (typeof rawUrl !== "string" || rawUrl.trim() === "") return null;
    const clean = rawUrl.trim();
    if (/^#[A-Za-z][A-Za-z0-9_.:-]*$/.test(clean)) return clean;
    try {
      const url = new URL(clean, pageUrl);
      if (
        (url.protocol !== "http:" && url.protocol !== "https:") ||
        url.username ||
        url.password
      ) {
        return null;
      }
      return url.href;
    } catch {
      return null;
    }
  };

  const normalizeRecord = (entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Invalid catalog record at position ${index + 1}`);
    }

    const id = normalizedText(entry.id);
    const title = normalizedText(entry.title);
    const status = normalizedText(entry.status).toLocaleLowerCase();
    if (!id || !title || !["accepted", "provisional"].includes(status)) {
      throw new Error(`Invalid catalog record at position ${index + 1}`);
    }

    const numericStep =
      entry.step === null || entry.step === undefined || entry.step === ""
        ? null
        : Number(entry.step);
    if (
      numericStep !== null &&
      (!Number.isInteger(numericStep) || numericStep < 1 || numericStep > 10)
    ) {
      throw new Error(`Invalid Snowflake step at position ${index + 1}`);
    }

    const fragmentUrl = safeSameOriginUrl(entry.url, indexUrl);
    const views = Array.isArray(entry.views)
      ? entry.views.map((view) => normalizedText(view).toLocaleLowerCase()).filter(Boolean)
      : [];

    return Object.freeze({
      id,
      title,
      status,
      step: numericStep,
      domain: normalizedText(entry.domain).toLocaleLowerCase(),
      role: normalizedText(entry.role).toLocaleLowerCase(),
      family: normalizedText(entry.family).toLocaleLowerCase(),
      subject: normalizedText(entry.subject),
      excerpt: normalizedText(entry.excerpt),
      url: fragmentUrl,
      views,
    });
  };

  const extractCurrentStep = (catalog) => {
    if (!catalog || Array.isArray(catalog)) return null;
    const candidate =
      catalog.currentStep?.step ??
      catalog.currentStep ??
      catalog.current?.step ??
      null;
    const step = Number(candidate);
    return Number.isInteger(step) && step >= 1 && step <= 10 ? step : null;
  };

  const extractCatalogState = (catalog) => {
    if (!catalog || Array.isArray(catalog)) return "";
    return normalizedText(catalog.state ?? catalog.status).toLocaleLowerCase();
  };

  const extractRecords = (catalog) => {
    const entries = Array.isArray(catalog)
      ? catalog
      : catalog?.records ?? catalog?.documents;
    if (!Array.isArray(entries)) {
      throw new Error("The public catalog does not contain a records array");
    }

    const seen = new Set();
    return entries.map((entry, index) => {
      const record = normalizeRecord(entry, index);
      if (seen.has(record.id)) {
        throw new Error("The public catalog contains duplicate document IDs");
      }
      seen.add(record.id);
      return record;
    });
  };

  const recordSort = (left, right) =>
    (STATUS_ORDER[left.status] ?? 99) - (STATUS_ORDER[right.status] ?? 99) ||
    (left.step ?? 99) - (right.step ?? 99) ||
    collator.compare(left.title, right.title);

  const explicitlyInView = (record, view) =>
    record.views.some(
      (entry) =>
        entry === view ||
        [`${view}:`, `${view}/`].some((prefix) => entry.startsWith(prefix)),
    );

  const recordInView = (record, view) => {
    if (view === "step") return record.step !== null || explicitlyInView(record, view);
    if (view === "subject") {
      return Boolean(record.subject) || explicitlyInView(record, view);
    }
    if (view === "science") {
      return record.domain === "science" || explicitlyInView(record, view);
    }
    if (view === "story") {
      return record.domain === "story" || explicitlyInView(record, view);
    }
    return false;
  };

  const recordsForView = (view) =>
    state.records.filter((record) => recordInView(record, view)).sort(recordSort);

  const syncNavigation = () => {
    const items = [...viewNavigation.querySelectorAll('[role="treeitem"]')];
    let activeItem = null;

    for (const item of items) {
      const itemView = item.dataset.treeView ?? item.dataset.view;
      const context = itemView === state.activeView;
      const isDocument =
        Boolean(item.dataset.recordId) &&
        item.dataset.recordId === state.activeDocumentId &&
        context;
      const isGroup =
        !state.activeDocumentId &&
        Boolean(item.dataset.treeGroup) &&
        context &&
        String(item.dataset.treeGroup) === String(state.activeGroup);
      const isView =
        !state.activeDocumentId &&
        !state.activeGroup &&
        Boolean(item.dataset.view) &&
        item.dataset.view === state.activeView;
      const active = isDocument || isGroup || isView;

      item.classList.toggle("is-active", active);
      item.classList.toggle("is-context", context && !active);
      if (active) {
        item.setAttribute("aria-current", "page");
        activeItem ??= item;
      } else {
        item.removeAttribute("aria-current");
      }
    }

    const focused = document.activeElement?.closest?.('[role="treeitem"]');
    const tabStop =
      focused && viewNavigation.contains(focused)
        ? focused
        : activeItem ?? items[0] ?? null;
    for (const item of items) item.tabIndex = item === tabStop ? 0 : -1;

    const label =
      state.activeView === "overview"
        ? document.querySelector("#tree-item-overview")
        : document.querySelector(`#tree-view-${state.activeView}`);
    if (label?.id) stage.setAttribute("aria-labelledby", label.id);
  };

  const metricCard = (value, label) => {
    const card = element("div", "metric-card");
    card.append(element("strong", "", value), element("span", "", label));
    return card;
  };

  const treeIdPart = (value) =>
    String(value)
      .toLocaleLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "general";

  const groupHash = (view, group) => {
    if (group === null || group === undefined || group === "") return "";
    const value =
      view === "step"
        ? String(group).padStart(2, "0")
        : encodeURIComponent(String(group));
    return `${view}-${value}`;
  };

  const groupFromHash = (view, hash) => {
    const prefix = `#${view}-`;
    if (!hash.startsWith(prefix)) return null;
    const encoded = hash.slice(prefix.length);
    if (!encoded) return null;
    try {
      const value = decodeURIComponent(encoded);
      if (view !== "step") return value;
      const step = Number(value);
      return Number.isInteger(step) && step >= 1 && step <= 10 ? step : null;
    } catch {
      return null;
    }
  };

  const makeViewUrl = (view = state.activeView, group = state.activeGroup) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("document");
    if (view === "overview") {
      url.searchParams.delete("view");
    } else {
      url.searchParams.set("view", view);
    }
    const hash = groupHash(view, group);
    url.hash = hash ? `#${hash}` : "";
    return url;
  };

  const updateViewUrl = ({ replace = false } = {}) => {
    const url = makeViewUrl();
    history[replace ? "replaceState" : "pushState"](
      { view: state.activeView },
      "",
      url,
    );
  };

  const focusContent = () => {
    window.requestAnimationFrame(() => content.focus({ preventScroll: true }));
  };

  const scrollToActiveGroup = () => {
    if (!state.activeGroup) return;
    const target = [...content.querySelectorAll("[data-view-group]")].find(
      (node) =>
        node.dataset.viewGroup === String(state.activeGroup) &&
        node.dataset.view === state.activeView,
    );
    target?.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const renderOverview = () => {
    locationLabel.textContent = "Workspace overview";
    content.replaceChildren();

    const accepted = state.records.filter(
      (record) => record.status === "accepted",
    ).length;
    const provisional = state.records.filter(
      (record) => record.status === "provisional",
    ).length;

    const header = element("header", "overview-header");
    const headerCopy = element("div");
    headerCopy.append(
      element("p", "section-kicker", "Method map"),
      element("h2", "", "One catalog, several useful views"),
      element(
        "p",
        "",
        "The ten-step map shows where planning belongs. Documents stay in one canonical source and may appear in more than one view.",
      ),
    );
    header.append(headerCopy);

    const metrics = element("div", "summary-metrics");
    metrics.append(
      metricCard(state.records.length, "Public documents"),
      metricCard(accepted, "Accepted"),
      metricCard(provisional, "Provisional"),
    );

    const reviewRequired =
      state.catalogState === "review-required"
        ? (() => {
            const panel = element("section", "review-required-panel");
            panel.setAttribute("role", "status");
            panel.append(
              element("strong", "", "Initial import review required"),
              element(
                "p",
                "",
                "The Snowflake snapshot has not been approved for this public library. No method progress is inferred while review is pending.",
              ),
            );
            return panel;
          })()
        : null;

    const currentPanel = element("section", "current-work-panel");
    const currentNumber = element(
      "span",
      "current-work-number",
      state.currentStep ?? "—",
    );
    const currentCopy = element("div");
    if (state.currentStep) {
      currentCopy.append(
        element("strong", "", `Step ${state.currentStep}: ${stepTitle(state.currentStep)}`),
        element(
          "p",
          "",
          "This is the active work pointer. Individual document labels show acceptance; the pointer does not mark the step complete.",
        ),
      );
    } else {
      currentCopy.append(
        element("strong", "", "No current step is published"),
        element(
          "p",
          "",
          "The library does not infer a current step from accepted documents.",
        ),
      );
    }
    currentPanel.append(currentNumber, currentCopy);

    const phaseStack = element("div", "phase-stack");
    for (const phase of PHASES) {
      const section = element("section", "phase-section");
      section.dataset.phase = phase.id;
      const phaseHeading = element("div", "phase-heading");
      const phaseCopy = element("div");
      phaseCopy.append(
        element("h3", "", phase.title),
        element("p", "", phase.description),
      );
      phaseHeading.append(
        phaseCopy,
        element("span", "status-pill", pluralize(phase.steps.length, "step")),
      );

      const list = element("ol", "step-roadmap");
      for (const step of phase.steps) {
        const documents = state.records.filter((record) => record.step === step);
        const acceptedCount = documents.filter(
          (record) => record.status === "accepted",
        ).length;
        const provisionalCount = documents.filter(
          (record) => record.status === "provisional",
        ).length;
        const item = element("li");
        const button = element("button", "roadmap-button");
        button.type = "button";
        button.classList.toggle("is-current", step === state.currentStep);
        button.setAttribute(
          "aria-label",
          `Step ${step}, ${stepTitle(step)}, ${pluralize(documents.length, "public document")}${step === state.currentStep ? ", current step" : ""}`,
        );

        const number = element(
          "span",
          "roadmap-number",
          `STEP ${String(step).padStart(2, "0")}`,
        );
        if (step === state.currentStep) {
          number.append(element("span", "current-label", "Current"));
        }
        const counts = element("span", "roadmap-counts");
        counts.append(
          element("span", "", `${acceptedCount} accepted`),
          element("span", "", `${provisionalCount} provisional`),
        );
        button.append(
          number,
          element("span", "roadmap-title", stepTitle(step)),
          counts,
        );
        button.addEventListener("click", () =>
          setView("step", { group: step, updateUrl: true }),
        );
        item.append(button);
        list.append(item);
      }
      section.append(phaseHeading, list);
      phaseStack.append(section);
    }

    const libraryHeading = element("div", "library-heading");
    libraryHeading.append(
      element("h3", "", "Browse across the method"),
      element("p", "", "Documents can appear in multiple views without copies"),
    );
    const viewCards = element("div", "collection-grid view-cards");
    for (const view of ["subject", "science", "story"]) {
      const copy = VIEW_COPY[view];
      const records = recordsForView(view);
      const card = element("button", "collection-card view-card");
      card.type = "button";
      card.append(
        element("strong", "", copy.title),
        element("small", "", pluralize(records.length, "public document")),
      );
      card.addEventListener("click", () => setView(view, { updateUrl: true }));
      viewCards.append(card);
    }

    content.append(header);
    if (reviewRequired) content.append(reviewRequired);
    content.append(metrics, currentPanel, phaseStack, libraryHeading, viewCards);
  };

  const documentCard = (record) => {
    const item = element("li");
    const link = element("a", "document-card");
    link.dataset.recordId = record.id;
    link.href = makeDocumentUrl(record).href;
    link.setAttribute("aria-label", `${record.title}, ${record.status}`);

    const heading = element("span", "card-header");
    heading.append(element("strong", "", record.title), statusChip(record.status));
    link.append(heading);

    if (record.excerpt) {
      link.append(element("p", "card-excerpt", record.excerpt));
    }

    const tags = element("span", "card-tags");
    if (record.step) tags.append(metadataChip(`Step ${record.step}`));
    if (record.family) tags.append(metadataChip(titleCase(record.family)));
    if (record.role) tags.append(metadataChip(titleCase(record.role)));
    if (record.subject) tags.append(metadataChip(titleCase(record.subject)));
    if (tags.childElementCount > 0) link.append(tags);

    link.append(element("span", "card-open", "Read document →"));
    link.addEventListener("click", (event) => {
      if (!isPlainLinkActivation(event)) return;
      event.preventDefault();
      openDocument(record, { push: true });
    });
    item.append(link);
    return item;
  };

  const groupRecords = (view, records) => {
    if (view === "step") {
      return STEP_TITLES.map((title, index) => ({
        key: String(index + 1),
        title: `Step ${index + 1}: ${title}`,
        description:
          index + 1 === state.currentStep
            ? "Current work pointer"
            : "Snowflake method step",
        records: records.filter((record) => record.step === index + 1),
      }));
    }

    const grouped = new Map();
    for (const record of records) {
      const rawKey =
        view === "subject"
          ? record.subject || "General"
          : record.family || record.role || "General";
      const key = rawKey.toLocaleLowerCase();
      const existing = grouped.get(key) ?? {
        key,
        title: titleCase(rawKey),
        description:
          view === "subject"
            ? "Subject collection"
            : `${titleCase(view)} planning family`,
        records: [],
      };
      existing.records.push(record);
      grouped.set(key, existing);
    }
    return [...grouped.values()].sort((left, right) =>
      collator.compare(left.title, right.title),
    );
  };

  const preferredViewForRecord = (record) => {
    if (record.step !== null) return "step";
    if (record.subject) return "subject";
    if (record.domain === "science") return "science";
    return "story";
  };

  const groupKeyForRecord = (view, record) => {
    if (view === "step") return record.step;
    if (view === "subject") {
      return (record.subject || "General").toLocaleLowerCase();
    }
    return (record.family || record.role || "General").toLocaleLowerCase();
  };

  const branchGroup = (row) => {
    const controls = row.getAttribute("aria-controls");
    return controls ? document.getElementById(controls) : null;
  };

  const setBranchExpanded = (row, expanded, { remember = true } = {}) => {
    if (!row?.hasAttribute("aria-expanded")) return;
    const group = branchGroup(row);
    if (!group) return;
    row.setAttribute("aria-expanded", String(expanded));
    group.hidden = !expanded;
    if (remember) {
      if (expanded) state.expandedTreeIds.add(row.id);
      else state.expandedTreeIds.delete(row.id);
    }
  };

  const createTreeBranch = ({
    id,
    label,
    detail,
    symbol,
    level,
    view,
    group = null,
    expanded = false,
  }) => {
    const node = element("div", "tree-node");
    node.setAttribute("role", "none");

    const row = element("button", "tree-row");
    row.type = "button";
    row.id = id;
    row.setAttribute("role", "treeitem");
    row.setAttribute("aria-level", String(level));
    row.setAttribute("aria-expanded", String(expanded));
    row.setAttribute("aria-controls", `${id}-children`);
    row.tabIndex = -1;
    if (group === null) row.dataset.view = view;
    else {
      row.dataset.treeView = view;
      row.dataset.treeGroup = String(group);
    }

    const chevron = element("span", "tree-chevron", "›");
    chevron.setAttribute("aria-hidden", "true");
    const marker = element("span", "tree-symbol", symbol);
    marker.setAttribute("aria-hidden", "true");
    const copy = element("span", "tree-copy");
    copy.append(element("strong", "", label), element("small", "", detail));
    row.append(chevron, marker, copy);

    const children = element("div", "tree-group");
    children.id = `${id}-children`;
    children.setAttribute("role", "group");
    children.hidden = !expanded;
    node.append(row, children);
    return { node, row, children };
  };

  const createTreeDocument = (record, view, group, level, itemIndex) => {
    const link = element("a", "tree-row tree-document");
    link.id =
      `tree-document-${treeIdPart(view)}-${treeIdPart(group)}-` +
      `${String(itemIndex + 1)}-${treeIdPart(record.id)}`;
    link.setAttribute("role", "treeitem");
    link.setAttribute("aria-level", String(level));
    link.tabIndex = -1;
    link.dataset.recordId = record.id;
    link.dataset.treeView = view;
    link.dataset.treeGroup = String(group);
    link.href = makeDocumentUrl(record, "", view, group).href;

    const spacer = element("span", "tree-spacer");
    spacer.setAttribute("aria-hidden", "true");
    const status = element("span", "tree-status");
    status.dataset.status = record.status;
    status.setAttribute("aria-hidden", "true");
    const copy = element("span", "tree-copy");
    copy.append(
      element("strong", "", record.title),
      element(
        "small",
        "",
        `${titleCase(record.status)}${record.step ? ` · Step ${record.step}` : ""}`,
      ),
    );
    link.append(spacer, status, copy);
    return link;
  };

  const buildNavigationTree = () => {
    treeBranches.replaceChildren();

    for (const view of Object.keys(VIEW_TREE)) {
      const records = recordsForView(view);
      const viewId = `tree-view-${view}`;
      const viewBranch = createTreeBranch({
        id: viewId,
        label: VIEW_TREE[view].label,
        detail: pluralize(records.length, "document"),
        symbol: VIEW_TREE[view].symbol,
        level: 1,
        view,
        expanded: state.expandedTreeIds.has(viewId),
      });

      const groups = groupRecords(view, records);
      for (const [groupIndex, group] of groups.entries()) {
        const groupId =
          `${viewId}-${String(groupIndex + 1)}-${treeIdPart(group.key)}`;
        const groupBranch = createTreeBranch({
          id: groupId,
          label: group.title,
          detail: pluralize(group.records.length, "document"),
          symbol:
            view === "step"
              ? String(group.key).padStart(2, "0")
              : String(group.records.length),
          level: 2,
          view,
          group: group.key,
          expanded:
            state.expandedTreeIds.has(groupId) ||
            (view === "step" && Number(group.key) === state.currentStep),
        });

        if (view === "step" && Number(group.key) === state.currentStep) {
          state.expandedTreeIds.add(groupId);
        }
        for (const [recordIndex, record] of group.records.entries()) {
          groupBranch.children.append(
            createTreeDocument(record, view, group.key, 3, recordIndex),
          );
        }
        viewBranch.children.append(groupBranch.node);
      }

      treeBranches.append(viewBranch.node);
    }
    syncNavigation();
  };

  const revealActiveTreePath = () => {
    let item = null;
    if (state.activeDocumentId) {
      item = [...viewNavigation.querySelectorAll("[data-record-id]")].find(
        (candidate) =>
          candidate.dataset.recordId === state.activeDocumentId &&
          candidate.dataset.treeView === state.activeView,
      );
    }
    if (!item && state.activeGroup !== null) {
      item = [...viewNavigation.querySelectorAll("[data-tree-group]")].find(
        (candidate) =>
          candidate.dataset.treeView === state.activeView &&
          candidate.dataset.treeGroup === String(state.activeGroup),
      );
    }
    if (!item) {
      item = viewNavigation.querySelector(
        state.activeView === "overview"
          ? "#tree-item-overview"
          : `#tree-view-${state.activeView}`,
      );
    }

    let group = item?.closest('[role="group"]');
    while (group && viewNavigation.contains(group)) {
      const node = group.parentElement;
      const parentRow = node?.querySelector(":scope > [role='treeitem']");
      if (parentRow) setBranchExpanded(parentRow, true);
      group = node?.parentElement?.closest('[role="group"]') ?? null;
    }
    return item;
  };

  const syncMobileTree = () => {
    const expanded = !mobileLayout.matches || state.mobileTreeOpen;
    treeToggle.setAttribute("aria-expanded", String(expanded));
    viewNavigation.dataset.mobileOpen = String(expanded);
  };

  const renderView = (view) => {
    const copy = VIEW_COPY[view];
    const records = recordsForView(view);
    locationLabel.textContent = copy.title;
    content.replaceChildren();

    const header = element("header", "view-header");
    const headerCopy = element("div");
    headerCopy.append(
      element("p", "section-kicker", copy.eyebrow),
      element("h2", "", copy.title),
      element("p", "", copy.description),
    );
    header.append(
      headerCopy,
      element("span", "view-summary", pluralize(records.length, "document")),
    );
    content.append(header);

    const groups = groupRecords(view, records);
    if (groups.length === 0) {
      const empty = element("div", "empty-state");
      empty.append(
        element("strong", "", "No public documents in this view"),
        element(
          "p",
          "",
          "The catalog does not currently project any accepted or provisional documents here.",
        ),
      );
      content.append(empty);
      return;
    }

    const stack = element("div", "group-stack");
    for (const group of groups) {
      const section = element("section", "document-group");
      section.dataset.view = view;
      section.dataset.viewGroup = group.key;
      section.id = groupHash(view, group.key);

      const heading = element("div", "group-heading");
      if (view === "step" && Number(group.key) === state.currentStep) {
        heading.classList.add("is-current");
      }
      const copyBlock = element("div");
      copyBlock.append(
        element("h3", "", group.title),
        element("p", "", group.description),
      );
      heading.append(
        copyBlock,
        element("span", "step-count", pluralize(group.records.length, "document")),
      );
      section.append(heading);

      if (group.records.length === 0) {
        const empty = element("div", "empty-documents");
        empty.append(
          element("strong", "", "No public documents cataloged"),
          element(
            "p",
            "",
            "This method step exists without precreating a deliverable or implying completion.",
          ),
        );
        section.append(empty);
      } else {
        const list = element("ul", "document-grid");
        for (const record of group.records) list.append(documentCard(record));
        section.append(list);
      }
      stack.append(section);
    }
    content.append(stack);
  };

  const searchableText = (record) =>
    [
      record.title,
      record.excerpt,
      record.status,
      record.step ? `step ${record.step} ${stepTitle(record.step)}` : "",
      record.domain,
      record.role,
      record.family,
      record.subject,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

  const renderSearch = () => {
    const query = state.query.trim();
    const normalizedQuery = query.toLocaleLowerCase();
    const matches = state.records
      .filter((record) => searchableText(record).includes(normalizedQuery))
      .sort(recordSort);

    locationLabel.textContent = `Search · ${pluralize(matches.length, "result")}`;
    content.replaceChildren();

    const header = element("header", "view-header");
    const headerCopy = element("div");
    headerCopy.append(
      element("p", "section-kicker", "Catalog search"),
      element("h2", "", `Results for “${query}”`),
      element(
        "p",
        "",
        "Search covers titles, excerpts, steps, subjects, domains, roles, and families.",
      ),
    );
    header.append(headerCopy);
    content.append(header);

    if (matches.length === 0) {
      const empty = element("div", "empty-state");
      empty.append(
        element("strong", "", "No matching public documents"),
        element("p", "", "Try a shorter title, a step number, or a subject."),
      );
      content.append(empty);
      return;
    }

    const list = element("ul", "document-grid search-results");
    for (const record of matches) list.append(documentCard(record));
    content.append(list);
  };

  const renderActive = () => {
    content.setAttribute("aria-busy", "false");
    if (state.query.trim()) {
      renderSearch();
    } else if (state.activeView === "overview") {
      renderOverview();
    } else {
      renderView(state.activeView);
    }
    scrollToActiveGroup();
  };

  const setView = (
    view,
    { group = null, updateUrl = false, focus = true } = {},
  ) => {
    state.requestToken += 1;
    state.activeDocumentId = null;
    state.activeView = ALLOWED_VIEWS.has(view) ? view : "overview";
    state.activeGroup =
      group === null || group === undefined || group === ""
        ? null
        : state.activeView === "step"
          ? Number(group) || null
          : String(group);
    state.query = "";
    search.value = "";
    revealActiveTreePath();
    syncNavigation();
    renderActive();
    if (updateUrl) updateViewUrl();
    if (focus) focusContent();
  };

  const blockedElements = new Set([
    "script",
    "style",
    "template",
    "noscript",
    "iframe",
    "object",
    "embed",
    "svg",
    "math",
    "form",
    "input",
    "button",
    "textarea",
    "select",
    "option",
    "link",
    "meta",
    "base",
  ]);

  const allowedElements = new Set([
    "p",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "em",
    "strong",
    "del",
    "s",
    "a",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "caption",
    "dl",
    "dt",
    "dd",
    "sup",
    "sub",
    "details",
    "summary",
  ]);

  const copySafeAttributes = (source, target, tag) => {
    const id = source.getAttribute("id");
    if (id && /^[A-Za-z][A-Za-z0-9_.:-]*$/.test(id)) {
      target.id = id;
    }
    const title = source.getAttribute("title");
    if (title) target.title = title;

    if (tag === "a") {
      const href = safePublicLink(source.getAttribute("href"));
      if (href) {
        target.setAttribute("href", href);
        if (!href.startsWith("#")) {
          const targetUrl = new URL(href, pageUrl);
          if (targetUrl.origin !== window.location.origin) {
            target.setAttribute("rel", "external noreferrer");
          }
        }
      }
    }
    if (tag === "ol") {
      const start = source.getAttribute("start");
      if (/^-?\d+$/.test(start ?? "")) target.setAttribute("start", start);
      if (source.hasAttribute("reversed")) target.setAttribute("reversed", "");
    }
    if (tag === "th" || tag === "td") {
      const colspan = source.getAttribute("colspan");
      const rowspan = source.getAttribute("rowspan");
      if (/^[1-9]\d?$/.test(colspan ?? "")) target.setAttribute("colspan", colspan);
      if (/^[1-9]\d?$/.test(rowspan ?? "")) target.setAttribute("rowspan", rowspan);
    }
    if (tag === "th") {
      const scope = source.getAttribute("scope");
      if (["row", "col", "rowgroup", "colgroup"].includes(scope)) {
        target.setAttribute("scope", scope);
      }
    }
    if (tag === "details" && source.hasAttribute("open")) {
      target.setAttribute("open", "");
    }
  };

  const sanitizeHtml = (source) => {
    const parsed = new DOMParser().parseFromString(
      typeof source === "string" ? source : "",
      "text/html",
    );
    const fragment = document.createDocumentFragment();

    const appendNode = (sourceNode, targetParent) => {
      if (sourceNode.nodeType === Node.TEXT_NODE) {
        targetParent.append(document.createTextNode(sourceNode.textContent ?? ""));
        return;
      }
      if (sourceNode.nodeType !== Node.ELEMENT_NODE) return;

      const sourceElement = sourceNode;
      const sourceTag = sourceElement.localName.toLocaleLowerCase();
      if (blockedElements.has(sourceTag)) return;
      if (!allowedElements.has(sourceTag)) {
        for (const child of sourceElement.childNodes) appendNode(child, targetParent);
        return;
      }

      const targetTag = sourceTag === "h1" ? "h2" : sourceTag;
      const target = document.createElement(targetTag);
      copySafeAttributes(sourceElement, target, sourceTag);
      for (const child of sourceElement.childNodes) appendNode(child, target);
      targetParent.append(target);
    };

    for (const child of parsed.body.childNodes) appendNode(child, fragment);
    return fragment;
  };

  const sourceLinkDetails = (entry) => {
    if (typeof entry === "string") {
      const relatedRecord = state.recordsById.get(entry);
      if (relatedRecord) {
        const url = new URL(pageUrl);
        url.searchParams.set("document", relatedRecord.id);
        return { label: relatedRecord.title, href: url.href };
      }
      const href = safePublicLink(entry);
      return href ? { label: "Related document", href } : null;
    }
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const href = safePublicLink(entry.url ?? entry.href);
    const label = normalizedText(entry.title ?? entry.label);
    return href && label ? { label, href } : null;
  };

  const renderSourceLinks = (entries) => {
    if (!Array.isArray(entries)) return null;
    const links = entries.map(sourceLinkDetails).filter(Boolean);
    if (links.length === 0) return null;

    const section = element("section", "source-links");
    section.append(element("h3", "", "Related public documents"));
    const list = element("ul");
    for (const link of links) {
      const item = element("li");
      const anchor = element("a", "", link.label);
      anchor.href = link.href;
      const url = new URL(link.href, pageUrl);
      if (url.origin !== window.location.origin) {
        anchor.rel = "external noreferrer";
      }
      item.append(anchor);
      list.append(item);
    }
    section.append(list);
    return section;
  };

  const loadFragment = (record) => {
    if (state.fragmentCache.has(record.id)) {
      return state.fragmentCache.get(record.id);
    }

    const request = fetch(record.url, {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((fragment) => {
        if (
          !fragment ||
          typeof fragment !== "object" ||
          fragment.id !== record.id ||
          typeof fragment.html !== "string"
        ) {
          throw new Error("Invalid document fragment");
        }
        return fragment;
      })
      .catch((error) => {
        state.fragmentCache.delete(record.id);
        throw error;
      });

    state.fragmentCache.set(record.id, request);
    return request;
  };

  const makeDocumentUrl = (
    record,
    heading = "",
    view = state.activeView,
    group = state.activeGroup,
  ) => {
    const url = makeViewUrl(view, group);
    url.searchParams.set("document", record.id);
    url.hash = heading ? `#${heading.replace(/^#/, "")}` : "";
    return url;
  };

  const restoreDocumentFocus = () => {
    const id = state.restoreFocusId;
    if (!id) return false;
    const target = [...content.querySelectorAll("[data-record-id]")].find(
      (node) => node.dataset.recordId === id,
    );
    target?.focus({ preventScroll: true });
    state.restoreFocusId = null;
    return Boolean(target);
  };

  const closeDocument = ({ updateUrl = true, focus = true } = {}) => {
    state.requestToken += 1;
    state.activeDocumentId = null;
    revealActiveTreePath();
    syncNavigation();
    renderActive();
    if (updateUrl) updateViewUrl({ replace: true });
    if (focus) {
      window.requestAnimationFrame(() => {
        if (!restoreDocumentFocus()) focusContent();
      });
    }
  };

  const renderDocumentError = (viewer, record) => {
    const error = element("div", "error-state");
    error.append(
      element("strong", "", "This document could not be loaded"),
      element(
        "p",
        "",
        "The public fragment is unavailable or did not match the catalog.",
      ),
    );
    const retry = element("button", "retry-button", "Try again");
    retry.type = "button";
    retry.addEventListener("click", () =>
      openDocument(record, { push: false, force: true }),
    );
    error.append(retry);
    viewer.append(error);
  };

  const scrollToHeading = (heading) => {
    if (!heading) return;
    let decoded;
    try {
      decoded = decodeURIComponent(heading.replace(/^#/, ""));
    } catch {
      return;
    }
    const target = [...content.querySelectorAll("[id]")].find(
      (node) => node.id === decoded,
    );
    target?.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const openDocument = async (
    record,
    { push = false, heading = "", force = false } = {},
  ) => {
    const token = ++state.requestToken;
    if (force) state.fragmentCache.delete(record.id);
    if (document.activeElement?.dataset?.recordId) {
      state.restoreFocusId = document.activeElement.dataset.recordId;
    }
    state.activeDocumentId = record.id;
    revealActiveTreePath();
    syncNavigation();
    locationLabel.textContent = `Document · ${record.title}`;
    content.setAttribute("aria-busy", "true");
    content.replaceChildren();

    const viewer = element("article", "document-viewer");
    const topbar = element("div", "viewer-topbar");
    const back = element("button", "viewer-back", "← Back to library");
    back.type = "button";
    back.addEventListener("click", () => closeDocument({ updateUrl: true }));
    topbar.append(back, statusChip(record.status));

    const header = element("header");
    header.append(
      element("p", "section-kicker", "Snowflake planning document"),
      element("h2", "", record.title),
    );
    const metadata = element("div", "viewer-meta");
    if (record.step) metadata.append(metadataChip(`Step ${record.step}`));
    if (record.domain) metadata.append(metadataChip(titleCase(record.domain)));
    if (record.family) metadata.append(metadataChip(titleCase(record.family)));
    if (record.subject) {
      metadata.append(metadataChip(titleCase(record.subject)));
    }
    if (metadata.childElementCount > 0) header.append(metadata);

    const loading = element("div", "loading-state document-loading");
    loading.append(
      element("span", "loading-flake", "✣"),
      element("p", "", "Loading document…"),
    );
    viewer.append(topbar, header, loading);
    content.append(viewer);
    if (push) {
      history.pushState(
        {
          document: record.id,
          view: state.activeView,
          group: state.activeGroup,
        },
        "",
        makeDocumentUrl(record, heading),
      );
    }
    focusContent();

    try {
      const fragment = await loadFragment(record);
      if (token !== state.requestToken || state.activeDocumentId !== record.id) return;
      loading.remove();
      const body = element("div", "document-body");
      body.append(sanitizeHtml(fragment.html));
      viewer.append(body);
      const sourceLinks = renderSourceLinks(fragment.sourceLinks);
      if (sourceLinks) viewer.append(sourceLinks);
      content.setAttribute("aria-busy", "false");
      scrollToHeading(heading || window.location.hash);
    } catch {
      if (token !== state.requestToken || state.activeDocumentId !== record.id) return;
      loading.remove();
      renderDocumentError(viewer, record);
      content.setAttribute("aria-busy", "false");
    }
  };

  const normalizedPagePath = (pathname) =>
    pathname.replace(/index\.html$/i, "").replace(/\/+$/, "/");

  const routeFromLocation = ({ focus = false } = {}) => {
    const url = new URL(window.location.href);
    const requestedView = url.searchParams.get("view");
    state.activeView = ALLOWED_VIEWS.has(requestedView)
      ? requestedView
      : "overview";
    state.query = "";
    search.value = "";

    const documentId = url.searchParams.get("document");
    const record = documentId ? state.recordsById.get(documentId) : null;
    if (record) {
      if (
        state.activeView === "overview" ||
        !recordInView(record, state.activeView)
      ) {
        state.activeView = preferredViewForRecord(record);
      }
      state.activeGroup = groupKeyForRecord(state.activeView, record);
      revealActiveTreePath();
      syncNavigation();
      openDocument(record, { push: false, heading: url.hash });
      return;
    }

    state.activeGroup = groupFromHash(state.activeView, url.hash);
    if (documentId) {
      history.replaceState({ view: state.activeView }, "", makeViewUrl());
    }

    state.activeDocumentId = null;
    revealActiveTreePath();
    syncNavigation();
    renderActive();
    if (focus) focusContent();
  };

  const setReadyState = () => {
    const reviewRequired = state.catalogState === "review-required";
    dataState.textContent = reviewRequired ? "Review required" : "Catalog ready";
    dataState.classList.remove("is-error", "is-ready", "is-review");
    dataState.classList.add(reviewRequired ? "is-review" : "is-ready");
    if (reviewRequired) {
      heroStatus.textContent = "Initial import awaiting review";
      heroDetail.textContent =
        state.records.length === 0
          ? "No planning documents published yet"
          : pluralize(state.records.length, "review-pending document");
      currentStepLabel.textContent = state.currentStep
        ? `Step ${state.currentStep} · ${stepTitle(state.currentStep)}`
        : "Awaiting import review";
      currentStepNote.textContent =
        "The source work pointer is not a completion claim.";
      return;
    }
    heroStatus.textContent = state.currentStep
      ? `Step ${state.currentStep}: ${stepTitle(state.currentStep)}`
      : "No current step published";
    heroDetail.textContent = pluralize(state.records.length, "public document");
    currentStepLabel.textContent = state.currentStep
      ? `Step ${state.currentStep} · ${stepTitle(state.currentStep)}`
      : "Not published";
    currentStepNote.textContent = state.currentStep
      ? "A current step is a work pointer, not a completion claim."
      : "The library will not infer one from document acceptance.";
  };

  const renderCatalogError = () => {
    dataState.textContent = "Load failed";
    dataState.classList.remove("is-ready", "is-review");
    dataState.classList.add("is-error");
    heroStatus.textContent = "Library unavailable";
    heroDetail.textContent = "The public catalog could not be read.";
    currentStepLabel.textContent = "Unavailable";
    currentStepNote.textContent = "Try reloading the public catalog.";
    content.setAttribute("aria-busy", "false");
    content.replaceChildren();
    const error = element("div", "error-state");
    error.append(
      element("strong", "", "The Snowflake library could not load"),
      element(
        "p",
        "",
        "The generated public catalog is missing, invalid, or temporarily unavailable.",
      ),
    );
    const retry = element("button", "retry-button", "Try again");
    retry.type = "button";
    retry.addEventListener("click", initialize);
    error.append(retry);
    content.append(error);
  };

  async function initialize() {
    content.setAttribute("aria-busy", "true");
    dataState.textContent = "Loading";
    dataState.classList.remove("is-ready", "is-error");

    try {
      const response = await fetch(indexUrl, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const catalog = await response.json();
      const records = extractRecords(catalog).sort(recordSort);
      state.records = records;
      state.recordsById = new Map(records.map((record) => [record.id, record]));
      state.currentStep = extractCurrentStep(catalog);
      state.catalogState = extractCatalogState(catalog);
      buildNavigationTree();
      setReadyState();
      routeFromLocation();
    } catch {
      renderCatalogError();
    }
  }

  viewNavigation.addEventListener("click", (event) => {
    const item = event.target.closest('[role="treeitem"]');
    if (!item || !viewNavigation.contains(item)) return;

    const record = item.dataset.recordId
      ? state.recordsById.get(item.dataset.recordId)
      : null;
    if (record) {
      if (item instanceof HTMLAnchorElement && !isPlainLinkActivation(event)) {
        return;
      }
      event.preventDefault();
      state.activeView = item.dataset.treeView || preferredViewForRecord(record);
      state.activeGroup =
        item.dataset.treeGroup || groupKeyForRecord(state.activeView, record);
      state.query = "";
      search.value = "";
      state.mobileTreeOpen = false;
      syncMobileTree();
      openDocument(record, { push: true });
      return;
    }

    event.preventDefault();
    if (item.hasAttribute("aria-expanded")) {
      setBranchExpanded(item, item.getAttribute("aria-expanded") !== "true");
    }
    const view = item.dataset.view ?? item.dataset.treeView ?? "overview";
    const group = item.dataset.treeGroup ?? null;
    setView(view, { group, updateUrl: true, focus: false });
  });

  const visibleTreeItems = () =>
    [...viewNavigation.querySelectorAll('[role="treeitem"]')].filter(
      (item) => !item.closest("[hidden]"),
    );

  const focusTreeItem = (item) => {
    if (!item) return;
    for (const candidate of viewNavigation.querySelectorAll('[role="treeitem"]')) {
      candidate.tabIndex = candidate === item ? 0 : -1;
    }
    item.focus();
  };

  viewNavigation.addEventListener("keydown", (event) => {
    if (
      ![
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(event.key)
    ) {
      return;
    }
    const current = event.target.closest('[role="treeitem"]');
    if (!current || !viewNavigation.contains(current)) return;
    const items = visibleTreeItems();
    const currentIndex = items.indexOf(current);
    if (currentIndex < 0) return;
    event.preventDefault();

    if (event.key === "Home") {
      focusTreeItem(items[0]);
      return;
    }
    if (event.key === "End") {
      focusTreeItem(items.at(-1));
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const offset = event.key === "ArrowUp" ? -1 : 1;
      const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + offset));
      focusTreeItem(items[nextIndex]);
      return;
    }
    if (event.key === "ArrowRight") {
      if (
        current.hasAttribute("aria-expanded") &&
        current.getAttribute("aria-expanded") !== "true"
      ) {
        setBranchExpanded(current, true);
        return;
      }
      const child = branchGroup(current)?.querySelector('[role="treeitem"]');
      if (child) focusTreeItem(child);
      return;
    }
    if (
      current.hasAttribute("aria-expanded") &&
      current.getAttribute("aria-expanded") === "true"
    ) {
      setBranchExpanded(current, false);
      return;
    }
    const parentGroup = current.parentElement?.closest('[role="group"]');
    const parent = parentGroup?.parentElement?.querySelector(
      ":scope > [role='treeitem']",
    );
    if (parent) focusTreeItem(parent);
  });

  treeToggle.addEventListener("click", () => {
    state.mobileTreeOpen = !state.mobileTreeOpen;
    syncMobileTree();
    if (state.mobileTreeOpen) {
      window.requestAnimationFrame(() => {
        const active =
          viewNavigation.querySelector('[aria-current="page"]') ??
          viewNavigation.querySelector('[role="treeitem"]');
        active?.focus({ preventScroll: true });
      });
    }
  });

  mobileLayout.addEventListener("change", syncMobileTree);
  syncMobileTree();

  search.addEventListener("input", () => {
    const wasDocumentOpen = Boolean(state.activeDocumentId);
    state.query = search.value;
    state.requestToken += 1;
    state.activeDocumentId = null;
    syncNavigation();
    renderActive();
    if (wasDocumentOpen) {
      history.replaceState({ view: state.activeView }, "", makeViewUrl());
    }
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;

    if (event.key === "/" && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      search.focus();
      return;
    }

    if (event.key !== "Escape") return;
    if (state.activeDocumentId) {
      event.preventDefault();
      closeDocument({ updateUrl: true });
    } else if (state.query) {
      event.preventDefault();
      state.query = "";
      search.value = "";
      renderActive();
      search.focus();
    }
  });

  content.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor || !content.contains(anchor)) return;
    if (!isPlainLinkActivation(event)) return;
    const targetUrl = new URL(anchor.href, pageUrl);
    const documentId = targetUrl.searchParams.get("document");
    if (
      targetUrl.origin !== window.location.origin ||
      normalizedPagePath(targetUrl.pathname) !==
        normalizedPagePath(window.location.pathname) ||
      !documentId
    ) {
      return;
    }
    const record = state.recordsById.get(documentId);
    if (!record) return;
    event.preventDefault();
    openDocument(record, { push: true, heading: targetUrl.hash });
  });

  window.addEventListener("popstate", () => routeFromLocation({ focus: true }));

  initialize();
})();
