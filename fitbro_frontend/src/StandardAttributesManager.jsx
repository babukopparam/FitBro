import React, { useEffect, useState } from "react";
import { Paper, Typography, TextField, Checkbox, Button, IconButton, Stack, Snackbar, Alert, Divider, Box, CircularProgress } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const API_BASE = "http://localhost:8000";

export default function StandardAttributesManager() {
    const [attrs, setAttrs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAttr, setNewAttr] = useState({ name: "", type: "number", unit: "", required: false });
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
    const [templateId, setTemplateId] = useState(null);

    // On mount, fetch the FitBro-level standard attributes (is_master=true, gym_id=null)
    useEffect(() => {
        async function fetchAttrs() {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/assessment-templates?master_only=1`);
                const data = await res.json();
                if (!data.length) {
                    // Auto-create master template!
                    await fetch(`${API_BASE}/assessment-templates`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: "FitBro Standard Attribute Pool",
                            template_json: "[]",
                            gym_id: null,
                            is_master: true
                        })
                    });
                    // Now try again
                    return fetchAttrs();
                }
                setTemplateId(data[0].id);
                setAttrs(JSON.parse(data[0].template_json || "[]"));
            } catch (e) {
                setSnack({ open: true, message: "Failed to load: " + e.message, severity: "error" });
            } finally {
                setLoading(false);
            }
        }
        fetchAttrs();
    }, []);

    function handleChange(idx, field, value) {
        setAttrs(list => list.map((a, i) => i === idx ? { ...a, [field]: value } : a));
    }
    function handleRemove(idx) {
        setAttrs(list => list.filter((_, i) => i !== idx));
    }
    function handleAdd() {
        if (!newAttr.name) return;
        setAttrs(list => [...list, newAttr]);
        setNewAttr({ name: "", type: "number", unit: "", required: false });
        setSnack({ open: true, message: "Attribute added!", severity: "success" });
    }
    async function handleSave() {
        if (!templateId) {
            setSnack({ open: true, message: "Cannot save: No master template.", severity: "error" });
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/assessment-templates/${templateId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ template_json: JSON.stringify(attrs) })
            });
            if (!res.ok) throw new Error(await res.text());
            setSnack({ open: true, message: "Standard attributes saved!", severity: "success" });
        } catch (e) {
            setSnack({ open: true, message: "Failed to save: " + e.message, severity: "error" });
        }
    }

    return (
        <Paper elevation={4} sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={2} color="primary.dark">
                Standard Attributes (FitBro Level)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 150 }}>
                    <CircularProgress />
                </Stack>
            ) : (
                <Stack spacing={2}>
                    {attrs.map((attr, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField
                                label="Name"
                                value={attr.name}
                                onChange={e => handleChange(idx, "name", e.target.value)}
                                size="small"
                                sx={{ width: 160 }}
                            />
                            <TextField
                                label="Type"
                                value={attr.type}
                                onChange={e => handleChange(idx, "type", e.target.value)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Unit"
                                value={attr.unit}
                                onChange={e => handleChange(idx, "unit", e.target.value)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <Checkbox
                                checked={!!attr.required}
                                onChange={e => handleChange(idx, "required", e.target.checked)}
                            />
                            <Typography variant="body2">Required</Typography>
                            <IconButton color="error" onClick={() => handleRemove(idx)}><Delete /></IconButton>
                        </Box>
                    ))}
                    {/* New attribute row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField label="Name" value={newAttr.name} onChange={e => setNewAttr(a => ({ ...a, name: e.target.value }))} size="small" sx={{ width: 160 }} />
                        <TextField label="Type" value={newAttr.type} onChange={e => setNewAttr(a => ({ ...a, type: e.target.value }))} size="small" sx={{ width: 120 }} />
                        <TextField label="Unit" value={newAttr.unit} onChange={e => setNewAttr(a => ({ ...a, unit: e.target.value }))} size="small" sx={{ width: 120 }} />
                        <Checkbox checked={!!newAttr.required} onChange={e => setNewAttr(a => ({ ...a, required: e.target.checked }))} />
                        <Typography variant="body2">Required</Typography>
                        <IconButton color="primary" onClick={handleAdd}><Add /></IconButton>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" justifyContent="flex-end">
                        <Button variant="contained" size="large" onClick={handleSave}>Save Attributes</Button>
                    </Stack>
                </Stack>
            )}
            <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
            </Snackbar>
        </Paper>
    );
}
