// Simple wrapper component to give pages a consistent card layout.
// Import MUI Paper to provide a consistent, elevated container with built-in styling
import { Paper } from "@mui/material";

// Reusable layout container for page sections, providing consistent padding and border
export default function ContentCard({ children }) {
    return (
        <Paper elevation={0} sx={{
            // Responsive padding for mobile and desktop
            p: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: 'divider'
        }}>
            {/* Paper styling ensures consistent spacing and border around content */}
            {children}
        </Paper>
    );
}