import { useEffect, useState } from "react";
import api from "../services/api";
import BedSidebar from "./BedSidebar";
import "./bed.css";

const WardManagement = () => {

    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [wardName, setWardName] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadWards();
    }, []);

    const loadWards = async () => {
        try {
            setLoading(true);

            const [wardResponse, bedResponse] = await Promise.all([
                api.get("/bed/wards"),
                api.get("/bed/beds")
            ]);

            const wardNames = wardResponse.data || [];
            const beds = bedResponse.data || [];

            const wardMap = {};

            // Add all saved wards, including empty wards
            wardNames.forEach((name) => {
                wardMap[name] = {
                    name,
                    rooms: new Set(),
                    totalBeds: 0,
                    availableBeds: 0,
                    occupiedBeds: 0
                };
            });

            // Add bed information to corresponding wards
            beds.forEach((bed) => {
                const name = bed.wardName || "Unassigned Ward";

                if (!wardMap[name]) {
                    wardMap[name] = {
                        name,
                        rooms: new Set(),
                        totalBeds: 0,
                        availableBeds: 0,
                        occupiedBeds: 0
                    };
                }

                const ward = wardMap[name];

                if (bed.roomNumber) {
                    ward.rooms.add(bed.roomNumber);
                }

                ward.totalBeds++;

                if (bed.status === "AVAILABLE") {
                    ward.availableBeds++;
                }

                if (bed.status === "OCCUPIED") {
                    ward.occupiedBeds++;
                }
            });

            const wardList = Object.values(wardMap).map((ward) => ({
                ...ward,
                rooms: ward.rooms.size
            }));

            setWards(wardList);

        } catch (err) {
            console.error("Unable to load wards", err);
            setError("Unable to load ward details.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddWard = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!wardName.trim()) {
            setError("Please enter a ward name.");
            return;
        }

        try {
            await api.post("/bed/ward", {
                wardName: wardName.trim()
            });

            setMessage("Ward added successfully!");
            setWardName("");
            setShowForm(false);

            await loadWards();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to add ward."
            );
        }
    };

    return (
        <div className="bed-layout">

            <BedSidebar />

            <div className="bed-main-content">

                <div className="bed-page-header">
                    <div>
                        <h1>Ward Management</h1>
                        <p>Manage hospital wards and monitor bed availability.</p>
                    </div>

                    <button
                        className="bed-primary-btn"
                        onClick={() => {
                            setShowForm(!showForm);
                            setMessage("");
                            setError("");
                        }}
                    >
                        {showForm ? "Cancel" : "+ Add Ward"}
                    </button>
                </div>

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {showForm && (
                    <div className="bed-form-card">
                        <h2>Add New Ward</h2>

                        <form onSubmit={handleAddWard}>

                            <div className="bed-form-group">
                                <label>Ward Name</label>

                                <input
                                    type="text"
                                    placeholder="Enter ward name"
                                    value={wardName}
                                    onChange={(e) =>
                                        setWardName(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="bed-primary-btn"
                            >
                                Save Ward
                            </button>

                        </form>
                    </div>
                )}

                <div className="bed-section-header">
                    <h2>Hospital Wards</h2>

                    <button
                        className="bed-secondary-btn"
                        onClick={loadWards}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p>Loading wards...</p>
                ) : wards.length === 0 ? (
                    <div className="bed-empty-state">
                        No wards found. Add your first ward.
                    </div>
                ) : (

                    <div className="ward-grid">

                        {wards.map((ward, index) => (

                            <div className="ward-card" key={index}>

                                <div className="ward-card-header">
                                    <h3>{ward.name}</h3>
                                    <span>🏥</span>
                                </div>

                                <div className="ward-stats">

                                    <div>
                                        <h4>{ward.rooms}</h4>
                                        <p>Rooms</p>
                                    </div>

                                    <div>
                                        <h4>{ward.totalBeds}</h4>
                                        <p>Total Beds</p>
                                    </div>

                                    <div>
                                        <h4>{ward.availableBeds}</h4>
                                        <p>Available</p>
                                    </div>

                                    <div>
                                        <h4>{ward.occupiedBeds}</h4>
                                        <p>Occupied</p>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
};

export default WardManagement;