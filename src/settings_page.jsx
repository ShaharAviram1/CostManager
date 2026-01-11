// Settings page: configure where exchange rates are fetched from.
import { useState } from 'react';
import {
    Alert,
    Button,
    Divider,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ContentCard from './components/content_card';

export default function SettingsPage({ db }) {
    // Persisted URL for fetching exchange rates (advanced usage)
    const [url, setUrl] = useState(() => {
        const saved = localStorage.getItem('ratesUrl');
        return saved || '/rates.json';
    });
    // User-facing status message after attempting to load rates
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch rates JSON, validate it, and store it in the DB
    async function loadRates() {
        setStatus('');
        // DB may not be ready yet if the app is still initializing
        if (!db) { setStatus('DB not ready'); return; }

        // Fallback to default rates file if input is empty
        const finalUrl = url.trim() || '/rates.json';
        try {
            setIsLoading(true);
            const res = await fetch(finalUrl);
            if (!res.ok) {
                setStatus('Failed fetching rates');
                return;
            }
            const rates = await res.json();
            db.setRates(rates);
            localStorage.setItem('ratesUrl', finalUrl);
            setUrl(finalUrl);
            setStatus('Rates loaded');
        }
        catch (err) {
            console.error(err);
            setStatus('Failed fetching rates');
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <ContentCard>
            <Stack spacing={2}>
                <Stack spacing={0.5}>
                    <Typography variant='h5'>Settings</Typography>
                    <Typography variant='body2' color='text.secondary'>
                        Configure where the app fetches currency exchange rates.
                    </Typography>
                </Stack>

                <Divider />

                {/* URL input for exchange rates source */}
                <TextField
                    label='Exchange rates URL'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    fullWidth
                    placeholder='/rates.json'
                    helperText='Advanced: leave as default unless you know what you’re doing.'
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    URL
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                {/* Trigger rate fetch and persistence */}
                <Button variant='contained' onClick={loadRates} disableElevation disabled={isLoading}>
                    Apply
                </Button>

                {/* Feedback after attempting to load rates */}
                {status && (
                    <Alert
                        severity={status === 'Rates loaded' ? 'success' : 'warning'}
                        variant='outlined'
                        sx={{ mt: 1 }}
                    >
                        {status}
                    </Alert>
                )}
            </Stack>
        </ContentCard>
    );
}