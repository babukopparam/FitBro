import React from "react";
import { Box, Typography, FormGroup, FormControlLabel, Switch, Divider, Button } from "@mui/material";

export default function Settings() {
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>Settings</Typography>

            <Typography variant="h6" mt={2}>Notifications</Typography>
            <FormGroup>
                <FormControlLabel control={<Switch defaultChecked />} label="Workout Reminders" />
                <FormControlLabel control={<Switch />} label="Announcements & Alerts" />
                <FormControlLabel control={<Switch defaultChecked />} label="Assessment Due Alerts" />
            </FormGroup>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6">General Preferences</Typography>
            <FormGroup>
                <FormControlLabel control={<Switch />} label="Dark Mode (Coming Soon)" />
            </FormGroup>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6">Data & Privacy</Typography>
            <FormGroup>
                <FormControlLabel control={<Switch />} label="Share progress data with instructor" />
                <FormControlLabel control={<Switch />} label="Enable fitness AI recommendations" />
            </FormGroup>

            <Divider sx={{ my: 4 }} />

            <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                Save Settings
            </Button>
        </Box>
    );
}
