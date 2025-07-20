import React from "react";
import Sidebar from "./Sidebar";
import { Box } from "@mui/material";

export default function Layout({ children }) {
    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, p: 3 }}>
                {children}
            </Box>
        </Box>
    );
}
