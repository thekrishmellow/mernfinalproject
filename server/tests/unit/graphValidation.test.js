import { describe, it, expect } from 'vitest';
import { validateRoadmapGraph } from '../../src/services/roadmap/graphValidationService.js';

describe('Graph Validation Service', () => {
  it('validates a correct linear DAG with root node', () => {
    const nodes = [
      { id: 'n1', title: 'Start' },
      { id: 'n2', title: 'Module 1' },
      { id: 'n3', title: 'Milestone' }
    ];
    const edges = [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' }
    ];

    const result = validateRoadmapGraph(nodes, edges);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.rootNodeIds).toEqual(['n1']);
  });

  it('detects and rejects circular dependency cycles', () => {
    const nodes = [
      { id: 'n1', title: 'Step 1' },
      { id: 'n2', title: 'Step 2' },
      { id: 'n3', title: 'Step 3' }
    ];
    const edges = [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n1' } // Cycle!
    ];

    const result = validateRoadmapGraph(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((err) => err.includes('Dependency cycle detected'))).toBe(true);
  });

  it('rejects dangling edges referencing non-existent nodes', () => {
    const nodes = [
      { id: 'n1', title: 'Step 1' }
    ];
    const edges = [
      { id: 'e1', source: 'n1', target: 'non_existent_node' }
    ];

    const result = validateRoadmapGraph(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((err) => err.includes('non-existent target node'))).toBe(true);
  });

  it('rejects self-referential loop', () => {
    const nodes = [
      { id: 'n1', title: 'Step 1' }
    ];
    const edges = [
      { id: 'e1', source: 'n1', target: 'n1' }
    ];

    const result = validateRoadmapGraph(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((err) => err.includes('Self-referential loop'))).toBe(true);
  });
});
