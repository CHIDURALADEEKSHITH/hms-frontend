import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./doctor.css";

const DischargeSummary = () => {

    const navigate = useNavigate();
    const { patientId } = useParams();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        admissionDate: "",
        dischargeDate: "",
        diagnosis: "",
        treatmentSummary: "",
        medicines: "",
        advice: "",
        followUp: "",
        remarks: ""
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
                patientId: patientId,
                ...formData
            };

            await api.post(
                `/doctor/${user?.userId}/discharge-summary`,
                data
            );

            setMessage(
                "Discharge summary saved successfully."
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data ||
                "Unable to save discharge summary."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="doctor-page">

            <div className="doctor-page-header">

                <div>
                    <h1>Discharge Summary</h1>

                    <p>
                        Prepare the patient's clinical discharge summary
                    </p>
                </div>

                <button
                    className="doctor-back-button"
                    onClick={() =>
                        navigate("/doctor/appointments")
                    }
                >
                    ← Appointments
                </button>

            </div>


            <div className="doctor-form-card">

                <div className="consultation-patient-banner">

                    <div className="consultation-patient-icon">
                        📄
                    </div>

                    <div>
                        <span>Patient ID</span>
                        <strong>
                            {patientId || "Select patient"}
                        </strong>
                    </div>

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

                            <label>Admission Date</label>

                            <input
                                type="date"
                                name="admissionDate"
                                value={formData.admissionDate}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="doctor-form-group">

                            <label>Discharge Date</label>

                            <input
                                type="date"
                                name="dischargeDate"
                                value={formData.dischargeDate}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>


                    <div className="doctor-form-group">

                        <label>Final Diagnosis</label>

                        <textarea
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            placeholder="Enter final diagnosis..."
                            rows="4"
                            required
                        />

                    </div>


                    <div className="doctor-form-group">

                        <label>Treatment Summary</label>

                        <textarea
                            name="treatmentSummary"
                            value={formData.treatmentSummary}
                            onChange={handleChange}
                            placeholder="Summarize treatment provided..."
                            rows="5"
                            required
                        />

                    </div>


                    <div className="doctor-form-group">

                        <label>Medicines</label>

                        <textarea
                            name="medicines"
                            value={formData.medicines}
                            onChange={handleChange}
                            placeholder="Enter discharge medicines..."
                            rows="4"
                        />

                    </div>


                    <div className="doctor-form-group">

                        <label>Advice</label>

                        <textarea
                            name="advice"
                            value={formData.advice}
                            onChange={handleChange}
                            placeholder="Enter discharge advice..."
                            rows="4"
                        />

                    </div>


                    <div className="doctor-form-group">

                        <label>Follow-up</label>

                        <textarea
                            name="followUp"
                            value={formData.followUp}
                            onChange={handleChange}
                            placeholder="Enter follow-up instructions..."
                            rows="3"
                        />

                    </div>


                    <div className="doctor-form-group">

                        <label>Remarks</label>

                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Additional remarks..."
                            rows="3"
                        />

                    </div>


                    <button
                        type="submit"
                        className="doctor-primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Save Discharge Summary"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default DischargeSummary;