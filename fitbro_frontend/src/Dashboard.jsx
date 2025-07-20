import React from "react";
import { Box, Typography, Grid, Card, CardContent, Button, Avatar, Stack } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import AnnouncementIcon from "@mui/icons-material/Announcement";

export default function Dashboard() {
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Dashboard
            </Typography>
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 1.5, borderRadius: 3, bgcolor: "#e3f2fd", minHeight: 112 }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "#1976d2" }}>
                                <PeopleIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Total Active Members
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    134
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 1.5, borderRadius: 3, bgcolor: "#fffde7" }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "#ffc107" }}>
                                <TrendingUpIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Visitor Conversion Rate
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    38%
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 1.5, borderRadius: 3, bgcolor: "#ede7f6" }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "#673ab7" }}>
                                <HistoryEduIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Upcoming Renewals
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    11
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Expiring in 30 days
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 1.5, borderRadius: 3, bgcolor: "#fce4ec" }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "#d81b60" }}>
                                <EventBusyIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Inactive Members
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    9
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Not logged in 14 days
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 1.5, borderRadius: 3, bgcolor: "#f3e5f5" }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "#8e24aa" }}>
                                <AssessmentIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Assessments Due
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    7
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Due in 7 days
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 1.5, borderRadius: 3, bgcolor: "#e8f5e9" }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "#43a047" }}>
                                <MonetizationOnIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Revenue (This Month)
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    ₹78,500
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 1.5, borderRadius: 3, bgcolor: "#e3f2fd" }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "#2196f3" }}>
                                <ThumbUpAltIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Feedback (Rating)
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    4.7 / 5
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    (last 30 days)
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Announcements/Alerts as a full-width card below all stats */}
            <Box my={3}>
                <Card sx={{ borderRadius: 3, bgcolor: "#fff3e0", minHeight: 108, px: 3, py: 2 }}>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <AnnouncementIcon sx={{ mr: 2, color: "#ef6c00" }} />
                            <Typography variant="h6" fontWeight="bold">
                                Announcements & Alerts
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="textSecondary">
                            <b>Tomorrow: </b> Gym will be closed 2-4pm for equipment maintenance.
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mt={1}>
                            <b>New Group Class: </b> HIIT Express on Mondays, 7:30pm.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Typography variant="h6" mb={2}>
                Quick Actions
            </Typography>
            <Stack direction="row" spacing={2} mb={2}>
                <Button variant="contained" color="primary">
                    Log Today’s Workout
                </Button>
                <Button variant="contained" color="secondary">
                    Add Assessment
                </Button>
                <Button variant="outlined" color="primary">
                    See Announcements
                </Button>
                <Button variant="outlined" color="secondary">
                    View Members
                </Button>
            </Stack>
        </Box>
    );
}
