import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, Button, Select, MenuItem, Snackbar, Alert,
  IconButton, Chip, Stack, CircularProgress, TextField, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemButton
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import dayjs from "dayjs";

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

export default function LogWorkoutPro() {
  // --- State ---
  const [members, setMembers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [dates, setDates] = useState([]);
  const [activeDateIdx, setActiveDateIdx] = useState(0);
  const [plan, setPlan] = useState([]);
  const [logs, setLogs] = useState({});
  const [actuals, setActuals] = useState({});
  const [notes, setNotes] = useState({});
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reloadLogsKey, setReloadLogsKey] = useState(0);

  // For date-level swap
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapSourceDate, setSwapSourceDate] = useState(null);
  const [swapTargetDate, setSwapTargetDate] = useState(null);

  const dateStripRef = useRef();

  // --- Fetch Members, Cycles, Workouts, Exercises ---
  useEffect(() => {
    fetch(`${API_BASE}/members/`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(setMembers)
      .catch(() => setError("Failed to fetch members"));
    fetch(`${API_BASE}/workouts/`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(setWorkouts);
    fetch(`${API_BASE}/exercises/`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(setExercises);
  }, []);

  useEffect(() => {
    if (!selectedMember) {
      setCycles([]);
      setSelectedCycle("");
      return;
    }
    fetch(`${API_BASE}/cycle-plans/?member_id=${selectedMember}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setCycles(data || []);
        if (data.length > 0) setSelectedCycle(data[0].id);
        else setSelectedCycle("");
      });
  }, [selectedMember]);

  // --- Fetch Plan/Entries (strictly day_date-based) ---
  useEffect(() => {
    if (!selectedCycle) {
      setDates([]);
      setPlan([]);
      setActiveDateIdx(0);
      return;
    }
    const cycle = cycles.find(c => c.id === Number(selectedCycle));
    if (!cycle) return;
    const ds = getDateArray(cycle.start_date, cycle.end_date);
    setDates(ds);
    setActiveDateIdx(() => {
      const todayIdx = ds.findIndex(d => d === dayjs().format("YYYY-MM-DD"));
      return todayIdx >= 0 ? todayIdx : 0;
    });

    fetch(`${API_BASE}/workout-plan-entries/?member_id=${cycle.member_id}&cycle_plan_id=${cycle.id}`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        const byDate = {};
        for (const entry of data) {
          if (!entry.day_date) continue;
          let exerciseName = entry.exercise_name;
          if (!exerciseName && Array.isArray(exercises)) {
            const exObj = exercises.find(ex => ex.id === entry.exercise_id);
            if (exObj) exerciseName = exObj.name;
          }
          let workoutName = entry.workout_name;
          if (!workoutName && Array.isArray(workouts)) {
            const wkObj = workouts.find(wk => wk.id === entry.workout_id);
            if (wkObj) workoutName = wkObj.name;
          }
          const fixedEntry = { ...entry, exercise_name: exerciseName, workout_name: workoutName };
          if (!byDate[entry.day_date]) byDate[entry.day_date] = [];
          byDate[entry.day_date].push(fixedEntry);
        }
        setPlan(ds.map(date => ({
          date,
          exercises: (byDate[date] || []).map(e => ({ ...e }))
        })));
      })
      .catch(() => setError("Failed to load workout plan"));
  }, [selectedCycle, cycles, exercises, workouts]);

  // --- Fetch Logs for member/cycle, day_date only ---
  const fetchLogs = useCallback(() => {
    if (!selectedMember || !selectedCycle) {
      setLogs({});
      return;
    }
    fetch(`${API_BASE}/workout-logs/`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        const byDate = {};
        data.filter(
          l => l.member_id === Number(selectedMember) && l.cycle_plan_id === Number(selectedCycle)
        ).forEach(l => {
          if (!byDate[l.workout_date]) byDate[l.workout_date] = {};
          byDate[l.workout_date][l.exercise_id] = l;
        });
        setLogs(byDate);
      });
  }, [selectedMember, selectedCycle, plan.length]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, reloadLogsKey]);

  // --- UI Helper Functions ---
  function isToday(dateStr) {
    return dateStr === dayjs().format("YYYY-MM-DD");
  }
  function isSunday(dateStr) {
    return dayjs(dateStr).day() === 0;
  }
  function isFuture(dateStr) {
    return dayjs(dateStr).isAfter(dayjs(), "day");
  }
  function isPast(dateStr) {
    return dayjs(dateStr).isBefore(dayjs(), "day");
  }

  // --- Date Strip: sliding window of 3 dates + auto-scroll ---
  useEffect(() => {
    if (dateStripRef.current) {
      const btn = dateStripRef.current.children[activeDateIdx + 1];
      if (btn && btn.scrollIntoView) btn.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [activeDateIdx]);
  function getVisibleDateIndexes() {
    if (!dates.length) return [];
    if (activeDateIdx === 0) return [0, 1, 2].filter(i => i < dates.length);
    if (activeDateIdx === dates.length - 1)
      return [dates.length - 3, dates.length - 2, dates.length - 1].filter(i => i >= 0);
    return [activeDateIdx - 1, activeDateIdx, activeDateIdx + 1].filter(i => i >= 0 && i < dates.length);
  }

  // --- Editable Actuals ---
  function getActual(date, ex, field, plannedValue) {
    if (actuals?.[date]?.[ex.exercise_id]?.[field] !== undefined) {
      return actuals[date][ex.exercise_id][field];
    }
    if (logs?.[date]?.[ex.exercise_id]?.[`actual_${field}`] !== undefined) {
      return logs[date][ex.exercise_id][`actual_${field}`];
    }
    return plannedValue ?? "";
  }
  function handleActualChange(date, ex, field, value) {
    setActuals(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [ex.exercise_id]: {
          ...(prev[date]?.[ex.exercise_id] || {}),
          [field]: value
        }
      }
    }));
  }
  function handleNotesChange(date, exId, value) {
    setNotes(prev => ({
      ...prev,
      [date]: { ...(prev[date] || {}), [exId]: value },
    }));
  }

  // --- Mark completed or skipped (EXERCISE-LEVEL ONLY) ---
  async function handleLogAction(date, ex, status) {
    let prevLog = logs[date]?.[ex.exercise_id];
    const payload = {
      workout_plan_entry_id: ex.id,
      member_id: ex.member_id || Number(selectedMember),
      cycle_plan_id: ex.cycle_plan_id,
      workout_date: date,
      exercise_id: ex.exercise_id,
      status,
      actual_notes: notes[date]?.[ex.exercise_id] || "",
    };
    if (ex.planned_minutes != null) {
      payload.actual_minutes = Number(getActual(date, ex, "minutes", ex.planned_minutes));
      payload.actual_rpe = Number(getActual(date, ex, "rpe", ex.planned_rpe));
      payload.actual_sets = 0;
      payload.actual_reps = 0;
      payload.actual_weight = 0;
    } else {
      payload.actual_minutes = 0;
      payload.actual_sets = Number(getActual(date, ex, "sets", ex.planned_sets));
      payload.actual_reps = Number(getActual(date, ex, "reps", ex.planned_reps));
      payload.actual_weight = Number(getActual(date, ex, "weight", ex.planned_weight));
      payload.actual_rpe = Number(getActual(date, ex, "rpe", ex.planned_rpe));
    }

    setLoading(true);
    let resp, ok = false;
    try {
      if (prevLog) {
        resp = await fetch(`${API_BASE}/workout-logs/${prevLog.id}`, {
          method: "PATCH",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        resp = await fetch(`${API_BASE}/workout-logs/`, {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      ok = resp.ok;
      if (!ok) {
        const errMsg = await resp.text();
        throw new Error(errMsg || "Failed");
      }
      setMsg(
        status === "completed"
          ? "Marked as completed!"
          : status === "skipped"
          ? "Marked as skipped!"
          : ""
      );
      setActuals({});
      setTimeout(() => setMsg(""), 2000);
      setReloadLogsKey(k => k + 1); // Force-refresh logs after action
    } catch (e) {
      setError("Failed to mark workout. " + (e.message || ""));
    } finally {
      setLoading(false);
    }
  }

  // --- Date-level swap logic (swap all entries for date1 <-> date2) ---
  function handleSwapDay() {
    setSwapSourceDate(today);
    setSwapOpen(true);
    setSwapTargetDate(null);
  }
  async function doSwap() {
    setSwapOpen(false);
    if (!swapSourceDate || !swapTargetDate) return;
    setLoading(true);
    try {
      const cycle_plan_id = cycles.find(c => c.id === Number(selectedCycle))?.id;
      await fetch(`${API_BASE}/swap-workout-day`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          cycle_plan_id,
          from_date: swapSourceDate,
          to_date: swapTargetDate
        })
      });
      setMsg("Workouts swapped between dates!");
      setTimeout(() => setMsg(""), 1800);
      setReloadLogsKey(k => k + 1);
    } catch (e) {
      setError("Swap failed");
    } finally {
      setLoading(false);
    }
  }

  // --- Render ---
  const member = members.find(m => m.id === Number(selectedMember));
  const cycle = cycles.find(c => c.id === Number(selectedCycle));
  const today = dates[activeDateIdx];
  const visibleDates = getVisibleDateIndexes();

  // day-level completed status for UI only
  const allCompleted =
    plan[activeDateIdx]?.exercises.length &&
    plan[activeDateIdx]?.exercises.every(
      ex =>
        logs[today]?.[ex.exercise_id]?.status === "completed" ||
        logs[today]?.[ex.exercise_id]?.status === "skipped"
    );

  return (
    <Box p={{ xs: 1, sm: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mb={2}>
        <Select
          value={selectedMember}
          onChange={e => setSelectedMember(e.target.value)}
          size="small"
          displayEmpty
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Select Member</MenuItem>
          {members.map(m => (
            <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
          ))}
        </Select>
        <Select
          value={selectedCycle}
          onChange={e => setSelectedCycle(e.target.value)}
          size="small"
          displayEmpty
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Select Cycle</MenuItem>
          {cycles.map(c => (
            <MenuItem key={c.id} value={c.id}>
              Cycle {c.cycle_number} ({c.start_date} - {c.end_date})
            </MenuItem>
          ))}
        </Select>
        {cycle && (
          <Chip
            label={`Status: ${cycle.status}`}
            color={cycle.status === "Active" ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>

      {/* Date Strip */}
      <Stack ref={dateStripRef} direction="row" alignItems="center" sx={{ mb: 2, gap: 1, overflowX: "auto" }}>
        <IconButton
          size="small"
          disabled={activeDateIdx === 0}
          onClick={() => setActiveDateIdx(i => Math.max(0, i - 1))}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        {visibleDates.map(i => {
          const d = dates[i];
          return (
            <Box key={d} sx={{ position: "relative", mx: 0.2 }}>
              <Button
                size="small"
                variant={i === activeDateIdx ? "contained" : "outlined"}
                color={
                  allCompleted && i === activeDateIdx
                    ? "success"
                    : isToday(d)
                    ? "primary"
                    : "primary"
                }
                sx={{
                  minWidth: 90, fontWeight: 600, fontSize: 13,
                  opacity: isToday(d) || i === activeDateIdx ? 1 : 0.85
                }}
                onClick={() => setActiveDateIdx(i)}
              >
                {isToday(d)
                  ? <Chip label="Today" color="primary" size="small" sx={{ fontWeight: "bold", bgcolor: "#1976d2", color: "white" }} />
                  : dayjs(d).format("DD MMM")}
                {allCompleted && i === activeDateIdx && <DoneAllIcon fontSize="small" sx={{ ml: 0.5 }} />}
              </Button>
              {isSunday(d) &&
                <Chip
                  label="Sunday"
                  color="warning"
                  size="small"
                  sx={{ position: "absolute", top: -12, right: 4, zIndex: 1, fontWeight: "bold" }}
                />}
            </Box>
          );
        })}
        <IconButton
          size="small"
          disabled={activeDateIdx === dates.length - 1}
          onClick={() => setActiveDateIdx(i => Math.min(dates.length - 1, i + 1))}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Stack>

      {loading && <CircularProgress />}
      {error && <Snackbar open={!!error} autoHideDuration={3500} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>}
      <Snackbar
        open={!!msg}
        autoHideDuration={3000}
        onClose={() => setMsg("")}
      >
        <Alert severity="success" onClose={() => setMsg("")}>{msg}</Alert>
      </Snackbar>

      {/* Day Card: Exercises for the selected day */}
      <Box
        sx={{
          mt: 1,
          bgcolor: "#f7f8fa",
          borderRadius: 2,
          p: { xs: 1, sm: 3 },
          minHeight: 300,
          boxShadow: 1,
          touchAction: "pan-x"
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {isToday(today) ? "Today" : dayjs(today).format("dddd, DD MMM YYYY")}
            {allCompleted && (
              <Chip
                icon={<DoneAllIcon />}
                label="Completed"
                size="small"
                color="success"
                sx={{ ml: 1 }}
              />
            )}
            {isSunday(today) && (
              <Chip label="HOLIDAY" color="warning" size="small" sx={{ ml: 1 }} />
            )}
          </Typography>
          {!isSunday(today) && !!plan[activeDateIdx]?.exercises.length && (
            <Button
              variant="outlined"
              startIcon={<SwapHorizIcon />}
              color="info"
              onClick={handleSwapDay}
              disabled={isPast(today)}
              sx={{ fontWeight: 600, minWidth: 120 }}
            >
              Swap Day
            </Button>
          )}
        </Stack>
        <Divider sx={{ my: 1 }} />

        {isSunday(today) ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No workout scheduled. Enjoy your holiday!
          </Typography>
        ) : plan[activeDateIdx]?.exercises?.length ? (
          <Stack spacing={2}>
            {plan[activeDateIdx].exercises.map((ex, i) => {
              const log = logs[today]?.[ex.exercise_id];
              const isCompleted = log?.status === "completed";
              const isSkipped = log?.status === "skipped";
              const isTerminated = log?.status === "terminated";
              const canAct =
                isToday(today) &&
                !isCompleted &&
                !isSkipped &&
                !isTerminated;

              // Planned/actual display
              let plannedDesc = "";
              if (ex.planned_minutes != null) {
                plannedDesc = `Planned: ${ex.planned_minutes} min` + (ex.planned_rpe ? `, RPE ${ex.planned_rpe}` : "");
              } else {
                plannedDesc = `Planned: ${ex.planned_sets} sets x ${ex.planned_reps} reps @ ${ex.planned_weight}kg`
                  + (ex.planned_rpe ? `, RPE ${ex.planned_rpe}` : "");
              }
              let actualDesc = "";
              if (isCompleted || isSkipped || isTerminated) {
                if (ex.planned_minutes != null) {
                  actualDesc = `Actual: ${log?.actual_minutes ?? ex.planned_minutes} min, RPE ${log?.actual_rpe ?? ex.planned_rpe}`;
                } else {
                  actualDesc =
                    `Actual: ${log?.actual_sets ?? ex.planned_sets} sets x ${log?.actual_reps ?? ex.planned_reps} reps @ ${log?.actual_weight ?? ex.planned_weight}kg, RPE ${log?.actual_rpe ?? ex.planned_rpe}`;
                }
              }

              return (
                <Card key={ex.id || i} variant="outlined" sx={{ borderRadius: 2, p: 1, bgcolor: "#fff" }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography fontWeight={600} sx={{ mb: 1 }}>
                        {ex.exercise_name}
                        <span style={{ color: "#888", fontWeight: 400 }}>
                          {" "}({ex.workout_name})
                        </span>
                      </Typography>
                    </Stack>
                    <Chip label={plannedDesc} size="small" sx={{ mb: 1, fontWeight: 500 }} />

                    {/* Actual value fields (editable for today, not if already marked) */}
                    {canAct ? (
                      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        {ex.planned_minutes != null ? (
                          <>
                            <TextField
                              label="Actual Minutes"
                              size="small"
                              type="number"
                              value={getActual(today, ex, "minutes", ex.planned_minutes)}
                              onChange={e => handleActualChange(today, ex, "minutes", e.target.value)}
                              sx={{ width: 120 }}
                            />
                            <TextField
                              label="RPE"
                              size="small"
                              type="number"
                              value={getActual(today, ex, "rpe", ex.planned_rpe)}
                              onChange={e => handleActualChange(today, ex, "rpe", e.target.value)}
                              sx={{ width: 90 }}
                            />
                          </>
                        ) : (
                          <>
                            <TextField
                              label="Sets"
                              size="small"
                              type="number"
                              value={getActual(today, ex, "sets", ex.planned_sets)}
                              onChange={e => handleActualChange(today, ex, "sets", e.target.value)}
                              sx={{ width: 80 }}
                            />
                            <TextField
                              label="Reps"
                              size="small"
                              type="number"
                              value={getActual(today, ex, "reps", ex.planned_reps)}
                              onChange={e => handleActualChange(today, ex, "reps", e.target.value)}
                              sx={{ width: 80 }}
                            />
                            <TextField
                              label="Weight"
                              size="small"
                              type="number"
                              value={getActual(today, ex, "weight", ex.planned_weight)}
                              onChange={e => handleActualChange(today, ex, "weight", e.target.value)}
                              sx={{ width: 100 }}
                            />
                            <TextField
                              label="RPE"
                              size="small"
                              type="number"
                              value={getActual(today, ex, "rpe", ex.planned_rpe)}
                              onChange={e => handleActualChange(today, ex, "rpe", e.target.value)}
                              sx={{ width: 90 }}
                            />
                          </>
                        )}
                        <TextField
                          label="Notes"
                          size="small"
                          value={notes[today]?.[ex.exercise_id] || ""}
                          onChange={e => handleNotesChange(today, ex.exercise_id, e.target.value)}
                          sx={{ width: 150 }}
                        />
                      </Stack>
                    ) : (isCompleted || isSkipped || isTerminated) ? (
                      <>
                        <Chip label={actualDesc} color="info" size="small" sx={{ mb: 1, fontWeight: 500, bgcolor: "#e3f2fd" }} />
                        {log?.actual_notes && (
                          <Typography variant="body2" sx={{ mt: 0.5, color: "#4b4b4b" }}>
                            Notes: {log.actual_notes}
                          </Typography>
                        )}
                      </>
                    ) : null}
                    <Stack direction="row" spacing={1} mt={1}>
                      {isCompleted && (
                        <Chip label="Completed" color="success" size="small" />
                      )}
                      {isSkipped && (
                        <Chip label="Skipped" color="warning" size="small" />
                      )}
                      {isTerminated && (
                        <Chip label="Terminated" color="error" size="small" />
                      )}
                      {canAct && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleLogAction(today, ex, "completed")}
                          >
                            Mark Completed
                          </Button>
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => handleLogAction(today, ex, "skipped")}
                          >
                            Skip
                          </Button>
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No exercises planned for this day.
          </Typography>
        )}

        {/* SWAP DAY DIALOG */}
        <Dialog open={swapOpen} onClose={() => setSwapOpen(false)}>
          <DialogTitle>Swap All Workouts for this Day</DialogTitle>
          <DialogContent>
            <Typography>Select a future date to swap with:</Typography>
            <List>
              {dates
                .filter(
                  d =>
                    isFuture(d) &&
                    d !== swapSourceDate &&
                    !isSunday(d)
                )
                .map(d => (
                  <ListItem key={d} disablePadding>
                    <ListItemButton
                      selected={swapTargetDate === d}
                      onClick={() => setSwapTargetDate(d)}
                    >
                      {dayjs(d).format("dddd, DD MMM YYYY")}
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSwapOpen(false)}>Cancel</Button>
            <Button onClick={doSwap} disabled={!swapTargetDate}>Swap</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
