import React, { useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, Stack, Chip, LinearProgress,
  TextField, Grid, Slider, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, IconButton
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ErrorIcon from "@mui/icons-material/Error";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

function getTodayYYYYMMDD() {
  return new Date().toISOString().split("T")[0];
}

// Dummy plan data for the cycle
const DUMMY_PLAN = [
  {
    date: "2025-07-12",
    exercises: [
      { type: "Strength", name: "Bench Press", planned: { sets: 4, reps: 10, weight: 40 }, actual: null, status: "pending" },
      { type: "Cardio", name: "Treadmill", planned: { minutes: 15 }, actual: null, status: "pending" },
    ]
  },
  {
    date: "2025-07-13",
    exercises: [
      { type: "Strength", name: "Pull Ups", planned: { sets: 3, reps: 8, weight: 0 }, actual: null, status: "pending" },
      { type: "Strength", name: "Squats", planned: { sets: 4, reps: 12, weight: 30 }, actual: null, status: "pending" },
    ]
  },
  {
    date: "2025-07-14",
    exercises: [
      { type: "Cardio", name: "Cycling", planned: { minutes: 20 }, actual: null, status: "pending" },
    ]
  },
  {
    date: "2025-07-15",
    exercises: [
      { type: "Strength", name: "Shoulder Press", planned: { sets: 3, reps: 8, weight: 18 }, actual: null, status: "pending" },
      { type: "Cardio", name: "Rowing", planned: { minutes: 10 }, actual: null, status: "pending" },
    ]
  },
];

const memberName = "Ramesh Gupta";
const cycleStart = "2025-07-12";
const cycleEnd = "2025-07-15";

export default function LogWorkoutPro() {
  // Clone plan, prefill actual as planned if not done
  const [plan, setPlan] = useState(DUMMY_PLAN.map(day => ({
    ...day,
    exercises: day.exercises.map(ex => ({
      ...ex,
      actual: ex.actual || { ...ex.planned, rpe: 5, notes: "" },
      status: ex.status
    }))
  })));
  const [selectedDateIdx, setSelectedDateIdx] = useState(plan.findIndex(day => day.date === getTodayYYYYMMDD()) || 0);
  const todayIdx = selectedDateIdx;

  // Cycle progress calculation
  const totalExercises = plan.reduce((acc, day) => acc + day.exercises.length, 0);
  const completedExercises = plan.reduce(
    (acc, day) => acc + day.exercises.filter(ex => ex.status === "completed").length, 0
  );
  const dayProgress = plan.slice(0, todayIdx + 1).reduce(
    (acc, day) => acc + day.exercises.length, 0
  );
  const shouldHaveCompleted = dayProgress;
  let progressStatus = "";
  if (completedExercises < shouldHaveCompleted) progressStatus = "Behind";
  else if (completedExercises === shouldHaveCompleted) progressStatus = "On Track";
  else if (completedExercises > shouldHaveCompleted) progressStatus = "PRO";

  // For swap dialog (dummy)
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapWithIdx, setSwapWithIdx] = useState(null);

  // UI state for congrats
  const showCongrats = plan[todayIdx].exercises.every(ex => ex.status === "completed");

  function handleActualChange(dayIdx, exIdx, field, value) {
    setPlan(plan =>
      plan.map((day, di) =>
        di === dayIdx
          ? {
              ...day,
              exercises: day.exercises.map((ex, ei) =>
                ei === exIdx
                  ? { ...ex, actual: { ...ex.actual, [field]: value } }
                  : ex
              )
            }
          : day
      )
    );
  }

  function handleMarkCompleted(dayIdx, exIdx) {
    setPlan(plan =>
      plan.map((day, di) =>
        di === dayIdx
          ? {
              ...day,
              exercises: day.exercises.map((ex, ei) =>
                ei === exIdx
                  ? { ...ex, status: "completed" }
                  : ex
              )
            }
          : day
      )
    );
  }

  function handleSkip(dayIdx, exIdx) {
    setPlan(plan =>
      plan.map((day, di) =>
        di === dayIdx
          ? {
              ...day,
              exercises: day.exercises.map((ex, ei) =>
                ei === exIdx
                  ? { ...ex, status: "skipped" }
                  : ex
              )
            }
          : day
      )
    );
  }

  // Swap handler (dummy logic)
  function handleSwap() {
    if (swapWithIdx === null || swapWithIdx === todayIdx) return;
    setPlan(plan => {
      const newPlan = [...plan];
      [newPlan[todayIdx].exercises, newPlan[swapWithIdx].exercises] =
        [newPlan[swapWithIdx].exercises, newPlan[todayIdx].exercises];
      return newPlan;
    });
    setSwapOpen(false);
    setSwapWithIdx(null);
  }

  return (
    <Box sx={{ maxWidth: 680, mx: "auto", mt: 3, mb: 6 }}>
      {/* Cycle Progress */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">{memberName}</Typography>
        <Typography variant="body2" color="text.secondary">
          Cycle: {cycleStart} - {cycleEnd}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2} mt={1}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(completedExercises / totalExercises) * 100}
              sx={{ height: 12, borderRadius: 6, bgcolor: "#e3f2fd" }}
              color={
                progressStatus === "Behind"
                  ? "warning"
                  : progressStatus === "PRO"
                  ? "success"
                  : "primary"
              }
            />
          </Box>
          <Box minWidth={80} textAlign="center">
            <Chip
              icon={
                progressStatus === "PRO"
                  ? <EmojiEventsIcon color="warning" />
                  : progressStatus === "Behind"
                  ? <ErrorIcon color="warning" />
                  : <CheckCircleIcon color="success" />
              }
              label={
                progressStatus === "PRO"
                  ? "PRO!"
                  : progressStatus === "Behind"
                  ? "Behind"
                  : "On Track"
              }
              color={progressStatus === "PRO" ? "success" : progressStatus === "Behind" ? "warning" : "primary"}
            />
            <Typography fontSize={12} color="text.secondary" mt={0.5}>
              {completedExercises} / {totalExercises} done
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Day Navigation */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {plan.map((day, idx) => (
          <Chip
            key={day.date}
            icon={<CalendarMonthIcon />}
            label={day.date}
            color={idx === todayIdx ? "primary" : "default"}
            onClick={() => setSelectedDateIdx(idx)}
            variant={idx === todayIdx ? "filled" : "outlined"}
            sx={{ minWidth: 110, fontWeight: idx === todayIdx ? 600 : undefined }}
          />
        ))}
      </Stack>

      {/* Swap workout */}
      <Button
        variant="outlined"
        startIcon={<SwapHorizIcon />}
        onClick={() => setSwapOpen(true)}
        sx={{ mb: 3 }}
      >
        Swap this day's workout
      </Button>

      {/* Today's Exercises */}
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        {plan[selectedDateIdx].date === getTodayYYYYMMDD()
          ? "Today's Workout"
          : plan[selectedDateIdx].date < getTodayYYYYMMDD()
          ? "Missed Workout"
          : "Scheduled Workout"}
      </Typography>

      <Stack spacing={2}>
        {plan[selectedDateIdx].exercises.map((ex, exIdx) => {
          const isPast = plan[selectedDateIdx].date < getTodayYYYYMMDD();
          const isToday = plan[selectedDateIdx].date === getTodayYYYYMMDD();
          const isFuture = plan[selectedDateIdx].date > getTodayYYYYMMDD();
          const color =
            ex.status === "completed"
              ? "#e8f5e9"
              : ex.status === "skipped"
              ? "#ffecec"
              : isPast
              ? "#fffbe8"
              : "#f3f6fa";
          return (
            <Card
              key={ex.name}
              sx={{
                bgcolor: color,
                borderRadius: 3,
                opacity: ex.status === "skipped" ? 0.5 : 1,
                border: ex.status === "completed" ? "2px solid #69f0ae" : undefined,
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                      label={ex.type}
                      color={ex.type === "Strength" ? "secondary" : "primary"}
                      size="small"
                    />
                    <Typography variant="h6">{ex.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isToday
                        ? "Planned for Today"
                        : isFuture
                        ? `Planned for: ${plan[selectedDateIdx].date}`
                        : "Overdue"}
                    </Typography>
                  </Stack>
                  {ex.status === "completed" && (
                    <Chip label="Completed" color="success" />
                  )}
                  {ex.status === "skipped" && (
                    <Chip label="Skipped" color="warning" />
                  )}
                  {!isToday && ex.status !== "completed" && ex.status !== "skipped" && (
                    <Chip label={isFuture ? "Upcoming" : "Missed"} color={isFuture ? "info" : "error"} />
                  )}
                </Stack>
                <Box mt={2}>
                  <Grid container spacing={2}>
                    {ex.type === "Strength" ? (
                      <>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Sets"
                            type="number"
                            size="small"
                            value={ex.actual.sets}
                            onChange={e => handleActualChange(selectedDateIdx, exIdx, "sets", e.target.value)}
                            disabled={ex.status === "completed" || ex.status === "skipped"}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Reps"
                            type="number"
                            size="small"
                            value={ex.actual.reps}
                            onChange={e => handleActualChange(selectedDateIdx, exIdx, "reps", e.target.value)}
                            disabled={ex.status === "completed" || ex.status === "skipped"}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Weight"
                            type="number"
                            size="small"
                            value={ex.actual.weight}
                            onChange={e => handleActualChange(selectedDateIdx, exIdx, "weight", e.target.value)}
                            disabled={ex.status === "completed" || ex.status === "skipped"}
                            fullWidth
                          />
                        </Grid>
                      </>
                    ) : (
                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="Minutes"
                          type="number"
                          size="small"
                          value={ex.actual.minutes}
                          onChange={e => handleActualChange(selectedDateIdx, exIdx, "minutes", e.target.value)}
                          disabled={ex.status === "completed" || ex.status === "skipped"}
                          fullWidth
                        />
                      </Grid>
                    )}
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" mb={1}>RPE (Effort)</Typography>
                      <Slider
                        min={1} max={10} step={1}
                        value={Number(ex.actual.rpe)}
                        onChange={(_, v) => handleActualChange(selectedDateIdx, exIdx, "rpe", v)}
                        disabled={ex.status === "completed" || ex.status === "skipped"}
                        marks
                        valueLabelDisplay="on"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Notes"
                        value={ex.actual.notes}
                        onChange={e => handleActualChange(selectedDateIdx, exIdx, "notes", e.target.value)}
                        disabled={ex.status === "completed" || ex.status === "skipped"}
                        fullWidth
                        multiline
                        rows={1}
                      />
                    </Grid>
                  </Grid>
                </Box>
                {ex.status !== "completed" && ex.status !== "skipped" && (
                  <Stack direction="row" spacing={2} mt={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleMarkCompleted(selectedDateIdx, exIdx)}
                    >
                      Mark Completed
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleSkip(selectedDateIdx, exIdx)}
                    >
                      Skip
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Motivational message */}
      {showCongrats && (
        <Alert severity="success" sx={{ mt: 3, fontSize: 18 }}>
          🎉 Great job! You completed all planned exercises for this day!
        </Alert>
      )}

      {/* Swap dialog */}
      <Dialog open={swapOpen} onClose={() => setSwapOpen(false)}>
        <DialogTitle>Swap Today's Workout</DialogTitle>
        <DialogContent>
          <Typography>Select another day to swap with:</Typography>
          <Stack spacing={1} mt={2}>
            {plan.map((day, idx) =>
              idx !== todayIdx && (
                <Button
                  key={day.date}
                  variant={swapWithIdx === idx ? "contained" : "outlined"}
                  onClick={() => setSwapWithIdx(idx)}
                  sx={{ textTransform: "none" }}
                >
                  {day.date}
                </Button>
              )
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSwapOpen(false)}>Cancel</Button>
          <Button onClick={handleSwap} disabled={swapWithIdx == null}>Swap</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
