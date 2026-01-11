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
  // Input state and generated report
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [currency, setCurrency] = useState('');
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate inputs and request a report from the DB API
  async function generateReport() {
    setMessage('');
    // DB might not be ready yet
    if (!db) { setMessage('DB not ready'); return; }
    if (!year || !month || !currency) { setMessage('Fill all fields'); return; }
    // Month is entered as text; validate it is in calendar range
    const m = Number(month);
    if (m < 1 || m > 12) { setMessage('Month must be 1-12'); return; }
    // Fetch report asynchronously and update UI state
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
  // Derived validation state used for UI feedback and button enablement
  const monthNumber = Number(month);
  const isMonthValid = Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12;
  const canGenerate = Boolean(db && currency && year && month && isMonthValid);

  return (
    <ContentCard>
      <Stack spacing={2}>
        <Typography variant='h5'>Monthly Report</Typography>

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

        <Button variant='contained' onClick={generateReport} disabled={!canGenerate || isLoading}>
          {!isLoading ? 'Generate Report' : 'Loading'}
        </Button>

        {message && (
          <Alert severity='error'>
            {message}
          </Alert>
        )}

        {/* Render report details only after a report was generated */}
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

            <Stack spacing={1}>
              {report.costs.map((c) => (
                <Paper key={c.id} variant='outlined' sx={{ p: 1 }}>
                  <Typography variant='body2'>
                    Day {c.Date.day} — {c.category} — {c.description} — {c.sum} {c.currency}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </ContentCard>
  );
}