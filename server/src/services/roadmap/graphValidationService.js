/**
 * Validates a roadmap's node-edge dependency graph
 * Enforces cycle detection, dangling edge prevention, and prerequisite structure integrity.
 */
export function validateRoadmapGraph(nodes = [], edges = []) {
  const errors = [];
  const nodeMap = new Map();

  if (!nodes || nodes.length === 0) {
    errors.push('Roadmap must have at least one node to be published.');
    return { isValid: false, errors };
  }

  // Check unique node IDs and collect them
  for (const node of nodes) {
    if (!node.id) {
      errors.push('All nodes must have an id.');
      continue;
    }
    if (nodeMap.has(node.id)) {
      errors.push(`Duplicate node id found: ${node.id}`);
    }
    if (!node.title || !node.title.trim()) {
      errors.push(`Node "${node.id}" is missing a title.`);
    }
    nodeMap.set(node.id, node);
  }

  // Validate edges
  const adj = new Map();
  const inDegree = new Map();

  for (const node of nodes) {
    adj.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  const seenEdgeIds = new Set();
  for (const edge of edges) {
    if (!edge.id) {
      errors.push('All edges must have an id.');
      continue;
    }
    if (seenEdgeIds.has(edge.id)) {
      errors.push(`Duplicate edge id found: ${edge.id}`);
    }
    seenEdgeIds.add(edge.id);

    if (!nodeMap.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references non-existent source node "${edge.source}".`);
    }
    if (!nodeMap.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references non-existent target node "${edge.target}".`);
    }

    if (edge.source === edge.target) {
      errors.push(`Self-referential loop detected on node "${edge.source}".`);
    }

    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      adj.get(edge.source).push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  }

  // Detect Cycles using Depth First Search (white-gray-black coloring)
  // 0 = unvisited (white), 1 = visiting (gray), 2 = visited (black)
  const visited = new Map();
  for (const node of nodes) {
    visited.set(node.id, 0);
  }

  let hasCycle = false;
  const cyclePath = [];

  function dfs(u, path) {
    visited.set(u, 1);
    path.push(u);

    for (const v of adj.get(u) || []) {
      if (visited.get(v) === 1) {
        hasCycle = true;
        cyclePath.push([...path, v]);
        return;
      }
      if (visited.get(v) === 0) {
        dfs(v, path);
        if (hasCycle) return;
      }
    }

    visited.set(u, 2);
    path.pop();
  }

  for (const node of nodes) {
    if (visited.get(node.id) === 0) {
      dfs(node.id, []);
      if (hasCycle) break;
    }
  }

  if (hasCycle) {
    const cycleDesc = cyclePath.length > 0 ? cyclePath[0].join(' -> ') : 'Circular dependency';
    errors.push(`Dependency cycle detected in roadmap graph: ${cycleDesc}`);
  }

  // Determine root nodes (inDegree === 0)
  const rootNodeIds = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) {
      rootNodeIds.push(nodeId);
    }
  }

  if (rootNodeIds.length === 0 && nodes.length > 0) {
    errors.push('Roadmap must have at least one root node with no incoming prerequisites.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    rootNodeIds
  };
}
