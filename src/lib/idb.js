// IndexedDB wrapper for the Cost Manager app (React/module version).
'use strict';

// Rates map (base USD): 1 USD = X <currency>. Defaults used until fetched/overridden.
const exchangeRates = { USD: 1, ILS: 3.5, GBP: 0.8, EURO: 0.9 };

// Replace in-memory exchange rates (invalid input is ignored).
export function setRates(ratesObj) {
  if (!ratesObj || typeof ratesObj !== 'object') return;
  Object.keys(exchangeRates).forEach(key => delete exchangeRates[key]);
  Object.assign(exchangeRates, ratesObj);
}

// Open/create the DB and expose a small API (addCost/getReport) for this instance.
export function openCostsDB(databaseName, databaseVersion) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const db = request.result;
      // Schema init: runs on first open or version bump.
      if (!db.objectStoreNames.contains('costs')) {
        db.createObjectStore('costs', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      // Add a new cost item; date is when it was added (per project spec).
      function addCost(cost) {
        return new Promise((resolveAdd, rejectAdd) => {
          try {
            // Input validation for cost object.
            if (!cost || typeof cost !== 'object') {
              rejectAdd(new Error('Invalid cost object: missing required fields'));
              return;
            }
            const { sum, currency, category, description } = cost;
            if (sum == null || currency == null || category == null || description == null) {
              rejectAdd(new Error('Invalid cost object: missing required fields'));
              return;
            }
            const numericSum = Number(sum);
            if (!Number.isFinite(numericSum) || numericSum < 0) {
              rejectAdd(new Error('Invalid sum'));
              return;
            }

            // Capture insertion time once so timestamp + Date stay consistent.
            const now = new Date();
            const itemToStore = {
              sum: numericSum,
              currency: String(currency),
              category: String(category),
              description: String(description),
              timestamp: now.getTime(),
              Date: {
                day: now.getDate(),
                month: now.getMonth() + 1,
                year: now.getFullYear(),
              },
            };

            const tx = db.transaction('costs', 'readwrite');
            const store = tx.objectStore('costs');
            const req = store.add(itemToStore);

            req.onsuccess = () => {
              itemToStore.id = req.result;
              resolveAdd(itemToStore);
            };

            req.onerror = () => {
              rejectAdd(req.error);
            };

            tx.onerror = () => {
              rejectAdd(tx.error);
            };

            tx.onabort = () => {
              rejectAdd(tx.error);
            };
          } catch (err) {
            rejectAdd(err);
          }
        });
      }

      // Convert using USD as the pivot: amount / fromRate * toRate.
      function convert(amount, fromCurrency, toCurrency) {
        const fromRate = exchangeRates[fromCurrency];
        const toRate = exchangeRates[toCurrency];
        if (!fromRate || !toRate) return amount;
        return (amount / fromRate) * toRate;
      }

      // Build a month report; keep original currency and add sumInCurrency for totals.
      function getReport(year, month, currency) {
        return new Promise((resolveRep, rejectRep) => {
          // Input validation for report parameters.
          const y = Number(year);
          const m = Number(month);
          if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
            rejectRep(new Error('Invalid year or month'));
            return;
          }
          if (typeof currency !== 'string' || !exchangeRates[currency]) {
            rejectRep(new Error('Invalid currency'));
            return;
          }

          const tx = db.transaction('costs', 'readonly');
          const store = tx.objectStore('costs');
          const req = store.getAll();

          req.onsuccess = () => {
            const allCosts = req.result;
            // Filtering by insertion month/year stored in Date.
            const filtered = allCosts.filter(
              (item) => item.Date.month === m && item.Date.year === y
            );

            // We intentionally match the strict spec and strip internal fields.
            const costsForReport = filtered.map((item) => ({
              sum: Number(item.sum),
              currency: String(item.currency),
              category: String(item.category),
              description: String(item.description),
              Date: { day: Number(item.Date.day) },
              sumInCurrency: convert(Number(item.sum), item.currency, currency),
            }));

            // Compute total in requested currency using original sums and currencies.
            let total = 0;
            for (const item of filtered) {
              total += convert(Number(item.sum), item.currency, currency);
            }

            resolveRep({
              year: y,
              month: m,
              costs: costsForReport,
              total: { currency: currency, total: total },
            });
          };

          req.onerror = () => {
            rejectRep(req.error);
          };

          tx.onerror = () => {
            rejectRep(tx.error);
          };

          tx.onabort = () => {
            rejectRep(tx.error);
          };
        });
      }

      // Public API for callers.
      resolve({ addCost, getReport, setRates });
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};