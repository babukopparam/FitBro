import React, { useState, useEffect } from "react";
import {
    Box, Typography, Card, CardContent, CardActions, Button, IconButton, Snackbar, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Grid,
    CircularProgress, Chip, InputLabel, FormControl, OutlinedInput
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const PLAN_API = "http://localhost:8000/membership-plans/";
const PROGRAM_API = "http://localhost:8000/programs/";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MembershipPlanManager() {
    const [plans, setPlans] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({ plan_type: "Regular", status: "Active", program_ids: [] });

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setLoading(true);
        try {
            // Fetch plans
            const res = await fetch(PLAN_API, { headers: getAuthHeaders() });
            setPlans(await res.json());
            // Fetch programs
            const pres = await fetch(PROGRAM_API, { headers: getAuthHeaders() });
            setPrograms(await pres.json());
        } catch {
            setError("Failed to fetch data");
        }
        setLoading(false);
    }

    function handleAdd() {
        setEditing(null);
        setForm({ plan_type: "Regular", status: "Active", program_ids: [] });
        setOpen(true);
    }
    function handleEdit(plan) {
        setEditing(plan);
        setForm({
            ...plan,
            program_ids: plan.programs ? plan.programs.map(p => p.id) : [],
            offer_start_date: plan.offer_start_date ? plan.offer_start_date.substring(0, 10) : "",
            offer_end_date: plan.offer_end_date ? plan.offer_end_date.substring(0, 10) : "",
        });
        setOpen(true);
    }
    async function handleDelete(id) {
        if (!window.confirm("Delete this plan?")) return;
        setError(""); setSuccess("");
        try {
            const res = await fetch(PLAN_API + id, {
                method: "DELETE", headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error();
            setPlans((prev) => prev.filter((p) => p.id !== id));
            setSuccess("Deleted successfully!");
        } catch {
            setError("Failed to delete");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(""); setSuccess("");
        // Default gym_id for testing if not available (remove in prod)
        const gym_id = form.gym_id || 1;
        // Build payload according to backend model
        const payload = {
            name: form.name,
            description: form.description,
            program_ids: form.program_ids || [],
            duration_months: parseInt(form.duration_months, 10),
            plan_type: form.plan_type,
            price: parseInt(form.price, 10),
            status: form.status,
            gym_id: gym_id,
            offer_terms: form.offer_terms,
        };
        if (form.plan_type === "Offer") {
            payload.offer_start_date = form.offer_start_date;
            payload.offer_end_date = form.offer_end_date;
        }
        try {
            let res, data;
            if (editing) {
                res = await fetch(PLAN_API + editing.id, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(PLAN_API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify(payload)
                });
            }
            if (!res.ok) throw new Error();
            data = await res.json();
            if (editing) {
                setPlans((prev) => prev.map((p) => (p.id === data.id ? data : p)));
                setSuccess("Plan updated!");
            } else {
                setPlans((prev) => [...prev, data]);
                setSuccess("Plan created!");
            }
            setOpen(false);
        } catch {
            setError("Save failed.");
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }
    function handleProgramsSelect(e) {
        setForm((prev) => ({ ...prev, program_ids: e.target.value }));
    }

    // Only show offer fields if "Offer" is selected
    const isOffer = form.plan_type === "Offer";

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3} gap={1}>
                <GroupIcon color="primary" />
                <Typography variant="h4" fontWeight="bold">
                    Membership Plans
                </Typography>
            </Box>
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ mb: 2 }}
                onClick={handleAdd}
            >
                Add Plan
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
            {success && (
                <Snackbar
                    open={!!success}
                    autoHideDuration={3000}
                    onClose={() => setSuccess("")}
                >
                    <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
                </Snackbar>
            )}
            {loading ? <CircularProgress sx={{ mt: 5 }} /> : (
                <Grid container spacing={2}>
                    {plans.map((plan) => (
                        <Grid item xs={12} sm={6} md={4} key={plan.id}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold">
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {plan.description}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Programs:</b>{" "}
                                        {(plan.programs || []).map(p => p.name).join(", ")}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Type:</b> {plan.plan_type}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Duration (months):</b> {plan.duration_months}
                                    </Typography>
                                    {plan.plan_type === "Offer" && (
                                        <>
                                            <Typography variant="body2">
                                                <b>Offer Start:</b> {plan.offer_start_date}
                                            </Typography>
                                            <Typography variant="body2">
                                                <b>Offer End:</b> {plan.offer_end_date}
                                            </Typography>
                                            <Typography variant="body2">
                                                <b>Offer Terms:</b> {plan.offer_terms}
                                            </Typography>
                                        </>
                                    )}
                                    <Typography variant="body2">
                                        <b>Price:</b> ₹{plan.price}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Status:</b> {plan.status}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <IconButton onClick={() => handleEdit(plan)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(plan.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? "Edit Plan" : "Add Plan"}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Plan Name"
                            name="name"
                            required
                            value={form.name || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            required
                            value={form.description || ""}
                            onChange={handleChange}
                        />
                        <FormControl>
                            <InputLabel>Programs</InputLabel>
                            <Select
                                name="program_ids"
                                multiple
                                value={form.program_ids || []}
                                onChange={handleProgramsSelect}
                                input={<OutlinedInput label="Programs" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((id) => {
                                            const prog = programs.find(p => p.id === id);
                                            return prog ? <Chip key={id} label={prog.name} /> : null;
                                        })}
                                    </Box>
                                )}
                            >
                                {programs.map((prog) => (
                                    <MenuItem key={prog.id} value={prog.id}>{prog.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <InputLabel>Type</InputLabel>
                            <Select
                                name="plan_type"
                                value={form.plan_type || "Regular"}
                                label="Type"
                                onChange={handleChange}
                            >
                                <MenuItem value="Regular">Regular</MenuItem>
                                <MenuItem value="Offer">Offer</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Duration (months)"
                            name="duration_months"
                            type="number"
                            required
                            value={form.duration_months || ""}
                            onChange={handleChange}
                        />
                        {isOffer && (
                            <>
                                <TextField
                                    label="Offer Start Date"
                                    name="offer_start_date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    value={form.offer_start_date || ""}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Offer End Date"
                                    name="offer_end_date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    value={form.offer_end_date || ""}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Offer Terms & Conditions"
                                    name="offer_terms"
                                    required
                                    value={form.offer_terms || ""}
                                    onChange={handleChange}
                                />
                            </>
                        )}
                        <TextField
                            label="Price"
                            name="price"
                            type="number"
                            required
                            value={form.price || ""}
                            onChange={handleChange}
                        />
                        <FormControl>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={form.status || "Active"}
                                label="Status"
                                onChange={handleChange}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
