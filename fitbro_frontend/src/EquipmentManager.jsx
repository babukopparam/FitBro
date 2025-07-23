import React, { useState } from "react";
import {
    Box, Typography, Card, CardContent, CardActions, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Chip, Grid, Tooltip
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const DUMMY_EQUIPMENT = [
    {
        id: 1,
        name: "Treadmill",
        manufacturer: "Life Fitness",
        boughtDate: "2022-06-10",
        expiryDate: "2027-06-10",
        status: "Active",
        gym: "XYZ Gym",
    },
    {
        id: 2,
        name: "Chest Press Machine",
        manufacturer: "Nautilus",
        boughtDate: "2021-09-15",
        expiryDate: "2026-09-15",
        status: "Maintenance",
        gym: "XYZ Gym",
    },
];

export default function EquipmentManager() {
    const [equipmentList, setEquipmentList] = useState(DUMMY_EQUIPMENT);
    const [open, setOpen] = useState(false);
    const [editEq, setEditEq] = useState(null);

    function handleAdd() {
        setEditEq(null);
        setOpen(true);
    }

    function handleEdit(eq) {
        setEditEq(eq);
        setOpen(true);
    }

    function handleDelete(id) {
        if (window.confirm("Delete this equipment?")) {
            setEquipmentList((prev) => prev.filter((eq) => eq.id !== id));
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            id: editEq ? editEq.id : Date.now(),
            name: form.name.value,
            manufacturer: form.manufacturer.value,
            boughtDate: form.boughtDate.value,
            expiryDate: form.expiryDate.value,
            status: form.status.value,
            gym: "XYZ Gym",
        };
        if (editEq) {
            setEquipmentList((prev) =>
                prev.map((eq) => (eq.id === editEq.id ? data : eq))
            );
        } else {
            setEquipmentList((prev) => [...prev, data]);
        }
        setOpen(false);
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3} gap={1}>
                <FitnessCenterIcon color="primary" />
                <Typography variant="h4" fontWeight="bold">
                    Equipment Manager
                </Typography>
            </Box>
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ mb: 2 }}
                onClick={handleAdd}
            >
                Add Equipment
            </Button>
            <Grid container spacing={2}>
                {equipmentList.map((eq) => (
                    <Grid item xs={12} sm={6} md={4} key={eq.id}>
                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {eq.name}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Manufacturer:</b> {eq.manufacturer}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Bought Date:</b> {eq.boughtDate}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Expiry Date:</b> {eq.expiryDate}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Status:</b>{" "}
                                    {eq.status === "Active" ? (
                                        <Chip label="Active" color="success" size="small" />
                                    ) : eq.status === "Maintenance" ? (
                                        <Chip label="Maintenance" color="warning" size="small" />
                                    ) : (
                                        <Chip label="Retired" color="default" size="small" />
                                    )}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Tooltip title="Edit">
                                    <IconButton onClick={() => handleEdit(eq)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton onClick={() => handleDelete(eq.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                                {eq.status !== "Active" && (
                                    <Tooltip title="Mark as Active">
                                        <IconButton
                                            color="success"
                                            onClick={() =>
                                                setEquipmentList((prev) =>
                                                    prev.map((e) =>
                                                        e.id === eq.id ? { ...e, status: "Active" } : e
                                                    )
                                                )
                                            }
                                        >
                                            <CheckCircleIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {eq.status === "Active" && (
                                    <Tooltip title="Mark as Maintenance">
                                        <IconButton
                                            color="warning"
                                            onClick={() =>
                                                setEquipmentList((prev) =>
                                                    prev.map((e) =>
                                                        e.id === eq.id ? { ...e, status: "Maintenance" } : e
                                                    )
                                                )
                                            }
                                        >
                                            <HighlightOffIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editEq ? "Edit Equipment" : "Add Equipment"}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Equipment Name"
                            name="name"
                            required
                            defaultValue={editEq?.name || ""}
                        />
                        <TextField
                            label="Manufacturer"
                            name="manufacturer"
                            defaultValue={editEq?.manufacturer || ""}
                        />
                        <TextField
                            label="Bought Date"
                            name="boughtDate"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            defaultValue={editEq?.boughtDate || ""}
                        />
                        <TextField
                            label="Expiry/Best Before Date"
                            name="expiryDate"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            defaultValue={editEq?.expiryDate || ""}
                        />
                        <Select
                            name="status"
                            label="Status"
                            defaultValue={editEq?.status || "Active"}
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                            <MenuItem value="Retired">Retired</MenuItem>
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
