import React, { useState } from "react";
import {
  Box, Typography, Paper, Grid, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// =============== Demo Data ===============
const user = {
  firstName: "Babu",
  now: { weight: 94, bmi: 32 },
  interim: { weight: 85, bmi: 28 },
  goal: { weight: 65, bmi: 26 },
};

const announcements = [
  "New HIIT workouts added to the program!",
];
const tips = [
  "Hydrate well before and after workouts.",
];

const month = 6; // July (0-based)
const year = 2025;
const getMonthShort = (idx) =>
  ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][idx];

function getWorkoutData() {
  const workouts = [];
  for (let i = 0; i < 28; i++) {
    const date = new Date(year, month, i + 1);
    const dayOfWeek = date.getDay();
    let status = "planned";
    let icon = "🏋️‍♂️";
    let exerciseName = "Chest Press";
    if (dayOfWeek === 0) {
      status = "sunday";
      icon = "";
      exerciseName = "Rest";
    } else if (i % 7 === 1) {
      status = "completed";
      icon = "🦵";
      exerciseName = "Leg Day";
    } else if (i % 7 === 2) {
      status = "absent";
      icon = "🏃";
      exerciseName = "Cardio";
    } else if (i % 7 === 3) {
      status = "terminated";
      icon = "💪";
      exerciseName = "Arms";
    } else if (i % 7 === 4) {
      status = "completed";
      icon = "🏋️‍♂️";
      exerciseName = "Chest Press";
    } else if (i % 7 === 5) {
      status = "planned";
      icon = "🏃";
      exerciseName = "Cardio";
    }
    workouts.push({
      dateObj: date,
      day: i + 1,
      icon,
      status,
      exerciseName,
      plannedSets: 4,
      plannedReps: 10,
      actualSets: status === "completed" ? 4 : status === "terminated" ? 2 : null,
      actualReps: status === "completed" ? 10 : status === "terminated" ? 5 : null,
      notes: status === "completed" ? "Good session" : "",
      terminationReason: status === "terminated" ? "Fatigue" : "",
    });
  }
  return workouts;
}

const workouts = getWorkoutData();

const todayDate = 13, todayMonth = 6, todayYear = 2025;

const getStatusStyle = (status, isToday, isFuture) => {
  if (isFuture) return { background: "#fff", color: "#616161" };
  if (status === "sunday") return { background: "#eee", color: "#bbb" };
  if (isToday)
    return {
      background: "#e0f7fa",
      border: "2px solid #0097a7",
      fontWeight: "bold",
      boxShadow: "0 2px 8px #b2ebf2",
    };
  if (status === "completed")
    return { background: "#c8e6c9", color: "#1b5e20", fontWeight: "bold" };
  if (status === "terminated")
    return { background: "#ffcdd2", color: "#b71c1c", fontWeight: "bold" };
  if (status === "absent")
    return { background: "#fff9c4", color: "#fbc02d", fontWeight: "bold" };
  return { background: "#f5f5f5", color: "#616161" };
};

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

// ============= Workout Dialog Component =============
function WorkoutDayDialog({ open, onClose, dayData }) {
  const [actualSets, setActualSets] = useState("");
  const [actualReps, setActualReps] = useState("");
  const [notes, setNotes] = useState("");

  if (!dayData) return null;

  const isToday = dayData.isToday;
  const isFuture = dayData.isFuture;
  const isCompleted = dayData.status === "completed";
  const isTerminated = dayData.status === "terminated";
  const isLeave = dayData.status === "leave";
  const isPast = !isToday && !isFuture && !isTerminated && !isCompleted && dayData.status !== "sunday";

  // Example handlers
  const handleSubmit = () => {
    alert("Workout submitted!");
    onClose();
  };
  const handleSwapToToday = () => {
    alert("Workout swapped to today!");
    onClose();
  };
  const handleSkip = () => {
    alert("Workout skipped!");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Workout for {dayData.dateString}
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2">Planned:</Typography>
        <div>Exercise: {dayData.exerciseName}</div>
        <div>Sets: {dayData.plannedSets}</div>
        <div>Reps: {dayData.plannedReps}</div>
        {(isCompleted || isTerminated) && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Actual:</Typography>
            <div>Actual Sets: {dayData.actualSets}</div>
            <div>Actual Reps: {dayData.actualReps}</div>
            {dayData.notes && <div>Notes: {dayData.notes}</div>}
          </>
        )}
        {isTerminated && dayData.terminationReason && (
          <div style={{ color: 'red', marginTop: 8 }}>Terminated: {dayData.terminationReason}</div>
        )}
        {isFuture && (
          <Button onClick={handleSwapToToday} variant="contained" color="primary" sx={{ mt: 2 }} fullWidth>
            SWAP this to TODAY
          </Button>
        )}
        {isToday && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Enter Today's Actuals:</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Actual Sets" value={actualSets} onChange={e=>setActualSets(e.target.value)} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Actual Reps" value={actualReps} onChange={e=>setActualReps(e.target.value)} fullWidth /></Grid>
              <Grid item xs={12}><TextField label="Notes" value={notes} onChange={e=>setNotes(e.target.value)} fullWidth multiline minRows={2} /></Grid>
            </Grid>
          </Box>
        )}
        {isLeave && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Button onClick={handleSwapToToday} variant="contained" color="primary" fullWidth>
                SWAP Today and add a day to current cycle
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button onClick={handleSkip} variant="outlined" color="secondary" fullWidth>
                Skip this workout in the current cycle
              </Button>
            </Grid>
          </Grid>
        )}
        {isPast && (
          <Typography sx={{ mt: 2, color: "#fbc02d" }}>This workout was neither completed nor terminated.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {isToday && (
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Submit
          </Button>
        )}
        <Button onClick={onClose} color="inherit">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ================ Main Home Screen ================
export default function HomeScreen() {
  // Prepare calendar grid
  let grid = [];
  let wIdx = 0;
  for (let week = 0; week < 4; week++) {
    let row = [];
    for (let dow = 0; dow < 7; dow++) {
      if (wIdx < workouts.length) row.push(workouts[wIdx++]);
      else row.push(null);
    }
    grid.push(row);
  }

  // Calendar dialog state
  const [selectedDay, setSelectedDay] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCellClick = (day) => {
    if (!day) return;
    const isToday =
      day.dateObj.getDate() === todayDate &&
      day.dateObj.getMonth() === todayMonth &&
      day.dateObj.getFullYear() === todayYear;
    const isFuture =
      day.dateObj.getFullYear() > todayYear ||
      (day.dateObj.getFullYear() === todayYear &&
        day.dateObj.getMonth() > todayMonth) ||
      (day.dateObj.getFullYear() === todayYear &&
        day.dateObj.getMonth() === todayMonth &&
        day.dateObj.getDate() > todayDate);
    setSelectedDay({
      ...day,
      dateString:
        day.dateObj.getDate().toString().padStart(2, "0") +
        "/" +
        getMonthShort(day.dateObj.getMonth()),
      isToday,
      isFuture,
    });
    setDialogOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 430, mx: "auto", p: 2, pb: 6 }}>
      {/* Welcome */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, mb: 2, textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Welcome, {user.firstName}
        </Typography>
      </Paper>

      {/* Fitness Goal */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Fitness Goal
        </Typography>
        <Grid container alignItems="center" spacing={0} sx={{ mb: 1 }}>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main" }}>
              NOW
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "secondary.main" }}>
              Interim Target
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#2e7d32" }}>
              Goal
            </Typography>
          </Grid>
        </Grid>
        <Divider />
        {/* Weight row */}
        <Grid container alignItems="center" spacing={0} sx={{ mt: 1 }}>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Wt: {user.now.weight}kg</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.interim.weight}kg</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.goal.weight}kg</Typography>
          </Grid>
        </Grid>
        {/* BMI row */}
        <Grid container alignItems="center" spacing={0}>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>BMI: {user.now.bmi}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.interim.bmi}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.goal.bmi}</Typography>
          </Grid>
        </Grid>
        {/* Progress bar/icon between NOW and Interim */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 1 }}>
          <TrendingUpIcon sx={{ fontSize: 32, color: "orange" }} />
        </Box>
      </Paper>

      {/* Announcements/Tips */}
      {(announcements.length > 0 || tips.length > 0) && (
        <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
          {announcements.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <InfoOutlinedIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {announcements[0]}
              </Typography>
            </Box>
          )}
          {tips.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EmojiEventsIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">{tips[0]}</Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Calendar */}
      <Paper elevation={3} sx={{ p: 1, borderRadius: 3, mb: 2 }}>
        <Typography align="center" sx={{ mb: 1, fontWeight: "bold" }}>
          July 2025
        </Typography>
        <Grid container spacing={1}>
          {daysOfWeek.map((day, idx) => (
            <Grid item xs={1.7} key={idx}>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: day === "S" ? "#bbb" : "#616161",
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        {grid.map((weekRow, weekIdx) => (
          <Grid container spacing={1} key={weekIdx} sx={{ mt: 0.2 }}>
            {weekRow.map((day, idx2) => {
              if (!day) return <Grid item xs={1.7} key={idx2}></Grid>;
              const isToday =
                day.dateObj.getDate() === todayDate &&
                day.dateObj.getMonth() === todayMonth &&
                day.dateObj.getFullYear() === todayYear;
              const isFuture =
                day.dateObj.getFullYear() > todayYear ||
                (day.dateObj.getFullYear() === todayYear &&
                  day.dateObj.getMonth() > todayMonth) ||
                (day.dateObj.getFullYear() === todayYear &&
                  day.dateObj.getMonth() === todayMonth &&
                  day.dateObj.getDate() > todayDate);
              const style = getStatusStyle(day.status, isToday, isFuture);
              const dateString =
                day.dateObj.getDate().toString().padStart(2, "0") +
                "/" +
                getMonthShort(day.dateObj.getMonth());

              return (
                <Grid item xs={1.7} key={idx2}>
                  <Box
                    onClick={() => handleCellClick(day)}
                    sx={{
                      ...style,
                      height: 52,
                      width: 52,
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      boxSizing: "border-box",
                      border: isToday ? "2.5px solid #00897b" : "none",
                      boxShadow: isToday ? "0 0 8px #a7ffeb" : undefined,
                      position: "relative",
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": { boxShadow: "0 2px 8px #80cbc4" },
                    }}
                  >
                    {/* Top-right date */}
                    <span
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 7,
                        fontSize: 10,
                        fontWeight: 600,
                        opacity: 0.85,
                      }}
                    >
                      {dateString}
                    </span>
                    {/* Center icon */}
                    <span
                      style={{
                        fontSize: 26,
                        lineHeight: 1.2,
                        marginTop: 10,
                      }}
                    >
                      {day.icon || ""}
                    </span>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Paper>

      {/* Legend (Optional) */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item>
          <Box sx={{ width: 20, height: 20, bgcolor: "#c8e6c9", borderRadius: 1, display: "inline-block", border: "1px solid #1b5e20", mr: 1 }} /> Completed
        </Grid>
        <Grid item>
          <Box sx={{ width: 20, height: 20, bgcolor: "#ffcdd2", borderRadius: 1, display: "inline-block", border: "1px solid #b71c1c", mr: 1 }} /> Terminated
        </Grid>
        <Grid item>
          <Box sx={{ width: 20, height: 20, bgcolor: "#fff9c4", borderRadius: 1, display: "inline-block", border: "1px solid #fbc02d", mr: 1 }} /> Absent
        </Grid>
        <Grid item>
          <Box sx={{ width: 20, height: 20, bgcolor: "#eee", borderRadius: 1, display: "inline-block", border: "1px solid #bbb", mr: 1 }} /> Sunday
        </Grid>
        <Grid item>
          <Box sx={{ width: 20, height: 20, bgcolor: "#e0f7fa", borderRadius: 1, display: "inline-block", border: "2px solid #00897b", mr: 1 }} /> Today
        </Grid>
      </Grid>

      {/* My Progress / My Assessments */}
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item xs={6}>
          <Button variant="outlined" color="primary" fullWidth startIcon={<TrendingUpIcon />}>
            My Progress
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="outlined" color="secondary" fullWidth startIcon={<AssessmentIcon />}>
            My Assessments
          </Button>
        </Grid>
      </Grid>

      {/* Popup Dialog */}
      <WorkoutDayDialog open={dialogOpen} onClose={() => setDialogOpen(false)} dayData={selectedDay} />
    </Box>
  );
}
