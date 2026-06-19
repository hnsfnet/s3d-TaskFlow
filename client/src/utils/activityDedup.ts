export interface DedupActivityInput {
  projectId: string;
  actorId: string;
  type: string;
  payload?: Record<string, any>;
}

export interface DedupActivityRecord extends DedupActivityInput {
  id: string;
  createdAt: string;
}

const DEFAULT_WINDOW_MS = 2000;
const DEFAULT_LOOKBACK = 10;

export function isDuplicateActivity(
  input: DedupActivityInput,
  history: DedupActivityRecord[],
  options: { windowMs?: number; lookback?: number } = {}
): boolean {
  if (history.length === 0) return false;

  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const lookback = options.lookback ?? DEFAULT_LOOKBACK;
  const now = Date.now();

  const recent = history.slice(0, lookback);
  const inputPayloadStr = JSON.stringify(input.payload || {});

  for (const act of recent) {
    const actTime = new Date(act.createdAt).getTime();
    if (now - actTime > windowMs) continue;
    if (
      act.projectId === input.projectId &&
      act.actorId === input.actorId &&
      act.type === input.type &&
      JSON.stringify(act.payload || {}) === inputPayloadStr
    ) {
      return true;
    }
  }
  return false;
}

export function createActivityDeduper(options?: { windowMs?: number; lookback?: number }) {
  const history: DedupActivityRecord[] = [];
  let counter = 0;

  return {
    add(input: DedupActivityInput): DedupActivityRecord | null {
      if (isDuplicateActivity(input, history, options)) {
        return null;
      }
      counter += 1;
      const record: DedupActivityRecord = {
        ...input,
        id: `act_${counter}`,
        createdAt: new Date().toISOString(),
      };
      history.unshift(record);
      const lookback = options?.lookback ?? DEFAULT_LOOKBACK;
      if (history.length > lookback * 2) {
        history.length = lookback;
      }
      return record;
    },
    getHistory: () => [...history],
    clear: () => {
      history.length = 0;
      counter = 0;
    },
  };
}
