// Simple wrapper component to give pages a consistent card layout.
import { Paper } from "@mui/material";

// Reusable layout container for page sections
export default function ContentCard({ children }) {
    return (
        <Paper elevation={0} sx={{
            // Responsive padding for mobile and desktop
            p: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: 'divider'
        }}>
            {children}
        </Paper>
    );
}