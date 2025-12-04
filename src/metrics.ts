type RunType = 'single' | 'batch';
type RunStatus = 'success' | 'failure';

type CounterKey = `${RunType}:${RunStatus}`;

const counters: Record<CounterKey, number> = {
  'single:success': 0,
  'single:failure': 0,
  'batch:success': 0,
  'batch:failure': 0,
};

const durationSum: Record<RunType, number> = {
  single: 0,
  batch: 0,
};

const durationCount: Record<RunType, number> = {
  single: 0,
  batch: 0,
};

export const recordRun = (type: RunType, status: RunStatus, durationMs: number) => {
  counters[`${type}:${status}`] += 1;
  durationSum[type] += durationMs;
  durationCount[type] += 1;
};

const renderGauge = (name: string, help: string, value: number, labels?: Record<string, string>) => {
  const lbl = labels
    ? '{' + Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',') + '}'
    : '';
  return [`# HELP ${name} ${help}`, `# TYPE ${name} counter`, `${name}${lbl} ${value}`].join('\n');
};

const renderSummary = (name: string, help: string, type: RunType) => {
  const sum = durationSum[type];
  const count = durationCount[type];
  return [
    `# HELP ${name} ${help}`,
    `# TYPE ${name} summary`,
    `${name}_sum{type="${type}"} ${sum}`,
    `${name}_count{type="${type}"} ${count}`,
  ].join('\n');
};

export const renderMetrics = (): string => {
  return [
    renderGauge('checker_runs_total', 'Total runs by type/status', counters['single:success'] + counters['single:failure'], {
      type: 'single',
      status: 'all',
    }),
    renderGauge('checker_runs_success_total', 'Successful runs', counters['single:success'], { type: 'single' }),
    renderGauge('checker_runs_failure_total', 'Failed runs', counters['single:failure'], { type: 'single' }),
    renderGauge('checker_runs_total', 'Total runs by type/status', counters['batch:success'] + counters['batch:failure'], {
      type: 'batch',
      status: 'all',
    }),
    renderGauge('checker_runs_success_total', 'Successful runs', counters['batch:success'], { type: 'batch' }),
    renderGauge('checker_runs_failure_total', 'Failed runs', counters['batch:failure'], { type: 'batch' }),
    renderSummary('checker_run_duration_ms', 'Run duration in milliseconds', 'single'),
    renderSummary('checker_run_duration_ms', 'Run duration in milliseconds', 'batch'),
  ].join('\n');
};
