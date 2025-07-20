import React from "react";
import { Box, Typography, Card, CardContent, Avatar, Button, Grid } from "@mui/material";

export default function UserProfile() {
    // Dummy user data
    const user = {
        name: "Ramesh Gupta",
        role: "Gym Member",
        email: "ramesh@example.com",
        phone: "+91-9876543210",
        membership: "Cardio + Strength",
        joined: "2024-12-15",
        photo: "",
        status: "Active"
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                User Profile
            </Typography>
            <Card sx={{ borderRadius: 3, maxWidth: 500, mx: "auto" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: "#a7ffeb" }}>
                        {user.photo
                            ? <img src={user.photo} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : user.name[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">{user.name}</Typography>
                        <Typography color="text.secondary">{user.role}</Typography>
                        <Typography color="text.secondary">{user.email}</Typography>
                        <Typography color="text.secondary">{user.phone}</Typography>
                        <Typography color="text.secondary">
                            Membership: {user.membership}
                        </Typography>
                        <Typography color="text.secondary">Joined: {user.joined}</Typography>
                        <Typography color="success.main" fontWeight="bold" mt={1}>
                            {user.status}
                        </Typography>
                    </Box>
                </CardContent>
                <Grid container spacing={2} p={2}>
                    <Grid item>
                        <Button variant="contained" color="primary">Edit Profile</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="outlined" color="secondary">Change Password</Button>
                    </Grid>
                </Grid>
            </Card>
        </Box>
    );
}
