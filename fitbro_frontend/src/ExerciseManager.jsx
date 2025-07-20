import React, { useState, useEffect } from "react";
import {
    Box, Typography, Grid, Card, CardContent, Button, Stack, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip,
    Snackbar, Alert, CircularProgress, IconButton, Fab, Zoom, Divider, MenuItem, Select, InputLabel, FormControl, OutlinedInput
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";

const EXERCISE_API = "http://localhost:8000/exercises";
const WORKOUT_API = "http://localhost:8000/workouts";
const EQUIPMENT_API = "http://localhost:8000/equipment/";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ExerciseManager() {
    const [exercises, setExercises] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formFields, setFormFields] = useState({
        name: "", description: "", type: "",
        primaryMuscle: "", secondaryMuscle: "",
        equipment_id: "", is_master: false, workout_id: "",
    });
    const [formTouched, setFormTouched] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, exercise: null });

    useEffect(() => { fetchAll(); }, []);
    async function fetchAll() {
        setLoading(true);
        setError("");
        try {
            const resEx = await fetch(EXERCISE_API + "/", { headers: getAuthHeaders() });
            setExercises(await resEx.json());
            const resWo = await fetch(WORKOUT_API + "/", { headers: getAuthHeaders() });
            setWorkouts(await resWo.json());
            const resEq = await fetch(EQUIPMENT_API, { headers: getAuthHeaders() });
            setEquipments(await resEq.json());
        } catch {
            setError("Could not fetch exercises, workouts, or equipments.");
        }
        setLoading(false);
    }

    function resetFormFields(obj) {
        setFormFields({
            name: obj?.name || "",
            description: obj?.description || "",
            type: obj?.type || "",
            primaryMuscle: obj?.primary_muscles || obj?.primaryMuscle || "",
            secondaryMuscle: obj?.secondary_muscles || obj?.secondaryMuscle || "",
            equipment_id: obj?.equipment_id ?? "",
            is_master: !!obj?.is_master,
            workout_id: obj?.workout_id || "",
        });
        setFormTouched({});
    }

    function handleAdd() {
        setEditing(null);
        resetFormFields({});
        setShowForm(true);
    }
    function handleEdit(ex) {
        setEditing(ex);
        resetFormFields(ex);
        setShowForm(true);
    }
    function handleCloseForm() {
        setShowForm(false);
        setEditing(null);
        setFormLoading(false);
    }

    function handleFieldChange(e) {
        const { name, value } = e.target;
        setFormFields(f => ({ ...f, [name]: value }));
        setFormTouched(t => ({ ...t, [name]: true }));
    }

    function isFormValid() {
        return (
            formFields.name.trim().length > 0 &&
            formFields.primaryMuscle.trim().length > 0 &&
            formFields.workout_id !== ""
        );
    }

    async function handleSave(e) {
        e.preventDefault();
        setFormLoading(true);
        setError(""); setSuccess("");
        // Build API payload exactly as backend expects!
        const data = {
            name: formFields.name,
            description: formFields.description || "",
            workout_id: parseInt(formFields.workout_id),
            is_time_based: false,
            primary_muscles: formFields.primaryMuscle || "",
            secondary_muscles: formFields.secondaryMuscle || "",
            gym_id: null,
            is_master: formFields.is_master,
            parent_id: null,
            is_enabled: true,
            equipment_id: formFields.equipment_id ? parseInt(formFields.equipment_id) : null
        };
        try {
            let res, ex;
            if (editing) {
                res = await fetch(`${EXERCISE_API}/${editing.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders(),
                    },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error();
                ex = await res.json();
                setExercises(prev => prev.map((x) => (x.id === ex.id ? ex : x)));
                setSuccess("Exercise updated!");
            } else {
                res = await fetch(EXERCISE_API + "/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders(),
                    },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error();
                ex = await res.json();
                setExercises(prev => [...prev, ex]);
                setSuccess("Exercise created!");
            }
            setShowForm(false);
        } catch {
            setError("Failed to save exercise.");
        }
        setFormLoading(false);
    }

    function handleDeleteRequest(ex) {
        setDeleteDialog({ open: true, exercise: ex });
    }
    async function handleDeleteConfirm() {
        const id = deleteDialog.exercise.id;
        setError(""); setSuccess("");
        try {
            const res = await fetch(`${EXERCISE_API}/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error();
            setExercises(prev => prev.filter(x => x.id !== id));
            setSuccess("Exercise deleted!");
        } catch {
            setError("Failed to delete exercise.");
        }
        setDeleteDialog({ open: false, exercise: null });
    }
    function handleDeleteCancel() {
        setDeleteDialog({ open: false, exercise: null });
    }

    // Filtering
    const filteredExercises = exercises.filter(ex =>
    (ex.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.primary_muscles?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.secondary_muscles?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.type?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    function renderExerciseCard(ex) {
        let workoutName = "";
        if (ex.workout_id && workouts.length > 0) {
            const w = workouts.find(wk => wk.id === ex.workout_id);
            if (w) workoutName = w.name;
        }
        let equipmentName = "None";
        if (ex.equipment_id && equipments.length > 0) {
            const eq = equipments.find(eq => eq.id === ex.equipment_id);
            if (eq) equipmentName = eq.name;
        }
        return (
            <Card key={ex.id} sx={{
                borderRadius: 3, boxShadow: 2, p: 1,
                background: "#fcfcfc", minHeight: 180,
                "&:hover": { boxShadow: 5, transform: "scale(1.015)" }
            }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                        <FitnessCenterIcon color="secondary" />
                        <Typography variant="h6" fontWeight="bold">{ex.name}</Typography>
                        {ex.is_master && <Chip label="Master" color="primary" size="small" />}
                    </Stack>
                    <Typography variant="body2"><b>Primary:</b> {ex.primary_muscles}</Typography>
                    <Typography variant="body2"><b>Secondary:</b> {ex.secondary_muscles}</Typography>
                    <Typography variant="body2"><b>Description:</b> {ex.description}</Typography>
                    <Typography variant="body2"><b>Workout:</b> {workoutName}</Typography>
                    <Typography variant="body2"><b>Equipment:</b> {equipmentName}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(ex)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteRequest(ex)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Typography variant="h4" fontWeight="bold" flex={1}>Exercise Management</Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
                <TextField
                    placeholder="Search exercises…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <SearchIcon />
                        ),
                        endAdornment: searchTerm && (
                            <IconButton size="small" onClick={() => setSearchTerm("")}>
                                <ClearIcon />
                            </IconButton>
                        )
                    }}
                    sx={{ width: { xs: "100%", sm: 300 } }}
                />
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
                <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={2}>
                    {filteredExercises.map(ex => (
                        <Grid item xs={12} sm={6} md={4} key={ex.id}>
                            {renderExerciseCard(ex)}
                        </Grid>
                    ))}
                </Grid>
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

            {/* Add/Edit Dialog */}
            <Dialog open={showForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <form onSubmit={handleSave} autoComplete="off">
                    <DialogTitle>
                        <Stack direction="row" alignItems="center" gap={1}>
                            {editing ? <EditIcon /> : <AddIcon />}
                            <Typography variant="h6">
                                {editing ? "Edit Exercise" : "Create New Exercise"}
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        {/* Associated Workout (First Element) */}
                        <FormControl fullWidth required error={formTouched.workout_id && !formFields.workout_id}>
                            <InputLabel>Associated Workout</InputLabel>
                            <Select
                                name="workout_id"
                                value={formFields.workout_id}
                                onChange={handleFieldChange}
                                input={<OutlinedInput label="Associated Workout" />}
                            >
                                {workouts.map(w => (
                                    <MenuItem key={w.id} value={w.id}>
                                        {w.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            name="name"
                            label="Exercise Name"
                            required
                            value={formFields.name}
                            onChange={handleFieldChange}
                            error={formTouched.name && formFields.name.trim().length === 0}
                            helperText={formTouched.name && formFields.name.trim().length === 0 ? "Name is required" : ""}
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
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={2}
                        />
                        <TextField
                            name="primaryMuscle"
                            label="Primary Muscle"
                            required
                            value={formFields.primaryMuscle}
                            onChange={handleFieldChange}
                            error={formTouched.primaryMuscle && formFields.primaryMuscle.trim().length === 0}
                            helperText={formTouched.primaryMuscle && formFields.primaryMuscle.trim().length === 0 ? "Required" : ""}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            name="secondaryMuscle"
                            label="Secondary Muscle"
                            value={formFields.secondaryMuscle}
                            onChange={handleFieldChange}
                            fullWidth
                            variant="outlined"
                        />
                        {/* Equipment dropdown */}
                        <FormControl fullWidth>
                            <InputLabel>Equipment (optional)</InputLabel>
                            <Select
                                name="equipment_id"
                                value={formFields.equipment_id}
                                onChange={handleFieldChange}
                                input={<OutlinedInput label="Equipment (optional)" />}
                            >
                                <MenuItem value="">None (Bodyweight/Yoga/Warmup)</MenuItem>
                                {equipments.map(eq => (
                                    <MenuItem key={eq.id} value={eq.id}>
                                        {eq.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseForm} disabled={formLoading}>Cancel</Button>
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
                        Are you sure you want to delete exercise <b>{deleteDialog.exercise?.name}</b>?
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
