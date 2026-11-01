import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BedSidebar from "./BedSidebar";
import "./bed.css";

const BedManagement = () => {

    const navigate = useNavigate();

    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingBed, setEditingBed] = useState(null);

    const [form, setForm] = useState({
        wardName: "",
        roomNumber: "",
        bedNumber: "",
        bedType: "GENERAL",
        status: "AVAILABLE"
    });

    useEffect(() => {
        loadBeds();
    }, []);

    // ==============================
    // LOAD ALL BEDS
    // ==============================

    const loadBeds = async () => {

        try {

            setLoading(true);

            const response = await api.get("/bed/beds");

            setBeds(response.data || []);

        } catch (error) {

            console.error("Unable to load beds", error);

            alert(
                error.response?.data ||
                "Unable to load beds"
            );

        } finally {

            setLoading(false);

        }
    };

    // ==============================
    // FORM CHANGE
    // ==============================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    // ==============================
    // RESET FORM
    // ==============================

    const resetForm = () => {

        setForm({
            wardName: "",
            roomNumber: "",
            bedNumber: "",
            bedType: "GENERAL",
            status: "AVAILABLE"
        });

        setEditingBed(null);
        setShowForm(false);
    };

    // ==============================
    // ADD / UPDATE BED
    // ==============================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.wardName.trim()) {
            alert("Please enter ward name");
            return;
        }

        if (!form.roomNumber.trim()) {
            alert("Please enter room number");
            return;
        }

        if (!form.bedNumber.trim()) {
            alert("Please enter bed number");
            return;
        }

        try {

            if (editingBed) {

                await api.put(
                    `/bed/bed/${editingBed.id}`,
                    form
                );

                alert("Bed updated successfully");

            } else {

                await api.post(
                    "/bed/bed",
                    form
                );

                alert("Bed added successfully");
            }

            resetForm();
            loadBeds();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data ||
                "Unable to save bed"
            );
        }
    };

    // ==============================
    // EDIT BED
    // ==============================

    const handleEdit = (bed) => {

        setEditingBed(bed);

        setForm({
            wardName: bed.wardName || "",
            roomNumber: bed.roomNumber || "",
            bedNumber: bed.bedNumber || "",
            bedType: bed.bedType || "GENERAL",
            status: bed.status || "AVAILABLE"
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // ==============================
    // BED COUNTS
    // ==============================

    const totalBeds = beds.length;

    const availableBeds = beds.filter(
        bed => bed.status === "AVAILABLE"
    ).length;

    const occupiedBeds = beds.filter(
        bed => bed.status === "OCCUPIED"
    ).length;

    const reservedBeds = beds.filter(
        bed => bed.status === "RESERVED"
    ).length;

    const maintenanceBeds = beds.filter(
        bed => bed.status === "MAINTENANCE"
    ).length;

    // ==============================
    // UNIQUE WARDS
    // ==============================

    const totalWards = new Set(
        beds
            .map(bed => bed.wardName)
            .filter(Boolean)
    ).size;

    // ==============================
    // UNIQUE ROOMS
    // ==============================

    const totalRooms = new Set(
        beds
            .filter(
                bed =>
                    bed.wardName &&
                    bed.roomNumber
            )
            .map(
                bed =>
                    `${bed.wardName}-${bed.roomNumber}`
            )
    ).size;

    // ==============================
    // STATUS CLASS
    // ==============================

    const getStatusClass = (status) => {

        switch (status) {

            case "AVAILABLE":
                return "status-available";

            case "OCCUPIED":
                return "status-occupied";

            case "RESERVED":
                return "status-reserved";

            case "MAINTENANCE":
                return "status-maintenance";

            default:
                return "";
        }
    };

    return (

        <div className="bed-layout">
            <BedSidebar />
            <main className="bed-main bed-page">

            {/* ================= HEADER ================= */}

            <header className="bed-page-header">

                <div>

                    <button
                        className="bed-back-button"
                        onClick={() => navigate("/bed")}
                    >
                        ← Dashboard
                    </button>

                    <h1>Bed Manager</h1>

                    <p>
                        Manage hospital beds, rooms and wards
                    </p>

                </div>

                <button
                    className="bed-primary-button"
                    onClick={() => {

                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }

                    }}
                >
                    {showForm ? "✕ Close" : "+ Add Bed"}
                </button>

            </header>


            {/* ================= SUMMARY ================= */}

            <div className="bed-stats-grid">

                <div className="bed-stat-card">

                    <div className="bed-stat-icon">
                        🛏️
                    </div>

                    <div>

                        <span>Total Beds</span>

                        <strong>
                            {totalBeds}
                        </strong>

                    </div>

                </div>


                <div className="bed-stat-card">

                    <div className="bed-stat-icon">
                        🟢
                    </div>

                    <div>

                        <span>Available</span>

                        <strong>
                            {availableBeds}
                        </strong>

                    </div>

                </div>


                <div className="bed-stat-card">

                    <div className="bed-stat-icon">
                        🔴
                    </div>

                    <div>

                        <span>Occupied</span>

                        <strong>
                            {occupiedBeds}
                        </strong>

                    </div>

                </div>


                <div className="bed-stat-card">

                    <div className="bed-stat-icon">
                        🏥
                    </div>

                    <div>

                        <span>Wards</span>

                        <strong>
                            {totalWards}
                        </strong>

                    </div>

                </div>


                <div className="bed-stat-card">

                    <div className="bed-stat-icon">
                        🚪
                    </div>

                    <div>

                        <span>Rooms</span>

                        <strong>
                            {totalRooms}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ================= ADD / EDIT FORM ================= */}

            {showForm && (

                <div className="bed-form-card">

                    <div className="bed-form-header">

                        <div>

                            <h2>
                                {editingBed
                                    ? "Edit Bed"
                                    : "Add New Bed"}
                            </h2>

                            <p>
                                {editingBed
                                    ? "Update bed information"
                                    : "Add a new hospital bed"}
                            </p>

                        </div>

                        <button
                            onClick={resetForm}
                        >
                            ✕
                        </button>

                    </div>


                    <form
                        className="bed-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="bed-form-grid">


                            {/* WARD */}

                            <div className="bed-form-group">

                                <label>
                                    Ward Name *
                                </label>

                                <input
                                    type="text"
                                    name="wardName"
                                    placeholder="Example: General Ward"
                                    value={form.wardName}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* ROOM */}

                            <div className="bed-form-group">

                                <label>
                                    Room Number *
                                </label>

                                <input
                                    type="text"
                                    name="roomNumber"
                                    placeholder="Example: 101"
                                    value={form.roomNumber}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* BED NUMBER */}

                            <div className="bed-form-group">

                                <label>
                                    Bed Number *
                                </label>

                                <input
                                    type="text"
                                    name="bedNumber"
                                    placeholder="Example: B-101"
                                    value={form.bedNumber}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* BED TYPE */}

                            <div className="bed-form-group">

                                <label>
                                    Bed Type
                                </label>

                                <select
                                    name="bedType"
                                    value={form.bedType}
                                    onChange={handleChange}
                                >

                                    <option value="GENERAL">
                                        General
                                    </option>

                                    <option value="PRIVATE">
                                        Private
                                    </option>

                                    <option value="SEMI_PRIVATE">
                                        Semi Private
                                    </option>

                                    <option value="ICU">
                                        ICU
                                    </option>

                                    <option value="EMERGENCY">
                                        Emergency
                                    </option>

                                </select>

                            </div>


                            {/* STATUS */}

                            <div className="bed-form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >

                                    <option value="AVAILABLE">
                                        Available
                                    </option>

                                    <option value="OCCUPIED">
                                        Occupied
                                    </option>

                                    <option value="RESERVED">
                                        Reserved
                                    </option>

                                    <option value="MAINTENANCE">
                                        Maintenance
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div className="bed-form-actions">

                            <button
                                type="button"
                                className="bed-secondary-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="bed-submit-button"
                            >
                                {editingBed
                                    ? "Update Bed"
                                    : "Add Bed"}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ================= BED TABLE ================= */}

            <div className="bed-table-card">

                <div className="bed-table-header">

                    <div>

                        <h2>
                            Hospital Beds
                        </h2>

                        <span>
                            {beds.length} bed(s)
                        </span>

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

                        <div>
                            🛏️
                        </div>

                        <h3>
                            No Beds Found
                        </h3>

                        <p>
                            Add your first hospital bed.
                        </p>

                    </div>

                ) : (

                    <div className="bed-table-wrapper">

                        <table className="bed-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Ward
                                    </th>

                                    <th>
                                        Room
                                    </th>

                                    <th>
                                        Bed Number
                                    </th>

                                    <th>
                                        Bed Type
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {beds.map((bed) => (

                                    <tr key={bed.id}>

                                        <td>
                                            #{bed.id}
                                        </td>

                                        <td>
                                            <strong>
                                                {bed.wardName || "-"}
                                            </strong>
                                        </td>

                                        <td>
                                            {bed.roomNumber || "-"}
                                        </td>

                                        <td>
                                            {bed.bedNumber || "-"}
                                        </td>

                                        <td>
                                            {bed.bedType || "-"}
                                        </td>

                                        <td>

                                            <span
                                                className={`bed-status ${getStatusClass(
                                                    bed.status
                                                )}`}
                                            >
                                                {bed.status || "-"}
                                            </span>

                                        </td>

                                        <td>

                                            <button
                                                className="bed-edit-button"
                                                onClick={() =>
                                                    handleEdit(bed)
                                                }
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