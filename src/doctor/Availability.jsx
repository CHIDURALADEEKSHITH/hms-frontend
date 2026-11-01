import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./doctor.css";

const Availability = () => {

    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        date: "",
        startTime: "",
        endTime: "",
        slotDuration: "30"
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        try {

            setLoading(true);

            const data = {
                doctorId: user?.userId,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                slotDuration: Number(formData.slotDuration)
            };

            await api.post(
                `/doctor/${user?.userId}/availability`,
                data
            );

            setMessage(
                "Availability has been added successfully."
            );

            setFormData({
                date: "",
                startTime: "",
                endTime: "",
                slotDuration: "30"
            });

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data ||
                "Unable to save availability."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="doctor-page">

            <div className="doctor-page-header">

                <div>
                    <h1>Doctor Availability</h1>
                    <p>Manage your consultation time slots</p>
                </div>

                <button
                    className="doctor-back-button"
                    onClick={() => navigate("/doctor")}
                >
                    ← Dashboard
                </button>

            </div>


            <div className="doctor-form-card">

                <div className="doctor-form-title">

                    <h2>Add Availability</h2>

                    <p>
                        Define the date and time when patients can
                        book appointments with you.
                    </p>

                </div>


                {message && (
                    <div className="doctor-success">
                        {message}
                    </div>
                )}


                {error && (
                    <div className="doctor-error">
                        {error}
                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    <div className="doctor-form-grid">

                        <div className="doctor-form-group">

                            <label>Date</label>

                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="doctor-form-group">

                            <label>Slot Duration</label>

                            <select
                                name="slotDuration"
                                value={formData.slotDuration}
                                onChange={handleChange}
                            >
                                <option value="15">
                                    15 minutes
                                </option>

                                <option value="30">
                                    30 minutes
                                </option>

                                <option value="45">
                                    45 minutes
                                </option>

                                <option value="60">
                                    60 minutes
                                </option>
                            </select>

                        </div>


                        <div className="doctor-form-group">

                            <label>Start Time</label>

                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="doctor-form-group">

                            <label>End Time</label>

                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>


                    <button
                        type="submit"
                        className="doctor-primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Save Availability"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default Availability;