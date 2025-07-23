import React from "react";
import { NavLink } from "react-router-dom";
import { List, ListItem, ListItemIcon, ListItemText, Divider, Drawer, Toolbar } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BuildIcon from "@mui/icons-material/Build";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const menuItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Home", path: "/home", icon: <HomeIcon /> }, // <-- add this line
  { label: "Workout Calendar", path: "/workout-calendar", icon: <CalendarTodayIcon /> }, // <--- added
  { label: "Programs", path: "/programs", icon: <ListAltIcon /> },
  { label: "Members", path: "/members", icon: <GroupIcon /> },
  { label: "Membership Plans", path: "/membership-plan-manager", icon: <ManageAccountsIcon /> },
  { label: "Gym Admin Panel", path: "/gym-admin", icon: <HomeIcon /> },
  { label: "Gym Setup", path: "/gym-setup", icon: <BuildIcon /> },
  { label: "Equipment", path: "/equipment", icon: <BuildIcon /> },
  { label: "Exercises", path: "/exercises", icon: <FitnessCenterIcon /> },
  { label: "Workouts", path: "/workouts", icon: <FitnessCenterIcon /> },
  { label: "Workout Plan Manager", path: "/workout-plan-manager", icon: <CalendarTodayIcon /> },
  { label: "Log Workout", path: "/log-workout", icon: <AssignmentTurnedInIcon /> },
  { label: "Log Workout Pro", path: "/log-workout-pro", icon: <AssignmentTurnedInIcon /> },
  { label: "Announcements", path: "/announcements", icon: <AnnouncementIcon /> },
  { label: "Assessment Entry", path: "/assessment-entry", icon: <AssessmentIcon /> },
  { label: "Assessment Entry Pro", path: "/assessment-entry-pro", icon: <AssessmentIcon /> },
  { label: "Assessment Template Designer", path: "/assessment-template-designer", icon: <AssessmentIcon /> },
  { label: "Standard Attributes", path: "/standard-attributes", icon: <AssessmentIcon /> },
  { label: "Gym Assessment Configurator", path: "/gym-assessment-configurator", icon: <AssessmentIcon /> },
  { label: "Visitor Manager", path: "/visitor-manager", icon: <GroupIcon /> },
  { label: "Cycle Plan Manager", path: "/cycle-plan-manager", icon: <CalendarTodayIcon /> },
  // The new landing page for cycle config manager:
  { label: "Cycle Config Manager", path: "/cycle-plan-manager-landing", icon: <CalendarTodayIcon /> },
  { label: "Profile", path: "/profile", icon: <GroupIcon /> },
  { label: "User Profile", path: "/user-profile", icon: <GroupIcon /> },
  { label: "Create Gym", path: "/create-gym", icon: <BuildIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
  { label: "Login", path: "/login", icon: <ExitToAppIcon /> },
];

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item, idx) => (
          <ListItem
            button
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              '&.active': {
                bgcolor: 'primary.main',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
}
