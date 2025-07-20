import React, { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Stack, Dialog, Alert
} from "@mui/material";
import CycleConfigManager from "./CycleConfigManager";

const API_BASE = "http://localhost:8000";

function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CyclePlanManagerLanding() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch paginated members
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/members/?page=1&page_size=50`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(e => setError("Failed to load members: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  // Fetch all membership plans for lookup
  useEffect(() => {
    fetch(`${API_BASE}/membership-plans/`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => setPlans(Array.isArray(data) ? data : []))
      .catch(e => setError("Failed to load plans: " + e.message));
  }, []);

  // Lookup map: planId -> planName
  const planMap = Object.fromEntries(plans.map(p => [p.id, p.name]));

  // Filter logic (by member name or plan name)
  const filteredMembers = members.filter(
    (m) =>
      (m.name && m.name.toLowerCase().includes(search.toLowerCase())) ||
      (planMap[m.membership_plan_id] && planMap[m.membership_plan_id].toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Cycle Plan Manager
      </Typography>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Search Member"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ width: 300 }}
        />
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading members...</Alert>}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Member Name</TableCell>
              <TableCell>Membership Plan</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{planMap[m.membership_plan_id] || "-"}</TableCell>
                <TableCell>{m.membership_start_date || "-"}</TableCell>
                <TableCell>{m.membership_end_date || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedMember(m)}
                  >
                    Configure Cycles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredMembers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pop-up for cycle config */}
      <Dialog open={!!selectedMember} onClose={() => setSelectedMember(null)} maxWidth="md" fullWidth>
        {selectedMember && (
          <CycleConfigManager
            open={!!selectedMember}
            onClose={() => setSelectedMember(null)}
            member={selectedMember}
          />
        )}
      </Dialog>
    </Box>
  );
}
