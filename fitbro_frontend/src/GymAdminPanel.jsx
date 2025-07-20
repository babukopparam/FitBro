import React from "react";
import { Box, Typography, Card, CardContent, Grid, Button, Divider } from "@mui/material";
import AssessmentIcon from '@mui/icons-material/Assessment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';

export default function GymAdminPanel() {
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Gym Admin Panel
            </Typography>
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <FitnessCenterIcon color="primary" sx={{ fontSize: 32 }} />
                            <Typography variant="h6" fontWeight="bold" mt={2}>Programs & Workouts</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Manage all programs and workouts for your gym. Clone from FitBro library or create custom.
                            </Typography>
                            <Button variant="contained" color="primary" href="/programs" size="small">Manage Programs</Button>
                            <Button variant="contained" color="secondary" href="/workouts" sx={{ ml: 2 }} size="small">Manage Workouts</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <GroupIcon color="primary" sx={{ fontSize: 32 }} />
                            <Typography variant="h6" fontWeight="bold" mt={2}>Members & Plans</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Add or approve new members, assign plans, monitor membership and renewals.
                            </Typography>
                            <Button variant="contained" color="primary" href="/members" size="small">Manage Members</Button>
                            <Button variant="contained" color="secondary" href="/plans" sx={{ ml: 2 }} size="small">Membership Plans</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
                            <Typography variant="h6" fontWeight="bold" mt={2}>Assessments</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Configure and assign fitness assessments, track member progress, view analytics.
                            </Typography>
                            <Button variant="contained" color="primary" href="/assessment-templates" size="small">Assessment Templates</Button>
                            <Button variant="contained" color="secondary" href="/assessments" sx={{ ml: 2 }} size="small">Assessments</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Divider sx={{ my: 4 }} />
            <Box>
                <Typography variant="h6" mb={1}>Settings & Equipment</Typography>
                <Button variant="outlined" color="primary" href="/equipment" size="small" sx={{ mr: 2 }}>
                    Manage Equipment
                </Button>
                <Button variant="outlined" color="secondary" href="/settings" size="small">
                    Gym Settings
                </Button>
            </Box>
        </Box>
    );
}
