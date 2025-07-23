import React, { useState, useRef } from "react";
import {
    Box, Typography, TextField, Button, Stack, Paper, Avatar, Alert, CircularProgress
} from "@mui/material";

const GYM_API = "http://localhost:8000/gyms/";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function GymSetup({ gymId = 1 }) {
    // gymId: for now, hardcoded; use actual logged-in gymId in your flow
    const [form, setForm] = useState({
        name: "",
        address: "",
        logo_url: "",
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const logoInputRef = useRef();

    // Optionally: useEffect to fetch initial gym info here

    const handleChange = e => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleLogoChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    // Save gym info (PUT)
    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true); setSuccess(""); setError("");
        try {
            // 1. Update basic info
            const res = await fetch(`${GYM_API}${gymId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    name: form.name,
                    address: form.address,
                }),
            });
            if (!res.ok) throw new Error(await res.text());

            // 2. Logo upload, if new file selected
            if (logoFile) {
                const formData = new FormData();
                formData.append("file", logoFile);
                const logoRes = await fetch(`${GYM_API}${gymId}/upload_logo`, {
                    method: "POST",
                    headers: {
                        ...getAuthHeaders(),
                    },
                    body: formData,
                });
                if (!logoRes.ok) throw new Error(await logoRes.text());
                const data = await logoRes.json();
                setForm(f => ({ ...f, logo_url: data.logo_url }));
            }

            setSuccess("Gym info updated successfully!");
        } catch (err) {
            setError("Failed to update gym: " + err.message);
        }
        setSubmitting(false);
    };

    return (
        <Paper elevation={2} sx={{ maxWidth: 500, mx: "auto", p: 3, mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>Complete Gym Setup</Typography>
            <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        label="Gym Name" name="name" value={form.name} onChange={handleChange}
                        required fullWidth
                    />
                    <TextField
                        label="Address" name="address" value={form.address} onChange={handleChange}
                        required fullWidth
                    />
                    <Box>
                        <Button
                            variant="outlined"
                            component="label"
                            onClick={() => logoInputRef.current.click()}
                        >
                            Upload Gym Logo
                            <input
                                ref={logoInputRef}
                                type="file"
                                hidden accept="image/*"
                                onChange={handleLogoChange}
                            />
                        </Button>
                        {logoPreview && (
                            <Avatar src={logoPreview} alt="Logo Preview" sx={{ width: 72, height: 72, mt: 2 }} />
                        )}
                        {!logoPreview && form.logo_url && (
                            <Avatar src={form.logo_url} alt="Logo" sx={{ width: 72, height: 72, mt: 2 }} />
                        )}
                    </Box>
                    {success && <Alert severity="success">{success}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button
                        type="submit" variant="contained" size="large"
                        disabled={submitting || !form.name || !form.address}
                        startIcon={submitting && <CircularProgress size={20} />}
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
}
