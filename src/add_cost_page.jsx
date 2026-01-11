// Add Cost page: controlled form for creating a new cost item.
import { useState } from 'react';
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
} from '@mui/material';
import ContentCard from './components/content_card';

export default function AddCostPage({ db }) {
    // Controlled form state
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState('');
    const [sum, setSum] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');

    // Validate input and persist a new cost item via the DB API
    async function handleSubmit() {
        setStatus('');
        // DB might not be ready on first render
        if (!db) { setStatus('DB not ready'); return; }
        if (!category || !currency || !sum || !description) { setStatus('Fill all fields'); return; }
        // Build the cost object in the shape expected by idb.addCost()
        const cost = { sum: Number(sum), currency, category, description };
        try {
            await db.addCost(cost);
            setStatus('Saved');
            setCategory('');
            setCurrency('');
            setSum('');
            setDescription('');
        } catch (err) {
            setStatus('Save failed: ' + err.message);
        }
    }
    // Enable submit only when all required fields are filled
    const canSubmit = Boolean(db && category && currency && sum && description);
    return (
        <ContentCard>
            <Stack spacing={2}>
                <Typography variant='h5'>Add Cost</Typography>

                <FormControl fullWidth>
                    <InputLabel id='category-label'>Category</InputLabel>
                    <Select
                        labelId='category-label'
                        label='Category'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}>
                        <MenuItem value='FOOD'>Food</MenuItem>
                        <MenuItem value='CAR'>Car</MenuItem>
                        <MenuItem value='EDUCATION'>Education</MenuItem>
                        <MenuItem value='HEALTH'>Health</MenuItem>
                        <MenuItem value='OTHER'>Other</MenuItem>
                    </Select>
                </FormControl>

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

                <TextField
                    label='Sum'
                    type='text'
                    inputMode='decimal'
                    value={sum}
                    onChange={(e) => {
                        // Allow only numbers with up to 2 decimal places
                        const next = e.target.value;
                        if (/^\d*(\.\d{0,2})?$/.test(next)) {
                            setSum(next);
                        }
                    }}
                    fullWidth/>

                <TextField
                    label='Description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth/>

                <Button variant='contained' onClick={handleSubmit} disabled={!canSubmit}>
                    Submit
                </Button>

                {status && (
                    <Alert severity={status.startsWith('Save failed') ? 'error' : 'info'}>
                        {status}
                    </Alert>
                    
                )}
            </Stack>
        </ContentCard>
    );
}