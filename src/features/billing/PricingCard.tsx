import { useTranslations } from 'next-intl';
import React from 'react';

import type { BillingInterval } from '@/types/Subscription';

type PlanNameKey = 'free_plan_name' | 'premium_plan_name' | 'enterprise_plan_name';
type PlanDescKey = 'free_plan_description' | 'premium_plan_description' | 'enterprise_plan_description';
type IntervalKey = 'plan_interval_month' | 'plan_interval_year';

const PLAN_NAME_KEYS: Record<string, PlanNameKey> = {
  free: 'free_plan_name',
  premium: 'premium_plan_name',
  enterprise: 'enterprise_plan_name',
};

const PLAN_DESC_KEYS: Record<string, PlanDescKey> = {
  free: 'free_plan_description',
  premium: 'premium_plan_description',
  enterprise: 'enterprise_plan_description',
};

const INTERVAL_KEYS: Record<BillingInterval, IntervalKey> = {
  month: 'plan_interval_month',
  year: 'plan_interval_year',
};

export const PricingCard = (props: {
  planId: string;
  price: number;
  interval: BillingInterval;
  button: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('PricingPlan');

  const nameKey = PLAN_NAME_KEYS[props.planId] ?? 'free_plan_name';
  const descKey = PLAN_DESC_KEYS[props.planId] ?? 'free_plan_description';
  const intervalKey = INTERVAL_KEYS[props.interval];

  return (
    <div className="rounded-xl border border-border px-6 py-8 text-center">
      <div className="text-lg font-semibold">
        {t(nameKey)}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className="text-5xl font-bold">
          {`$${props.price}`}
        </div>

        <div className="ml-1 text-muted-foreground">
          {`/ ${t(intervalKey)}`}
        </div>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        {t(descKey)}
      </div>

      {props.button}

      <ul className="mt-8 space-y-3">{props.children}</ul>
    </div>
  );
};
