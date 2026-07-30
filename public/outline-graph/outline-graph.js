(() => {
  "use strict";

  const d3 = window.d3;
  const graphFrame = document.querySelector("#graph-frame");
  const svg = d3.select("#outline-graph");
  const loading = document.querySelector("#graph-loading");
  const dataState = document.querySelector("#data-state");
  const graphStatus = document.querySelector("#graph-status");
  const typeFilterRoot = document.querySelector("#type-filters");
  const nodeList = document.querySelector("#node-list");
  const visibleNodeCount = document.querySelector("#visible-node-count");
  const detailPanel = document.querySelector("#detail-panel");
  const searchInput = document.querySelector("#node-search");
  const structureToggle = document.querySelector("#show-structure");
  const structureToggleStatus = document.querySelector(
    "#structure-toggle-status",
  );
  const fitButton = document.querySelector("#fit-graph");
  const resetButton = document.querySelector("#reset-layout");

  const themeColor = (property, fallback) =>
    getComputedStyle(document.documentElement).getPropertyValue(property).trim() ||
    fallback;

  const TYPE_CONFIG = {
    premise: {
      label: "Premise",
      color: themeColor("--premise", "#f4f0e8"),
      x: 0.5,
      y: 0.12,
    },
    arc: {
      label: "Arc",
      color: themeColor("--arc", "#ff7a1a"),
      x: 0.17,
      y: 0.43,
    },
    character: {
      label: "Character",
      color: themeColor("--character", "#5dc5b4"),
      x: 0.48,
      y: 0.48,
    },
    concept: {
      label: "Concept",
      color: themeColor("--concept", "#65a7ff"),
      x: 0.81,
      y: 0.4,
    },
    theme: {
      label: "Theme",
      color: themeColor("--theme", "#b68cff"),
      x: 0.67,
      y: 0.81,
    },
    motif: {
      label: "Motif",
      color: themeColor("--motif", "#e6bf55"),
      x: 0.32,
      y: 0.81,
    },
  };

  const DEFAULT_TYPE = {
    label: "Other",
    color: themeColor("--unknown", "#a89f93"),
    x: 0.5,
    y: 0.5,
  };

  const LAYOUT = Object.freeze({
    relationshipDistance: 134,
    structureDistance: 160,
    chargeStrength: -295,
    chargeDistanceMax: 375,
    collisionPadding: 30,
    collisionIterations: 3,
  });

  const state = {
    nodes: [],
    relationshipLinks: [],
    structureLinks: [],
    selectedId: null,
    query: "",
    activeTypes: new Set(),
    width: 900,
    height: 640,
    simulation: null,
    nodeSelection: null,
    relationSelection: null,
    structureSelection: null,
    viewport: null,
    zoom: null,
    clusterUpdater: null,
    hasFit: false,
    unresolvedRelationships: [],
  };

  const typeFor = (type) => TYPE_CONFIG[type] ?? DEFAULT_TYPE;

  const humanizeRelation = (value) =>
    value
      .split("-")
      .filter(Boolean)
      .join(" ");

  const compactTitle = (title, limit = 25) =>
    title.length > limit ? `${title.slice(0, limit - 1).trim()}…` : title;

  const hash = (value) => {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  };

  const nodeRadius = (node) => {
    if (node.type === "premise") return node.id === "premise:main" ? 15 : 11;
    if (node.type === "arc") return 12;
    if (node.type === "character") return 11;
    return 9;
  };

  const flattenOutline = (roots) => {
    const nodes = [];
    const visit = (node, parentId = null) => {
      const copy = {
        ...node,
        parentId,
        children: undefined,
        relationships: Array.isArray(node.relationships) ? node.relationships : [],
      };
      nodes.push(copy);
      for (const child of node.children ?? []) {
        visit(child, node.id);
      }
    };
    for (const root of roots ?? []) visit(root);
    return nodes;
  };

  const buildModel = (site) => {
    const nodes = flattenOutline(site.outline);
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const nodesByTitle = new Map();

    for (const node of nodes) {
      const matches = nodesByTitle.get(node.title) ?? [];
      matches.push(node);
      nodesByTitle.set(node.title, matches);
    }

    const characterHrefs = new Map(
      (site.characters ?? []).map((character) => [character.id, character.href]),
    );

    for (const node of nodes) {
      node.href = characterHrefs.get(node.id) ?? null;
      node.searchText = `${node.title} ${node.id} ${node.type} ${node.summary ?? ""}`.toLowerCase();
      node.degree = 0;
    }

    const relationshipLinks = [];
    const unresolvedRelationships = [];

    for (const source of nodes) {
      for (const relationship of source.relationships) {
        const targets = nodesByTitle.get(relationship.targetTitle) ?? [];
        if (targets.length !== 1) {
          unresolvedRelationships.push({
            source: source.id,
            relationship,
            matches: targets.length,
          });
          continue;
        }
        const target = targets[0];
        source.degree += 1;
        target.degree += 1;
        relationshipLinks.push({
          id: `${source.id}|${relationship.type}|${target.id}`,
          source: source.id,
          target: target.id,
          type: relationship.type,
          kind: "relationship",
          curve: ((hash(`${source.id}:${target.id}`) % 5) - 2) * 7,
        });
      }
    }

    const structureLinks = nodes
      .filter((node) => node.parentId && nodesById.has(node.parentId))
      .map((node) => ({
        id: `${node.parentId}|parent|${node.id}`,
        source: node.parentId,
        target: node.id,
        type: "contains",
        kind: "structure",
        curve: 0,
      }));

    return {
      nodes,
      relationshipLinks,
      structureLinks,
      unresolvedRelationships,
    };
  };

  const isVisible = (node) => {
    if (!state.activeTypes.has(node.type)) return false;
    if (!state.query) return true;
    return node.searchText.includes(state.query);
  };

  const idOf = (endpoint) =>
    typeof endpoint === "object" && endpoint !== null ? endpoint.id : endpoint;

  const visibleNodeIds = () =>
    new Set(state.nodes.filter(isVisible).map((node) => node.id));

  const visibleRelationshipLinks = () => {
    const ids = visibleNodeIds();
    return state.relationshipLinks.filter(
      (link) => ids.has(idOf(link.source)) && ids.has(idOf(link.target)),
    );
  };

  const visibleStructureLinks = () => {
    const ids = visibleNodeIds();
    return state.structureLinks.filter(
      (link) => ids.has(idOf(link.source)) && ids.has(idOf(link.target)),
    );
  };

  const horizontalAnchorStrength = (node) =>
    node.type === "arc" ? 0.29 : 0.16;

  const verticalAnchorStrength = (node) =>
    node.type === "arc" ? 0.35 : 0.17;

  const anchorFor = (node) => {
    const config = typeFor(node.type);
    const paddingX = Math.min(90, state.width * 0.1);
    const usableWidth = Math.max(240, state.width - paddingX * 2);
    const usableHeight = Math.max(320, state.height - 90);

    if (node.type === "arc") {
      const arcs = state.nodes
        .filter((candidate) => candidate.type === "arc")
        .sort((a, b) => a.order - b.order);
      const index = Math.max(0, arcs.findIndex((candidate) => candidate.id === node.id));
      const progress = arcs.length <= 1 ? 0.5 : index / (arcs.length - 1);
      return {
        x: paddingX + usableWidth * config.x,
        y: 125 + progress * Math.min(usableHeight * 0.66, state.height - 220),
      };
    }

    if (node.id === "premise:main") {
      return { x: state.width * 0.5, y: 66 };
    }

    if (node.id === "premise:synopsis") {
      return { x: state.width * 0.5, y: 145 };
    }

    return {
      x: paddingX + usableWidth * config.x,
      y: 45 + usableHeight * config.y,
    };
  };

  const fallbackClusterExtent = (node) => {
    const radius = nodeRadius(node) + 8;
    const labelWidth = compactTitle(node.title).length * 6.6;
    return {
      x: -radius,
      y: -radius,
      width: radius + nodeRadius(node) + 8 + labelWidth,
      height: radius * 2,
    };
  };

  const clusterBounds = (type) => {
    const nodes = state.nodes.filter(
      (node) =>
        node.type === type &&
        isVisible(node) &&
        Number.isFinite(node.x) &&
        Number.isFinite(node.y),
    );
    if (nodes.length === 0) return null;

    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const node of nodes) {
      const extent = node.clusterExtent ?? fallbackClusterExtent(node);
      left = Math.min(left, node.x + extent.x);
      right = Math.max(right, node.x + extent.x + extent.width);
      top = Math.min(top, node.y + extent.y);
      bottom = Math.max(bottom, node.y + extent.y + extent.height);
    }

    const paddingX = 24;
    const paddingTop = 42;
    const paddingBottom = 24;
    let x = left - paddingX;
    let y = top - paddingTop;
    let width = right - left + paddingX * 2;
    let height = bottom - top + paddingTop + paddingBottom;
    const minimumWidth = 130;
    const minimumHeight = 86;
    if (width < minimumWidth) {
      x -= (minimumWidth - width) / 2;
      width = minimumWidth;
    }
    if (height < minimumHeight) {
      y -= (minimumHeight - height) / 2;
      height = minimumHeight;
    }
    return {
      x,
      y,
      width,
      height,
      labelX: x + 16,
      labelY: y + 21,
    };
  };

  const linkPath = (link) => {
    const source = link.source;
    const target = link.target;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.hypot(dx, dy) || 1;
    const offsetX = (-dy / distance) * link.curve;
    const offsetY = (dx / distance) * link.curve;
    const middleX = (source.x + target.x) / 2 + offsetX;
    const middleY = (source.y + target.y) / 2 + offsetY;
    return `M${source.x},${source.y} Q${middleX},${middleY} ${target.x},${target.y}`;
  };

  const renderTypeFilters = () => {
    const counts = d3.rollup(state.nodes, (values) => values.length, (node) => node.type);
    const types = [...counts.keys()].sort((left, right) => {
      const order = Object.keys(TYPE_CONFIG);
      return order.indexOf(left) - order.indexOf(right);
    });

    typeFilterRoot.replaceChildren();
    for (const type of types) {
      state.activeTypes.add(type);
      const config = typeFor(type);
      const label = document.createElement("label");
      label.className = "type-chip";
      label.style.setProperty("--type-color", config.color);

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = true;
      input.value = type;
      input.addEventListener("change", () => {
        if (input.checked) state.activeTypes.add(type);
        else state.activeTypes.delete(type);
        if (
          state.selectedId &&
          !isVisible(state.nodes.find((node) => node.id === state.selectedId))
        ) {
          selectNode(null);
        }
        applyVisibility();
      });

      const dot = document.createElement("span");
      dot.className = "type-dot";
      dot.setAttribute("aria-hidden", "true");

      const name = document.createElement("span");
      name.className = "type-chip-name";
      name.textContent = config.label;

      const count = document.createElement("span");
      count.className = "type-chip-count";
      count.textContent = String(counts.get(type));

      label.append(input, dot, name, count);
      typeFilterRoot.append(label);
    }
  };

  const renderNodeList = () => {
    const visible = state.nodes
      .filter(isVisible)
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));

    nodeList.replaceChildren();
    visibleNodeCount.textContent = `${visible.length}/${state.nodes.length}`;

    for (const node of visible) {
      const config = typeFor(node.type);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "node-list-button";
      button.dataset.nodeId = node.id;
      button.style.setProperty("--type-color", config.color);
      if (node.id === state.selectedId) button.classList.add("is-selected");

      const dot = document.createElement("span");
      dot.className = "node-list-dot";
      dot.setAttribute("aria-hidden", "true");

      const title = document.createElement("span");
      title.className = "node-list-title";
      title.textContent = node.title;

      const meta = document.createElement("span");
      meta.className = "node-list-meta";
      meta.textContent = `${config.label} · ${node.degree} relation${node.degree === 1 ? "" : "s"}`;

      button.append(dot, title, meta);
      button.addEventListener("click", () => selectNode(node.id, { center: true }));
      nodeList.append(button);
    }
  };

  const relationForNode = (nodeId) =>
    state.relationshipLinks
      .filter(
        (link) => idOf(link.source) === nodeId || idOf(link.target) === nodeId,
      )
      .map((link) => ({
        link,
        outgoing: idOf(link.source) === nodeId,
        other: state.nodes.find(
          (node) =>
            node.id ===
            (idOf(link.source) === nodeId ? idOf(link.target) : idOf(link.source)),
        ),
      }))
      .filter((entry) => entry.other)
      .sort((left, right) => left.other.order - right.other.order);

  const renderDetail = (node) => {
    detailPanel.replaceChildren();
    if (!node) {
      const empty = document.createElement("div");
      empty.className = "detail-empty";
      const kicker = document.createElement("p");
      kicker.className = "panel-kicker";
      kicker.textContent = "Selection";
      const heading = document.createElement("h2");
      heading.textContent = "Choose a node";
      const copy = document.createElement("p");
      copy.textContent =
        "Select a point in the graph or use the keyboard-friendly list. Connected nodes and relationship directions will appear here.";
      empty.append(kicker, heading, copy);
      detailPanel.append(empty);
      return;
    }

    const config = typeFor(node.type);
    const heading = document.createElement("div");
    heading.className = "detail-heading";
    const headingCopy = document.createElement("div");

    const type = document.createElement("div");
    type.className = "detail-type";
    type.style.setProperty("--type-color", config.color);
    const typeDot = document.createElement("span");
    typeDot.className = "detail-type-dot";
    typeDot.setAttribute("aria-hidden", "true");
    const typeName = document.createElement("span");
    typeName.textContent = config.label;
    type.append(typeDot, typeName);

    const title = document.createElement("h2");
    title.textContent = node.title;
    headingCopy.append(type, title);
    heading.append(headingCopy);

    const id = document.createElement("code");
    id.className = "detail-id";
    id.textContent = node.id;

    const summary = document.createElement("p");
    summary.className = "detail-summary";
    summary.textContent = node.summary || "No summary has been written yet.";

    detailPanel.append(heading, id, summary);

    const relations = relationForNode(node.id);
    const relationSection = document.createElement("section");
    relationSection.className = "detail-section";
    const relationHeading = document.createElement("h3");
    relationHeading.textContent = `Relationships · ${relations.length}`;
    const relationList = document.createElement("ul");
    relationList.className = "relation-list";

    for (const entry of relations) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "relation-button";

      const direction = document.createElement("span");
      direction.className = "relation-direction";
      direction.textContent = entry.outgoing ? "→" : "←";
      direction.setAttribute(
        "aria-label",
        entry.outgoing ? "Points to" : "Points from",
      );

      const relationTitle = document.createElement("span");
      relationTitle.className = "relation-title";
      relationTitle.textContent = entry.other.title;

      const relationType = document.createElement("span");
      relationType.className = "relation-type";
      relationType.textContent = entry.outgoing
        ? humanizeRelation(entry.link.type)
        : `${humanizeRelation(entry.link.type)} this node`;

      button.append(direction, relationTitle, relationType);
      button.addEventListener("click", () =>
        selectNode(entry.other.id, { center: true }),
      );
      item.append(button);
      relationList.append(item);
    }

    if (relations.length === 0) {
      const emptyRelation = document.createElement("li");
      emptyRelation.className = "relation-type";
      emptyRelation.textContent = "No semantic relationships yet.";
      relationList.append(emptyRelation);
    }

    relationSection.append(relationHeading, relationList);
    detailPanel.append(relationSection);

    if (node.href) {
      const link = document.createElement("a");
      link.className = "character-link";
      link.href = node.href;
      link.textContent = "Open character page";
      detailPanel.append(link);
    }
  };

  const updateSelectionStyles = () => {
    if (!state.nodeSelection) return;
    const selectedId = state.selectedId;
    const relatedIds = new Set([selectedId]);
    if (selectedId) {
      for (const link of state.relationshipLinks) {
        const sourceId = idOf(link.source);
        const targetId = idOf(link.target);
        if (sourceId === selectedId) relatedIds.add(targetId);
        if (targetId === selectedId) relatedIds.add(sourceId);
      }
    }

    state.nodeSelection
      .classed("is-selected", (node) => node.id === selectedId)
      .classed(
        "is-dimmed",
        (node) => Boolean(selectedId) && !relatedIds.has(node.id),
      );

    state.relationSelection
      .classed(
        "is-active",
        (link) =>
          Boolean(selectedId) &&
          (idOf(link.source) === selectedId || idOf(link.target) === selectedId),
      )
      .classed(
        "is-dimmed",
        (link) =>
          Boolean(selectedId) &&
          idOf(link.source) !== selectedId &&
          idOf(link.target) !== selectedId,
      );

    document.querySelectorAll(".node-list-button").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.nodeId === selectedId);
    });
  };

  const centerOnNode = (node) => {
    if (!node || !state.zoom) return;
    const scale = Math.max(1.15, d3.zoomTransform(svg.node()).k);
    const transform = d3.zoomIdentity
      .translate(state.width / 2, state.height / 2)
      .scale(scale)
      .translate(-node.x, -node.y);
    svg.transition().duration(420).call(state.zoom.transform, transform);
  };

  const selectNode = (nodeId, options = {}) => {
    state.selectedId = nodeId;
    const node = state.nodes.find((candidate) => candidate.id === nodeId) ?? null;
    renderDetail(node);
    renderNodeList();
    updateSelectionStyles();
    if (options.center && node) centerOnNode(node);
  };

  const updateGraphStatus = () => {
    const visibleNodes = state.nodes.filter(isVisible);
    const visibleLinks = visibleRelationshipLinks();
    const visibleHierarchyLinks = structureToggle.checked
      ? visibleStructureLinks().length
      : 0;
    const unresolved = state.unresolvedRelationships.length;
    graphStatus.textContent = `${visibleNodes.length} nodes · ${visibleLinks.length} relationships${
      visibleHierarchyLinks ? ` · ${visibleHierarchyLinks} hierarchy lines` : ""
    }${
      unresolved ? ` · ${unresolved} unresolved` : ""
    }`;
    structureToggleStatus.textContent = structureToggle.checked
      ? `${visibleHierarchyLinks} parent and child lines shown`
      : "Parent and child lines hidden";
  };

  const applyVisibility = () => {
    const visibleIds = visibleNodeIds();
    state.nodeSelection?.classed("is-hidden", (node) => !visibleIds.has(node.id));
    state.relationSelection?.classed(
      "is-hidden",
      (link) =>
        !visibleIds.has(idOf(link.source)) || !visibleIds.has(idOf(link.target)),
    );
    state.structureSelection?.classed(
      "is-hidden",
      (link) =>
        !structureToggle.checked ||
        !visibleIds.has(idOf(link.source)) ||
        !visibleIds.has(idOf(link.target)),
    );
    state.clusterUpdater?.();
    renderNodeList();
    updateGraphStatus();
    updateSelectionStyles();
  };

  const createGraph = () => {
    const defs = svg.append("defs");
    defs
      .append("marker")
      .attr("id", "relation-arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 17)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L9,0L0,4")
      .attr("fill", "context-stroke");

    const viewport = svg.append("g").attr("class", "graph-viewport");
    state.viewport = viewport;

    const clusters = viewport
      .append("g")
      .attr("class", "cluster-layer")
      .selectAll("g")
      .data(Object.keys(TYPE_CONFIG))
      .join("g")
      .attr("class", "cluster")
      .style("--cluster-color", (type) => typeFor(type).color);

    clusters.append("rect").attr("class", "cluster-region");
    clusters
      .append("text")
      .attr("class", "cluster-label")
      .attr("text-anchor", "start")
      .text((type) => typeFor(type).label);

    const updateClusters = () => {
      clusters.each(function update(type) {
        const bounds = clusterBounds(type);
        const group = d3.select(this);
        group.classed("is-hidden", !bounds);
        if (!bounds) return;
        group
          .select("rect")
          .attr("x", bounds.x)
          .attr("y", bounds.y)
          .attr("width", bounds.width)
          .attr("height", bounds.height)
          .attr("rx", 18)
          .attr("ry", 18);
        group
          .select("text")
          .attr("x", bounds.labelX)
          .attr("y", bounds.labelY);
      });
    };
    state.clusterUpdater = updateClusters;

    const relationSelection = viewport
      .append("g")
      .attr("class", "relation-layer")
      .selectAll("path")
      .data(state.relationshipLinks, (link) => link.id)
      .join("path")
      .attr("class", "relation-link")
      .attr("marker-end", "url(#relation-arrow)");

    const structureSelection = viewport
      .append("g")
      .attr("class", "structure-layer")
      .selectAll("path")
      .data(state.structureLinks, (link) => link.id)
      .join("path")
      .attr("class", "structure-link is-hidden");

    const nodeSelection = viewport
      .append("g")
      .attr("class", "node-layer")
      .selectAll("g")
      .data(state.nodes, (node) => node.id)
      .join("g")
      .attr("class", "node")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr(
        "aria-label",
        (node) =>
          `${node.title}, ${typeFor(node.type).label}, ${node.degree} relationships`,
      )
      .style("--node-color", (node) => typeFor(node.type).color)
      .on("click", (event, node) => {
        event.stopPropagation();
        selectNode(node.id);
      })
      .on("keydown", (event, node) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNode(node.id);
        }
      })
      .on("dblclick", (event, node) => {
        event.stopPropagation();
        node.fx = null;
        node.fy = null;
        state.simulation.alpha(0.55).restart();
      });

    nodeSelection
      .append("circle")
      .attr("class", "node-halo")
      .attr("r", (node) => nodeRadius(node) + 8);

    nodeSelection
      .append("circle")
      .attr("class", "node-core")
      .attr("r", nodeRadius);

    nodeSelection
      .append("text")
      .attr("class", "node-label")
      .attr("x", (node) => nodeRadius(node) + 6)
      .attr("y", 3)
      .text((node) => compactTitle(node.title));

    nodeSelection.each(function cacheClusterExtent(node) {
      const radius = nodeRadius(node) + 8;
      const label = this.querySelector(".node-label");
      let measuredLabelWidth = 0;
      try {
        measuredLabelWidth = label?.getComputedTextLength() ?? 0;
      } catch {
        measuredLabelWidth = 0;
      }
      const labelWidth = Math.max(
        measuredLabelWidth,
        compactTitle(node.title).length * 6.6,
      );
      const left = -radius;
      const right = Math.max(radius, nodeRadius(node) + 8 + labelWidth);
      node.clusterExtent = {
        x: left,
        y: -radius,
        width: right - left,
        height: radius * 2,
      };
    });

    const drag = d3
      .drag()
      .on("start", (event, node) => {
        if (!event.active) state.simulation.alphaTarget(0.22).restart();
        node.fx = node.x;
        node.fy = node.y;
      })
      .on("drag", (event, node) => {
        node.fx = event.x;
        node.fy = event.y;
      })
      .on("end", (event) => {
        if (!event.active) state.simulation.alphaTarget(0);
      });

    nodeSelection.call(drag);

    const allLinks = [...state.relationshipLinks, ...state.structureLinks];
    const renderTick = () => {
      relationSelection.attr("d", linkPath);
      structureSelection.attr("d", linkPath);
      nodeSelection.attr("transform", (node) => `translate(${node.x},${node.y})`);
      updateClusters();
    };

    const simulation = d3
      .forceSimulation(state.nodes)
      .force(
        "link",
        d3
          .forceLink(allLinks)
          .id((node) => node.id)
          .distance((link) =>
            link.kind === "relationship"
              ? LAYOUT.relationshipDistance
              : LAYOUT.structureDistance,
          )
          .strength((link) => (link.kind === "relationship" ? 0.2 : 0.025)),
      )
      .force(
        "charge",
        d3
          .forceManyBody()
          .strength(LAYOUT.chargeStrength)
          .distanceMax(LAYOUT.chargeDistanceMax),
      )
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((node) => nodeRadius(node) + LAYOUT.collisionPadding)
          .iterations(LAYOUT.collisionIterations),
      )
      .force(
        "x",
        d3
          .forceX((node) => anchorFor(node).x)
          .strength(horizontalAnchorStrength),
      )
      .force(
        "y",
        d3
          .forceY((node) => anchorFor(node).y)
          .strength(verticalAnchorStrength),
      )
      .alphaDecay(0.035)
      .velocityDecay(0.32)
      .on("tick", renderTick);

    state.simulation = simulation;
    state.nodeSelection = nodeSelection;
    state.relationSelection = relationSelection;
    state.structureSelection = structureSelection;

    const zoom = d3
      .zoom()
      .scaleExtent([0.42, 3.2])
      .on("zoom", (event) => viewport.attr("transform", event.transform));
    state.zoom = zoom;
    svg.call(zoom).on("dblclick.zoom", null);
    svg.on("click", () => selectNode(null));

    const fitGraph = (animate = true) => {
      if (!state.nodeSelection || state.nodes.length === 0) return;
      updateClusters();
      const bounds = state.viewport.node().getBBox();
      if (!bounds.width || !bounds.height) return;
      const padding = 58;
      const scale = Math.min(
        1.15,
        (state.width - padding * 2) / bounds.width,
        (state.height - padding * 2) / bounds.height,
      );
      const transform = d3.zoomIdentity
        .translate(state.width / 2, state.height / 2)
        .scale(scale)
        .translate(
          -(bounds.x + bounds.width / 2),
          -(bounds.y + bounds.height / 2),
        );
      const target = animate ? svg.transition().duration(520) : svg;
      target.call(zoom.transform, transform);
    };

    const scheduleFit = (animate = false) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => fitGraph(animate));
      });
    };

    fitButton.addEventListener("click", () => fitGraph());
    resetButton.addEventListener("click", () => {
      for (const node of state.nodes) {
        node.fx = null;
        node.fy = null;
        const anchor = anchorFor(node);
        const angle = (hash(node.id) % 360) * (Math.PI / 180);
        node.x = anchor.x + Math.cos(angle) * 35;
        node.y = anchor.y + Math.sin(angle) * 35;
      }
      state.simulation.alpha(1).stop();
      state.simulation.tick(240);
      renderTick();
      selectNode(null);
      scheduleFit(true);
    });

    const resize = () => {
      const bounds = graphFrame.getBoundingClientRect();
      state.width = Math.max(320, Math.round(bounds.width));
      state.height = Math.max(520, Math.round(bounds.height));
      svg.attr("viewBox", `0 0 ${state.width} ${state.height}`);
      updateClusters();
      state.simulation
        .force(
          "x",
          d3
            .forceX((node) => anchorFor(node).x)
            .strength(horizontalAnchorStrength),
        )
        .force(
          "y",
          d3
            .forceY((node) => anchorFor(node).y)
            .strength(verticalAnchorStrength),
        )
        .alpha(0.7)
        .stop();
      if (!state.hasFit) {
        state.hasFit = true;
        state.simulation.tick(280);
        renderTick();
        scheduleFit();
      } else {
        state.simulation.tick(60);
        renderTick();
        scheduleFit();
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(graphFrame);
    resize();
  };

  const initialize = async () => {
    try {
      const siteUrl = new URL("../authorbot-site.json", window.location.href);
      const response = await fetch(siteUrl);
      if (!response.ok) {
        throw new Error(`Site model returned HTTP ${response.status}`);
      }
      const site = await response.json();
      if (site.schema !== "authorbot.site/v1") {
        throw new Error(`Unsupported site model: ${site.schema ?? "unknown"}`);
      }

      const model = buildModel(site);
      state.nodes = model.nodes;
      state.relationshipLinks = model.relationshipLinks;
      state.structureLinks = model.structureLinks;
      state.unresolvedRelationships = model.unresolvedRelationships;

      renderTypeFilters();
      renderNodeList();
      createGraph();
      applyVisibility();
      renderDetail(null);

      dataState.textContent = "Live model";
      dataState.classList.add("is-ready");
      loading.classList.add("is-hidden");

      if (state.unresolvedRelationships.length > 0) {
        console.warn(
          "Outline graph could not resolve these title-based relationships:",
          state.unresolvedRelationships,
        );
      }
    } catch (error) {
      console.error(error);
      dataState.textContent = "Load failed";
      dataState.classList.add("is-error");
      graphStatus.textContent = error instanceof Error ? error.message : "Unable to load graph";
      loading.querySelector("span:last-child").textContent =
        "The story model could not be loaded.";
      loading.querySelector(".loading-orbit").remove();
    }
  };

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value.trim().toLowerCase();
    if (
      state.selectedId &&
      !isVisible(state.nodes.find((node) => node.id === state.selectedId))
    ) {
      selectNode(null);
    }
    applyVisibility();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const first = state.nodes.find(isVisible);
    if (first) selectNode(first.id, { center: true });
  });

  structureToggle.addEventListener("change", applyVisibility);

  initialize();
})();
