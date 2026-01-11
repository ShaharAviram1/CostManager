/* idb.js - vanilla global library (no modules). Exposes window.idb for the tester HTML. */
(function () {
  'use strict';

  // Rates map (base USD): 1 USD = X <currency>. Defaults to 1:1 until updated.
  let exchangeRates = { USD: 1, ILS: 1, GBP: 1, EURO: 1 };

  // Replace in-memory exchange rates (invalid input is ignored).
  function setRates(ratesObj) {
    if (!ratesObj || typeof ratesObj !== 'object') return;
    exchangeRates = ratesObj;
  }

  // Open/create the DB and expose a small API (addCost/getReport) for this instance.
  function openCostsDB(databaseName, databaseVersion) {
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
              // Capture insertion time once so timestamp + Date stay consistent.
              const now = new Date();
              const itemToStore = {
                sum: Number(cost.sum),
                currency: String(cost.currency),
                category: String(cost.category),
                description: String(cost.description),
                timestamp: now.getTime(),
                Date: { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() },
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
            const tx = db.transaction('costs', 'readonly');
            const store = tx.objectStore('costs');
            const req = store.getAll();

            req.onsuccess = () => {
              const allCosts = req.result;
              // Month is stored 1-based (Jan=1).
              const filtered = allCosts.filter(
                (item) => item.Date.month === month && item.Date.year === year
              );

              const costsForReport = filtered.map((item) => {
                const converted = convert(Number(item.sum), item.currency, currency);
                return { ...item, sumInCurrency: converted };
              });

              let total = 0;
              for (const item of costsForReport) {
                total += item.sumInCurrency;
              }

              resolveRep({
                year: year,
                month: month,
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

        resolve({ addCost, getReport, setRates });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Expose the required global (used by the automatic tester via <script src="idb.js">).
  window.idb = {
    openCostsDB: openCostsDB,
    setRates: setRates,
  };
})();