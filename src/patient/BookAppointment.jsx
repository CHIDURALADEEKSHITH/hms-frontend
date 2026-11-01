import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./patient.css";

const BookAppointment = () => {

    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const patientId = user.userId;

    const [step, setStep] = useState(1);

    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] =
        useState("");

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");

    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const timeSlots = [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00"
    ];

    useEffect(() => {
        loadSpecializations();
    }, []);

    const loadSpecializations = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/doctor/specializations"
            );

            setSpecializations(response.data || []);

        } catch (err) {

            console.error(
                "Specialization loading error:",
                err
            );

            setError(
                "Unable to load doctor specializations."
            );

        } finally {

            setLoading(false);
        }
    };

    const selectSpecialization = async (specialization) => {

        try {

            setSelectedSpecialization(specialization);
            setSelectedDoctor(null);
            setDoctors([]);
            setError("");

            setLoadingDoctors(true);

            const response = await api.get(
                `/doctor/specialization/${encodeURIComponent(
                    specialization
                )}`
            );

            setDoctors(response.data || []);

            setStep(2);

        } catch (err) {

            console.error(
                "Doctor loading error:",
                err
            );

            setError(
                "Unable to load doctors."
            );

        } finally {

            setLoadingDoctors(false);
        }
    };

    const selectDoctor = (doctor) => {

        setSelectedDoctor(doctor);
        setStep(3);
        setError("");
    };

    const bookAppointment = async () => {

        if (!patientId) {
            setError("Patient information not found.");
            return;
        }

        if (!selectedDoctor) {
            setError("Please select a doctor.");
            return;
        }

        if (!appointmentDate) {
            setError("Please select an appointment date.");
            return;
        }

        if (!appointmentTime) {
            setError("Please select an appointment time.");
            return;
        }

        if (!reason.trim()) {
            setError("Please enter the reason for your visit.");
            return;
        }

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            const appointmentData = {

                patient: {
                    id: Number(patientId)
                },

                doctor: {
                    id: selectedDoctor.id
                },

                appointmentDate: appointmentDate,

                appointmentTime: appointmentTime,

                reason: reason,

                status: "PENDING"
            };

            console.log(
                "Booking appointment:",
                appointmentData
            );

            const response = await api.post(
                "/patient/appointment",
                appointmentData
            );

            console.log(
                "Appointment booked:",
                response.data
            );

            setSuccess(
                "Appointment booked successfully!"
            );

            setTimeout(() => {
                navigate("/patient/appointments");
            }, 1500);

        } catch (err) {

            console.error(
                "Appointment booking error:",
                err
            );

            if (err.response?.data) {
                setError(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : "Unable to book appointment."
                );
            } else {
                setError(
                    "Unable to book appointment."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    const goBack = () => {

        setError("");

        if (step === 2) {

            setSelectedSpecialization("");
            setDoctors([]);
            setStep(1);

        } else if (step === 3) {

            setSelectedDoctor(null);
            setStep(2);

        } else {

            navigate("/patient");
        }
    };

    return (

        <div className="patient-page">

            {/* SIDEBAR */}

            <aside className="patient-sidebar">

                <div className="patient-logo">

                    <div className="patient-logo-icon">
                        +
                    </div>

                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Patient Portal</span>
                    </div>

                </div>

                <nav className="patient-nav">

                    <button
                        onClick={() =>
                            navigate("/patient")
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/profile")
                        }
                    >
                        <span>👤</span>
                        My Profile
                    </button>

                    <button className="active">
                        <span>➕</span>
                        Book Appointment
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/appointments")
                        }
                    >
                        <span>📅</span>
                        My Appointments
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/medical-history")
                        }
                    >
                        <span>📋</span>
                        Medical History
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/prescriptions")
                        }
                    >
                        <span>💊</span>
                        Prescriptions
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/lab-reports")
                        }
                    >
                        <span>🧪</span>
                        Lab Reports
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/bills")
                        }
                    >
                        <span>💳</span>
                        Bills
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/admission")
                        }
                    >
                        <span>🏥</span>
                        Admission
                    </button>

                </nav>

                <button
                    className="patient-logout"
                    onClick={() => {
                        clearAuth();
                        navigate("/");
                    }}
                >
                    ⇥ Logout
                </button>

            </aside>

            {/* MAIN */}

            <main className="patient-main">

                <header className="patient-header">

                    <div>

                        <p className="patient-label">
                            APPOINTMENTS
                        </p>

                        <h1>
                            Book Appointment
                        </h1>

                        <p>
                            Choose a specialist and schedule
                            your consultation.
                        </p>

                    </div>

                </header>

                {/* STEP INDICATOR */}

                <div className="appointment-steps">

                    <div
                        className={
                            step >= 1
                                ? "appointment-step active"
                                : "appointment-step"
                        }
                    >
                        <span>1</span>
                        <div>
                            <strong>Specialization</strong>
                            <small>
                                Choose doctor type
                            </small>
                        </div>
                    </div>

                    <div className="appointment-line"></div>

                    <div
                        className={
                            step >= 2
                                ? "appointment-step active"
                                : "appointment-step"
                        }
                    >
                        <span>2</span>
                        <div>
                            <strong>Doctor</strong>
                            <small>
                                Select doctor
                            </small>
                        </div>
                    </div>

                    <div className="appointment-line"></div>

                    <div
                        className={
                            step >= 3
                                ? "appointment-step active"
                                : "appointment-step"
                        }
                    >
                        <span>3</span>
                        <div>
                            <strong>Schedule</strong>
                            <small>
                                Date & time
                            </small>
                        </div>
                    </div>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="patient-error">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div className="patient-success">
                        {success}
                    </div>
                )}

                {/* STEP 1 */}

                {step === 1 && (

                    <section className="patient-section">

                        <div className="appointment-section-title">

                            <div>
                                <h2>
                                    What type of doctor do you need?
                                </h2>

                                <p>
                                    Select a medical specialization
                                    to find available doctors.
                                </p>
                            </div>

                        </div>

                        {loading ? (

                            <div className="patient-empty">
                                Loading specializations...
                            </div>

                        ) : specializations.length === 0 ? (

                            <div className="patient-empty">
                                No doctor specializations
                                are currently available.
                            </div>

                        ) : (

                            <div className="specialization-grid">

                                {specializations.map(
                                    (specialization) => (

                                        <button
                                            key={specialization}
                                            className="specialization-card"
                                            onClick={() =>
                                                selectSpecialization(
                                                    specialization
                                                )
                                            }
                                        >

                                            <div className="specialization-icon">
                                                🩺
                                            </div>

                                            <div>

                                                <h3>
                                                    {specialization}
                                                </h3>

                                                <p>
                                                    Find available{" "}
                                                    {specialization}
                                                    doctors
                                                </p>

                                            </div>

                                            <span className="specialization-arrow">
                                                →
                                            </span>

                                        </button>

                                    )
                                )}

                            </div>
                        )}

                    </section>
                )}

                {/* STEP 2 */}

                {step === 2 && (

                    <section className="patient-section">

                        <div className="appointment-section-header">

                            <button
                                className="back-button"
                                onClick={goBack}
                            >
                                ← Back
                            </button>

                            <div>

                                <p className="patient-label">
                                    {selectedSpecialization}
                                </p>

                                <h2>
                                    Choose Your Doctor
                                </h2>

                                <p>
                                    Available doctors in{" "}
                                    {selectedSpecialization}.
                                </p>

                            </div>

                        </div>

                        {loadingDoctors ? (

                            <div className="patient-empty">
                                Loading available doctors...
                            </div>

                        ) : doctors.length === 0 ? (

                            <div className="patient-empty">

                                <h3>
                                    No doctors available
                                </h3>

                                <p>
                                    There are currently no active
                                    doctors in this specialization.
                                </p>

                            </div>

                        ) : (

                            <div className="doctor-selection-grid">

                                {doctors.map((doctor) => (

                                    <div
                                        className="doctor-selection-card"
                                        key={doctor.id}
                                    >

                                        <div className="doctor-avatar">
                                            👨‍⚕️
                                        </div>

                                        <div className="doctor-selection-info">

                                            <h3>
                                                {doctor.fullName}
                                            </h3>

                                            <p className="doctor-specialization">
                                                {doctor.specialization}
                                            </p>

                                            <p>
                                                {doctor.qualification ||
                                                    "Medical Professional"}
                                            </p>

                                            {doctor.department && (
                                                <p>
                                                    Department:{" "}
                                                    {doctor.department}
                                                </p>
                                            )}

                                            {doctor.experience !== null &&
                                                doctor.experience !== undefined && (
                                                    <p>
                                                        {doctor.experience}{" "}
                                                        years experience
                                                    </p>
                                                )}

                                            <span className="doctor-available">
                                                ● Available
                                            </span>

                                            <button
                                                className="patient-primary-button"
                                                onClick={() =>
                                                    selectDoctor(
                                                        doctor
                                                    )
                                                }
                                            >
                                                Select Doctor
                                            </button>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>
                )}

                {/* STEP 3 */}

                {step === 3 && selectedDoctor && (

                    <section className="patient-section">

                        <div className="appointment-section-header">

                            <button
                                className="back-button"
                                onClick={goBack}
                            >
                                ← Back
                            </button>

                            <div>

                                <p className="patient-label">
                                    APPOINTMENT DETAILS
                                </p>

                                <h2>
                                    Schedule Your Visit
                                </h2>

                                <p>
                                    Complete the appointment details
                                    for your selected doctor.
                                </p>

                            </div>

                        </div>

                        {/* SELECTED DOCTOR */}

                        <div className="selected-doctor-card">

                            <div className="doctor-avatar">
                                👨‍⚕️
                            </div>

                            <div>

                                <p className="patient-label">
                                    SELECTED DOCTOR
                                </p>

                                <h3>
                                    {selectedDoctor.fullName}
                                </h3>

                                <p>
                                    {selectedDoctor.specialization}
                                </p>

                                <span className="doctor-available">
                                    ● Available
                                </span>

                            </div>

                        </div>

                        {/* DATE */}

                        <div className="appointment-form-grid">

                            <div className="appointment-form-group">

                                <label>
                                    Appointment Date
                                </label>

                                <input
                                    type="date"
                                    value={appointmentDate}
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(e) =>
                                        setAppointmentDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            <div className="appointment-form-group">

                                <label>
                                    Preferred Time
                                </label>

                                <select
                                    value={appointmentTime}
                                    onChange={(e) =>
                                        setAppointmentTime(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select a time
                                    </option>

                                    {timeSlots.map((time) => (

                                        <option
                                            key={time}
                                            value={time}
                                        >
                                            {time}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>

                        {/* REASON */}

                        <div className="appointment-form-group">

                            <label>
                                Reason for Visit
                            </label>

                            <textarea
                                rows="5"
                                value={reason}
                                onChange={(e) =>
                                    setReason(
                                        e.target.value
                                    )
                                }
                                placeholder="Briefly describe your reason for consultation..."
                            />

                        </div>

                        {/* ACTIONS */}

                        <div className="appointment-actions">

                            <button
                                className="appointment-cancel-button"
                                onClick={goBack}
                            >
                                Cancel
                            </button>

                            <button
                                className="patient-primary-button"
                                onClick={bookAppointment}
                                disabled={loading}
                            >
                                {loading
                                    ? "Booking..."
                                    : "Book Appointment"}
                            </button>

                        </div>

                    </section>
                )}

            </main>

        </div>
    );
};

export default BookAppointment;