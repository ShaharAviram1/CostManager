// This file defines the global Material-UI (MUI) theme for the app, customizing colors, typography, shapes, and component defaults.

import { createTheme } from '@mui/material/styles';

// Defines the app’s color system
export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1f4ed8',
        },
        background: {
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
