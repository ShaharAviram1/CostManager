// App shell: top navigation + page routing and one-time app initialization.
import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Tabs, Tab, Container, Stack, Typography, Box } from '@mui/material';
import { openCostsDB } from './lib/idb.js';
import AddCostPage from './add_cost_page.jsx';
import ReportPage from './report_page.jsx';
import ChartsPage from './charts_page.jsx';
import SettingsPage from './settings_page.jsx';
import BrandIcon from './components/brand_icon.jsx';

function App() {
  const [tab, setTab] = useState(0);
  const [db, setDb] = useState(null);
  const [ratesReady, setRatesReady] = useState(false);
  // One-time init: open IndexedDB and load exchange rates (with a safe fallback).
  useEffect(() => {
    async function init() {
      // Open the DB and expose our small API (addCost/getReport/setRates).
      const dbApi = await openCostsDB('costsdb', 1);
      setDb(dbApi);

      // The project supports exactly these currencies.
      const required = ['USD', 'ILS', 'GBP', 'EURO'];
      const ratesUrl = localStorage.getItem('ratesUrl') || '/rates.json';

      // Fetch + validate rates JSON. Returns null on any validation failure.
      async function tryFetchRates(url) {
        const res = await fetch(url);
        if (!res.ok) {
          return null;
        }

        const rates = await res.json();
        for (const key of required) {
          if (!Number.isFinite(rates[key])) {
            return null;
          }
        }

        return rates;
      }

      try {
        let rates = null;

        try {
          rates = await tryFetchRates(ratesUrl);
        }
        catch {
          rates = null;
        }

        // If a custom URL fails, fall back to our default bundled rates.
        if (!rates && ratesUrl !== '/rates.json') {
          try {
            rates = await tryFetchRates('/rates.json');
          }
          catch {
            rates = null;
          }
        }

        if (rates) {
          await dbApi.setRates(rates);
          setRatesReady(true);
          return;
        }


        console.warn('Failed loading rates');
        setRatesReady(true);
      }
      catch (err) {
        console.warn('Failed loading rates', err);
        setRatesReady(true);
      }
    }

    init();
  }, []);
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  width: 22,
                  height: 22,
                  color: 'primary.main'
                }}
                aria-hidden="true">
              <BrandIcon size={22} showDetails />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                Cost Manager
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Personal expense insights
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            aria-label="Navigation tabs"
          >
            <Tab label="Add" />
            <Tab label="Report" />
            <Tab label="Charts" />
            <Tab label="Settings" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 3 }}>
        {/* Render pages only after DB is ready and rates were attempted to load. */}
        {db && ratesReady && (
          <Box sx={{ mt: 2 }}>
            {tab === 0 && <AddCostPage db={db} />}
            {tab === 1 && <ReportPage db={db} />}
            {tab === 2 && <ChartsPage db={db} />}
            {tab === 3 && <SettingsPage db={db} />}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
