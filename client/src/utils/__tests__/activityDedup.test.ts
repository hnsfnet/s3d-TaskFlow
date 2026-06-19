import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isDuplicateActivity, createActivityDedup } from '../activityDedup';
import type { DedupActivityRecord } from '../activityDedup';

const baseInput = {
  projectId: 'p1',
  actorId: 'u1',
  type: 'task_moved',
  payload: { taskId: 't1', from: 'todo', to: 'in_progress' },
};

describe('活动去重 - isDuplicateActivity', () => {
  it('空历史记录不会判定为重复', () => {
    const result = isDuplicateActivity(baseInput, []);
    expect(result).toBe(false);
  });

  it('完全相同的活动在 2 秒内判定为重复', () => {
    const now = new Date();
    const history: DedupActivityRecord[] = [
      { ...baseInput, id: 'a1', createdAt: now.toISOString() },
    ];
    const result = isDuplicateActivity(baseInput, history);
    expect(result).toBe(true);
  });

  it('超过时间窗口的相同活动不判定为重复', () => {
    const threeSecondsAgo = new Date(Date.now() - 3000);
    const history: DedupActivityRecord[] = [
      { ...baseInput, id: 'a1', createdAt: threeSecondsAgo.toISOString() },
    ];
    const result = isDuplicateActivity(baseInput, history);
    expect(result).toBe(false);
  });

  it('不同任务的相同动作不判定为重复', () => {
    const now = new Date();
    const history: DedupActivityRecord[] = [
      {
        ...baseInput,
        id: 'a1',
        createdAt: now.toISOString(),
        payload: { taskId: 't2', from: 'todo', to: 'in_progress' },
      },
    ];
    const result = isDuplicateActivity(baseInput, history);
    expect(result).toBe(false);
  });

  it('不同项目的相同活动不判定为重复', () => {
    const now = new Date();
    const history: DedupActivityRecord[] = [
      { ...baseInput, id: 'a1', projectId: 'p2', createdAt: now.toISOString() },
    ];
    const result = isDuplicateActivity(baseInput, history);
    expect(result).toBe(false);
  });

  it('不同操作人的相同活动不判定为重复', () => {
    const now = new Date();
    const history: DedupActivityRecord[] = [
      { ...baseInput, id: 'a1', actorId: 'u2', createdAt: now.toISOString() },
    ];
    const result = isDuplicateActivity(baseInput, history);
    expect(result).toBe(false);
  });

  it('不同类型的活动不判定为重复', () => {
    const now = new Date();
    const history: DedupActivityRecord[] = [
      { ...baseInput, id: 'a1', type: 'task_created', createdAt: now.toISOString() },
    ];
    const result = isDuplicateActivity(baseInput, history);
    expect(result).toBe(false);
  });

  it('不同 payload 不判定为重复', () => {
    const now = new Date();
    const history: DedupActivityRecord[] = [
      {
        ...baseInput,
        id: 'a1',
        createdAt: now.toISOString(),
        payload: { taskId: 't1', from: 'todo', to: 'done' },
      },
    ];
    const result = isDuplicateActivity(baseInput, history);
    expect(result).toBe(false);
  });

  it('空 payload 和 undefined payload 视为相同', () => {
    const now = new Date();
    const history: DedupActivityRecord[] = [
      {
        ...baseInput,
        id: 'a1',
        createdAt: now.toISOString(),
        payload: undefined,
        type: 'member_joined',
      },
    ];
    const result = isDuplicateActivity(
      { ...baseInput, type: 'member_joined', payload: {} },
      history
    );
    expect(result).toBe(true);
  });

  it('只检查最近 N 条记录', () => {
    const now = new Date();
    const lookback = 2;
    const history: DedupActivityRecord[] = [
      { ...baseInput, id: 'a_newer', type: 'other_type', createdAt: now.toISOString() },
      { ...baseInput, id: 'a_newer2', type: 'other_type2', createdAt: now.toISOString() },
      { ...baseInput, id: 'a_old', createdAt: now.toISOString() },
    ];
    const result = isDuplicateActivity(baseInput, history, { lookback });
    expect(result).toBe(false);
  });

  it('支持自定义时间窗口', () => {
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const history: DedupActivityRecord[] = [
      { ...baseInput, id: 'a1', createdAt: fiveSecondsAgo.toISOString() },
    ];
    const result = isDuplicateActivity(baseInput, history, { windowMs: 10000 });
    expect(result).toBe(true);
  });
});

describe('活动去重 - createActivityDedup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('第一次添加活动返回记录', () => {
    const deduper = createActivityDedup();
    const result = deduper.add(baseInput);
    expect(result).not.toBeNull();
    expect(result?.id).toBeDefined();
    expect(result?.type).toBe('task_moved');
  });

  it('2 秒内相同活动返回 null', () => {
    const deduper = createActivityDedup();
    const first = deduper.add(baseInput);
    expect(first).not.toBeNull();

    vi.advanceTimersByTime(1000);
    const second = deduper.add(baseInput);
    expect(second).toBeNull();
  });

  it('超过 2 秒相同活动可以重新生成', () => {
    const deduper = createActivityDedup();
    const first = deduper.add(baseInput);
    expect(first).not.toBeNull();

    vi.advanceTimersByTime(2500);
    const second = deduper.add(baseInput);
    expect(second).not.toBeNull();
    expect(second?.id).not.toBe(first?.id);
  });

  it('不同任务不受去重影响', () => {
    const deduper = createActivityDedup();
    const first = deduper.add(baseInput);
    expect(first).not.toBeNull();

    const secondInput = {
      ...baseInput,
      payload: { ...baseInput.payload, taskId: 't2' },
    };
    const second = deduper.add(secondInput);
    expect(second).not.toBeNull();
  });

  it('历史记录可以被清空', () => {
    const deduper = createActivityDedup();
    deduper.add(baseInput);
    expect(deduper.getHistory().length).toBe(1);

    deduper.clear();
    expect(deduper.getHistory().length).toBe(0);

    const result = deduper.add(baseInput);
    expect(result).not.toBeNull();
  });

  it('生成的 ID 自增不重复', () => {
    const deduper = createActivityDedup({ windowMs: 0 });
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = deduper.add({ ...baseInput, type: `type_${i}` });
      if (r) ids.push(r.id);
    }
    expect(new Set(ids).size).toBe(5);
  });

  it('支持自定义时间窗口', () => {
    const deduper = createActivityDedup({ windowMs: 5000 });
    deduper.add(baseInput);

    vi.advanceTimersByTime(3000);
    const second = deduper.add(baseInput);
    expect(second).toBeNull();

    vi.advanceTimersByTime(2500);
    const third = deduper.add(baseInput);
    expect(third).not.toBeNull();
  });
});
