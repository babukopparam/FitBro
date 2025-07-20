import React, { useEffect, useState } from "react";
import {
    Paper, Stack, Typography, TextField, Select, MenuItem, Button, Snackbar, Alert, Divider, Box, CircularProgress
} from "@mui/material";

const API_BASE = "http://localhost:8000";
const GYM_ID = 1; // Replace with logic for logged-in gym

export default function AssessmentEntry_Pro() {
    const [members, setMembers] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedMember, setSelectedMember] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [attrs, setAttrs] = useState([]);
    const [form, setForm] = useState({});
    const [assessmentDate, setAssessmentDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
    const [loading, setLoading] = useState(true);
    console.log("AssessmentEntry_Pro loaded!");

    // Load gym members
    useEffect(() => {
        async function fetchMembers() {
            try {
                const res = await fetch(`${API_BASE}/members?gym_id=${GYM_ID}`);
                const data = await res.json();
                setMembers(data);
            } catch (e) {
                setSnack({ open: true, message: "Failed to load members: " + e.message, severity: "error" });
            }
        }
        fetchMembers();
    }, []);

    // Load templates
    useEffect(() => {
        async function fetchTemplates() {
            try {
                const res = await fetch(`${API_BASE}/assessment-templates?gym_id=${GYM_ID}&is_master=false`);
                const data = await res.json();
                setTemplates(data);
            } catch (e) {
                setSnack({ open: true, message: "Failed to load templates: " + e.message, severity: "error" });
            }
        }
        fetchTemplates();
    }, []);

    // Load attributes for selected template
    useEffect(() => {
        if (!selectedTemplate) return setAttrs([]);
        async function fetchAttrs() {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/assessment-templates/${selectedTemplate}`);
                const data = await res.json();
                setAttrs(JSON.parse(data.template_json || "[]"));
            } catch (e) {
                setSnack({ open: true, message: "Failed to load attributes: " + e.message, severity: "error" });
                setAttrs([]);
            } finally {
                setLoading(false);
            }
        }
        fetchAttrs();
    }, [selectedTemplate]);

    function handleField(attr, value) { setForm(f => ({ ...f, [attr]: value })); }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedMember || !selectedTemplate) {
            setSnack({ open: true, message: "Select member and template!", severity: "error" });
            return;
        }
        try {
            const payload = {
                member_id: selectedMember,
                template_id: selectedTemplate,
                taken_at: assessmentDate,
                result_json: JSON.stringify(form)
            };
            const res = await fetch(`${API_BASE}/assessment-results`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            setSnack({ open: true, message: "Assessment saved!", severity: "success" });
            setForm({});
            setSelectedTemplate("");
            setAttrs([]);
        } catch (e) {
            setSnack({ open: true, message: "Failed to save: " + e.message, severity: "error" });
        }
    }

    return (
        <Paper elevation={4} sx={{ maxWidth: 700, mx: "auto", p: 4, mt: 4, borderRadius: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h5" fontWeight="bold" color="primary.dark">
                    Fitness Assessment Entry
                </Typography>
                <Divider />
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormField
                        label="Member"
                        value={selectedMember}
                        onChange={e => setSelectedMember(e.target.value)}
                        options={members.map(m => ({ value: m.id, label: `${m.name} (${m.mobile})` }))}
                    />
                    <FormField
                        label="Assessment Template"
                        value={selectedTemplate}
                        onChange={e => setSelectedTemplate(e.target.value)}
                        options={templates.map(t => ({ value: t.id, label: t.name }))}
                    />
                    <TextField
                        label="Assessment Date"
                        type="date"
                        size="small"
                        value={assessmentDate}
                        onChange={e => setAssessmentDate(e.target.value)}
                        sx={{ width: 160 }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Stack>
                <Divider />
                {loading && selectedTemplate ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 120 }}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    attrs.length > 0 && (
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2} mt={2}>
                                {attrs.map(attr => (
                                    <Box key={attr.name} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: "#f8f8f8", p: 1, borderRadius: 1 }}>
                                        <TextField
                                            label={attr.name}
                                            value={form[attr.name] || ""}
                                            onChange={e => handleField(attr.name, e.target.value)}
                                            type={attr.type}
                                            required={attr.required}
                                            size="small"
                                            sx={{ width: 160 }}
                                        />
                                        {attr.unit && <Typography ml={1} variant="body2">{attr.unit}</Typography>}
                                    </Box>
                                ))}
                                <Stack direction="row" justifyContent="flex-end" mt={2}>
                                    <Button type="submit" variant="contained" size="large">Save Assessment</Button>
                                </Stack>
                            </Stack>
                        </form>
                    )
                )}
            </Stack>
            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
            </Snackbar>
        </Paper>
    );
}

// Helper component for Select+Label
function FormField({ label, value, onChange, options }) {
    return (
        <FormControl sx={{ minWidth: 180 }}>
            <Typography variant="body2" color="textSecondary">{label}</Typography>
            <Select value={value} onChange={onChange} size="small" displayEmpty>
                <MenuItem value=""><em>Select {label}</em></MenuItem>
                {options.map(opt =>
                    <MenuItem value={opt.value} key={opt.value}>{opt.label}</MenuItem>
                )}
            </Select>
        </FormControl>
    );
}
