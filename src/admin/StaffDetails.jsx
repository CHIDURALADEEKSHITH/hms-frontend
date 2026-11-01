import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "./admin.css";

const StaffDetails = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const [staff, setStaff] = useState(location.state?.staff || null);
    const [loading, setLoading] = useState(!location.state?.staff);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!staff) {
            loadStaff();
        }

    }, [id]);


    const loadStaff = async () => {

        try {

            setLoading(true);

            /*
             * Try to load the complete staff list.
             * This avoids depending on an unknown single-staff endpoint.
             */
            const response = await api.get("/admin/staff");

            const list = Array.isArray(response.data)
                ? response.data
                : [];

            const found = list.find(
                (member) => String(member.id) === String(id)
            );

            if (found) {
                setStaff(found);
            } else {
                setError("Staff member not found.");
            }

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data ||
                "Unable to load staff details."
            );

        } finally {

            setLoading(false);

        }
    };


    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Loading staff details...
                </div>
            </div>
        );
    }


    if (error || !staff) {
        return (
            <div className="admin-page">

                <div className="admin-error">
                    {error || "Staff member not found."}
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/admin/staff")}
                >
                    ← Back to Staff
                </button>

            </div>
        );
    }


    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <div>
                    <h1>Staff Details</h1>
                    <p>View hospital staff information</p>
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/admin/staff")}
                >
                    ← Staff Management
                </button>

            </div>


            <div className="staff-profile-card">

                <div className="staff-profile-header">

                    <div className="large-avatar">
                        {staff.fullName
                            ?.charAt(0)
                            ?.toUpperCase() || "S"}
                    </div>

                    <div>
                        <h2>{staff.fullName}</h2>

                        <span className="role-badge">
                            {staff.role || "Staff"}
                        </span>
                    </div>

                </div>


                <div className="details-grid">

                    <div className="detail-item">
                        <label>Staff ID</label>
                        <strong>{staff.id || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <label>Status</label>
                        <strong>{staff.status || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <label>Email</label>
                        <strong>{staff.email || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <label>Mobile</label>
                        <strong>{staff.mobile || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <label>Qualification</label>
                        <strong>{staff.qualification || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <label>Specialization</label>
                        <strong>{staff.specialization || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <label>Department</label>
                        <strong>{staff.department || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <label>Experience</label>
                        <strong>
                            {staff.experience !== null &&
                            staff.experience !== undefined
                                ? `${staff.experience} years`
                                : "-"}
                        </strong>
                    </div>

                    <div className="detail-item">
                        <label>Medical Registration Number</label>
                        <strong>
                            {staff.medicalRegistrationNumber || "-"}
                        </strong>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default StaffDetails;