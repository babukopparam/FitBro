import React, { useState, useEffect } from "react";
import {
    Box, Typography, Grid, Card, CardContent, Button, Stack, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip, Tooltip,
    Snackbar, Alert, CircularProgress, InputAdornment, IconButton, Fab, Zoom, Divider, Autocomplete
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
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

const API_BASE = "http://localhost:8000/programs";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const ROLE = "FitBro Admin"; // Replace with actual role from auth context
const MY_GYM_ID = "XYZ_GYM_ID"; // Replace with real gym_id from user context

export default function ProgramManager() {
    const [programs, setPrograms] = useState([]);
    const [allWorkouts, setAllWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [cloneFrom, setCloneFrom] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, program: null });
    const [formLoading, setFormLoading] = useState(false);

    const [formFields, setFormFields] = useState({
        name: "",
        description: "",
        goals: "",
        workouts: [],
        status: "Active"
    });
    const [formTouched, setFormTouched] = useState({});

    useEffect(() => {
        fetchPrograms();
        fetchWorkouts();
        // eslint-disable-next-line
    }, []);

    async function fetchPrograms() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(API_BASE + "/", {
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPrograms(data);
        } catch {
            setError("Could not fetch programs. Please try again.");
        }
        setLoading(false);
    }

    async function fetchWorkouts() {
        try {
            const res = await fetch("http://localhost:8000/workouts/", {
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setAllWorkouts(data); // Each workout: {id, name, ...}
        } catch {
            setError("Could not fetch workouts.");
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case "Active": return "success";
            case "Archived": return "default";
            case "Draft": return "warning";
            default: return "success";
        }
    }

    function getStatusIcon(status) {
        switch (status) {
            case "Active": return <CheckCircleIcon fontSize="small" />;
            case "Archived": return <ArchiveIcon fontSize="small" />;
            case "Draft": return <DraftsIcon fontSize="small" />;
            default: return <CheckCircleIcon fontSize="small" />;
        }
    }

    const canEdit = (program) =>
        (ROLE === "FitBro Admin" && program.is_master) ||
        (ROLE !== "FitBro Admin" && !program.is_master && program.gym_id === MY_GYM_ID);

    const canClone = (program) =>
        !cloneFrom &&
        ((ROLE !== "FitBro Admin" && program.is_master) ||
            (ROLE === "FitBro Admin" && program.is_master));

    const filteredPrograms = programs.filter(program => {
        const matchSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase())
            || (program.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchStatus = statusFilter === "All" || program.status === statusFilter;
        return matchSearch && matchStatus;
    });
    const masterPrograms = filteredPrograms.filter((p) => p.is_master);
    const gymPrograms = filteredPrograms.filter((p) => !p.is_master && p.gym_id === MY_GYM_ID);

    function resetFormFields(obj) {
        setFormFields({
            name: obj?.name || "",
            description: obj?.description || "",
            goals: obj?.goals || "",
            workouts: obj?.workouts || [], // always an array of workout IDs
            status: obj?.status || "Active",
        });
        setFormTouched({});
    }

    function handleEdit(program) {
        setEditing(program);
        setCloneFrom(null);
        resetFormFields(program);
        setShowForm(true);
    }
    function handleClone(program) {
        setCloneFrom(program);
        setEditing(null);
        resetFormFields({
            ...program,
            name: `Cloned - ${program.name}`,
            // workouts: [...(program.workouts || [])] // Already array of IDs
        });
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

    function isFormValid() {
        return (
            formFields.name.trim().length > 0 &&
            formFields.description.trim().length > 0
        );
    }

    async function handleSave(e) {
        e.preventDefault();
        setFormLoading(true);
        setError(""); setSuccess("");
        const data = {
            name: formFields.name,
            description: formFields.description,
            goals: formFields.goals,
            gym_id: cloneFrom ? MY_GYM_ID : (editing ? editing.gym_id : (ROLE === "FitBro Admin" ? null : MY_GYM_ID)),
            is_master: cloneFrom ? false : (editing ? editing.is_master : (ROLE === "FitBro Admin")),
            parent_id: cloneFrom ? cloneFrom.id : (editing ? editing.parent_id : null),
            created_by: ROLE === "FitBro Admin" ? "FitBro Admin" : "XYZ Owner",
            workouts: formFields.workouts, // array of workout IDs
            status: formFields.status,
        };
        try {
            let res, program;
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
                program = await res.json();
                setPrograms((prev) => prev.map((p) => (p.id === program.id ? program : p)));
                setSuccess("Program updated!");
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
                program = await res.json();
                setPrograms((prev) => [...prev, program]);
                setSuccess(cloneFrom ? "Program cloned!" : "Program created!");
            }
            setShowForm(false);
        } catch {
            setError("Failed to save program. Please try again.");
        }
        setFormLoading(false);
    }

    function handleCloseForm() {
        setShowForm(false);
        setEditing(null);
        setCloneFrom(null);
        setFormLoading(false);
    }

    function handleDeleteRequest(program) {
        setDeleteDialog({ open: true, program });
    }
    async function handleDeleteConfirm() {
        const id = deleteDialog.program.id;
        setError(""); setSuccess("");
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error();
            setPrograms((prev) => prev.filter((p) => p.id !== id));
            setSuccess("Program deleted!");
        } catch {
            setError("Failed to delete program.");
        }
        setDeleteDialog({ open: false, program: null });
    }

    function handleDeleteCancel() {
        setDeleteDialog({ open: false, program: null });
    }

    function getWorkoutNamesByIds(ids) {
        return allWorkouts.filter(w => ids.includes(w.id)).map(w => w.name).join(", ");
    }

    function renderProgramCard(program, isMaster) {
        return (
            <Card
                key={program.id}
                sx={{
                    borderRadius: 3,
                    boxShadow: 2,
                    p: 1,
                    transition: "transform 0.18s, box-shadow 0.18s",
                    "&:hover": {
                        transform: "translateY(-2px) scale(1.015)",
                        boxShadow: 5,
                    },
                    background: program.status === "Active"
                        ? "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                        : "white",
                }}
            >
                <CardContent sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                        <LibraryBooksIcon color={isMaster ? "primary" : "secondary"} />
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: 17, sm: 19 } }}>
                            {program.name}
                        </Typography>
                        {isMaster && (
                            <Tooltip title="Master Program">
                                <StarIcon color="warning" fontSize="small" />
                            </Tooltip>
                        )}
                        <Chip
                            icon={getStatusIcon(program.status)}
                            label={program.status}
                            color={getStatusColor(program.status)}
                            size="small"
                            sx={{ fontSize: 11, fontWeight: 500, ml: 1 }}
                        />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mb={1} sx={{ fontSize: { xs: 13.5, sm: 15 } }}>
                        {program.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>
                        Workouts: <span style={{ color: "#1976d2" }}>
                            {getWorkoutNamesByIds(program.workouts || [])}
                        </span>
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                        {program.last_updated
                            ? `Last updated: ${program.last_updated}`
                            : ""}
                    </Typography>
                    {program.parent_id && (
                        <Chip
                            size="small"
                            label="Cloned"
                            color="info"
                            sx={{ ml: 1, fontSize: 10, height: 18 }}
                        />
                    )}
                    <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
                        {canEdit(program) && (
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEdit(program)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canClone(program) && (
                            <Tooltip title="Clone">
                                <IconButton size="small" onClick={() => handleClone(program)}>
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canEdit(program) && (
                            <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleDeleteRequest(program)}>
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
                            <Box sx={{ height: 160, background: "#eee", borderRadius: 2 }} />
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
                    Program Management
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
                    placeholder="Search programs…"
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
                    <MenuItem value="Archived">Archived</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
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
                    {/* Master Programs */}
                    <Stack direction="row" alignItems="center" gap={1} mb={1} mt={2}>
                        <StarIcon color="warning" />
                        <Typography variant="h6" fontWeight="bold">
                            Master Programs
                        </Typography>
                        <Chip size="small" label={masterPrograms.length} color="warning" />
                    </Stack>
                    {masterPrograms.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            {searchTerm || statusFilter !== "All"
                                ? "No master programs match your search/filter."
                                : "No master programs available."}
                        </Alert>
                    ) : (
                        <Grid container columns={{ xs: 12, sm: 12, md: 12 }} columnSpacing={2} rowSpacing={2} mb={3}>
                            {masterPrograms.map(p => (
                                <Grid key={p.id} sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" } }}>
                                    {renderProgramCard(p, true)}
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Gym-level Programs */}
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                        <LibraryBooksIcon color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                            Your Gym Programs
                        </Typography>
                        <Chip size="small" label={gymPrograms.length} color="secondary" />
                    </Stack>
                    {gymPrograms.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            {searchTerm || statusFilter !== "All"
                                ? "No gym programs match your search/filter."
                                : "No gym programs created yet. Start by cloning a master program or creating a new one!"}
                        </Alert>
                    ) : (
                        <Grid container columns={{ xs: 12, sm: 12, md: 12 }} columnSpacing={2} rowSpacing={2} mb={3}>
                            {gymPrograms.map(p => (
                                <Grid key={p.id} sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" } }}>
                                    {renderProgramCard(p, false)}
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
                        bottom: 40,
                        right: 40,
                        zIndex: 3000,
                        boxShadow: 5,
                        "&:hover": { backgroundColor: "#1976d2" }
                    }}
                >
                    <AddIcon />
                </Fab>
            </Zoom>

            {/* Program Form Dialog */}
            <Dialog open={showForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <form onSubmit={handleSave}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        {editing ? "Edit Program" : cloneFrom ? "Clone Program" : "Create Program"}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1 }}>
                        <Stack spacing={2} mt={1}>
                            <TextField
                                name="name"
                                label="Program Name"
                                variant="outlined"
                                fullWidth
                                value={formFields.name}
                                onChange={handleFieldChange}
                                error={formTouched.name && formFields.name.trim() === ""}
                                helperText={formTouched.name && formFields.name.trim() === "" ? "Required" : ""}
                                required
                            />
                            <TextField
                                name="description"
                                label="Description"
                                variant="outlined"
                                multiline
                                minRows={2}
                                fullWidth
                                value={formFields.description}
                                onChange={handleFieldChange}
                                error={formTouched.description && formFields.description.trim() === ""}
                                helperText={formTouched.description && formFields.description.trim() === "" ? "Required" : ""}
                                required
                            />
                            <TextField
                                name="goals"
                                label="Goals"
                                variant="outlined"
                                fullWidth
                                value={formFields.goals}
                                onChange={handleFieldChange}
                            />
                            {/* MultiSelect for Workouts */}
                            <Autocomplete
                                multiple
                                options={allWorkouts}
                                getOptionLabel={(option) => option.name}
                                value={allWorkouts.filter((w) => formFields.workouts?.includes(w.id))}
                                onChange={(_, value) => {
                                    setFormFields((prev) => ({
                                        ...prev,
                                        workouts: value.map((w) => w.id),
                                    }));
                                    setFormTouched((prev) => ({ ...prev, workouts: true }));
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Workouts"
                                        placeholder="Select workouts"
                                        variant="outlined"
                                        helperText="Associate workouts to this program"
                                    />
                                )}
                            />
                            <TextField
                                select
                                name="status"
                                label="Status"
                                value={formFields.status}
                                onChange={handleFieldChange}
                                variant="outlined"
                                sx={{ width: 180 }}
                                size="small"
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Draft">Draft</MenuItem>
                                <MenuItem value="Archived">Archived</MenuItem>
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseForm} disabled={formLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isFormValid() || formLoading}
                            startIcon={formLoading ? <CircularProgress size={18} /> : null}
                        >
                            {editing ? "Update" : cloneFrom ? "Clone" : "Create"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
                <DialogTitle>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to delete program <b>{deleteDialog.program?.name}</b>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button color="error" onClick={handleDeleteConfirm}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
