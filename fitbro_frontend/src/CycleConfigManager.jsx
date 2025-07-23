import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, IconButton, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const API_BASE = "http://localhost:8000";

function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to get status (Active, Completed, Future)
function getStatus(start, end) {
  const today = dayjs();
  if (today.isAfter(end, "day")) return "Completed";
  if (today.isBefore(start, "day")) return "Future";
  if (today.isAfter(start, "day") && today.isBefore(end, "day")) return "Active";
  return "Active";
}

export default function CycleConfigManager({ open, onClose, member }) {
  const [cycles, setCycles] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load cycles on open/member change
  useEffect(() => {
    if (!open || !member) return;
    const loadCycles = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/cycle-plans/?member_id=${member.id}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCycles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(`Failed to load cycles: ${err.message}`);
        setCycles([]);
      } finally {
        setLoading(false);
      }
    };
    loadCycles();
  }, [open, member]);

  const handleEdit = useCallback((idx) => {
    setEditIdx(idx);
    setEditRow({ ...cycles[idx] });
  }, [cycles]);

  const handleCancel = useCallback(() => {
    setEditIdx(null);
    setEditRow(null);
  }, []);

  const handleChange = useCallback((field, value) => {
    setEditRow(r => ({ ...r, [field]: value }));
  }, []);

  const handleSave = useCallback(async (idx) => {
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const payload = {
        ...editRow,
        member_id: member.id,
        cycle_number: editRow.cycle_number,
        start_date: editRow.start_date,
        end_date: editRow.end_date,
        duration: editRow.duration,
        status: getStatus(dayjs(editRow.start_date), dayjs(editRow.end_date))
      };
      const res = await fetch(`${API_BASE}/cycle-plans/${editRow.id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Save failed: ${res.status} ${errorData}`);
      }
      const updated = await res.json();
      setCycles(cycles => cycles.map((c, i) => i === idx ? updated : c));
      setSuccess("Updated successfully!");
      setEditIdx(null);
      setEditRow(null);
    } catch (e) {
      setError(`Error updating cycle: ${e.message}`);
    }
    setSaving(false);
  }, [editRow, member.id]);

  const handleDelete = useCallback(async (idx) => {
    if (!window.confirm("Are you sure you want to delete this cycle?")) return;
    const id = cycles[idx].id;
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/cycle-plans/${id}/delete`, {
        method: "PUT",
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Delete failed: ${res.status} ${errorData}`);
      }
      setCycles(cycles => cycles.filter((_, i) => i !== idx));
      setSuccess("Cycle deleted!");
    } catch (e) {
      setError(`Error deleting cycle: ${e.message}`);
    }
    setSaving(false);
  }, [cycles]);

  // Add new cycle (auto-calculating start/end, duration)
  const handleAdd = useCallback(async () => {
    setError(""); setSuccess(""); setSaving(true);
    try {
      const last = cycles[cycles.length - 1];
      let defaultDuration = 30;
      // CORRECTED: use direct membership_start_date/end_date from member
      let planStart = dayjs(member.membership_start_date);
      let planEnd = dayjs(member.membership_end_date);
      let newStart = last ? dayjs(last.end_date).add(1, "day") : planStart;

      if (!newStart.isBefore(planEnd)) {
        setError("Cannot add more cycles beyond membership end date.");
        setSaving(false);
        return;
      }
      let daysLeft = planEnd.diff(newStart, "day") + 1;
      if (daysLeft <= 0) {
        setError("Cannot add more cycles beyond membership end date.");
        setSaving(false);
        return;
      }
      let duration = daysLeft < defaultDuration ? daysLeft : defaultDuration;
      let newEnd = newStart.add(duration - 1, "day");
      if (newEnd.isAfter(planEnd)) newEnd = planEnd;

      const payload = {
        member_id: member.id,
        cycle_number: cycles.length + 1,
        start_date: newStart.format("YYYY-MM-DD"),
        end_date: newEnd.format("YYYY-MM-DD"),
        duration,
        status: getStatus(newStart, newEnd)
      };
      const res = await fetch(`${API_BASE}/cycle-plans/`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Create failed: ${res.status} ${errorData}`);
      }
      const created = await res.json();
      setCycles(cycles => [...cycles, created]);
      setSuccess("Cycle added!");
    } catch (e) {
      setError(`Error creating cycle: ${e.message}`);
    }
    setSaving(false);
  }, [cycles, member]);

  // On duration edit, auto-adjust end_date and propagate to subsequent cycles
  const handleDurationChange = useCallback((idx, newDuration) => {
    setCycles(currentCycles => {
      let updated = [...currentCycles];
      // CORRECTED: use direct membership_end_date from member
      let planEnd = dayjs(member.membership_end_date);

      for (let i = idx; i < updated.length; i++) {
        let prev = i === 0 ? null : updated[i - 1];
        let start = prev ? dayjs(prev.end_date).add(1, "day") : dayjs(updated[i].start_date);
        let daysLeft = planEnd.diff(start, "day") + 1;
        let duration = (i === updated.length - 1 && daysLeft < newDuration) ? daysLeft : newDuration;
        let end = start.add(duration - 1, "day");
        if (end.isAfter(planEnd)) end = planEnd;

        updated[i] = {
          ...updated[i],
          start_date: start.format("YYYY-MM-DD"),
          end_date: end.format("YYYY-MM-DD"),
          duration
        };
        newDuration = duration; // propagate to next cycle
      }
      return updated;
    });
  }, [member.membership_end_date]);

  // FIX addDisabled: should use membership_end_date directly
  const addDisabled =
    saving ||
    loading ||
    (cycles.length > 0 &&
      dayjs(cycles[cycles.length - 1].end_date).isSameOrAfter(dayjs(member.membership_end_date)));

  if (!open || !member) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Configure Cycles for {member?.name}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
      {loading && <Alert severity="info" sx={{ mb: 1 }}>Loading cycles...</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cycle #</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Duration (days)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cycles.map((cycle, idx) => (
              <TableRow key={cycle.id || idx}>
                <TableCell>{cycle.cycle_number}</TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      type="date"
                      value={editRow?.start_date || ""}
                      onChange={e => handleChange("start_date", e.target.value)}
                      size="small"
                    />
                  ) : (
                    cycle.start_date
                  )}
                </TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      type="date"
                      value={editRow?.end_date || ""}
                      onChange={e => handleChange("end_date", e.target.value)}
                      size="small"
                    />
                  ) : (
                    cycle.end_date
                  )}
                </TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      type="number"
                      value={editRow?.duration || ""}
                      onChange={e => {
                        const newDuration = Number(e.target.value);
                        handleChange("duration", newDuration);
                        handleDurationChange(idx, newDuration);
                      }}
                      size="small"
                      sx={{ width: 70 }}
                    />
                  ) : (
                    cycle.duration
                  )}
                </TableCell>
                <TableCell>{cycle.status}</TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <>
                      <IconButton color="success" onClick={() => handleSave(idx)} disabled={saving}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={handleCancel} disabled={saving}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton color="primary" onClick={() => handleEdit(idx)} disabled={saving || loading}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(idx)} disabled={saving || loading}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {cycles.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No cycles found. Click "Add Cycle" to create one.
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleAdd}
                  startIcon={<AddIcon />}
                  disabled={addDisabled}
                >
                  Add Cycle
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button variant="contained" onClick={onClose}>Close</Button>
      </Box>
    </Box>
  );
}
