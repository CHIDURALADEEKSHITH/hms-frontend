import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./admin.css";

const PatientManagement = () => {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadPatients();
    }, []);


    useEffect(() => {

        const value = search.toLowerCase();

        const filtered = patients.filter((patient) =>
            String(patient.id || "").includes(value) ||
            String(patient.uhid || "").toLowerCase().includes(value) ||
            String(patient.fullName || "").toLowerCase().includes(value) ||
            String(patient.email || "").toLowerCase().includes(value) ||
            String(patient.mobile || "").includes(value)
        );

        setFilteredPatients(filtered);

    }, [search, patients]);


    const loadPatients = async () => {

        try {

            setLoading(true);
            setError("");

            /*
             * This endpoint should match your Admin patient
             * controller when patient management is connected.
             */
            const response = await api.get("/admin/patients");

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setPatients(data);

        } catch (err) {

            console.error(err);

            setPatients([]);

            setError(
                err.response?.data ||
                "Unable to load patient information."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <div>
                    <h1>Patient Management</h1>
                    <p>
                        Monitor registered hospital patients
                    </p>
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/admin")}
                >
                    ← Dashboard
                </button>

            </div>


            <div className="admin-toolbar">

                <div className="search-box">

                    <span>🔍</span>

                    <input
                        type="text"
                        placeholder="Search by name, UHID, mobile or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                <button
                    className="refresh-button"
                    onClick={loadPatients}
                >
                    ↻ Refresh
                </button>

            </div>


            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}


            <div className="admin-table-card">

                <div className="table-header">

                    <div>
                        <h2>Registered Patients</h2>

                        <span>
                            {filteredPatients.length} patient(s)
                        </span>
                    </div>

                </div>


                {loading ? (

                    <div className="admin-loading">
                        Loading patients...
                    </div>

                ) : filteredPatients.length === 0 ? (

                    <div className="admin-empty">

                        <div className="empty-icon">
                            🧑
                        </div>

                        <h3>No Patients Found</h3>

                        <p>
                            No patient records are currently available.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>UHID</th>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Email</th>
                                    <th>Gender</th>
                                    <th>Status</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredPatients.map((patient) => (

                                    <tr key={patient.id}>

                                        <td>
                                            {patient.id || "-"}
                                        </td>

                                        <td>
                                            <strong>
                                                {patient.uhid || "-"}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="table-person">

                                                <div className="table-avatar">
                                                    {patient.fullName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "P"}
                                                </div>

                                                <span>
                                                    {patient.fullName || "-"}
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            {patient.mobile || "-"}
                                        </td>

                                        <td>
                                            {patient.email || "-"}
                                        </td>

                                        <td>
                                            {patient.gender || "-"}
                                        </td>

                                        <td>
                                            <span className="status-badge status-approved">
                                                {patient.status || "ACTIVE"}
                                            </span>
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

export default PatientManagement;