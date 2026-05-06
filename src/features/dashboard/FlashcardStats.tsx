'use client';

import { useMemo } from 'react';

import { useFlashcardsStore } from '@/stores/useFlashcardsStore';

type HistoryEntry = {
  again: number;
  hard: number;
  good: number;
  easy: number;
  total: number;
};

type Labels = {
  todayTitle: string;
  overallTitle: string;
  cardsTouchedToday: string;
  totalMarkedOverall: string;
  again: string;
  hard: string;
  good: string;
  easy: string;
};

const EMPTY_ENTRY: HistoryEntry = {
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
  total: 0,
};

function todayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function sumEntries(entries: Record<string, HistoryEntry>): HistoryEntry {
  return Object.values(entries).reduce<HistoryEntry>((acc, entry) => ({
    again: acc.again + entry.again,
    hard: acc.hard + entry.hard,
    good: acc.good + entry.good,
    easy: acc.easy + entry.easy,
    total: acc.total + entry.total,
  }), EMPTY_ENTRY);
}

function StatRow(props: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {props.label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{props.value}</div>
    </div>
  );
}

function StatsCard(props: {
  title: string;
  summaryLabel: string;
  summaryValue: number;
  labels: Labels;
  entry: HistoryEntry;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {props.title}
          </h3>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {props.summaryValue}
          </p>
        </div>
        <p className="max-w-[12rem] text-right text-sm text-muted-foreground">
          {props.summaryLabel}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatRow label={props.labels.again} value={props.entry.again} />
        <StatRow label={props.labels.hard} value={props.entry.hard} />
        <StatRow label={props.labels.good} value={props.entry.good} />
        <StatRow label={props.labels.easy} value={props.entry.easy} />
      </div>
    </div>
  );
}

export function FlashcardStats(props: { labels: Labels }) {
  const studyHistory = useFlashcardsStore(state => state.studyHistory);

  const { todayEntry, overallEntry } = useMemo(() => {
    const today = todayKey(new Date());
    return {
      todayEntry: studyHistory[today] ?? EMPTY_ENTRY,
      overallEntry: sumEntries(studyHistory),
    };
  }, [studyHistory]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <StatsCard
        title={props.labels.todayTitle}
        summaryLabel={props.labels.cardsTouchedToday}
        summaryValue={todayEntry.total}
        labels={props.labels}
        entry={todayEntry}
      />

      <StatsCard
        title={props.labels.overallTitle}
        summaryLabel={props.labels.totalMarkedOverall}
        summaryValue={overallEntry.total}
        labels={props.labels}
        entry={overallEntry}
      />
    </div>
  );
}