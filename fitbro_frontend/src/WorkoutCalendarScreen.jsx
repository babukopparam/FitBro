import React from "react";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";

// Dummy data for July 2025
const month = 6; // July (0-based)
const year = 2025;

const getMonthShort = (monthIdx) =>
  ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][monthIdx];

function getWorkoutData() {
  const workouts = [];
  for (let i = 0; i < 28; i++) {
    const date = new Date(year, month, i + 1);
    const dayOfWeek = date.getDay();
    let status = "planned";
    let icon = "🏋️‍♂️";
    if (dayOfWeek === 0) {
      status = "sunday";
      icon = "";
    } else if (i % 7 === 1) {
      status = "completed";
      icon = "🦵";
    } else if (i % 7 === 2) {
      status = "absent";
      icon = "🏃";
    } else if (i % 7 === 3) {
      status = "terminated";
      icon = "💪";
    } else if (i % 7 === 4) {
      status = "completed";
      icon = "🏋️‍♂️";
    } else if (i % 7 === 5) {
      status = "planned";
      icon = "🏃";
    }
    workouts.push({
      dateObj: date,
      day: i + 1,
      icon,
      status,
    });
  }
  return workouts;
}

const workouts = getWorkoutData();

const todayDate = 13;
const todayMonth = 6; // July (0-based)
const todayYear = 2025;

const getStatusStyle = (status, isToday, isFuture) => {
  if (isFuture) {
    return { background: "#fff", color: "#616161" };
  }
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

export default function WorkoutCalendarScreen() {
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

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
      <Typography variant="h5" align="center" sx={{ mb: 2 }}>
        Workout Calendar
      </Typography>
      <Typography align="center" sx={{ mb: 1, fontWeight: "bold" }}>
        July 2025
      </Typography>

      {/* Calendar Grid */}
      <Paper elevation={3} sx={{ p: 1, borderRadius: 3 }}>
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

      {/* Legend */}
      <Box sx={{ mt: 2, mb: 1, pl: 0.5 }}>
        <Grid container spacing={1}>
          <Grid item>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#c8e6c9",
                borderRadius: 1,
                display: "inline-block",
                border: "1px solid #1b5e20",
                mr: 1,
              }}
            />{" "}
            Completed
          </Grid>
          <Grid item>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#ffcdd2",
                borderRadius: 1,
                display: "inline-block",
                border: "1px solid #b71c1c",
                mr: 1,
              }}
            />{" "}
            Terminated
          </Grid>
          <Grid item>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#fff9c4",
                borderRadius: 1,
                display: "inline-block",
                border: "1px solid #fbc02d",
                mr: 1,
              }}
            />{" "}
            Absent
          </Grid>
          <Grid item>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#eee",
                borderRadius: 1,
                display: "inline-block",
                border: "1px solid #bbb",
                mr: 1,
              }}
            />{" "}
            Sunday
          </Grid>
          <Grid item>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#e0f7fa",
                borderRadius: 1,
                display: "inline-block",
                border: "2px solid #00897b",
                mr: 1,
              }}
            />{" "}
            Today
          </Grid>
        </Grid>
      </Box>

      {/* Next workout details */}
      <Paper elevation={2} sx={{ p: 2, mt: 2, borderRadius: 3 }}>
        <Typography variant="subtitle2" sx={{ color: "#666" }}>
          Next Workout:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
          Legs - 5 sets, 30 mins
        </Typography>
        <Button variant="contained" color="success" fullWidth>
          Log Today's Workout
        </Button>
      </Paper>
    </Box>
  );
}
