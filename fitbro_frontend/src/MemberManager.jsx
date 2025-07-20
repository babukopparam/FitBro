import React, { useState, useEffect } from "react";
import {
    Box, Typography, Card, CardContent, CardActions, Button, IconButton, Snackbar, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, CircularProgress,
    Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";

const MEMBER_API = "http://localhost:8000/members/";
const GYM_API = "http://localhost:8000/gyms/";
const PLAN_API = "http://localhost:8000/membership-plans/";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MemberManager() {
    const [members, setMembers] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setLoading(true);
        setError("");
        try {
            // Fetch members
            const res = await fetch(MEMBER_API, { headers: getAuthHeaders() });
            if (!res.ok) {
                const msg = `Members API failed: ${res.status}`;
                setError(msg);
                alert(msg);
            } else {
                setMembers(await res.json());
            }

            // Fetch gyms
            const gres = await fetch(GYM_API, { headers: getAuthHeaders() });
            if (!gres.ok) {
                const msg = `Gyms API failed: ${gres.status}`;
                setError(msg);
                alert(msg);
            } else {
                setGyms(await gres.json());
            }

            // Fetch membership plans
            const pres = await fetch(PLAN_API, { headers: getAuthHeaders() });
            if (!pres.ok) {
                const msg = `Plans API failed: ${pres.status}`;
                setError(msg);
                alert(msg);
            } else {
                setPlans(await pres.json());
            }
        } catch (e) {
            setError("Failed to fetch data: " + (e?.message || e));
            alert("Failed to fetch data: " + (e?.message || e));
        }
        setLoading(false);
    }

    function handleAdd() {
        setEditing(null);
        setForm({});
        setOpen(true);
    }

    function handleEdit(member) {
        setEditing(member);
        setForm({
            ...member,
            join_date: member.join_date ? member.join_date.substring(0, 10) : "",
            dob: member.dob ? member.dob.substring(0, 10) : "",
            membership_start_date: member.membership_start_date ? member.membership_start_date.substring(0, 10) : "",
            membership_end_date: member.membership_end_date ? member.membership_end_date.substring(0, 10) : ""
        });
        setOpen(true);
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this member?")) return;
        setError(""); setSuccess("");
        try {
            const res = await fetch(MEMBER_API + id, {
                method: "DELETE", headers: getAuthHeaders()
            });
            if (!res.ok) {
                alert(`Delete failed: ${res.status}`);
                throw new Error();
            }
            setMembers((prev) => prev.filter((m) => m.id !== id));
            setSuccess("Deleted successfully!");
        } catch {
            setError("Failed to delete");
        }
    }

    function calculateMembershipEndDate(startDate, planId) {
        const plan = plans.find(p => p.id === Number(planId));
        if (!plan || !startDate) return "";
        const duration = plan.duration_months || 1;
        return dayjs(startDate).add(duration, "month").subtract(1, "day").format("YYYY-MM-DD");
    }

    function handlePlanOrStartDateChange(field, value) {
        let updated = { ...form, [field]: value };
        // If plan or membership start date changes, recalculate end date
        if (field === "membership_plan_id" || field === "membership_start_date") {
            const planId = field === "membership_plan_id" ? value : form.membership_plan_id;
            const startDate = field === "membership_start_date" ? value : form.membership_start_date;
            updated.membership_end_date = calculateMembershipEndDate(startDate, planId);
        }
        setForm(updated);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(""); setSuccess("");
        // Prepare the required payload
        const payload = {
            name: form.name,
            mobile: form.mobile,
            email: form.email,
            photo_url: form.photo_url,
            dob: form.dob,
            gender: form.gender,
            address: form.address,
            join_date: form.join_date,
            gym_id: form.gym_id,
            membership_plan_id: form.membership_plan_id,
            membership_start_date: form.membership_start_date,
            membership_end_date: form.membership_end_date
        };
        try {
            let res, data;
            if (editing) {
                res = await fetch(MEMBER_API + editing.id, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(MEMBER_API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify(payload)
                });
            }
            if (!res.ok) {
                const msg = `Save failed: ${res.status}`;
                setError(msg);
                alert(msg);
                return;
            }
            data = await res.json();
            if (editing) {
                setMembers((prev) => prev.map((m) => (m.id === data.id ? data : m)));
                setSuccess("Member updated!");
            } else {
                setMembers((prev) => [...prev, data]);
                setSuccess("Member created!");
            }
            setOpen(false);
        } catch (e) {
            setError("Save failed: " + err.message);
            console.error("Save failed", err);
            alert("Save failed", err);
            alert("Save failed: " + (e?.message || e));
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3} gap={1}>
                <PersonIcon color="primary" />
                <Typography variant="h4" fontWeight="bold">
                    Members
                </Typography>
            </Box>
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ mb: 2 }}
                onClick={handleAdd}
            >
                Add Member
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
            {success && (
                <Snackbar
                    open={!!success}
                    autoHideDuration={3200}
                    onClose={() => setSuccess("")}
                >
                    <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
                </Snackbar>
            )}
            {loading ? <CircularProgress sx={{ mt: 5 }} /> : (
                <Grid container spacing={2}>
                    {members.map((member) => (
                        <Grid item xs={12} sm={6} md={4} key={member.id}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold">
                                        {member.name}
                                    </Typography>
                                    <Typography variant="body2"><b>Mobile:</b> {member.mobile}</Typography>
                                    <Typography variant="body2"><b>Email:</b> {member.email}</Typography>
                                    <Typography variant="body2"><b>Photo URL:</b> {member.photo_url}</Typography>
                                    <Typography variant="body2"><b>DOB:</b> {member.dob}</Typography>
                                    <Typography variant="body2"><b>Gender:</b> {member.gender}</Typography>
                                    <Typography variant="body2"><b>Address:</b> {member.address}</Typography>
                                    <Typography variant="body2">
                                        <b>Gym:</b> {gyms.find(g => g.id === member.gym_id)?.name || "-"}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Plan:</b> {plans.find(p => p.id === member.membership_plan_id)?.name || "-"}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Join Date:</b> {member.join_date}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Membership Start:</b> {member.membership_start_date || "-"}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Membership End:</b> {member.membership_end_date || "-"}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <IconButton onClick={() => handleEdit(member)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(member.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* Join Date FIRST */}
                        <TextField
                            label="Join Date"
                            name="join_date"
                            required
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.join_date || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Name"
                            name="name"
                            required
                            value={form.name || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Mobile"
                            name="mobile"
                            required
                            value={form.mobile || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            required
                            value={form.email || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Photo URL"
                            name="photo_url"
                            required
                            value={form.photo_url || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            label="DOB"
                            name="dob"
                            required
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.dob || ""}
                            onChange={handleChange}
                        />
                        <FormControl required>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                name="gender"
                                value={form.gender || ""}
                                label="Gender"
                                onChange={handleChange}
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Address"
                            name="address"
                            required
                            value={form.address || ""}
                            onChange={handleChange}
                        />
                        <FormControl required>
                            <InputLabel>Gym</InputLabel>
                            <Select
                                name="gym_id"
                                value={form.gym_id || ""}
                                label="Gym"
                                onChange={handleChange}
                            >
                                {gyms.map(gym => (
                                    <MenuItem key={gym.id} value={gym.id}>{gym.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl required>
                            <InputLabel>Membership Plan</InputLabel>
                            <Select
                                name="membership_plan_id"
                                value={form.membership_plan_id || ""}
                                label="Membership Plan"
                                onChange={e =>
                                    handlePlanOrStartDateChange("membership_plan_id", e.target.value)
                                }
                            >
                                {plans.map(plan => (
                                    <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Membership Start Date"
                            name="membership_start_date"
                            required
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.membership_start_date || ""}
                            onChange={e =>
                                handlePlanOrStartDateChange("membership_start_date", e.target.value)
                            }
                        />
                        <TextField
                            label="Membership End Date"
                            name="membership_end_date"
                            required
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.membership_end_date || ""}
                            onChange={handleChange}
                            disabled // Only calculated
                        />
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
