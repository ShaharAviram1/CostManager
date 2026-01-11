// Helper utilities for transforming report data for charts and views.
'use strict';

// Aggregates costs by category and normalizes sums using `sumInCurrency` when available.
export function getCategoryTotals(costs) {
    const totals = {};
    for (const c of costs) {
        // Use sumInCurrency if available, otherwise fallback to sum
        const amount = Number(c.sumInCurrency ?? c.sum);
        totals[c.category] = (totals[c.category] || 0) + amount;
    }
    return Object.entries(totals).map(([name, value]) => ({ name: name, value: value }));
}

// Builds 12-month totals for the bar chart by querying monthly reports.
export async function getYearMonthlyTotals(db, year, currency) {
    const result = [];
    for (let month = 1; month <= 12; month++){
        const rep = await db.getReport(year, month, currency);
        result.push({ month: month, total: rep.total.total });
    }
    return result;
}