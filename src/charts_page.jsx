// Charts page: generate either a category pie chart (month) or a yearly bar chart.
import { useState } from 'react';
// Helpers that shape report data into the structures Recharts expects.
import { getCategoryTotals, getYearMonthlyTotals } from './util/report_utils';
import { PieChart, BarChart, Tooltip, Legend, XAxis, YAxis, Bar, Pie, Cell } from 'recharts';
import {
    Alert,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Box,
} from '@mui/material';
import ContentCard from './components/content_card';

export default function ChartsPage({ db }) {

    // State tracked: selected chart, year, month, messages, data, currency, loading, and generation flag.
    const [chart, setChart] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [message, setMessage] = useState('');
    const [pieData, setPieData] = useState([]);
    const [barData, setBarData] = useState([]);
    const [currency, setCurrency] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);

    // Color palette for pie slices (repeat if more categories than colors).
    const COLORS = ['#1f4ed8', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6'];


    // Validate inputs and fetch data for the selected chart type.
    async function generateChart() {
        setMessage('');
        if (!db) { setMessage('DB not ready'); return; }
        if (!chart) { setMessage('Select a chart type'); return; }
        if (chart === 'Pie') {
            if (!month || !year) { setMessage('Select year and month'); return; }
            try {
                setIsLoading(true);
                // Get a month report in the selected currency, then aggregate by category.
                const rep = await db.getReport(Number(year), Number(month), currency);
                const data = getCategoryTotals(rep.costs);
                setPieData(data);
                setBarData([]);
                setHasGenerated(true);
            }
            catch (err) {
                setMessage('Generating report failed: ' + err.message);
            }
            finally {
                setIsLoading(false);
            }
            
        }
        else {
            try {
                if (!year) { setMessage('Select a year'); return; }
                setIsLoading(true);
                // Compute totals for all 12 months (missing months default to 0).
                const data = await getYearMonthlyTotals(db, Number(year), currency);
                setBarData(data);
                setPieData([]);
                setHasGenerated(true);
            }
            catch (err) {
                setMessage('Generating report failed: ' + err.message);
            }
            finally {
                setIsLoading(false);
            }
        }
    }

    // Month is text input; validate range only when pie chart is selected.
    const monthNumber = Number(month);
    const monthInvalid = chart === 'Pie' && month !== '' && (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12);

    const canGenerate = Boolean(db && chart && year && currency && (chart === 'Pie' ? month && !monthInvalid : true));

    // Used to decide whether to render a chart vs. an empty-state message.
    const hasPieMeaningfulData = pieData.some((item) => item.value > 0);
    const hasBarMeaningfulData = barData.some((item) => item.total > 0);

    return (
        <ContentCard>
            {/* Main card container for page content */}
            {/* Vertical stack for layout spacing */}
            <Stack spacing={2}>
                {/* Page header */}
                <Typography variant='h5'>Charts</Typography>

                {/* Inputs row: chart type, year, month, currency */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {/* Chart type selector */}
                    <FormControl fullWidth variant='outlined' sx={{ flex: '1 1 0', minWidth: 0 }}>
                        <InputLabel id='chart-type-label'>Chart type</InputLabel>
                        <Select
                            labelId='chart-type-label'
                            value={chart}
                            onChange={(e) => setChart(e.target.value)}
                            label='Chart type'
                            sx={{ '& .MuiSelect-select': { paddingRight: 6, } }}>
                            <MenuItem value='Pie'>Pie chart</MenuItem>
                            <MenuItem value='Bar'>Bar chart</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Year input field */}
                    <TextField
                        label='Year'
                        type='text'
                        inputMode='numeric'
                        value={year}
                        onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
                        fullWidth
                        sx={{ flex: '1 1 0', minWidth: 0 }}/>

                    {/* Month input field, enabled only for pie chart */}
                    <TextField
                        label='Month'
                        type='text'
                        inputMode='numeric'
                        value={month}
                        onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))}
                        slotProps={{ htmlInput: { min: 1, max: 12 } }}
                        disabled={chart !== 'Pie'}
                        error={monthInvalid}
                        helperText={monthInvalid ? 'Month must be 1–12' : ''}
                        fullWidth
                        sx={{ flex: '1 1 0', minWidth: 0 }}/>

                    {/* Currency selector */}
                    <FormControl fullWidth variant='outlined' sx={{ flex: '1 1 0', minWidth: 0 }}>
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

                {/* Generate chart button */}
                <Button variant='contained' onClick={generateChart} disabled={!canGenerate || isLoading}>
                    {isLoading? 'Loading' : 'Generate chart'}
                </Button>

                {/* Warning or info message display */}
                {message && <Alert severity='warning'>{message}</Alert>}

            {/* Chart display area */}
            {(hasGenerated || isLoading) && (
                <Box sx={{ minHeight: 360, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Container box for centering charts or messages */}
                        {/* Pie chart rendering */}
                        {hasPieMeaningfulData && (
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <PieChart width={420} height={320}>
                                    <Pie
                                        data={pieData}
                                        dataKey='value'
                                        nameKey='name'
                                        cx='50%'
                                        cy='50%'
                                        outerRadius={110}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </Box>
                        )}

                        {/* Bar chart rendering */}
                        {hasBarMeaningfulData && (
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <BarChart width={520} height={320} data={barData}>
                                    <XAxis dataKey='month' />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey='total' fill='#1f4ed8' />
                                </BarChart>
                            </Box>
                        )}

                        {/* Loading indicator text */}
                        {isLoading && (
                            <Typography variant='body2' color='text.secondary'>
                                Loading…
                            </Typography>
                        )}
                        {/* No data message */}
                        {!isLoading && hasGenerated && !hasPieMeaningfulData && !hasBarMeaningfulData && (
                            <Typography variant='body2' color='text.secondary'>
                                No data found for the selected period.
                            </Typography>
                        )}
                    </Box>
                )}
            </Stack>
        </ContentCard>
    );
}