import React, { useEffect, useState } from "react";
import {
    Box, Typography, Grid, Card, CardContent, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";

const VISITOR_API = "http://localhost:8000/visitors/";
const MEMBERSHIP_API = "http://localhost:8000/membership-plans/";
const VISITOR_FOLLOWUP_API = "http://localhost:8000/visitor-followup/";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function getGymId() {
    try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        return user?.gym_id || 1;
    } catch {
        return 1;
    }
}

export default function VisitorManager() {
    const [visitors, setVisitors] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({});
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPass, setShowPass] = useState("");
    const [followUpDialog, setFollowUpDialog] = useState({ open: false, visitor: null, comment: "", next_followup: "", status: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");

    const gymId = getGymId();

    useEffect(() => {
        fetchVisitors();
        fetchPlans();
    }, []);

    async function fetchVisitors() {
        setLoading(true);
        try {
            const res = await fetch(VISITOR_API + `?gym_id=${gymId}`, { headers: getAuthHeaders() });
            setVisitors(await res.json());
        } catch {
            setError("Failed to load visitors.");
        }
        setLoading(false);
    }

    async function fetchPlans() {
        try {
            const res = await fetch(MEMBERSHIP_API + `?gym_id=${gymId}`, { headers: getAuthHeaders() });
            setPlans(await res.json());
        } catch {
            setPlans([]);
        }
    }

    function handleOpen(visitor = null) {
        setEditing(visitor);
        setForm(visitor ? { ...visitor } : { status: "Contacted" });
        setShowPass("");
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
        setEditing(null);
        setShowPass("");
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function openFollowUpDialog(visitor) {
        setFollowUpDialog({
            open: true,
            visitor,
            comment: "",
            next_followup: "",
            status: visitor.status || "",
        });
    }
    function closeFollowUpDialog() {
        setFollowUpDialog({ open: false, visitor: null, comment: "", next_followup: "", status: "" });
    }
    function handleFollowUpChange(e) {
        const { name, value } = e.target;
        setFollowUpDialog((prev) => ({ ...prev, [name]: value }));
    }

    // Save or update visitor (no duplicate mobile check, no 'name' field)
    async function handleSave() {
        setError(""); setSuccess("");
        setShowPass("");
        setOpen(false);

        const payload = {
            first_name: form.first_name,
            last_name: form.last_name,
            mobile: form.mobile,
            email: form.email,
            fitness_goal: form.fitness_goal,
            gym_id: gymId,
            interested_plan_id: form.interested_plan_id || null,
            status: "Contacted"
        };

        try {
            let res, data;
            if (editing) {
                res = await fetch(VISITOR_API + editing.id, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(VISITOR_API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify(payload)
                });
            }
            if (!res.ok) throw new Error();
            data = await res.json();
            fetchVisitors();
            if (editing) {
                setSuccess("Visitor updated!");
            } else {
                setShowPass(`Your Pass Number for the visit: ${data.id}`);
                setSuccess("Visitor created!");
            }
        } catch (e) {
            setError("Failed to save visitor.");
        }
    }

    // Save new follow-up (MULTIPLE per visitor)
    async function handleFollowUpSave() {
        const v = followUpDialog.visitor;
        closeFollowUpDialog();
        try {
            const payload = {
                comment: followUpDialog.comment,
                next_followup: followUpDialog.next_followup,
                status: followUpDialog.status || v.status,
            };
            const res = await fetch(`${VISITOR_FOLLOWUP_API}${v.id}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error();
            fetchVisitors();
            setSuccess("Visitor follow-up added!");
        } catch {
            setError("Failed to add visitor follow-up.");
        }
    }

    function visitorMatchesSearch(v) {
        const term = searchTerm.trim().toLowerCase();
        if (!term && !followUpDate) return true;
        const nameMatch =
            (v.first_name && v.first_name.toLowerCase().includes(term)) ||
            (v.last_name && v.last_name.toLowerCase().includes(term)) ||
            (v.mobile && v.mobile.includes(term));
        const followUpMatch =
            !followUpDate ||
            (v.last_followup && v.last_followup.startsWith(followUpDate)) ||
            (v.followups && v.followups.some(fu => fu.next_followup && fu.next_followup.startsWith(followUpDate)));
        return nameMatch && followUpMatch;
    }

    const filteredVisitors = visitors.filter(visitorMatchesSearch);

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Visitor Registration
            </Typography>
            {/* Membership plans (view-only, for the gym) */}
            <Typography variant="h6">Membership Plans (View Only)</Typography>
            <Grid container spacing={2} mb={2}>
                {plans.map((p) => (
                    <Grid item xs={12} sm={6} md={4} key={p.id}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6">{p.name}</Typography>
                                <Typography>{p.description}</Typography>
                                <Typography>
                                    {p.price ? `Price: ₹${p.price}` : ""}
                                    {p.duration_months ? ` | Duration: ${p.duration_months} month(s)` : ""}
                                </Typography>
                                {p.plan_type === "Offer" && (
                                    <Typography color="primary">
                                        {`Offer: ${p.offer_start_date?.slice(0, 10) || "-"} to ${p.offer_end_date?.slice(0, 10) || "-"}`}
                                    </Typography>
                                )}
                                <Typography variant="caption">{p.offer_terms}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpen()}>
                + Add Visitor
            </Button>

            {/* SEARCH BAR and FILTERS */}
            <Box mb={2} display="flex" gap={2} alignItems="center">
                <TextField
                    label="Search by Name or Mobile"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    size="small"
                />
                <TextField
                    label="Follow-Up Date"
                    type="date"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="outlined" onClick={() => { setSearchTerm(""); setFollowUpDate(""); }}>Clear</Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {success && (
                <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}>
                    <Alert onClose={() => setSuccess("")} severity="success" variant="filled">{success}</Alert>
                </Snackbar>
            )}
            {showPass && (
                <Alert severity="success" sx={{ mt: 2 }}>{showPass}</Alert>
            )}

            {/* Visitors table */}
            <Grid container spacing={2}>
                {filteredVisitors.map((v) => (
                    <Grid item xs={12} sm={6} md={4} key={v.id}>
                        <Card variant="outlined">
                            <CardContent>
                                {/* Display fresh name */}
                                <Typography variant="h6">
                                    {[v.first_name, v.last_name].filter(Boolean).join(" ")}
                                </Typography>
                                <Typography>Mobile: {v.mobile}</Typography>
                                <Typography>Email: {v.email}</Typography>
                                <Typography>Status: {v.status}</Typography>
                                <Typography>Fitness Goal: {v.fitness_goal}</Typography>
                                <Typography>Interested Plan ID: {v.interested_plan_id || "-"}</Typography>
                                <Typography>Last Follow-up: {v.last_followup || "-"}</Typography>
                                <Typography>Comment: {v.comments || "-"}</Typography>
                                <Button size="small" onClick={() => handleOpen(v)}>Edit</Button>
                                <Button size="small" onClick={() => openFollowUpDialog(v)}>Follow Up</Button>
                                {/* Show followups */}
                                {v.followups && v.followups.length > 0 && (
                                    <Box mt={1}>
                                        <Typography variant="subtitle2">Follow Ups:</Typography>
                                        {v.followups.map(fu => (
                                            <Box key={fu.id} sx={{ ml: 1 }}>
                                                <Typography variant="body2">
                                                    {fu.created_at?.slice(0, 10)} - {fu.comment} (Next: {fu.next_followup || '-'})
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Add/Edit Visitor Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle>{editing ? "Edit Visitor" : "Add Visitor"}</DialogTitle>
                <DialogContent>
                    <TextField name="first_name" label="First Name" value={form.first_name || ""} onChange={handleChange} fullWidth margin="dense" />
                    <TextField name="last_name" label="Last Name" value={form.last_name || ""} onChange={handleChange} fullWidth margin="dense" />
                    <TextField name="mobile" label="Mobile Number" value={form.mobile || ""} onChange={handleChange} fullWidth margin="dense" />
                    <TextField name="email" label="Email" value={form.email || ""} onChange={handleChange} fullWidth margin="dense" />
                    <TextField name="fitness_goal" label="Fitness Goal" value={form.fitness_goal || ""} onChange={handleChange} fullWidth margin="dense" />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Interested Membership Plan</InputLabel>
                        <Select
                            name="interested_plan_id"
                            value={form.interested_plan_id || ""}
                            onChange={handleChange}
                            label="Interested Membership Plan"
                        >
                            <MenuItem value="">None</MenuItem>
                            {plans.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Submit</Button>
                </DialogActions>
            </Dialog>

            {/* Follow-up dialog for instructors/owners */}
            <Dialog open={followUpDialog.open} onClose={closeFollowUpDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Follow Up Visitor</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={followUpDialog.status || ""}
                            onChange={handleFollowUpChange}
                            label="Status"
                        >
                            <MenuItem value="Contacted">Contacted</MenuItem>
                            <MenuItem value="Converted">Converted</MenuItem>
                            <MenuItem value="Not Interested">Not Interested</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        name="comment"
                        label="Comment"
                        value={followUpDialog.comment || ""}
                        onChange={handleFollowUpChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        name="next_followup"
                        label="Next Follow-up Date"
                        type="date"
                        value={followUpDialog.next_followup || ""}
                        onChange={handleFollowUpChange}
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeFollowUpDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleFollowUpSave}>Add Follow Up</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
