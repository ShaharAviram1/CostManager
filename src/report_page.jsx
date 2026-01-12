// Monthly Report page: collects inputs and displays a generated cost report.
import { useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Divider,
  Box,
} from '@mui/material';
import ContentCard from './components/content_card';

export default function ReportPage({ db }) {
  // Year input state
  const [year, setYear] = useState('');
  // Month input state
  const [month, setMonth] = useState('');
  // Selected currency state
  const [currency, setCurrency] = useState('');
  // Generated report data state
  const [report, setReport] = useState(null);
  // User-facing message state (errors, info)
  const [message, setMessage] = useState('');
  // Loading flag state for async operations
  const [isLoading, setIsLoading] = useState(false);

  // Validate inputs and request a monthly report from the IndexedDB layer
  async function generateReport() {
    setMessage('');
    // DB might not be ready yet
    if (!db) { setMessage('DB not ready'); return; }
    if (!year || !month || !currency) { setMessage('Fill all fields'); return; }
    // Month is entered as text; validate it is in calendar range
    const m = Number(month);
    if (m < 1 || m > 12) { setMessage('Month must be 1-12'); return; }
    // Async flow: start loading, fetch report, update UI, handle errors, stop loading
    try {
      setIsLoading(true);
      const rep = await db.getReport(Number(year), m, currency);
      setReport(rep);
      setMessage('');
    }
    catch (err) {
      setMessage('Generating report failed: ' + err.message);
    }
    finally {
      setIsLoading(false);
    }
  }
  // Derived values used only for UI validation and button enablement
  const monthNumber = Number(month);
  const isMonthValid = Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12;
  const canGenerate = Boolean(db && currency && year && month && isMonthValid);

  return (
    <ContentCard>
      <Stack spacing={2}>
        {/* Page header */}
        <Typography variant='h5'>Monthly Report</Typography>

        {/* Input controls */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label='Year'
            type='text'
            inputMode='numeric'
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
            fullWidth/>

          <TextField
            label='Month'
            type='text'
            inputMode='numeric'
            value={month}
            onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))}
            error={month !== '' && !isMonthValid}
            helperText={month !== '' && !isMonthValid ? 'Month must be 1–12' : ' '}
            fullWidth/>

          <FormControl fullWidth>
            <InputLabel id='currency-label'>Currency</InputLabel>
            <Select
              labelId='currency-label'
              label='Currency'
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}>
              <MenuItem value='USD'>USD</MenuItem>
              <MenuItem value='ILS'>ILS</MenuItem>
              <MenuItem value='GBP'>GBP</MenuItem>
              <MenuItem value='EURO'>EURO</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Generate button */}
        <Button variant='contained' onClick={generateReport} disabled={!canGenerate || isLoading}>
          {!isLoading ? 'Generate Report' : 'Loading'}
        </Button>

        {/* Error message area */}
        {message && (
          <Alert severity='error'>
            {message}
          </Alert>
        )}

        {/* Report output: summary and items list */}
        {report && (
          <Box>
            <Divider sx={{ my: 2 }} />

            <Typography variant='h6'>
              Report for {report.month}/{report.year}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              Total: {Number(report.total.total).toLocaleString(undefined, { maximumFractionDigits: 2 })} {report.total.currency}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              Items: {report.costs.length}
            </Typography>

            {report.costs.length === 0 ? (
              <Alert severity='info'>No costs found for this month.</Alert>
            ) : (
              <Stack spacing={1}>
                {report.costs.map((c) => (
                  // Report items intentionally do not include internal DB IDs, so use composite key
                  <Paper key={`${c.Date.day}-${c.category}-${c.description}`} variant='outlined' sx={{ p: 1 }}>
                    <Typography variant='body2'>
                      Day {c.Date.day} — {c.category} — {c.description} — {c.sum} {c.currency}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Stack>
    </ContentCard>
  );
}