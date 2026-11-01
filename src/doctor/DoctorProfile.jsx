import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./doctor.css";

const DoctorProfile = () => {

    const navigate = useNavigate();
    const { user } = useAuth();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!user?.userId) {
            setError("Doctor information is not available.");
            setLoading(false);
            return;
        }

        loadProfile();

    }, [user]);


    const loadProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                `/doctor/${user.userId}`
            );

            setDoctor(response.data);

        } catch (err) {

            console.error("Doctor profile error:", err);

            setError(
                err.response?.data ||
                "Unable to load doctor profile."
            );

        } finally {

            setLoading(false);

        }
    };


    if (loading) {

        return (
            <div className="doctor-page">

                <div className="doctor-loading">
                    Loading profile...
                </div>

            </div>
        );
    }


    return (

        <div className="doctor-page">

            <div className="doctor-page-header">

                <div>

                    <h1>My Profile</h1>

                    <p>
                        View your professional information
                    </p>

                </div>

                <button
                    className="doctor-back-button"
                    onClick={() => navigate("/doctor")}
                >
                    ← Dashboard
                </button>

            </div>


            {error ? (

                <div className="doctor-error">
                    {error}
                </div>

            ) : (

                <div className="doctor-profile-card">

                    <div className="doctor-profile-header">

                        <div className="doctor-large-avatar">

                            {doctor?.fullName
                                ?.charAt(0)
                                ?.toUpperCase() || "D"}

                        </div>

                        <div>

                            <h2>
                                Dr.{" "}
                                {doctor?.fullName ||
                                    user?.name ||
                                    "Doctor"}
                            </h2>

                            <span className="doctor-role-badge">
                                DOCTOR
                            </span>

                        </div>

                    </div>


                    <div className="doctor-details-grid">

                        <div className="doctor-detail">

                            <label>Doctor ID</label>

                            <strong>
                                {doctor?.id ||
                                    user?.userId ||
                                    "-"}
                            </strong>

                        </div>


                        <div className="doctor-detail">

                            <label>Email</label>

                            <strong>
                                {doctor?.email || "-"}
                            </strong>

                        </div>


                        <div className="doctor-detail">

                            <label>Mobile</label>

                            <strong>
                                {doctor?.mobile || "-"}
                            </strong>

                        </div>


                        <div className="doctor-detail">

                            <label>Qualification</label>

                            <strong>
                                {doctor?.qualification || "-"}
                            </strong>

                        </div>


                        <div className="doctor-detail">

                            <label>Specialization</label>

                            <strong>
                                {doctor?.specialization || "-"}
                            </strong>

                        </div>


                        <div className="doctor-detail">

                            <label>Department</label>

                            <strong>
                                {doctor?.department || "-"}
                            </strong>

                        </div>


                        <div className="doctor-detail">

                            <label>Experience</label>

                            <strong>

                                {doctor?.experience !== undefined &&
                                doctor?.experience !== null
                                    ? `${doctor.experience} years`
                                    : "-"}

                            </strong>

                        </div>


                        <div className="doctor-detail">

                            <label>
                                Medical Registration Number
                            </label>

                            <strong>
                                {doctor?.medicalRegistrationNumber ||
                                    "-"}
                            </strong>

                        </div>


                        <div className="doctor-detail">

                            <label>Account Status</label>

                            <strong>
                                {doctor?.status || "ACTIVE"}
                            </strong>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default DoctorProfile;