import React, { useState } from "react";
import {
    Box, Typography, Card, CardContent, CardActions, Button, IconButton, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const DUMMY_ANNOUNCEMENTS = [
    {
        id: 1,
        title: "New Zumba Class Added",
        content: "Join our new Zumba class every Saturday at 6pm!",
        date: "2025-07-03",
    },
    {
        id: 2,
        title: "Gym Closed for Maintenance",
        content: "The gym will be closed on 12th July for equipment maintenance.",
        date: "2025-07-02",
    },
];

export default function AnnouncementManager() {
    const [announcements, setAnnouncements] = useState(DUMMY_ANNOUNCEMENTS);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    function handleAdd() {
        setEditing(null);
        setOpen(true);
    }
    function handleEdit(a) {
        setEditing(a);
        setOpen(true);
    }
    function handleDelete(id) {
        if (window.confirm("Delete this announcement?")) {
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        }
    }
    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            id: editing ? editing.id : Date.now(),
            title: form.title.value,
            content: form.content.value,
            date: form.date.value,
        };
        if (editing) {
            setAnnouncements((prev) => prev.map((a) => (a.id === editing.id ? data : a)));
        } else {
            setAnnouncements((prev) => [...prev, data]);
        }
        setOpen(false);
        setEditing(null);
    }
    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3} gap={1}>
                <AnnouncementIcon color="primary" />
                <Typography variant="h4" fontWeight="bold">
                    Announcements
                </Typography>
            </Box>
            <Button
                variant="contained"
                color="primary"
                sx={{ mb: 2 }}
                onClick={handleAdd}
            >
                Add Announcement
            </Button>
            <Grid container spacing={2}>
                {announcements.map((a) => (
                    <Grid item xs={12} sm={6} md={4} key={a.id}>
                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold">{a.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{a.content}</Typography>
                                <Typography variant="caption" display="block" mt={1}>{a.date}</Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton onClick={() => handleEdit(a)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(a.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? "Edit Announcement" : "Add Announcement"}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField label="Title" name="title" required defaultValue={editing?.title || ""} />
                        <TextField label="Content" name="content" multiline rows={3} required defaultValue={editing?.content || ""} />
                        <TextField label="Date" name="date" type="date" InputLabelProps={{ shrink: true }} defaultValue={editing?.date || ""} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
