import React, { useState } from "react";
import {
    Box, Typography, TextField, Button, Stack, Paper, Alert, CircularProgress
} from "@mui/material";

const GYM_API = "http://localhost:8000/gyms/";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CreateGym() {
    const [form, setForm] = useState({
        name: "",
        address: "",
        owner_name: "",
        owner_email: "",
        owner_mobile: "",
        contract_start: "",
        contract_end: "",
        recurring_start: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = e => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true); setSuccess(""); setError("");
        try {
            const res = await fetch(GYM_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(await res.text());
            setSuccess("Gym created successfully!");
            setForm({
                name: "",
                address: "",
                owner_name: "",
                owner_email: "",
                owner_mobile: "",
                contract_start: "",
                contract_end: "",
                recurring_start: "",
            });
        } catch (err) {
            setError("Failed to create gym: " + err.message);
        }
        setSubmitting(false);
    };

    return (
        <Paper elevation={2} sx={{ maxWidth: 480, mx: "auto", p: 3, mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>Create New Gym</Typography>
            <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        label="Gym Name" name="name" value={form.name} onChange={handleChange}
                        required fullWidth autoFocus
                    />
                    <TextField
                        label="Gym Address/Location" name="address" value={form.address}
                        onChange={handleChange} required fullWidth
                    />
                    <TextField
                        label="Owner Name" name="owner_name" value={form.owner_name}
                        onChange={handleChange} required fullWidth
                    />
                    <TextField
                        label="Owner Email" name="owner_email" value={form.owner_email}
                        onChange={handleChange} required type="email" fullWidth
                    />
                    <TextField
                        label="Owner Mobile Number" name="owner_mobile" value={form.owner_mobile}
                        onChange={handleChange} required fullWidth
                    />
                    <TextField
                        label="Contract Start Date" name="contract_start" type="date"
                        value={form.contract_start} onChange={handleChange} InputLabelProps={{ shrink: true }}
                        required fullWidth
                    />
                    <TextField
                        label="Recurring Revenue Start Date" name="recurring_start" type="date"
                        value={form.recurring_start} onChange={handleChange} InputLabelProps={{ shrink: true }}
                        required fullWidth
                    />
                    <TextField
                        label="Contract End Date" name="contract_end" type="date"
                        value={form.contract_end} onChange={handleChange} InputLabelProps={{ shrink: true }}
                        required fullWidth
                    />
                    {success && <Alert severity="success">{success}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button
                        type="submit" variant="contained" size="large"
                        disabled={
                            submitting ||
                            !form.name || !form.address || !form.owner_name ||
                            !form.owner_email || !form.owner_mobile ||
                            !form.contract_start || !form.recurring_start || !form.contract_end
                        }
                        startIcon={submitting && <CircularProgress size={20} />}
                    >
                        {submitting ? "Submitting..." : "Create Gym"}
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
}
