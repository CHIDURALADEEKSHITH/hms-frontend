import { useEffect, useState } from "react";
import api from "../services/api";
import "../bed/bed.css";

const BedsOverview = () => {

    const [summary, setSummary] = useState({
        totalBeds: 0,
        availableBeds: 0,
        occupiedBeds: 0,
        maintenanceBeds: 0
    });

    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAvailability = async () => {
        try {
            setLoading(true);
            setError("");

            const [summaryResponse, wardResponse, allWardsResponse] =
                await Promise.all([
                    api.get("/bed/beds/summary"),
                    api.get("/bed/beds/ward-summary"),
                    api.get("/bed/wards")
                ]);

            setSummary(summaryResponse.data);

            const wardSummary = wardResponse.data || [];

            const completeWardList = (allWardsResponse.data || []).map(wardName => {
                const existing = wardSummary.find(
                    item => item.wardName === wardName
                );

                return existing || {
                    wardName,
                    totalBeds: 0,
                    availableBeds: 0,
                    occupiedBeds: 0,
                    maintenanceBeds: 0
                };
            });

            setWards(completeWardList);

        } catch (err) {
            console.error("Admin bed availability error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load bed availability."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAvailability();
    }, []);

    const occupancyPercentage =
        summary.totalBeds > 0
            ? Math.round(
                (summary.occupiedBeds / summary.totalBeds) * 100
            )
            : 0;

    if (loading) {
        return (
            <div className="bed-availability-loading">
                Loading bed availability...
            </div>
        );
    }

    return (
        <div className="bed-availability-page">

            <div className="bed-availability-header">
                <div>
                    <h2>Bed Availability Overview</h2>
                    <p>
                        Monitor hospital bed occupancy and availability.
                    </p>
                </div>

                <button
                    className="bed-refresh-btn"
                    onClick={loadAvailability}
                >
                    ↻ Refresh
                </button>
            </div>

            {error && (
                <div className="bed-availability-error">
                    {error}

                    <button onClick={loadAvailability}>
                        Retry
                    </button>
                </div>
            )}

            {!error && (
                <>
                    {/* BED SUMMARY */}

                    <div className="bed-summary-grid">

                        <div className="bed-summary-card total">
                            <span>Total Beds</span>
                            <h2>{summary.totalBeds}</h2>
                            <small>Registered beds</small>
                        </div>

                        <div className="bed-summary-card available">
                            <span>Available Beds</span>
                            <h2>{summary.availableBeds}</h2>
                            <small>Ready for admission</small>
                        </div>

                        <div className="bed-summary-card occupied">
                            <span>Occupied Beds</span>
                            <h2>{summary.occupiedBeds}</h2>
                            <small>Currently assigned</small>
                        </div>

                        <div className="bed-summary-card maintenance">
                            <span>Maintenance Beds</span>
                            <h2>{summary.maintenanceBeds}</h2>
                            <small>Currently unavailable</small>
                        </div>

                    </div>

                    {/* OVERALL OCCUPANCY */}

                    <div className="bed-occupancy-section">

                        <h3>Overall Bed Occupancy</h3>

                        <div className="bed-occupancy-info">
                            <strong>{occupancyPercentage}%</strong>
                            <span>Occupancy Rate</span>
                        </div>

                        <div className="bed-progress-track">
                            <div
                                className="bed-progress-fill"
                                style={{
                                    width: `${occupancyPercentage}%`
                                }}
                            />
                        </div>

                        <div className="bed-progress-labels">
                            <span>
                                Occupied: {summary.occupiedBeds}
                            </span>

                            <span>
                                Available: {summary.availableBeds}
                            </span>
                        </div>

                    </div>

                    {/* WARD-WISE AVAILABILITY */}

                    <div className="bed-ward-section">

                        <div className="bed-ward-heading">
                            <h3>Ward-wise Bed Availability</h3>
                            <span>{wards.length} Wards</span>
                        </div>

                        {wards.length === 0 ? (
                            <p className="bed-no-data">
                                No ward records available.
                            </p>
                        ) : (
                            <div className="bed-table-wrapper">

                                <table className="bed-availability-table">

                                    <thead>
                                        <tr>
                                            <th>Ward Name</th>
                                            <th>Total Beds</th>
                                            <th>Available</th>
                                            <th>Occupied</th>
                                            <th>Maintenance</th>
                                            <th>Occupancy</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {wards.map((ward, index) => {

                                            const percentage =
                                                ward.totalBeds > 0
                                                    ? Math.round(
                                                        (ward.occupiedBeds /
                                                            ward.totalBeds) * 100
                                                    )
                                                    : 0;

                                            return (
                                                <tr
                                                    key={ward.wardName || index}
                                                >
                                                    <td>
                                                        <strong>
                                                            {ward.wardName}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {ward.totalBeds}
                                                    </td>

                                                    <td>
                                                        <span className="bed-status available">
                                                            {ward.availableBeds}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="bed-status occupied">
                                                            {ward.occupiedBeds}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="bed-status maintenance">
                                                            {ward.maintenanceBeds}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {percentage}%
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>
                </>
            )}

        </div>
    );
};

export default BedsOverview;