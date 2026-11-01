import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BedSidebar from "./BedSidebar";
import "./bed.css";

const BedManagement = () => {

    const navigate = useNavigate();

    const [beds, setBeds] = useState([]);
    const [wards, setWards] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingBed, setEditingBed] = useState(null);

    const [form, setForm] = useState({
        wardName: "",
        roomNumber: "",
        bedNumber: "",
        bedType: "GENERAL",
        status: "AVAILABLE"
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // LOAD BEDS AND EXISTING WARDS

    const loadBeds = async () => {

        try {

            setLoading(true);
            setError("");

            const [response, wardResponse] = await Promise.all([
                api.get("/bed/beds"),
                api.get("/bed/wards")
            ]);

            const bedList = Array.isArray(response.data)
                ? response.data
                : [];

            setBeds(bedList);
            setWards(Array.isArray(wardResponse.data) ? wardResponse.data : []);

        } catch (error) {

            console.error("Unable to load beds:", error);

            setError(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : "Unable to load beds."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadBeds();
    }, []);

    // LOAD ROOMS FOR SELECTED WARD

    const loadRooms = async (wardName) => {

        if (!wardName) {
            setRooms([]);
            return;
        }

        try {

            setRoomsLoading(true);

            const response = await api.get(
                `/bed/rooms/ward/${encodeURIComponent(wardName)}`
            );

            setRooms(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error("Unable to load rooms:", error);

            setRooms([]);
            setError("Unable to load rooms for this ward.");

        } finally {

            setRoomsLoading(false);
        }
    };

    // FORM CHANGE

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === "wardName" ? { roomNumber: "" } : {})
        }));

        if (name === "wardName") {
            setError("");
            setRooms([]);
            loadRooms(value);
        }
    };

    // RESET FORM

    const resetForm = () => {

        setForm({
            wardName: "",
            roomNumber: "",
            bedNumber: "",
            bedType: "GENERAL",
            status: "AVAILABLE"
        });

        setRooms([]);
        setEditingBed(null);
        setShowForm(false);
    };

    // OPEN ADD FORM

    const openAddForm = () => {

        setError("");
        setMessage("");

        setForm({
            wardName: "",
            roomNumber: "",
            bedNumber: "",
            bedType: "GENERAL",
            status: "AVAILABLE"
        });

        setRooms([]);
        setEditingBed(null);
        setShowForm(true);
    };

    // OPEN EDIT FORM

    const openEditForm = async (bed) => {

        setError("");
        setMessage("");

        setForm({
            wardName: bed.wardName || "",
            roomNumber: bed.roomNumber || "",
            bedNumber: bed.bedNumber || "",
            bedType: bed.bedType || "GENERAL",
            status: bed.status || "AVAILABLE"
        });

        setEditingBed(bed);
        setShowForm(true);

        await loadRooms(bed.wardName);
    };

    // SAVE BED

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");

        if (!form.wardName) {
            setError("Please select a ward.");
            return;
        }

        if (!form.roomNumber) {
            setError("Please select a room.");
            return;
        }

        if (!form.bedNumber.trim()) {
            setError("Please enter bed number.");
            return;
        }

        try {

            if (editingBed) {

                await api.put(
                    `/bed/bed/${editingBed.id}`,
                    form
                );

                setMessage("Bed updated successfully.");

            } else {

                await api.post(
                    "/bed/bed",
                    {
                        wardName: form.wardName,
                        roomNumber: form.roomNumber,
                        bedNumber: form.bedNumber,
                        bedType: form.bedType
                    }
                );

                setMessage("Bed added successfully.");
            }

            resetForm();

            await loadBeds();

        } catch (error) {

            console.error("Unable to save bed:", error);

            setError(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.data?.message ||
                      "Unable to save bed."
            );
        }
    };

    // BED STATUS STYLE

    const getStatusClass = (status) => {

        if (status === "AVAILABLE") return "available";
        if (status === "OCCUPIED") return "occupied";
        if (status === "RESERVED") return "reserved";
        if (status === "MAINTENANCE") return "maintenance";

        return "";
    };

    const availableCount = beds.filter(
        bed => bed.status === "AVAILABLE"
    ).length;

    const occupiedCount = beds.filter(
        bed => bed.status === "OCCUPIED"
    ).length;

    const maintenanceCount = beds.filter(
        bed => bed.status === "MAINTENANCE"
    ).length;

    // SHOW ROOMS WITH CAPACITY
    // While editing, also show the bed's existing room.

    const availableRooms = rooms.filter(room =>
        Number(room.availableCapacity) > 0 ||
        (
            editingBed &&
            room.roomNumber === editingBed.roomNumber
        )
    );

    return (

        <div className="bed-layout">

            <BedSidebar />

            <main className="bed-main bed-page">

                {/* HEADER */}

                <header className="bed-page-header">

                    <div>

                        <button
                            className="bed-back-button"
                            onClick={() => navigate("/bed")}
                        >
                            ← Dashboard
                        </button>

                        <h1>Bed Management</h1>

                        <p>
                            Add, update and monitor hospital beds
                        </p>

                    </div>

                    <button
                        className="bed-primary-button"
                        onClick={openAddForm}
                    >
                        + Add Bed
                    </button>

                </header>

                {/* MESSAGES */}

                {message && (
                    <div className="bed-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bed-error">
                        {error}
                    </div>
                )}

                {/* SUMMARY */}

                <div className="bed-stats">

                    <div className="bed-stat-card">
                        <div className="bed-stat-icon ward">🛏️</div>
                        <div>
                            <span>Total Beds</span>
                            <h2>{beds.length}</h2>
                        </div>
                    </div>

                    <div className="bed-stat-card">
                        <div className="bed-stat-icon available">✓</div>
                        <div>
                            <span>Available</span>
                            <h2>{availableCount}</h2>
                        </div>
                    </div>

                    <div className="bed-stat-card">
                        <div className="bed-stat-icon occupied">🛏️</div>
                        <div>
                            <span>Occupied</span>
                            <h2>{occupiedCount}</h2>
                        </div>
                    </div>

                    <div className="bed-stat-card">
                        <div className="bed-stat-icon room">⚙️</div>
                        <div>
                            <span>Maintenance</span>
                            <h2>{maintenanceCount}</h2>
                        </div>
                    </div>

                </div>

                {/* ADD / EDIT FORM */}

                {showForm && (

                    <div className="bed-form-card">

                        <div className="bed-form-header">

                            <div>

                                <span className="bed-small-label">
                                    {editingBed ? "UPDATE BED" : "NEW BED"}
                                </span>

                                <h2>
                                    {editingBed ? "Update Bed" : "Add New Bed"}
                                </h2>

                            </div>

                            <button
                                onClick={resetForm}
                                type="button"
                            >
                                ✕
                            </button>

                        </div>

                        <form
                            className="bed-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="bed-form-grid">

                                {/* WARD DROPDOWN */}

                                <div className="bed-form-group">

                                    <label>Ward Name *</label>

                                    <select
                                        name="wardName"
                                        value={form.wardName}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select Ward
                                        </option>

                                        {wards.map(ward => (
                                            <option key={ward} value={ward}>
                                                {ward}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                {/* ROOM DROPDOWN */}

                                <div className="bed-form-group">

                                    <label>Room Number *</label>

                                    <select
                                        name="roomNumber"
                                        value={form.roomNumber}
                                        onChange={handleChange}
                                        disabled={!form.wardName || roomsLoading}
                                        required
                                    >

                                        <option value="">
                                            {roomsLoading
                                                ? "Loading rooms..."
                                                : "Select Room"}
                                        </option>

                                        {availableRooms.map(room => (

                                            <option
                                                key={room.id}
                                                value={room.roomNumber}
                                            >
                                                Room {room.roomNumber} -
                                                {" "}{room.availableCapacity} space(s) left
                                            </option>

                                        ))}

                                    </select>

                                    {form.wardName &&
                                        !roomsLoading &&
                                        availableRooms.length === 0 && (
                                            <small>
                                                No rooms with available capacity.
                                                Please create a room first.
                                            </small>
                                        )}

                                </div>

                                {/* BED NUMBER */}

                                <div className="bed-form-group">

                                    <label>Bed Number *</label>

                                    <input
                                        type="text"
                                        name="bedNumber"
                                        value={form.bedNumber}
                                        onChange={handleChange}
                                        placeholder="Example: B-01"
                                        required
                                    />

                                </div>

                                {/* BED TYPE */}

                                <div className="bed-form-group">

                                    <label>Bed Type</label>

                                    <select
                                        name="bedType"
                                        value={form.bedType}
                                        onChange={handleChange}
                                    >

                                        <option value="GENERAL">General</option>
                                        <option value="PRIVATE">Private</option>
                                        <option value="SEMI_PRIVATE">Semi Private</option>
                                        <option value="ICU">ICU</option>
                                        <option value="EMERGENCY">Emergency</option>

                                    </select>

                                </div>

                                {/* STATUS - EDIT ONLY */}

                                {editingBed && (

                                    <div className="bed-form-group">

                                        <label>Status</label>

                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                        >

                                            <option value="AVAILABLE">Available</option>
                                            <option value="OCCUPIED">Occupied</option>
                                            <option value="RESERVED">Reserved</option>
                                            <option value="MAINTENANCE">Maintenance</option>

                                        </select>

                                    </div>

                                )}

                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "20px"
                                }}
                            >

                                <button
                                    type="submit"
                                    className="bed-submit-button"
                                >
                                    {editingBed ? "Update Bed" : "Add Bed"}
                                </button>

                                <button
                                    type="button"
                                    className="bed-cancel-button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                )}

                {/* BED TABLE */}

                <div className="bed-table-card">

                    <div className="bed-table-header">

                        <div>
                            <h2>Hospital Beds</h2>
                            <span>{beds.length} bed(s)</span>
                        </div>

                        <button
                            className="bed-refresh-button"
                            onClick={loadBeds}
                        >
                            ↻ Refresh
                        </button>

                    </div>

                    {loading ? (

                        <div className="bed-loading">
                            Loading beds...
                        </div>

                    ) : beds.length === 0 ? (

                        <div className="bed-empty">

                            <div>🛏️</div>

                            <h3>No Beds Found</h3>

                            <p>
                                Add rooms first, then add beds to those rooms.
                            </p>

                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table className="bed-table">

                                <thead>
                                    <tr>
                                        <th>Bed ID</th>
                                        <th>Ward</th>
                                        <th>Room</th>
                                        <th>Bed Number</th>
                                        <th>Bed Type</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {beds.map(bed => (

                                        <tr key={bed.id}>

                                            <td>#{bed.id}</td>

                                            <td>
                                                <strong>
                                                    {bed.wardName || "-"}
                                                </strong>
                                            </td>

                                            <td>{bed.roomNumber || "-"}</td>

                                            <td>{bed.bedNumber || "-"}</td>

                                            <td>
                                                <span className="bed-category">
                                                    {bed.bedType || "GENERAL"}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`bed-status ${getStatusClass(
                                                        bed.status
                                                    )}`}
                                                >
                                                    {bed.status || "AVAILABLE"}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="table-action primary"
                                                    onClick={() => openEditForm(bed)}
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

            </main>

        </div>
    );
};

export default BedManagement;