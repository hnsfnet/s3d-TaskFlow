import { describe, it, expect } from 'vitest';
import {
  sortTasksByPriority,
  filterTasksByAssignee,
  filterTasksByStatus,
  filterAndSortTasks,
} from '../taskUtils';
import type { Task } from '../../types';

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  title: '测试任务',
  projectId: 'p1',
  assigneeId: '1',
  status: 'todo',
  priority: 'medium',
  ...overrides,
});

describe('任务排序 - 按优先级', () => {
  it('空列表排序后仍为空', () => {
    const result = sortTasksByPriority([]);
    expect(result).toEqual([]);
  });

  it('单条数据排序后顺序不变', () => {
    const task = createTask({ priority: 'high' });
    const result = sortTasksByPriority([task]);
    expect(result).toHaveLength(1);
    expect(result[0].priority).toBe('high');
  });

  it('按高→中→低排序', () => {
    const tasks = [
      createTask({ id: 'low', priority: 'low' }),
      createTask({ id: 'high', priority: 'high' }),
      createTask({ id: 'medium', priority: 'medium' }),
    ];
    const result = sortTasksByPriority(tasks);
    expect(result.map(t => t.priority)).toEqual(['high', 'medium', 'low']);
    expect(result[0].id).toBe('high');
    expect(result[1].id).toBe('medium');
    expect(result[2].id).toBe('low');
  });

  it('所有任务优先级相同时顺序不变', () => {
    const tasks = [
      createTask({ id: 'a', priority: 'medium' }),
      createTask({ id: 'b', priority: 'medium' }),
      createTask({ id: 'c', priority: 'medium' }),
    ];
    const result = sortTasksByPriority(tasks);
    expect(result.map(t => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('不修改原始数组', () => {
    const tasks = [
      createTask({ id: 'low', priority: 'low' }),
      createTask({ id: 'high', priority: 'high' }),
    ];
    const original = [...tasks];
    sortTasksByPriority(tasks);
    expect(tasks).toEqual(original);
  });
});

describe('任务筛选 - 按负责人', () => {
  it('空列表筛选后仍为空', () => {
    const result = filterTasksByAssignee([], '1');
    expect(result).toEqual([]);
  });

  it('筛选特定负责人的任务', () => {
    const tasks = [
      createTask({ id: 'a', assigneeId: '1' }),
      createTask({ id: 'b', assigneeId: '2' }),
      createTask({ id: 'c', assigneeId: '1' }),
    ];
    const result = filterTasksByAssignee(tasks, '1');
    expect(result).toHaveLength(2);
    expect(result.every(t => t.assigneeId === '1')).toBe(true);
    expect(result.map(t => t.id).sort()).toEqual(['a', 'c']);
  });

  it('没有匹配的负责人返回空数组', () => {
    const tasks = [createTask({ assigneeId: '1' })];
    const result = filterTasksByAssignee(tasks, '999');
    expect(result).toEqual([]);
  });

  it('负责人为 null 时返回全部任务', () => {
    const tasks = [
      createTask({ id: 'a', assigneeId: '1' }),
      createTask({ id: 'b', assigneeId: '2' }),
    ];
    const result = filterTasksByAssignee(tasks, null);
    expect(result).toHaveLength(2);
  });

  it('未指派的任务 (assigneeId 为 null) 可以被筛选出来', () => {
    const tasks = [
      createTask({ id: 'a', assigneeId: null }),
      createTask({ id: 'b', assigneeId: '1' }),
    ];
    const result = filterTasksByAssignee(tasks, null);
    expect(result).toHaveLength(2);
  });
});

describe('任务筛选 - 按状态', () => {
  it('空列表筛选后仍为空', () => {
    const result = filterTasksByStatus([], 'todo');
    expect(result).toEqual([]);
  });

  it('筛选待办状态的任务', () => {
    const tasks = [
      createTask({ id: 'a', status: 'todo' }),
      createTask({ id: 'b', status: 'in_progress' }),
      createTask({ id: 'c', status: 'todo' }),
    ];
    const result = filterTasksByStatus(tasks, 'todo');
    expect(result).toHaveLength(2);
    expect(result.every(t => t.status === 'todo')).toBe(true);
  });

  it('筛选进行中状态的任务', () => {
    const tasks = [
      createTask({ id: 'a', status: 'todo' }),
      createTask({ id: 'b', status: 'in_progress' }),
    ];
    const result = filterTasksByStatus(tasks, 'in_progress');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('筛选已完成状态的任务', () => {
    const tasks = [
      createTask({ id: 'a', status: 'done' }),
      createTask({ id: 'b', status: 'in_progress' }),
    ];
    const result = filterTasksByStatus(tasks, 'done');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('没有匹配状态时返回空数组', () => {
    const tasks = [createTask({ status: 'todo' })];
    const result = filterTasksByStatus(tasks, 'done');
    expect(result).toEqual([]);
  });
});

describe('组合筛选和排序', () => {
  const tasks = [
    createTask({ id: 't1', status: 'todo', priority: 'low', assigneeId: '1' }),
    createTask({ id: 't2', status: 'todo', priority: 'high', assigneeId: '2' }),
    createTask({ id: 't3', status: 'in_progress', priority: 'medium', assigneeId: '1' }),
    createTask({ id: 't4', status: 'todo', priority: 'medium', assigneeId: '1' }),
  ];

  it('按状态筛选后按优先级排序', () => {
    const result = filterAndSortTasks(tasks, { status: 'todo', sortBy: 'priority' });
    expect(result.every(t => t.status === 'todo')).toBe(true);
    expect(result.map(t => t.priority)).toEqual(['high', 'medium', 'low']);
    expect(result.map(t => t.id)).toEqual(['t2', 't4', 't1']);
  });

  it('按负责人筛选后按状态筛选', () => {
    const result = filterAndSortTasks(tasks, { assigneeId: '1', status: 'todo' });
    expect(result).toHaveLength(2);
    expect(result.every(t => t.assigneeId === '1' && t.status === 'todo')).toBe(true);
    expect(result.map(t => t.id).sort()).toEqual(['t1', 't4']);
  });

  it('负责人 + 状态 + 优先级排序 三重组合', () => {
    const result = filterAndSortTasks(tasks, {
      assigneeId: '1',
      status: 'todo',
      sortBy: 'priority',
    });
    expect(result.map(t => t.priority)).toEqual(['medium', 'low']);
    expect(result.map(t => t.id)).toEqual(['t4', 't1']);
  });

  it('不传选项时返回原数组副本', () => {
    const result = filterAndSortTasks(tasks);
    expect(result).toEqual(tasks);
    expect(result).not.toBe(tasks);
  });
});
