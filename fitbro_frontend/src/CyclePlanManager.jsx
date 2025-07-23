import React, { useEffect, useState } from "react";
import {
    Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Alert, Snackbar, Chip, IconButton, Table, TableHead, TableBody,
    TableRow, TableCell, Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const API_BASE = "http://localhost:8000";
function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CyclePlanManager() {
    const [cycles, setCycles] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState({
        id: null,
        member_id: "",
        cycle_number: "",
        start_date: "",
        end_date: "",
        status: "Active"
    });
    const [formMode, setFormMode] = useState("add");
    const [formError, setFormError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, cycle: null });

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setLoading(true);
        // Fetch members
        const mems = await fetch(`${API_BASE}/members/`, { headers: getAuthHeaders() }).then(res => res.json());
        setMembers(mems);
        // Fetch membership plans
        const mp = await fetch(`${API_BASE}/membership-plans/`, { headers: getAuthHeaders() }).then(res => res.json());
        setPlans(mp);
        // Fetch cycles (active only)
        const cycles = await fetch(`${API_BASE}/cycle-plans/`, { headers: getAuthHeaders() }).then(res => res.json());
        setCycles(cycles.filter(c => !c.is_deleted));
        setLoading(false);
    }

    // Helper: get membership plan for a member
    function getMemberPlan(member_id) {
        const m = members.find(m => m.id === member_id);
        if (!m) return "No plan assigned";
        const plan = plans.find(p => p.id === m.membership_plan_id);
        return plan ? plan.name : "No plan assigned";
    }

    // Helper: get member name by id
    function getMemberName(member_id) {
        const m = members.find(m => m.id === member_id);
        return m ? m.name : "Unknown";
    }

    // Start Add
    function handleAdd() {
        setForm({
            id: null,
            member_id: "",
            cycle_number: "",
            start_date: "",
            end_date: "",
            status: "Active"
        });
        setFormMode("add");
        setFormOpen(true);
        setFormError("");
    }

    // Start Edit
    function handleEdit(cycle) {
        setForm({ ...cycle });
        setFormMode("edit");
        setFormOpen(true);
        setFormError("");
    }

    // Form input
    function handleFormChange(e) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }

    // Submit Add/Edit
    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");
        // Validation
        if (!form.member_id || !form.cycle_number || !form.start_date || !form.end_date) {
            setFormError("All fields are required.");
            return;
        }
        if (new Date(form.start_date) >= new Date(form.end_date)) {
            setFormError("Start date must be before end date.");
            return;
        }
        // Only one active cycle per member
        if (
            form.status === "Active" &&
            cycles.some(c =>
                c.member_id === Number(form.member_id) &&
                c.status === "Active" &&
                (formMode === "add" || c.id !== form.id)
            )
        ) {
            setFormError("This member already has an active cycle.");
            return;
        }
        // Prepare payload
        const payload = {
            member_id: Number(form.member_id),
            cycle_number: Number(form.cycle_number),
            start_date: form.start_date,
            end_date: form.end_date,
            status: form.status
        };
        try {
            let res;
            if (formMode === "add") {
                res = await fetch(`${API_BASE}/cycle-plans/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_BASE}/cycle-plans/${form.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify(payload)
                });
            }
            if (!res.ok) throw new Error(await res.text());
            setSuccessMsg(formMode === "add" ? "Cycle added." : "Cycle updated.");
            setFormOpen(false);
            fetchAll();
        } catch (err) {
            setFormError("Could not save: " + (err.message || ""));
        }
    }

    // Start Delete (soft)
    function handleDeleteConfirm(cycle) {
        setDeleteConfirm({ open: true, cycle });
    }
    async function handleDelete() {
        // Soft delete
        try {
            const { cycle } = deleteConfirm;
            await fetch(`${API_BASE}/cycle-plans/${cycle.id}/delete`, {
                method: "PUT",
                headers: { ...getAuthHeaders() }
            });
            setSuccessMsg("Cycle deleted.");
            setDeleteConfirm({ open: false, cycle: null });
            fetchAll();
        } catch {
            setSuccessMsg("");
        }
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4 }}>
            <Stack direction="row" alignItems="center" mb={3} spacing={2}>
                <Typography variant="h5" fontWeight={700}>Cycle Plan Manager</Typography>
                <Button startIcon={<AddIcon />} variant="contained" onClick={handleAdd}>
                    Add Cycle
                </Button>
            </Stack>
            {successMsg && (
                <Snackbar open={!!successMsg} autoHideDuration={2500} onClose={() => setSuccessMsg("")}>
                    <Alert severity="success">{successMsg}</Alert>
                </Snackbar>
            )}
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Member</TableCell>
                        <TableCell>Membership Plan</TableCell>
                        <TableCell>Cycle #</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {cycles.map((c) => (
                        <TableRow key={c.id}>
                            <TableCell>{getMemberName(c.member_id)}</TableCell>
                            <TableCell>{getMemberPlan(c.member_id)}</TableCell>
                            <TableCell>{c.cycle_number}</TableCell>
                            <TableCell>{c.start_date}</TableCell>
                            <TableCell>{c.end_date}</TableCell>
                            <TableCell>
                                <Chip
                                    size="small"
                                    color={
                                        c.status === "Active" ? "success"
                                            : c.status === "Completed" ? "primary"
                                            : c.status === "Terminated" ? "error"
                                            : "default"
                                    }
                                    label={c.status}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title="Edit">
                                    <IconButton onClick={() => handleEdit(c)}><EditIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton onClick={() => handleDeleteConfirm(c)}><DeleteIcon /></IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Add/Edit Cycle Dialog */}
            <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{formMode === "add" ? "Add Cycle" : "Edit Cycle"}</DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                        {formMode === "add" ? (
                            <TextField
                                select
                                name="member_id"
                                label="Member"
                                required
                                value={form.member_id}
                                onChange={handleFormChange}
                                fullWidth
                            >
                                <MenuItem value="">Select Member</MenuItem>
                                {members.map(m => (
                                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                ))}
                            </TextField>
                        ) : (
                            <TextField label="Member" value={getMemberName(form.member_id)} InputProps={{ readOnly: true }} fullWidth />
                        )}
                        <TextField
                            label="Membership Plan"
                            value={getMemberPlan(form.member_id)}
                            InputProps={{ readOnly: true }}
                            fullWidth
                        />
                        <TextField
                            name="cycle_number"
                            label="Cycle Number"
                            type="number"
                            required
                            value={form.cycle_number}
                            onChange={handleFormChange}
                            fullWidth
                        />
                        <TextField
                            name="start_date"
                            label="Start Date"
                            type="date"
                            required
                            InputLabelProps={{ shrink: true }}
                            value={form.start_date}
                            onChange={handleFormChange}
                            fullWidth
                        />
                        <TextField
                            name="end_date"
                            label="End Date"
                            type="date"
                            required
                            InputLabelProps={{ shrink: true }}
                            value={form.end_date}
                            onChange={handleFormChange}
                            fullWidth
                        />
                        <TextField
                            select
                            name="status"
                            label="Status"
                            value={form.status}
                            onChange={handleFormChange}
                            required
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Terminated">Terminated</MenuItem>
                            <MenuItem value="Future">Future</MenuItem>
                        </TextField>
                        {formError && <Alert severity="error">{formError}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setFormOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">{formMode === "add" ? "Add" : "Update"}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, cycle: null })}>
                <DialogTitle>Delete Cycle?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete cycle #{deleteConfirm.cycle?.cycle_number} for {getMemberName(deleteConfirm.cycle?.member_id)}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false, cycle: null })}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
