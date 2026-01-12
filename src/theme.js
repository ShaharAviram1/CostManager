// Utility to create a centralized MUI theme object
import { createTheme } from '@mui/material/styles';

// Defines the app’s color system
export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            // Primary brand color used across buttons and highlights
            main: '#1f4ed8',
        },
        background: {
            // App’s global page background color
            default: '#f6f7fb',
            paper: '#ffffff',
        },
        text: {
            primary: '#111827',
            secondary: '#6b7280',
        },
        divider: 'rgba(17, 24, 39, 0.08)',
    },
    // Rounded-corner design choice for a softer UI
    shape: {
        borderRadius: 12,
    },
    // Font choices and consistency across the app
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica',
            'Arial',
            'Apple Color Emoji',
            'Segoe UI Emoji',
        ].join(','),
        h5: {
            // Style used for page titles and section headers
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        subtitle1: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    // Global component defaults and overrides
    components: {
        // Baseline CSS resets and global styles
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#f6f7fb',
                },
            },
        },
        // Button default props to disable elevation
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
        },
        // Paper component default elevation and background style
        MuiPaper: {
            defaultProps: {
                elevation: 2,
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        // Default variant for TextField components
        MuiTextField: {
            defaultProps: {
                // Enforces a consistent input style across the app
                variant: 'outlined',
            },
        },
        // Default variant for Select components
        MuiSelect: {
            defaultProps: {
                variant: 'outlined',
            },
        },
    },
});
