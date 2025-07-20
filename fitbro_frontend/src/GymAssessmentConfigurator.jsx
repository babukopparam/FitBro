import React, { useEffect, useState } from "react";
import { Paper, Typography, TextField, Checkbox, Button, IconButton, Stack, Snackbar, Alert, Divider, Box, CircularProgress } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const API_BASE = "http://localhost:8000";
const GYM_ID = 1; // Replace with logged-in user's gym_id!

export default function GymAssessmentConfigurator() {
    const [stdAttrs, setStdAttrs] = useState([]);
    const [selected, setSelected] = useState([]); // booleans: which std attrs are included
    const [customs, setCustoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
    const [newAttr, setNewAttr] = useState({ name: "", type: "number", unit: "" });
    const [templateId, setTemplateId] = useState(null);

    // Fetch standard (FitBro) attrs and gym custom attrs
    useEffect(() => {
        async function fetchAttrs() {
            setLoading(true);
            try {
                // 1. Get standard attributes
                const stdRes = await fetch(`${API_BASE}/assessment-templates?master_only=1`);
                const stdData = await stdRes.json();
                const stdList = JSON.parse((stdData[0] && stdData[0].template_json) || "[]");
                setStdAttrs(stdList);
                // 2. Get gym-level template (attribute pool for this gym, is_master=false, gym_id=this gym)
                const gymRes = await fetch(`${API_BASE}/assessment-templates?gym_id=${GYM_ID}`);
                const gymData = await gymRes.json();
                if (gymData.length) {
                    setTemplateId(gymData[0].id);
                    const gymAttrs = JSON.parse(gymData[0].template_json || "[]");
                    // Figure out which stdAttrs are included, and customs
                    const gymStd = stdList.map(attr =>
                        !!gymAttrs.find(a => a.name === attr.name)
                    );
                    setSelected(gymStd);
                    const gymCustoms = gymAttrs.filter(a => !stdList.find(sa => sa.name === a.name));
                    setCustoms(gymCustoms);
                } else {
                    setSelected(stdList.map(() => true));
                    setCustoms([]);
                }
            } catch (e) {
                setSnack({ open: true, message: "Failed to load: " + e.message, severity: "error" });
            } finally {
                setLoading(false);
            }
        }
        fetchAttrs();
    }, []);

    function handleCheck(idx, checked) {
        setSelected(sel => sel.map((s, i) => i === idx ? checked : s));
    }
    function handleCustomChange(idx, field, value) {
        setCustoms(list => list.map((a, i) => i === idx ? { ...a, [field]: value } : a));
    }
    function handleCustomRemove(idx) {
        setCustoms(list => list.filter((_, i) => i !== idx));
    }
    function handleCustomAdd() {
        if (!newAttr.name) return;
        setCustoms(list => [...list, newAttr]);
        setNewAttr({ name: "", type: "number", unit: "" });
        setSnack({ open: true, message: "Custom attribute added!", severity: "success" });
    }
    async function handleSave() {
        const finalAttrs = [
            ...stdAttrs.filter((_, i) => selected[i]),
            ...customs
        ];
        try {
            if (templateId) {
                // PATCH update existing gym-level template
                const res = await fetch(`${API_BASE}/assessment-templates/${templateId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ template_json: JSON.stringify(finalAttrs) })
                });
                if (!res.ok) throw new Error(await res.text());
            } else {
                // POST new template for this gym
                const res = await fetch(`${API_BASE}/assessment-templates`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Gym Attribute Pool",
                        template_json: JSON.stringify(finalAttrs),
                        gym_id: GYM_ID,
                        is_master: false
                    })
                });
                if (!res.ok) throw new Error(await res.text());
            }
            setSnack({ open: true, message: "Assessment template saved!", severity: "success" });
        } catch (e) {
            setSnack({ open: true, message: "Failed to save: " + e.message, severity: "error" });
        }
    }

    return (
        <Paper elevation={4} sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={2} color="primary.dark">
                Gym Assessment Configurator
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 150 }}>
                    <CircularProgress />
                </Stack>
            ) : (
                <>
                    <Typography variant="h6" sx={{ mt: 2 }}>Standard Attributes</Typography>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                        {stdAttrs.map((attr, idx) => (
                            <Box key={attr.name} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: "#f8f8f8", p: 1, borderRadius: 1 }}>
                                <Typography sx={{ width: 160 }}>{attr.name}</Typography>
                                <Typography sx={{ width: 100 }}>{attr.type}</Typography>
                                <Typography sx={{ width: 100 }}>{attr.unit}</Typography>
                                <Checkbox
                                    checked={selected[idx]}
                                    onChange={e => handleCheck(idx, e.target.checked)}
                                />
                                <Typography variant="body2">Include</Typography>
                            </Box>
                        ))}
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6">Custom Attributes</Typography>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                        {customs.map((attr, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: "#f8f8f8", p: 1, borderRadius: 1 }}>
                                <TextField label="Name" value={attr.name} onChange={e => handleCustomChange(idx, "name", e.target.value)} size="small" sx={{ width: 160 }} />
                                <TextField label="Type" value={attr.type} onChange={e => handleCustomChange(idx, "type", e.target.value)} size="small" sx={{ width: 100 }} />
                                <TextField label="Unit" value={attr.unit} onChange={e => handleCustomChange(idx, "unit", e.target.value)} size="small" sx={{ width: 100 }} />
                                <IconButton color="error" onClick={() => handleCustomRemove(idx)}><Delete /></IconButton>
                            </Box>
                        ))}
                        {/* New custom row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField label="Name" value={newAttr.name} onChange={e => setNewAttr(a => ({ ...a, name: e.target.value }))} size="small" sx={{ width: 160 }} />
                            <TextField label="Type" value={newAttr.type} onChange={e => setNewAttr(a => ({ ...a, type: e.target.value }))} size="small" sx={{ width: 100 }} />
                            <TextField label="Unit" value={newAttr.unit} onChange={e => setNewAttr(a => ({ ...a, unit: e.target.value }))} size="small" sx={{ width: 100 }} />
                            <IconButton color="primary" onClick={handleCustomAdd}><Add /></IconButton>
                        </Box>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" justifyContent="flex-end">
                        <Button variant="contained" size="large" onClick={handleSave}>Save Configuration</Button>
                    </Stack>
                </>
            )}
            <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
            </Snackbar>
        </Paper>
    );
}
