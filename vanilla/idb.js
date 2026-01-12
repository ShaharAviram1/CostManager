/* idb.js - vanilla IndexedDB wrapper exposing window.idb for testing */
(function () {
  'use strict';

  // Exchange rates map (base USD): 1 USD = X <currency>. Defaults to 1:1 until updated.
  let exchangeRates = { USD: 1, ILS: 1, GBP: 1, EURO: 1 };

  // Replace in-memory exchange rates; ignores invalid inputs.
  function setRates(ratesObj) {
    // Ignore invalid input to keep using last known rates
    if (!ratesObj || typeof ratesObj !== 'object') return;
    exchangeRates = ratesObj;
  }

  // Open/create the IndexedDB database and expose API: addCost, getReport, setRates.
  function openCostsDB(databaseName, databaseVersion) {
    return new Promise((resolve, reject) => {
      // Validate inputs
      if (typeof databaseName !== 'string' || databaseName.trim() === '') {
        reject(new Error('Invalid databaseName: must be a non-empty string'));
        return;
      }
      if (typeof databaseVersion !== 'number' || databaseVersion <= 0) {
        reject(new Error('Invalid databaseVersion: must be a positive number'));
        return;
      }

      const request = indexedDB.open(databaseName, databaseVersion);

      // Handle DB schema initialization or upgrade.
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('costs')) {
          db.createObjectStore('costs', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = () => {
        const db = request.result;

        // Add a new cost item; requires sum, currency, category, description.
        function addCost(cost) {
          return new Promise((resolveAdd, rejectAdd) => {
            try {
              // Validate required fields presence and type
              if (
                !cost ||
                typeof cost.sum !== 'number' && typeof cost.sum !== 'string' ||
                !cost.currency ||
                !cost.category ||
                !cost.description
              ) {
                rejectAdd(new Error('Invalid cost object: missing required fields'));
                return;
              }

              // Store timestamp for sorting/debug and structured Date for filtering by month/year
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

        // Convert amount from one currency to another using USD as pivot: amount / fromRate * toRate.
        function convert(amount, fromCurrency, toCurrency) {
          const fromRate = exchangeRates[fromCurrency];
          const toRate = exchangeRates[toCurrency];
          if (!fromRate || !toRate) return amount;
          return (amount / fromRate) * toRate;
        }

        // Get monthly report for year/month in target currency; returns costs with sumInCurrency and total.
        function getReport(year, month, currency) {
          return new Promise((resolveRep, rejectRep) => {
            // Coerce and validate year and month
            const y = Number(year);
            const m = Number(month);
            if (!Number.isInteger(y) || !Number.isInteger(m) || y < 0 || m < 1 || m > 12) {
              rejectRep(new Error('Invalid year or month'));
              return;
            }

            const tx = db.transaction('costs', 'readonly');
            const store = tx.objectStore('costs');
            const req = store.getAll();

            req.onsuccess = () => {
              const allCosts = req.result;
              // Month is stored 1-based (Jan=1).
              const filtered = allCosts.filter(
                (item) => item.Date.month === m && item.Date.year === y
              );

              // Shape items to spec, stripping internal fields like id and timestamp
              const costsForReport = filtered.map((item) => {
                return {
                  sum: Number(item.sum),
                  currency: String(item.currency),
                  category: String(item.category),
                  description: String(item.description),
                  Date: { day: item.Date.day },
                };
              });

              // Compute total in requested currency; individual items keep original sum and currency
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

        resolve({ addCost, getReport, setRates });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Expose the global API for testing.
  window.idb = {
    openCostsDB: openCostsDB,
    setRates: setRates,
  };
})();