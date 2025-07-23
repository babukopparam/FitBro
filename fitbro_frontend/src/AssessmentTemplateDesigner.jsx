import React, { useEffect, useState } from "react";
import {
    Paper, Typography, TextField, Checkbox, Button, Stack, Snackbar, Alert, Divider, Box, CircularProgress, MenuItem
} from "@mui/material";

const API_BASE = "http://localhost:8000";
const GYM_ID = 1; // Replace with actual logic for current gym

export default function AssessmentTemplateDesigner() {
    const [templates, setTemplates] = useState([]);
    const [attrs, setAttrs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
    const [mode, setMode] = useState("list"); // "list" or "edit"
    const [templateName, setTemplateName] = useState("");
    const [editingId, setEditingId] = useState(null);

    // Load all templates for this gym
    useEffect(() => {
        async function fetchTemplates() {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/assessment-templates?gym_id=${GYM_ID}&is_master=false`);
                const data = await res.json();
                setTemplates(data);
            } catch (e) {
                setSnack({ open: true, message: "Failed to load templates: " + e.message, severity: "error" });
            } finally {
                setLoading(false);
            }
        }
        fetchTemplates();
    }, [mode]);

    // Start new template (reset to gym attribute pool)
    async function startNewTemplate() {
        setEditingId(null);
        setTemplateName("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/assessment-templates?gym_id=${GYM_ID}&name=Gym Attribute Pool`);
            const data = await res.json();
            if (!data.length) throw new Error("No gym attribute pool found. Ask admin to set up.");
            const attrArr = JSON.parse(data[0].template_json || "[]");
            setAttrs(attrArr.map(attr => ({ ...attr, selected: true, required: !!attr.required })));
            setMode("edit");
        } catch (e) {
            setSnack({ open: true, message: e.message, severity: "error" });
            setAttrs([]);
        } finally {
            setLoading(false);
        }
    }

    // Edit existing template
    async function editTemplate(tmpl) {
        setEditingId(tmpl.id);
        setTemplateName(tmpl.name);
        const attrArr = JSON.parse(tmpl.template_json || "[]");
        setAttrs(attrArr.map(attr => ({ ...attr, selected: true, required: !!attr.required })));
        setMode("edit");
    }

    function handleAttrCheck(idx, field, checked) {
        setAttrs(list => list.map((a, i) =>
            i === idx ? { ...a, [field]: checked } : a
        ));
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!templateName.trim()) {
            setSnack({ open: true, message: "Template name required!", severity: "error" });
            return;
        }
        const selectedAttrs = attrs.filter(a => a.selected).map(({ name, type, unit, required }) => ({
            name, type, unit, required
        }));
        if (selectedAttrs.length === 0) {
            setSnack({ open: true, message: "Select at least one attribute!", severity: "error" });
            return;
        }
        const payload = {
            name: templateName.trim(),
            template_json: JSON.stringify(selectedAttrs),
            gym_id: GYM_ID,
            is_master: false
        };
        try {
            let url = `${API_BASE}/assessment-templates`;
            let method = "POST";
            if (editingId) {
                url = `${API_BASE}/assessment-templates/${editingId}`;
                method = "PATCH";
            }
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            setSnack({ open: true, message: "Template saved!", severity: "success" });
            setMode("list");
        } catch (e) {
            setSnack({ open: true, message: "Failed to save: " + e.message, severity: "error" });
        }
    }

    function handleCancel() {
        setMode("list");
        setEditingId(null);
        setTemplateName("");
        setAttrs([]);
    }

    // UI for template list
    if (mode === "list") {
        return (
            <Paper elevation={4} sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={2} color="primary.dark">
                    Assessment Templates
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                    <Button variant="contained" color="primary" onClick={startNewTemplate}>Create New Template</Button>
                    {loading ? (
                        <Stack alignItems="center"><CircularProgress /></Stack>
                    ) : (
                        <Stack>
                            {templates.length === 0 && <Typography>No templates found.</Typography>}
                            {templates.map(tmpl => (
                                <Box key={tmpl.id} sx={{ display: "flex", alignItems: "center", gap: 2, bgcolor: "#f8f8f8", p: 1, borderRadius: 1, my: 1 }}>
                                    <Typography sx={{ flex: 1 }}>{tmpl.name}</Typography>
                                    <Button size="small" variant="outlined" onClick={() => editTemplate(tmpl)}>Edit</Button>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Stack>
                <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
                </Snackbar>
            </Paper>
        );
    }

    // UI for template creation/editing
    return (
        <Paper elevation={4} sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={2} color="primary.dark">
                {editingId ? "Edit Assessment Template" : "Create Assessment Template"}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 150 }}>
                    <CircularProgress />
                </Stack>
            ) : (
                <form onSubmit={handleSave}>
                    <Stack spacing={2}>
                        <TextField
                            label="Template Name"
                            value={templateName}
                            onChange={e => setTemplateName(e.target.value)}
                            required fullWidth
                        />
                        <Divider textAlign="left" sx={{ my: 2 }}>Select Attributes for This Template</Divider>
                        <Stack spacing={1}>
                            {attrs.map((attr, idx) => (
                                <Box
                                    key={attr.name}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        bgcolor: "#f8f8f8",
                                        p: 1,
                                        borderRadius: 1
                                    }}
                                >
                                    <Checkbox
                                        checked={attr.selected}
                                        onChange={e => handleAttrCheck(idx, "selected", e.target.checked)}
                                    />
                                    <Typography sx={{ width: 170 }}>{attr.name}</Typography>
                                    <Typography sx={{ width: 90 }} color="text.secondary">{attr.type}</Typography>
                                    <Typography sx={{ width: 100 }} color="text.secondary">{attr.unit}</Typography>
                                    <Checkbox
                                        checked={attr.required}
                                        onChange={e => handleAttrCheck(idx, "required", e.target.checked)}
                                        disabled={!attr.selected}
                                    />
                                    <Typography variant="body2">Required</Typography>
                                </Box>
                            ))}
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button onClick={handleCancel} variant="outlined">Cancel</Button>
                            <Button type="submit" variant="contained" size="large">{editingId ? "Update" : "Save"} Template</Button>
                        </Stack>
                    </Stack>
                </form>
            )}
            <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
            </Snackbar>
        </Paper>
    );
}
