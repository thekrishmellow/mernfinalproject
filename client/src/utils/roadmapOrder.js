/**
 * Topologically and pedagogically sorts nodes according to graph dependencies.
 * Ensures the curriculum flows naturally: Prerequisites/Start -> Core Learning -> Practice/Quizzes -> Milestones/Completion.
 */
export function sortRoadmapNodes(nodes = [], edges = []) {
  if (!nodes || nodes.length <= 1) return nodes || [];

  const nodeMap = new Map();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const adj = new Map();
  const inDegree = new Map();
  nodes.forEach((n) => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  (edges || []).forEach((e) => {
    if (adj.has(e.source) && inDegree.has(e.target)) {
      adj.get(e.source).push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  // Calculate topological depth (distance from root)
  const depth = new Map();
  nodes.forEach((n) => depth.set(n.id, 0));

  const queue = [];
  nodes.forEach((n) => {
    if (inDegree.get(n.id) === 0) {
      queue.push(n.id);
    }
  });

  const inDegreeCopy = new Map(inDegree);
  while (queue.length > 0) {
    const u = queue.shift();
    const currentDepth = depth.get(u) || 0;
    for (const v of adj.get(u) || []) {
      depth.set(v, Math.max(depth.get(v) || 0, currentDepth + 1));
      inDegreeCopy.set(v, (inDegreeCopy.get(v) || 1) - 1);
      if (inDegreeCopy.get(v) === 0) {
        queue.push(v);
      }
    }
  }

  const typeWeights = {
    start: 0,
    learning: 1,
    practice: 2,
    quiz: 3,
    project: 4,
    milestone: 4,
    completion: 5
  };

  return [...nodes].sort((a, b) => {
    const depthA = depth.get(a.id) || 0;
    const depthB = depth.get(b.id) || 0;
    if (depthA !== depthB) return depthA - depthB;

    const weightA = typeWeights[a.type] ?? 2;
    const weightB = typeWeights[b.type] ?? 2;
    if (weightA !== weightB) return weightA - weightB;

    const yA = a.position?.y ?? 0;
    const yB = b.position?.y ?? 0;
    if (yA !== yB) return yA - yB;

    const xA = a.position?.x ?? 0;
    const xB = b.position?.x ?? 0;
    return xA - xB;
  });
}
