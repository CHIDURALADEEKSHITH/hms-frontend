import { useEffect, useState } from "react";
import api from "../services/api";
import "./bed.css";

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    const [form, setForm] = useState({
        wardName: "",
        roomNumber: "",
        capacity: ""
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const [roomResponse, wardResponse] = await Promise.all([
                api.get("/bed/rooms"),
                api.get("/bed/wards")
            ]);

            setRooms(roomResponse.data || []);
            setWards(wardResponse.data || []);
        } catch (err) {
            setError("Unable to load room details.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openAddForm = () => {
        setEditingRoom(null);
        setForm({
            wardName: "",
            roomNumber: "",
            capacity: ""
        });
        setError("");
        setMessage("");
        setShowForm(true);
    };

    const openEditForm = (room) => {
        setEditingRoom(room);
        setForm({
            wardName: room.wardName,
            roomNumber: room.roomNumber,
            capacity: room.capacity
        });
        setError("");
        setMessage("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!form.wardName || !form.roomNumber.trim() || !form.capacity) {
            setError("Please fill in all fields.");
            return;
        }

        if (Number(form.capacity) <= 0 || !Number.isInteger(Number(form.capacity))) {
            setError("Capacity must be a positive whole number.");
            return;
        }

        const roomData = {
            wardName: form.wardName,
            roomNumber: form.roomNumber.trim(),
            capacity: Number(form.capacity)
        };

        try {
            if (editingRoom) {
                await api.put(`/bed/room/${editingRoom.id}`, roomData);
                setMessage("Room updated successfully.");
            } else {
                await api.post("/bed/room", roomData);
                setMessage("Room added successfully.");
            }

            setShowForm(false);
            setEditingRoom(null);
            await loadData();

        } catch (err) {
            const responseData = err.response?.data;

            setError(
                responseData?.message ||
                (typeof responseData === "string" ? responseData : null) ||
                "Unable to save room. Please check the room details."
            );
        }
    };

    const totalCapacity = rooms.reduce(
        (total, room) => total + Number(room.capacity || 0), 0
    );

    const totalBeds = rooms.reduce(
        (total, room) => total + Number(room.bedsAdded || 0), 0
    );

    const availableCapacity = rooms.reduce(
        (total, room) => total + Number(room.availableCapacity || 0), 0
    );

    return (
        <div className="bed-page">

            <div className="bed-page-header">
                <div>
                    <h1>Room Management</h1>
                    <p>Create and manage rooms under each ward.</p>
                </div>

                <button className="bed-primary-btn" onClick={openAddForm}>
                    + Add Room
                </button>
            </div>

            {message && <div className="bed-success">{message}</div>}
            {error && !showForm && <div className="bed-error">{error}</div>}

            <div className="bed-summary-grid">
                <div className="bed-summary-card">
                    <h3>Total Rooms</h3>
                    <h2>{rooms.length}</h2>
                </div>

                <div className="bed-summary-card">
                    <h3>Total Capacity</h3>
                    <h2>{totalCapacity}</h2>
                </div>

                <div className="bed-summary-card">
                    <h3>Beds Added</h3>
                    <h2>{totalBeds}</h2>
                </div>

                <div className="bed-summary-card">
                    <h3>Remaining Capacity</h3>
                    <h2>{availableCapacity}</h2>
                </div>
            </div>

            {showForm && (
                <div className="bed-form-card">
                    <h2>{editingRoom ? "Edit Room" : "Add New Room"}</h2>

                    {error && <div className="bed-error">{error}</div>}

                    <form onSubmit={handleSubmit}>

                        <div className="bed-form-grid">

                            <div className="bed-form-group">
                                <label>Ward</label>

                                <select
                                    name="wardName"
                                    value={form.wardName}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Ward</option>

                                    {wards.map(ward => (
                                        <option key={ward} value={ward}>
                                            {ward}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bed-form-group">
                                <label>Room Number</label>

                                <input
                                    type="text"
                                    name="roomNumber"
                                    value={form.roomNumber}
                                    onChange={handleChange}
                                    placeholder="Enter room number"
                                    required
                                />
                            </div>

                            <div className="bed-form-group">
                                <label>Room Capacity</label>

                                <input
                                    type="number"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    placeholder="Enter maximum beds"
                                    min="1"
                                    step="1"
                                    required
                                />
                            </div>

                        </div>

                        <div className="bed-form-actions">
                            <button type="submit" className="bed-primary-btn">
                                {editingRoom ? "Update Room" : "Save Room"}
                            </button>

                            <button
                                type="button"
                                className="bed-secondary-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setError("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            )}

            <div className="bed-table-card">
                <h2>Room List</h2>

                {loading ? (
                    <p>Loading rooms...</p>
                ) : rooms.length === 0 ? (
                    <p>No rooms found. Add a room to get started.</p>
                ) : (
                    <div className="bed-table-wrapper">
                        <table className="bed-table">
                            <thead>
                                <tr>
                                    <th>Ward</th>
                                    <th>Room Number</th>
                                    <th>Capacity</th>
                                    <th>Beds Added</th>
                                    <th>Remaining Capacity</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room.id}>
                                        <td>{room.wardName}</td>
                                        <td>{room.roomNumber}</td>
                                        <td>{room.capacity}</td>
                                        <td>{room.bedsAdded}</td>
                                        <td>{room.availableCapacity}</td>
                                        <td>
                                            <button
                                                className="bed-edit-btn"
                                                onClick={() => openEditForm(room)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default RoomManagement;