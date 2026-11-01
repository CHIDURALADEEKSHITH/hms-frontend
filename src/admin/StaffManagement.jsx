import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ConfirmDialog from "../common/ConfirmDialog";
import "./admin.css";

const StaffManagement = () => {
    const navigate = useNavigate();

    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    const [dialog, setDialog] = useState({
        open: false,
        title: "",
        message: "",
        action: null
    });

    // =====================================================
    // LOAD STAFF
    // =====================================================

    const loadStaff = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/staff");

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setStaff(data);
            setFilteredStaff(data);

        } catch (err) {
            console.error("Failed to load staff:", err);

            setError(
                err.response?.data ||
                "Unable to load hospital staff."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaff();
    }, []);

    // =====================================================
    // SEARCH STAFF
    // =====================================================

    useEffect(() => {

        const value = search.toLowerCase().trim();

        if (!value) {
            setFilteredStaff(staff);
            return;
        }

        const result = staff.filter((member) =>

            String(member.id || "")
                .toLowerCase()
                .includes(value) ||

            String(member.fullName || "")
                .toLowerCase()
                .includes(value) ||

            String(member.email || "")
                .toLowerCase()
                .includes(value) ||

            String(member.mobile || "")
                .toLowerCase()
                .includes(value) ||

            String(member.role || "")
                .toLowerCase()
                .includes(value) ||

            String(member.status || "")
                .toLowerCase()
                .includes(value)

        );

        setFilteredStaff(result);

    }, [search, staff]);

    // =====================================================
    // CONFIRMATION DIALOG
    // =====================================================

    const openConfirmation = (
        title,
        message,
        action
    ) => {

        setDialog({
            open: true,
            title,
            message,
            action
        });

    };

    const closeDialog = () => {

        setDialog({
            open: false,
            title: "",
            message: "",
            action: null
        });

    };

    // =====================================================
    // APPROVE STAFF
    // =====================================================

    const approveStaff = async (id) => {

        try {

            setActionLoading(true);
            setError("");

            console.log("Approving staff:", id);

            const response = await api.put(
                `/admin/staff/${id}/approve`
            );

            console.log(
                "Approve response:",
                response.data
            );

            closeDialog();

            await loadStaff();

        } catch (err) {

            console.error(
                "Approve error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                err.response?.data ||
                "Unable to approve staff."
            );

        } finally {

            setActionLoading(false);

        }
    };

    // =====================================================
    // REJECT STAFF
    // =====================================================

    const rejectStaff = async (id) => {

        try {

            setActionLoading(true);
            setError("");

            console.log("Rejecting staff:", id);

            const response = await api.put(
                `/admin/staff/${id}/reject`
            );

            console.log(
                "Reject response:",
                response.data
            );

            closeDialog();

            await loadStaff();

        } catch (err) {

            console.error(
                "Reject error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                err.response?.data ||
                "Unable to reject staff."
            );

        } finally {

            setActionLoading(false);

        }
    };

    // =====================================================
    // ACTIVATE STAFF
    // =====================================================

    const activateStaff = async (id) => {

        try {

            setActionLoading(true);
            setError("");

            console.log("Activating staff:", id);

            const response = await api.put(
                `/admin/staff/${id}/activate`
            );

            console.log(
                "Activate response:",
                response.data
            );

            closeDialog();

            await loadStaff();

        } catch (err) {

            console.error(
                "Activate error:",
                err
            );

            console.error(
                "Backend activate response:",
                err.response?.data
            );

            setError(
                err.response?.data ||
                "Unable to activate staff."
            );

        } finally {

            setActionLoading(false);

        }
    };

    // =====================================================
    // DEACTIVATE STAFF
    // =====================================================

    const deactivateStaff = async (id) => {

        try {

            setActionLoading(true);
            setError("");

            console.log(
                "Deactivating staff:",
                id
            );

            const response = await api.put(
                `/admin/staff/${id}/deactivate`
            );

            console.log(
                "Deactivate response:",
                response.data
            );

            closeDialog();

            await loadStaff();

        } catch (err) {

            console.error(
                "Deactivate error:",
                err
            );

            console.error(
                "Backend deactivate response:",
                err.response?.data
            );

            setError(
                err.response?.data ||
                "Unable to deactivate staff."
            );

        } finally {

            setActionLoading(false);

        }
    };

    // =====================================================
    // DELETE STAFF
    // =====================================================

    const deleteStaff = async (id) => {

        try {

            setActionLoading(true);
            setError("");

            console.log(
                "Deleting staff:",
                id
            );

            const response = await api.delete(
                `/admin/staff/${id}`
            );

            console.log(
                "Delete response:",
                response.data
            );

            closeDialog();

            await loadStaff();

        } catch (err) {

            console.error(
                "Delete error:",
                err
            );

            console.error(
                "Backend delete response:",
                err.response?.data
            );

            setError(
                err.response?.data ||
                "Unable to delete staff."
            );

        } finally {

            setActionLoading(false);

        }
    };

    // =====================================================
    // EXECUTE CONFIRMED ACTION
    // =====================================================

    const executeAction = () => {

        if (dialog.action) {
            dialog.action();
        }

    };

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        switch (status?.toUpperCase()) {

            case "APPROVED":
            case "ACTIVE":
                return "status-approved";

            case "PENDING":
                return "status-pending";

            case "REJECTED":
                return "status-rejected";

            case "INACTIVE":
                return "status-inactive";

            default:
                return "status-default";
        }

    };

    // =====================================================
    // ROLE CLASS
    // =====================================================

    const getRoleClass = (role) => {

        return `role-badge role-${String(role || "")
            .toLowerCase()
            .replace("_", "-")}`;

    };

    // =====================================================
    // ACTION BUTTONS
    // =====================================================

    const renderActions = (member) => {

        const status =
            member.status?.toUpperCase();

        return (

            <div className="staff-actions">

                {/* =========================================
                    VIEW
                ========================================= */}

                <button
                    className="action-btn view-btn"
                    onClick={() =>
                        navigate(
                            `/admin/staff/${member.id}`
                        )
                    }
                    disabled={actionLoading}
                >
                    View
                </button>


                {/* =========================================
                    PENDING
                ========================================= */}

                {status === "PENDING" && (

                    <>

                        {/* APPROVE */}

                        <button
                            className="action-btn approve-btn"
                            onClick={() =>
                                approveStaff(
                                    member.id
                                )
                            }
                            disabled={actionLoading}
                        >
                            {actionLoading
                                ? "Processing..."
                                : "Approve"}
                        </button>


                        {/* REJECT */}

                        <button
                            className="action-btn reject-btn"
                            onClick={() =>
                                openConfirmation(
                                    "Reject Staff",
                                    `Are you sure you want to reject ${member.fullName}?`,
                                    () =>
                                        rejectStaff(
                                            member.id
                                        )
                                )
                            }
                            disabled={actionLoading}
                        >
                            Reject
                        </button>

                    </>

                )}


                {/* =========================================
                    APPROVED / ACTIVE
                ========================================= */}

                {(status === "APPROVED" ||
                    status === "ACTIVE") && (

                    <button
                        className="action-btn deactivate-btn"
                        onClick={() =>
                            deactivateStaff(
                                member.id
                            )
                        }
                        disabled={actionLoading}
                    >
                        {actionLoading
                            ? "Processing..."
                            : "Deactivate"}
                    </button>

                )}


                {/* =========================================
                    INACTIVE
                ========================================= */}

                {status === "INACTIVE" && (

                    <button
                        className="action-btn activate-btn"
                        onClick={() =>
                            activateStaff(
                                member.id
                            )
                        }
                        disabled={actionLoading}
                    >
                        {actionLoading
                            ? "Processing..."
                            : "Activate"}
                    </button>

                )}


                {/* =========================================
                    REJECTED
                ========================================= */}

                {status === "REJECTED" && (

                    <button
                        className="action-btn approve-btn"
                        onClick={() =>
                            approveStaff(
                                member.id
                            )
                        }
                        disabled={actionLoading}
                    >
                        {actionLoading
                            ? "Processing..."
                            : "Approve"}
                    </button>

                )}


                {/* =========================================
                    DELETE
                ========================================= */}

                <button
                    className="action-btn delete-btn"
                    onClick={() =>
                        openConfirmation(
                            "Delete Staff",
                            `Are you sure you want to permanently delete ${member.fullName}? This action cannot be undone.`,
                            () =>
                                deleteStaff(
                                    member.id
                                )
                        )
                    }
                    disabled={actionLoading}
                >
                    Delete
                </button>

            </div>

        );

    };

    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="admin-page">

            {/* =============================================
                PAGE HEADER
            ============================================= */}

            <div className="page-header">

                <div>

                    <h1>
                        Staff Management
                    </h1>

                    <p>
                        Manage hospital staff registrations and accounts
                    </p>

                </div>


                <button
                    className="back-dashboard-btn"
                    onClick={() =>
                        navigate("/admin")
                    }
                >
                    ← Dashboard
                </button>

            </div>


            {/* =============================================
                SEARCH TOOLBAR
            ============================================= */}

            <div className="staff-toolbar">

                <div className="staff-search">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search by name, email, mobile, role or ID..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <button
                    className="refresh-btn"
                    onClick={loadStaff}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =============================================
                ERROR MESSAGE
            ============================================= */}

            {error && (

                <div className="admin-error">

                    {error}

                </div>

            )}


            {/* =============================================
                STAFF CARD
            ============================================= */}

            <div className="staff-card">

                <div className="staff-card-header">

                    <div>

                        <h2>
                            Hospital Staff
                        </h2>

                        <span>
                            {filteredStaff.length} staff member(s)
                        </span>

                    </div>

                </div>


                {/* =========================================
                    LOADING
                ========================================= */}

                {loading ? (

                    <div className="staff-loading">

                        <div className="admin-spinner"></div>

                        <p>
                            Loading staff...
                        </p>

                    </div>

                ) : filteredStaff.length === 0 ? (

                    /* =====================================
                       EMPTY
                    ===================================== */

                    <div className="staff-empty">

                        <div className="empty-icon">
                            👥
                        </div>

                        <h3>
                            No staff found
                        </h3>

                        <p>
                            {search
                                ? "No staff members match your search."
                                : "There are no staff registrations yet."
                            }
                        </p>

                    </div>

                ) : (

                    /* =====================================
                       STAFF TABLE
                    ===================================== */

                    <div className="staff-table-wrapper">

                        <table className="staff-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        NAME
                                    </th>

                                    <th>
                                        ROLE
                                    </th>

                                    <th>
                                        EMAIL
                                    </th>

                                    <th>
                                        MOBILE
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredStaff.map(
                                    (member) => (

                                        <tr
                                            key={
                                                member.id
                                            }
                                        >

                                            {/* ID */}

                                            <td>

                                                <strong>
                                                    {member.id}
                                                </strong>

                                            </td>


                                            {/* NAME */}

                                            <td>

                                                <div className="staff-name-cell">

                                                    <div className="staff-avatar">

                                                        {member.fullName
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "U"}

                                                    </div>

                                                    <span>
                                                        {
                                                            member.fullName
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* ROLE */}

                                            <td>

                                                <span
                                                    className={getRoleClass(
                                                        member.role
                                                    )}
                                                >
                                                    {
                                                        member.role
                                                    }
                                                </span>

                                            </td>


                                            {/* EMAIL */}

                                            <td>
                                                {
                                                    member.email
                                                }
                                            </td>


                                            {/* MOBILE */}

                                            <td>
                                                {
                                                    member.mobile
                                                }
                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`staff-status ${getStatusClass(
                                                        member.status
                                                    )}`}
                                                >
                                                    {
                                                        member.status
                                                    }
                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                {renderActions(
                                                    member
                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =============================================
                CONFIRM DIALOG
            ============================================= */}

            {dialog.open && (

                <ConfirmDialog
                    title={
                        dialog.title
                    }
                    message={
                        dialog.message
                    }
                    onConfirm={
                        executeAction
                    }
                    onCancel={
                        closeDialog
                    }
                />

            )}


            {/* =============================================
                ACTION LOADING
            ============================================= */}

            {actionLoading && (

                <div className="action-loading-overlay">

                    <div className="action-loading-box">

                        <div className="admin-spinner"></div>

                        <p>
                            Processing...
                        </p>

                    </div>

                </div>

            )}

        </div>

    );

};

export default StaffManagement;