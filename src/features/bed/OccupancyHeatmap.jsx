import { useEffect, useMemo, useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Card, Empty, Notice, StatStrip } from "../shared/ui";
import { useApiList } from "../shared/useApi";
import { titleCase } from "../shared/data";

const STATES = [["AVAILABLE", "Available"], ["OCCUPIED", "Occupied"], ["RESERVED", "Reserved"], ["MAINTENANCE", "Maintenance"]];
const COLOR = { AVAILABLE: "#dff3e8", OCCUPIED: "#fbe0de", RESERVED: "#fdf0d0", MAINTENANCE: "#e4e1dc" };

const OccupancyHeatmap = () => {
    const { data, loading, error, reload } = useApiList("/bed/beds");
    const [ward, setWard] = useState("ALL");
    const [status, setStatus] = useState("ALL");
    const [auto, setAuto] = useState(false);
    const beds = data[0];

    useEffect(() => {
        if (!auto) return undefined;
        const t = setInterval(reload, 60000);
        return () => clearInterval(t);
    }, [auto, reload]);

    const wards = useMemo(() => [...new Set(beds.map((b) => b.wardName || "Unassigned"))].sort(), [beds]);
    const count = (s) => beds.filter((b) => b.status === s).length;
    const pct = beds.length ? Math.round((count("OCCUPIED") / beds.length) * 100) : 0;

    const groups = wards
        .filter((w) => ward === "ALL" || w === ward)
        .map((w) => ({ ward: w, beds: beds.filter((b) => (b.wardName || "Unassigned") === w && (status === "ALL" || b.status === status)) }))
        .filter((g) => g.beds.length);

    return (
        <FeatureLayout
            title="Occupancy Heatmap"
            subtitle="Every bed at a glance, grouped by ward."
            actions={
                <>
                    <select className="fx-input" value={ward} onChange={(e) => setWard(e.target.value)}>
                        <option value="ALL">All wards</option>{wards.map((w) => <option key={w}>{w}</option>)}
                    </select>
                    <label className="fx-btn" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto-refresh
                    </label>
                    <button className="fx-btn" onClick={reload}>↻ Refresh</button>
                </>
            }
        >
            {error && <Notice tone="warn">{error}</Notice>}
            <StatStrip items={[
                { label: "Beds", value: beds.length },
                { label: "Occupancy", value: `${pct}%`, tone: pct >= 90 ? "bad" : pct >= 75 ? "warn" : "good" },
                { label: "Available", value: count("AVAILABLE"), tone: "good" },
                { label: "Reserved", value: count("RESERVED"), tone: "warn" },
                { label: "Maintenance", value: count("MAINTENANCE") }
            ]} />

            <div className="fx-chips">
                {[["ALL", "All"], ...STATES].map(([v, l]) => (
                    <button key={v} className={status === v ? "on" : ""} onClick={() => setStatus(v)}>{l}<b>{v === "ALL" ? beds.length : count(v)}</b></button>
                ))}
            </div>
            <div className="fx-key">{STATES.map(([v, l]) => <span key={v}><i style={{ background: COLOR[v] }} />{l}</span>)}</div>

            {loading ? <Notice>Loading beds…</Notice> : groups.length === 0 ? <Card><Empty>No beds match.</Empty></Card> : groups.map((g) => (
                <Card key={g.ward} className="fx-ward">
                    <h4>{g.ward}<small>{g.beds.filter((b) => b.status === "OCCUPIED").length}/{g.beds.length} occupied</small></h4>
                    <div className="fx-cells">
                        {g.beds.map((b) => (
                            <div key={b.id} className={`fx-cell ${b.status}`} title={`${g.ward} · Bed ${b.bedNumber} · ${titleCase(b.bedType)} · ${titleCase(b.status)}`}>
                                {b.bedNumber}<small>{b.roomNumber ? `R${b.roomNumber}` : titleCase(b.bedType).slice(0, 6)}</small>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </FeatureLayout>
    );
};

export default OccupancyHeatmap;
