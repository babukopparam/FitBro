import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({ onLogin }) {
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    username: mobile,
                    password: password
                }).toString()
            });
            if (!res.ok) throw new Error("Invalid mobile or password");
            const data = await res.json();
            sessionStorage.setItem("token", data.access_token);
            sessionStorage.setItem("role", data.role);
            sessionStorage.setItem("name", data.name);
            onLogin && onLogin(data);
            const redirectTo = location.state?.from?.pathname || "/";
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError("Login failed: " + err.message);
        }
    }

    return (
        <Box sx={{ maxWidth: 350, mx: "auto", mt: 10 }}>
            <Typography variant="h5" mb={2}>Sign In</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleLogin}>
                <TextField
                    label="Mobile"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                >Login</Button>
            </form>
        </Box>
    );
}
