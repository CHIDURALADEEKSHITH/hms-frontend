import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./doctor.css";

const Consultation = () => {

    const navigate = useNavigate();

    // Get both Patient ID and Appointment ID from URL
    const { patientId, appointmentId } = useParams();

    const { user } = useAuth();

    const [formData, setFormData] = useState({
        symptoms: "",
        examination: "",
        diagnosis: "",
        clinicalNotes: "",
        treatmentPlan: "",
        followUpDate: "",
        recommendation: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // Handle form input changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };


    // Save consultation
    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        // Basic validation
        if (!patientId) {
            setError("Patient ID is missing.");
            return;
        }

        if (!appointmentId) {
            setError("Appointment ID is missing.");
            return;
        }

        if (!user?.userId) {
            setError("Doctor information is missing. Please login again.");
            return;
        }

        try {

            setLoading(true);

            /*
             * IMPORTANT:
             * We are sending the appointment ID here.
             *
             * This creates the relationship:
             *
             * Appointment
             *      ↓
             * Consultation
             *      ↓
             * Prescription
             */

            const data = {

                doctor: {
                    id: Number(user.userId)
                },

                patient: {
                    id: Number(patientId)
                },

                appointment: {
                    id: Number(appointmentId)
                },

                symptoms: formData.symptoms,

                examination: formData.examination,

                diagnosis: formData.diagnosis,

                clinicalNotes: formData.clinicalNotes,

                treatmentPlan: formData.treatmentPlan,

                followUpDate:
                    formData.followUpDate || null,

                recommendation:
                    formData.recommendation
            };


            console.log(
                "Saving consultation:",
                data
            );


            /*
             * Send consultation to backend
             */
            await api.post(
                "/doctor/consultation",
                data
            );


            setMessage(
                "Consultation has been saved successfully."
            );


            /*
             * Clear form after successful save
             */
            setFormData({
                symptoms: "",
                examination: "",
                diagnosis: "",
                clinicalNotes: "",
                treatmentPlan: "",
                followUpDate: "",
                recommendation: ""
            });


        } catch (err) {

            console.error(
                "Consultation save error:",
                err
            );

            setError(
                err.response?.data ||
                "Unable to save consultation."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="doctor-page">

            {/* ================= HEADER ================= */}

            <div className="doctor-page-header">

                <div>

                    <h1>
                        Patient Consultation
                    </h1>

                    <p>
                        Record clinical findings and treatment plan
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


            {/* ================= FORM CARD ================= */}

            <div className="doctor-form-card">


                {/* ================= PATIENT / APPOINTMENT INFO ================= */}

                <div className="consultation-patient-banner">

                    <div className="consultation-patient-icon">
                        🧑
                    </div>


                    <div>

                        <span>
                            Patient ID
                        </span>

                        <strong>
                            {patientId || "-"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Appointment ID
                        </span>

                        <strong>
                            {appointmentId || "-"}
                        </strong>

                    </div>

                </div>


                {/* ================= SUCCESS MESSAGE ================= */}

                {message && (

                    <div className="doctor-success">

                        {message}

                    </div>

                )}


                {/* ================= ERROR MESSAGE ================= */}

                {error && (

                    <div className="doctor-error">

                        {error}

                    </div>

                )}


                {/* ================= CONSULTATION FORM ================= */}

                <form onSubmit={handleSubmit}>


                    {/* ================= SYMPTOMS ================= */}

                    <div className="doctor-form-group">

                        <label>
                            Symptoms
                        </label>

                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleChange}
                            placeholder="Enter patient symptoms..."
                            rows="4"
                            required
                        />

                    </div>


                    {/* ================= EXAMINATION ================= */}

                    <div className="doctor-form-group">

                        <label>
                            Examination
                        </label>

                        <textarea
                            name="examination"
                            value={formData.examination}
                            onChange={handleChange}
                            placeholder="Enter examination findings..."
                            rows="4"
                        />

                    </div>


                    {/* ================= DIAGNOSIS ================= */}

                    <div className="doctor-form-group">

                        <label>
                            Diagnosis
                        </label>

                        <textarea
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            placeholder="Enter diagnosis..."
                            rows="4"
                            required
                        />

                    </div>


                    {/* ================= CLINICAL NOTES ================= */}

                    <div className="doctor-form-group">

                        <label>
                            Clinical Notes
                        </label>

                        <textarea
                            name="clinicalNotes"
                            value={formData.clinicalNotes}
                            onChange={handleChange}
                            placeholder="Enter clinical notes..."
                            rows="4"
                        />

                    </div>


                    {/* ================= TREATMENT PLAN ================= */}

                    <div className="doctor-form-group">

                        <label>
                            Treatment Plan
                        </label>

                        <textarea
                            name="treatmentPlan"
                            value={formData.treatmentPlan}
                            onChange={handleChange}
                            placeholder="Enter treatment plan..."
                            rows="4"
                        />

                    </div>


                    {/* ================= FOLLOW UP + RECOMMENDATION ================= */}

                    <div className="doctor-form-grid">


                        {/* FOLLOW UP DATE */}

                        <div className="doctor-form-group">

                            <label>
                                Follow-up Date
                            </label>

                            <input
                                type="date"
                                name="followUpDate"
                                value={formData.followUpDate}
                                onChange={handleChange}
                            />

                        </div>


                        {/* RECOMMENDATION */}

                        <div className="doctor-form-group">

                            <label>
                                Recommendation
                            </label>

                            <select
                                name="recommendation"
                                value={formData.recommendation}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Recommendation
                                </option>

                                <option value="NONE">
                                    No Special Recommendation
                                </option>

                                <option value="ADMISSION">
                                    Recommend Admission
                                </option>

                                <option value="OPERATION">
                                    Recommend Operation
                                </option>

                                <option value="DISCHARGE">
                                    Recommend Discharge
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* ================= SAVE BUTTON ================= */}

                    <button
                        type="submit"
                        className="doctor-primary-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Saving Consultation..."
                            : "Save Consultation"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
};

export default Consultation;