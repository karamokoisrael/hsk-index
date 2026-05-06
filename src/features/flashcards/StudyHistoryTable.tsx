'use client';

import { useMemo, useState } from 'react';

import { useFlashcardsStore } from '@/stores/useFlashcardsStore';

type Labels = {
  title: string;
  date: string;
  again: string;
  hard: string;
  good: string;
  easy: string;
  total: string;
  empty: string;
  showMore: string;
  showLess: string;
};

const PAGE_SIZE = 7;

function formatDate(dateStr: string, locale: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function GradeCell({ value, colorClass }: { value: number; colorClass: string }) {
  if (value === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span className={colorClass}>{value}</span>;
}

export const StudyHistoryTable = ({ labels, locale }: { labels: Labels; locale: string }) => {
  const studyHistory = useFlashcardsStore(s => s.studyHistory);
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    return Object.entries(studyHistory)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, entry]) => ({ date, ...entry }));
  }, [studyHistory]);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{labels.empty}</p>
    );
  }

  const visible = showAll ? rows : rows.slice(0, PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs font-medium text-muted-foreground">
              <th className="px-4 py-2 text-left">{labels.date}</th>
              <th className="px-3 py-2 text-right text-red-600">{labels.again}</th>
              <th className="px-3 py-2 text-right text-orange-500">{labels.hard}</th>
              <th className="px-3 py-2 text-right text-green-600">{labels.good}</th>
              <th className="px-3 py-2 text-right text-blue-500">{labels.easy}</th>
              <th className="px-4 py-2 text-right font-semibold">{labels.total}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={row.date} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                <td className="px-4 py-2 text-muted-foreground">{formatDate(row.date, locale)}</td>
                <td className="px-3 py-2 text-right">
                  <GradeCell value={row.again} colorClass="text-red-600 font-medium" />
                </td>
                <td className="px-3 py-2 text-right">
                  <GradeCell value={row.hard} colorClass="text-orange-500 font-medium" />
                </td>
                <td className="px-3 py-2 text-right">
                  <GradeCell value={row.good} colorClass="text-green-600 font-medium" />
                </td>
                <td className="px-3 py-2 text-right">
                  <GradeCell value={row.easy} colorClass="text-blue-500 font-medium" />
                </td>
                <td className="px-4 py-2 text-right font-semibold">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > PAGE_SIZE && (
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {showAll ? labels.showLess : `${labels.showMore} (${rows.length - PAGE_SIZE})`}
        </button>
      )}
    </div>
  );
};
