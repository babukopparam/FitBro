import React, { useState, useEffect } from "react";
import {
    Box, Typography, Grid, Card, CardContent, Button, Stack, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip, Tooltip,
    Snackbar, Alert, CircularProgress, InputAdornment, IconButton, Fab, Zoom, Divider, Switch, FormControlLabel
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import StarIcon from "@mui/icons-material/Star";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArchiveIcon from "@mui/icons-material/Archive";
import DraftsIcon from "@mui/icons-material/Drafts";

const API_BASE = "http://localhost:8000/workouts";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const ROLE = "FitBro Admin"; // Replace with actual role from auth context
const MY_GYM_ID = 1; // Replace with actual gym_id from context
    
export default function WorkoutManager() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [cloneFrom, setCloneFrom] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, workout: null });
    const [formLoading, setFormLoading] = useState(false);
    const [formFields, setFormFields] = useState({ name: "", description: "", program_id: "", active: true });
    const [formTouched, setFormTouched] = useState({});

    useEffect(() => { fetchWorkouts(); }, []);

    async function fetchWorkouts() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(API_BASE + "/", { headers: getAuthHeaders() });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setWorkouts(data);
        } catch {
            setError("Could not fetch workouts. Please try again.");
        }
        setLoading(false);
    }

    function getStatusColor(active) {
        return active ? "success" : "default";
    }

    function getStatusIcon(active) {
        return active ? <CheckCircleIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />;
    }

    const canEdit = (workout) =>
        (ROLE === "FitBro Admin" && workout.is_master) ||
        (ROLE !== "FitBro Admin" && !workout.is_master && workout.gym_id === MY_GYM_ID);

    const canClone = (workout) =>
        !cloneFrom &&
        ((ROLE !== "FitBro Admin" && workout.is_master) ||
            (ROLE === "FitBro Admin" && workout.is_master));

    const filteredWorkouts = workouts.filter(w => {
        const matchSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase())
            || (w.description || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "All" ||
            (statusFilter === "Active" ? w.active : !w.active);
        return matchSearch && matchStatus;
    });
    const masterWorkouts = filteredWorkouts.filter((w) => w.is_master);
    const gymWorkouts = filteredWorkouts.filter((w) => !w.is_master && w.gym_id === MY_GYM_ID);

    function resetFormFields(obj) {
        setFormFields({
            name: obj?.name || "",
            description: obj?.description || "",
            program_id: obj?.program_id || "",
            active: typeof obj?.active === "boolean" ? obj.active : true,
        });
        setFormTouched({});
    }

    function handleEdit(workout) {
        setEditing(workout);
        setCloneFrom(null);
        resetFormFields(workout);
        setShowForm(true);
    }
    function handleClone(workout) {
        setCloneFrom(workout);
        setEditing(null);
        resetFormFields({ ...workout, name: `Cloned - ${workout.name}` });
        setShowForm(true);
    }
    function handleAdd() {
        setEditing(null);
        setCloneFrom(null);
        resetFormFields({});
        setShowForm(true);
    }

    function handleFieldChange(e) {
        setFormFields(f => ({ ...f, [e.target.name]: e.target.value }));
        setFormTouched(t => ({ ...t, [e.target.name]: true }));
    }

    function handleSwitchChange(e) {
        setFormFields(f => ({ ...f, [e.target.name]: e.target.checked }));
    }

    function isFormValid() {
        return (
            formFields.name.trim().length > 0 &&
            formFields.program_id && !isNaN(Number(formFields.program_id))
        );
    }
    const [programs, setPrograms] = useState([]);
    useEffect(() => {
        fetch("http://localhost:8000/programs/", { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => setPrograms(data));
    }, []);
    async function handleSave(e) {
        e.preventDefault();
        setFormLoading(true);
        setError(""); setSuccess("");
        const data = {
            name: formFields.name,
            description: formFields.description,
            program_id: Number(formFields.program_id),
            gym_id: cloneFrom ? MY_GYM_ID : (editing ? editing.gym_id : (ROLE === "FitBro Admin" ? null : MY_GYM_ID)),
            is_master: cloneFrom ? false : (editing ? editing.is_master : (ROLE === "FitBro Admin")),
            parent_id: cloneFrom ? cloneFrom.id : (editing ? editing.parent_id : null),
            active: !!formFields.active,
        };
        try {
            let res, workout;
            if (editing) {
                res = await fetch(`${API_BASE}/${editing.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error();
                workout = await res.json();
                setWorkouts((prev) => prev.map((w) => (w.id === workout.id ? workout : w)));
                setSuccess("Workout updated!");
            } else {
                res = await fetch(API_BASE + "/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error();
                workout = await res.json();
                setWorkouts((prev) => [...prev, workout]);
                setSuccess(cloneFrom ? "Workout cloned!" : "Workout created!");
            }
            setShowForm(false);
        } catch {
            setError("Failed to save workout. Please try again.");
        }
        setFormLoading(false);
    }

    function handleCloseForm() {
        setShowForm(false);
        setEditing(null);
        setCloneFrom(null);
        setFormLoading(false);
    }

    function handleDeleteRequest(workout) {
        setDeleteDialog({ open: true, workout });
    }
    async function handleDeleteConfirm() {
        const id = deleteDialog.workout.id;
        setError(""); setSuccess("");
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error();
            setWorkouts((prev) => prev.filter((w) => w.id !== id));
            setSuccess("Workout deleted!");
        } catch {
            setError("Failed to delete workout.");
        }
        setDeleteDialog({ open: false, workout: null });
    }
    function handleDeleteCancel() {
        setDeleteDialog({ open: false, workout: null });
    }

    function renderWorkoutCard(workout, isMaster) {
        return (
            <Card
                key={workout.id}
                sx={{
                    borderRadius: 3,
                    boxShadow: 2,
                    p: 1,
                    transition: "transform 0.18s, box-shadow 0.18s",
                    "&:hover": {
                        transform: "translateY(-2px) scale(1.015)",
                        boxShadow: 5,
                    },
                    background: workout.active
                        ? "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                        : "white",
                }}
            >
                <CardContent sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                        <FitnessCenterIcon color={isMaster ? "primary" : "secondary"} />
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: 17, sm: 19 } }}>
                            {workout.name}
                        </Typography>
                        {isMaster && (
                            <Tooltip title="Master Workout">
                                <StarIcon color="warning" fontSize="small" />
                            </Tooltip>
                        )}
                        <Chip
                            icon={getStatusIcon(workout.active)}
                            label={workout.active ? "Active" : "Inactive"}
                            color={getStatusColor(workout.active)}
                            size="small"
                            sx={{ fontSize: 11, fontWeight: 500, ml: 1 }}
                        />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mb={1} sx={{ fontSize: { xs: 13.5, sm: 15 } }}>
                        {workout.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>
                        Program ID: <span style={{ color: "#1976d2" }}>{workout.program_id}</span>
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
                        {canEdit(workout) && (
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEdit(workout)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canClone(workout) && (
                            <Tooltip title="Clone">
                                <IconButton size="small" onClick={() => handleClone(workout)}>
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canEdit(workout) && (
                            <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleDeleteRequest(workout)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    function LoadingSkeleton() {
        return (
            <Grid container columns={{ xs: 12, sm: 12, md: 12 }} columnSpacing={2} rowSpacing={2}>
                {[...Array(6)].map((_, i) => (
                    <Grid key={i} sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" } }}>
                        <Card sx={{ borderRadius: 3, p: 2 }}>
                            <Box sx={{ height: 120, background: "#eee", borderRadius: 2 }} />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Typography variant="h4" fontWeight="bold" flex={1}>
                    Workout Management
                </Typography>
                <Chip
                    label={`Role: ${ROLE}`}
                    color="info"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 500 }}
                />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
                <TextField
                    placeholder="Search workouts�"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm("")}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    sx={{ width: { xs: "100%", sm: 300 } }}
                />
                <TextField
                    select
                    size="small"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FilterListIcon />
                            </InputAdornment>
                        )
                    }}
                    sx={{ width: { xs: "100%", sm: 170 } }}
                >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && (
                <Snackbar
                    open={!!success}
                    autoHideDuration={3200}
                    onClose={() => setSuccess("")}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert onClose={() => setSuccess("")} severity="success" variant="filled" sx={{ width: '100%' }}>
                        {success}
                    </Alert>
                </Snackbar>
            )}

            {loading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    {/* Master Workouts */}
                    <Stack direction="row" alignItems="center" gap={1} mb={1} mt={2}>
                        <StarIcon color="warning" />
                        <Typography variant="h6" fontWeight="bold">
                            Master Workouts
                        </Typography>
                        <Chip size="small" label={masterWorkouts.length} color="warning" />
                    </Stack>
                    {masterWorkouts.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            {searchTerm || statusFilter !== "All"
                                ? "No master workouts match your search/filter."
                                : "No master workouts available."}
                        </Alert>
                    ) : (
                        <Grid container columns={{ xs: 12, sm: 12, md: 12 }} columnSpacing={2} rowSpacing={2} mb={3}>
                            {masterWorkouts.map(w => (
                                <Grid key={w.id} sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" } }}>
                                    {renderWorkoutCard(w, true)}
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Gym-level Workouts */}
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                        <FitnessCenterIcon color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                            Your Gym Workouts
                        </Typography>
                        <Chip size="small" label={gymWorkouts.length} color="secondary" />
                    </Stack>
                    {gymWorkouts.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            {searchTerm || statusFilter !== "All"
                                ? "No gym workouts match your search/filter."
                                : "No gym workouts created yet. Start by cloning a master workout or creating a new one!"}
                        </Alert>
                    ) : (
                        <Grid container columns={{ xs: 12, sm: 12, md: 12 }} columnSpacing={2} rowSpacing={2} mb={3}>
                            {gymWorkouts.map(w => (
                                <Grid key={w.id} sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" } }}>
                                    {renderWorkoutCard(w, false)}
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            <Zoom in={!loading}>
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={handleAdd}
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        boxShadow: 4,
                        zIndex: 999
                    }}
                >
                    <AddIcon />
                </Fab>
            </Zoom>

            {/* Add/Edit/Clone Dialog */}
            <Dialog open={showForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <form onSubmit={handleSave} autoComplete="off">
                    <DialogTitle>
                        <Stack direction="row" alignItems="center" gap={1}>
                            {editing ? <EditIcon /> : cloneFrom ? <ContentCopyIcon /> : <AddIcon />}
                            <Typography variant="h6">
                                {editing
                                    ? "Edit Workout"
                                    : cloneFrom
                                        ? `Clone: ${cloneFrom.name}`
                                        : "Create New Workout"}
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField
                            name="name"
                            label="Workout Name"
                            required
                            value={formFields.name}
                            onChange={handleFieldChange}
                            error={formTouched.name && formFields.name.trim().length === 0}
                            helperText={
                                formTouched.name && formFields.name.trim().length === 0
                                    ? "Name is required"
                                    : ""
                            }
                            fullWidth
                            autoFocus
                            variant="outlined"
                            size="medium"
                        />
                        <TextField
                            name="description"
                            label="Description"
                            value={formFields.description}
                            onChange={handleFieldChange}
                            multiline
                            minRows={2}
                            fullWidth
                            variant="outlined"
                            size="medium"
                        />
                        <TextField
                            select
                            name="program_id"
                            label="Program"
                            required
                            value={formFields.program_id}
                            onChange={handleFieldChange}
                            error={formTouched.program_id && !formFields.program_id}
                            helperText={formTouched.program_id && !formFields.program_id ? "Please select a program" : ""}
                            fullWidth
                            variant="outlined"
                            size="medium"
                        >
                            <MenuItem value="">Select Program</MenuItem>
                            {programs.map(program => (
                                <MenuItem key={program.id} value={program.id}>
                                    {program.name}
                                </MenuItem>
                            ))}
                        </TextField> 
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formFields.active}
                                    name="active"
                                    color="primary"
                                    onChange={handleSwitchChange}
                                />
                            }
                            label="Active"
                            sx={{ ml: 0.5, mt: 1 }}
                        />
                        {cloneFrom && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                                Cloning from "{cloneFrom.name}" for your gym.
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseForm} disabled={formLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={formLoading || !isFormValid()}
                            startIcon={formLoading ? <CircularProgress size={18} /> : null}
                        >
                            {formLoading
                                ? "Saving..."
                                : editing
                                    ? "Update"
                                    : cloneFrom
                                        ? "Clone"
                                        : "Create"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete workout
                        <b> {deleteDialog.workout?.name}</b>? This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteConfirm}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
