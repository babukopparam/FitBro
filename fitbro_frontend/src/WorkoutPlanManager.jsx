import React, { useEffect, useState } from "react";
import {
    Box, Typography, Button, Card, CardContent, Stack, Chip, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, Select, MenuItem, Checkbox, TextField, Divider, Alert
} from "@mui/material";

const API_BASE = "http://localhost:8000";

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function getDateArray(startDate, endDate) {
    const arr = [];
    let dt = new Date(startDate);
    const ed = new Date(endDate);
    while (dt <= ed) {
        arr.push(dt.toISOString().slice(0, 10));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}

export default function WorkoutPlanManager() {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState("");
    const [cycles, setCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState("");
    const [workouts, setWorkouts] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [plan, setPlan] = useState([]);
    const [editDayIdx, setEditDayIdx] = useState(null);
    const [popupSelections, setPopupSelections] = useState([]);
    const [popupWorkouts, setPopupWorkouts] = useState([]);
    const [cycleAlert, setCycleAlert] = useState("");
    const [datesForCycle, setDatesForCycle] = useState([]);

    // Load members, workouts, exercises on mount
    useEffect(() => {
        fetch(`${API_BASE}/members/`, { headers: getAuthHeaders() })
            .then(res => res.json()).then(setMembers);
        fetch(`${API_BASE}/workouts/`, { headers: getAuthHeaders() })
            .then(res => res.json()).then(setWorkouts);
        fetch(`${API_BASE}/exercises/`, { headers: getAuthHeaders() })
            .then(res => res.json()).then(setExercises);
    }, []);

    // When member is selected, load cycles for that member only
    useEffect(() => {
        if (!selectedMember) {
            setCycles([]);
            setSelectedCycle("");
            setDatesForCycle([]);
            return;
        }
        fetch(`${API_BASE}/cycle-plans/?member_id=${selectedMember}`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setCycles(data);
                setCycleAlert(`Fetched ${data.length} cycle(s) for this member`);
                setTimeout(() => setCycleAlert(""), 2500);
                if (data.length > 0) setSelectedCycle(data[0].id);
                else setSelectedCycle("");
            });
    }, [selectedMember]);

    // When cycle is selected, set dates for the cycle and load plan for member+cycle
    useEffect(() => {
        if (!selectedCycle || !selectedMember) {
            setDatesForCycle([]);
            setPlan([]);
            return;
        }
        const cycle = cycles.find(c => c.id === Number(selectedCycle));
        if (!cycle) {
            setDatesForCycle([]);
            setPlan([]);
            return;
        }
        const dates = getDateArray(cycle.start_date, cycle.end_date);
        setDatesForCycle(dates);

        fetch(`${API_BASE}/workout-plan-entries/?member_id=${selectedMember}&cycle_plan_id=${selectedCycle}`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => setPlan(convertEntriesToPlan(data, dates, exercises, workouts)));
    // rerun mapping when exercises or workouts change (for name lookup)
    }, [selectedCycle, cycles, selectedMember, exercises, workouts]);

    // === Fallback name mapping fix here ===
    function convertEntriesToPlan(entries, dates, exercises, workouts) {
        const byDate = {};
        for (const entry of entries) {
            if (!entry.day_date) continue;
            if (!byDate[entry.day_date]) byDate[entry.day_date] = [];
            byDate[entry.day_date].push(entry);
        }
        return dates.map(date => ({
            date,
            exercises: (byDate[date] || []).map(e => {
                // Fallback to local lookup for names if not present in API
                let exerciseName = e.exercise_name;
                if (!exerciseName && Array.isArray(exercises)) {
                    const exObj = exercises.find(ex => ex.id === e.exercise_id);
                    if (exObj) exerciseName = exObj.name;
                }
                let workoutName = e.workout_name;
                if (!workoutName && Array.isArray(workouts)) {
                    const wkObj = workouts.find(wk => wk.id === e.workout_id);
                    if (wkObj) workoutName = wkObj.name;
                }
                return {
                    id: e.id,
                    exercise_id: e.exercise_id,
                    workout_id: e.workout_id,
                    exercise: exerciseName || e.exercise_id,
                    workout: workoutName || e.workout_id,
                    type: e.planned_minutes != null ? "time" : "sets",
                    planned: {
                        sets: e.planned_sets,
                        reps: e.planned_reps,
                        weight: e.planned_weight,
                        duration: e.planned_minutes,
                        rpe: e.planned_rpe
                    }
                };
            })
        }));
    }


    // Add/Edit Exercises Dialog Logic
    function handleAddEditExercises(dayIdx) {
        setEditDayIdx(dayIdx);
        const prev = plan[dayIdx]?.exercises || [];
        setPopupSelections([...prev]);
        setPopupWorkouts([...new Set(prev.map(e => e.workout))]);
    }
    function handleWorkoutSelect(workoutName) {
        if (popupWorkouts.includes(workoutName)) return;
        setPopupWorkouts([...popupWorkouts, workoutName]);
    }
    function handleExerciseToggle(workout, exercise, type) {
        const idx = popupSelections.findIndex(
            e => e.workout === workout && e.exercise === exercise
        );
        if (idx !== -1) {
            setPopupSelections(popupSelections.filter((_, i) => i !== idx));
        } else {
            setPopupSelections([
                ...popupSelections,
                {
                    workout,
                    exercise,
                    type,
                    planned: type === "time"
                        ? { duration: "", rpe: "" }
                        : { sets: "", reps: "", weight: "", rpe: "" }
                }
            ]);
        }
    }
    function handlePlannedValueChange(idx, field, value) {
        setPopupSelections(list =>
            list.map((e, i) =>
                i === idx ? { ...e, planned: { ...e.planned, [field]: value } } : e
            )
        );
    }
    function handlePopupClose() {
        setEditDayIdx(null);
        setPopupWorkouts([]);
        setPopupSelections([]);
    }
    function handlePopupSubmit() {
        const dayIdx = editDayIdx;
        const date = datesForCycle[dayIdx];
        const memberId = selectedMember;
        const cyclePlanId = selectedCycle;

        const savePromises = popupSelections.map(e => {
            const workoutObj = workouts.find(w => w.name === e.workout);
            const exerciseObj = exercises.find(ex => ex.name === e.exercise && ex.workout_id === workoutObj.id);
            if (!workoutObj || !exerciseObj) return Promise.resolve();

            const payload = {
                cycle_plan_id: Number(cyclePlanId),
                day_number: dayIdx + 1,
                day_date: date,
                workout_id: workoutObj.id,
                exercise_id: exerciseObj.id,
                planned_sets: e.type === "sets" ? Number(e.planned.sets) : null,
                planned_reps: e.type === "sets" ? Number(e.planned.reps) : null,
                planned_weight: e.type === "sets" ? Number(e.planned.weight) : null,
                planned_minutes: e.type === "time" ? Number(e.planned.duration) : null,
                planned_rpe: Number(e.planned.rpe) || null,
                planned_notes: null
            };
            if (e.id) {
                // Update
                return fetch(`${API_BASE}/workout-plan-entries/${e.id}`, {
                    method: "PUT",
                    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create
                return fetch(`${API_BASE}/workout-plan-entries/`, {
                    method: "POST",
                    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }
        });
        Promise.all(savePromises).then(() => {
            // Refresh plan
            fetch(`${API_BASE}/workout-plan-entries/?member_id=${memberId}&cycle_plan_id=${cyclePlanId}`, {
                headers: getAuthHeaders()
            })
                .then(res => res.json())
                .then(data => setPlan(convertEntriesToPlan(data, datesForCycle, exercises, workouts)));
            handlePopupClose();
        });
    }

    // --- Rendering ---
    const member = members.find(m => m.id === Number(selectedMember));
    // Filter cycles for selected member
    const filteredCycles = cycles.filter(c => String(c.member_id) === String(selectedMember));
    const cycle = filteredCycles.find(c => c.id === Number(selectedCycle));

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>Workout Plan Manager</Typography>
            <Stack direction="row" spacing={2} mb={2}>
                <Select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} size="small" displayEmpty>
                    <MenuItem value="">Select Member</MenuItem>
                    {members.map(m => (
                        <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                </Select>
                <Select value={selectedCycle} onChange={e => setSelectedCycle(e.target.value)} size="small" displayEmpty>
                    <MenuItem value="">Select Cycle</MenuItem>
                    {filteredCycles.map(c => (
                        <MenuItem key={c.id} value={c.id}>
                            Cycle {c.cycle_number}: {c.start_date} - {c.end_date}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>
            {cycleAlert && <Alert severity="info" sx={{ mb: 2 }}>{cycleAlert}</Alert>}

            {datesForCycle.length === 0 && (
                <Typography color="text.secondary">No plan found for this member/cycle.</Typography>
            )}
            <Card sx={{ borderRadius: 3, mt: 2 }}>
                <CardContent>
                    <Typography variant="h6">{member?.name} - {cycle ? `Cycle ${cycle.cycle_number}` : ""}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {cycle?.start_date} - {cycle?.end_date}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Day</TableCell>
                                    <TableCell>Workouts</TableCell>
                                    <TableCell>Exercises (Planned)</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {datesForCycle.map((date, idx) => {
                                    const d = plan[idx] || {};
                                    const dayNum = idx + 1;
                                    const isSunday = (new Date(date).getDay() === 0);
                                    const workoutsUsed = Array.from(new Set((d.exercises || []).map(e => e.workout)));
                                    let workoutsCell = "";
                                    if (workoutsUsed.length === 1) workoutsCell = workoutsUsed[0];
                                    else if (workoutsUsed.length === 2) workoutsCell = workoutsUsed.join(", ");
                                    else if (workoutsUsed.length >= 3) workoutsCell = "CIRCUIT";
                                    return (
                                        <TableRow key={date} style={isSunday ? { background: "#fdeaea" } : {}}>
                                            <TableCell>
                                                {date}
                                                {isSunday && <Chip label="HOLIDAY" size="small" color="warning" sx={{ ml: 1 }} />}
                                            </TableCell>
                                            <TableCell>Day {dayNum}</TableCell>
                                            <TableCell>
                                                {workoutsCell || <Typography color="text.secondary" variant="body2">—</Typography>}
                                            </TableCell>
                                            <TableCell>
                                                {d.exercises && d.exercises.length ? (
                                                    <Stack spacing={1}>
                                                        {d.exercises.map((e, i) => (
                                                            <Box key={i} sx={{ mb: 0.5, bgcolor: "#f7f9fa", p: 1, borderRadius: 1 }}>
                                                                <Typography variant="subtitle2" display="inline">
                                                                    {e.exercise} <span style={{ color: "#888" }}>({e.workout})</span>
                                                                </Typography>
                                                                <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                                                                    {e.type === "time" ? (
                                                                        <>
                                                                            <Chip label={`Duration: ${e.planned.duration || "-"} min`} size="small" />
                                                                            <Chip label={`RPE: ${e.planned.rpe || "-"}`} size="small" />
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Chip label={`Sets: ${e.planned.sets || "-"}`} size="small" />
                                                                            <Chip label={`Reps: ${e.planned.reps || "-"}`} size="small" />
                                                                            <Chip label={`Wt: ${e.planned.weight || "-"}`} size="small" />
                                                                            <Chip label={`RPE: ${e.planned.rpe || "-"}`} size="small" />
                                                                        </>
                                                                    )}
                                                                </Stack>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        No exercises
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {!isSunday && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleAddEditExercises(idx)}
                                                    >
                                                        Add / Edit Exercises
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
            {/* Pop-up Dialog */}
            <Dialog open={editDayIdx !== null} onClose={handlePopupClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {member?.name} | {cycle ? `Cycle ${cycle.cycle_number}` : ""} | Date: {editDayIdx !== null && datesForCycle[editDayIdx]}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <Divider textAlign="left">Add Workouts</Divider>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {workouts.map(wk => (
                                <Button
                                    key={wk.name}
                                    size="small"
                                    variant={popupWorkouts.includes(wk.name) ? "contained" : "outlined"}
                                    onClick={() => handleWorkoutSelect(wk.name)}
                                    sx={{ mb: 1 }}
                                >
                                    {wk.name}
                                </Button>
                            ))}
                        </Stack>
                        {popupWorkouts.map(wkName => {
                            const wk = workouts.find(w => w.name === wkName);
                            if (!wk) return null;
                            const exercisesForThisWorkout = exercises.filter(ex => ex.workout_id === wk.id);
                            return (
                                <Box key={wkName} sx={{ my: 1, p: 1, border: "1px solid #eee", borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="primary" mb={1}>{wkName}</Typography>
                                    <Stack direction="row" spacing={3} flexWrap="wrap">
                                        {exercisesForThisWorkout.map(ex => {
                                            const idx = popupSelections.findIndex(e => e.workout === wkName && e.exercise === ex.name);
                                            const checked = idx !== -1;
                                            const planned = checked ? popupSelections[idx].planned :
                                                ex.is_time_based
                                                    ? { duration: "", rpe: "" }
                                                    : { sets: "", reps: "", weight: "", rpe: "" };
                                            return (
                                                <Box key={ex.id} sx={{ minWidth: 210, m: 0.5, p: 1, bgcolor: "#f9f9fb", borderRadius: 1 }}>
                                                    <Checkbox
                                                        checked={checked}
                                                        onChange={() => handleExerciseToggle(wkName, ex.name, ex.is_time_based ? "time" : "sets")}
                                                    />
                                                    <Typography variant="body2" display="inline">{ex.name}</Typography>
                                                    {checked && (
                                                        <Stack spacing={1} mt={1}>
                                                            {ex.is_time_based ? (
                                                                <>
                                                                    <TextField
                                                                        label="Duration (min)"
                                                                        type="number"
                                                                        size="small"
                                                                        value={planned.duration}
                                                                        onChange={e => handlePlannedValueChange(idx, "duration", e.target.value)}
                                                                        sx={{ width: 140 }}
                                                                    />
                                                                    <TextField
                                                                        label="RPE"
                                                                        type="number"
                                                                        size="small"
                                                                        value={planned.rpe}
                                                                        onChange={e => handlePlannedValueChange(idx, "rpe", e.target.value)}
                                                                        sx={{ width: 100 }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TextField
                                                                        label="Sets"
                                                                        type="number"
                                                                        size="small"
                                                                        value={planned.sets}
                                                                        onChange={e => handlePlannedValueChange(idx, "sets", e.target.value)}
                                                                        sx={{ width: 100 }}
                                                                    />
                                                                    <TextField
                                                                        label="Reps"
                                                                        type="number"
                                                                        size="small"
                                                                        value={planned.reps}
                                                                        onChange={e => handlePlannedValueChange(idx, "reps", e.target.value)}
                                                                        sx={{ width: 100 }}
                                                                    />
                                                                    <TextField
                                                                        label="Weight"
                                                                        type="number"
                                                                        size="small"
                                                                        value={planned.weight}
                                                                        onChange={e => handlePlannedValueChange(idx, "weight", e.target.value)}
                                                                        sx={{ width: 120 }}
                                                                    />
                                                                    <TextField
                                                                        label="RPE"
                                                                        type="number"
                                                                        size="small"
                                                                        value={planned.rpe}
                                                                        onChange={e => handlePlannedValueChange(idx, "rpe", e.target.value)}
                                                                        sx={{ width: 100 }}
                                                                    />
                                                                </>
                                                            )}
                                                        </Stack>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePopupClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handlePopupSubmit}
                        disabled={popupSelections.length === 0}
                    >
                        Save Exercises
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
