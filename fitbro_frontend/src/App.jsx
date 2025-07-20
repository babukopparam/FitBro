import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ProgramManager from "./ProgramManager";
import MemberManager from "./MemberManager";
import MembershipPlanManager from "./MembershipPlanManager";
import GymAdminPanel from "./GymAdminPanel";
import GymSetup from "./GymSetup";
import EquipmentManager from "./EquipmentManager";
import ExerciseManager from "./ExerciseManager";
import WorkoutManager from "./WorkoutManager";
import WorkoutPlanManager from "./WorkoutPlanManager";
import LogWorkout from "./LogWorkout";
import LogWorkoutPro from "./LogWorkoutPro";
import AnnouncementManager from "./AnnouncementManager";
import AssessmentEntry from "./AssessmentEntry";
import AssessmentEntry_Pro from "./AssessmentEntry_Pro";
import AssessmentTemplateDesigner from "./AssessmentTemplateDesigner";
import StandardAttributesManager from "./StandardAttributesManager";
import GymAssessmentConfigurator from "./GymAssessmentConfigurator";
import VisitorManager from "./VisitorManager";
import CyclePlanManager from "./CyclePlanManager";
import CyclePlanManagerLanding from "./CyclePlanManagerLanding";
import Profile from "./Profile";
import UserProfile from "./UserProfile";
import CreateGym from "./CreateGym";
import Settings from "./Settings";
import Login from "./Login";
import WorkoutCalendarScreen from "./WorkoutCalendarScreen"; // <--- added
import HomeScreen from "./HomeScreen"; // <-- add this import

export default function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flexGrow: 1, padding: "24px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout-calendar" element={<WorkoutCalendarScreen />} />
            <Route path="/home" element={<HomeScreen />} /> {/* <-- add this line */}
            <Route path="/programs" element={<ProgramManager />} />
            <Route path="/members" element={<MemberManager />} />
            <Route path="/membership-plan-manager" element={<MembershipPlanManager />} />
            <Route path="/gym-admin" element={<GymAdminPanel />} />
            <Route path="/gym-setup" element={<GymSetup />} />
            <Route path="/equipment" element={<EquipmentManager />} />
            <Route path="/exercises" element={<ExerciseManager />} />
            <Route path="/workouts" element={<WorkoutManager />} />
            <Route path="/workout-plan-manager" element={<WorkoutPlanManager />} />
            <Route path="/log-workout" element={<LogWorkout />} />
            <Route path="/log-workout-pro" element={<LogWorkoutPro />} />
            <Route path="/announcements" element={<AnnouncementManager />} />
            <Route path="/assessment-entry" element={<AssessmentEntry />} />
            <Route path="/assessment-entry-pro" element={<AssessmentEntry_Pro />} />
            <Route path="/assessment-template-designer" element={<AssessmentTemplateDesigner />} />
            <Route path="/standard-attributes" element={<StandardAttributesManager />} />
            <Route path="/gym-assessment-configurator" element={<GymAssessmentConfigurator />} />
            <Route path="/visitor-manager" element={<VisitorManager />} />
            <Route path="/cycle-plan-manager" element={<CyclePlanManager />} />
            {/* NEW CYCLE CONFIG MANAGER LANDING PAGE */}
            <Route path="/cycle-plan-manager-landing" element={<CyclePlanManagerLanding />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/create-gym" element={<CreateGym />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            {/* Workout Calendar */}
            <Route path="/workout-calendar" element={<WorkoutCalendarScreen />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
