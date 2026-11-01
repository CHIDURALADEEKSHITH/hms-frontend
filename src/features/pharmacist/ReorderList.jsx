import { useMemo, useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Card, Empty, Notice, StatStrip } from "../shared/ui";
import { useStore } from "../shared/storage";
import { downloadCSV } from "../shared/csv";
import { money } from "../shared/data";
import { stockFlags } from "./MedicineStock";

const ReorderList = () => {
    const [stock] = useStore("pharmacy-stock", [], true);
    const [override, setOverride] = useState({});

    const items = useMemo(() => stock
        .map((r) => ({ ...r, f: stockFlags(r) }))
        .filter((r) => r.f.low || r.f.out || r.f.expired || r.f.expiring)
        .map((r) => {
            const suggested = Math.max(Number(r.reorderLevel || 0) * 2 - Number(r.qty || 0), 1);
            const why = r.f.out ? "Out of stock" : r.f.low ? "Below reorder level" : r.f.expired ? "Expired — replace" : "Expiring soon";
            return { ...r, suggested, why };
        }), [stock]);

    const qtyOf = (r) => (override[r.id] ?? r.suggested);
    const total = items.reduce((s, r) => s + qtyOf(r) * Number(r.price || 0), 0);

    const bySupplier = items.reduce((acc, r) => {
        const k = r.supplier || "No supplier set";
        (acc[k] = acc[k] || []).push(r);
        return acc;
    }, {});

    return (
        <FeatureLayout
            title="Reorder List"
            subtitle="Built automatically from your stock list: low, out-of-stock, expired and soon-to-expire items."
            actions={
                <>
                    <button className="fx-btn" disabled={!items.length} onClick={() => downloadCSV("purchase-order", items, [
                        { key: "supplier", label: "Supplier" }, { key: "medicine", label: "Medicine" }, { key: "qty", label: "In stock" },
                        { key: "why", label: "Reason" }, { key: "order", label: "Order qty", get: qtyOf }, { key: "price", label: "Unit price" }])}>⬇ CSV</button>
                    <button className="fx-btn primary" disabled={!items.length} onClick={() => window.print()}>🖨 Print purchase order</button>
                </>
            }
        >
            <StatStrip items={[
                { label: "Items to order", value: items.length, tone: items.length ? "warn" : "good" },
                { label: "Suppliers", value: Object.keys(bySupplier).length },
                { label: "Estimated cost", value: money(total) }
            ]} />
            <Notice>Suggested quantity brings stock back to twice the reorder level. Change any quantity before printing.</Notice>

            {items.length === 0 ? <Card><Empty>Nothing needs ordering — stock levels look fine.</Empty></Card> : Object.entries(bySupplier).map(([supplier, list]) => (
                <Card key={supplier} title={supplier}>
                    <div className="fx-table-wrap">
                        <table className="fx-table">
                            <thead><tr><th>Medicine</th><th>In stock</th><th>Reason</th><th>Order qty</th><th className="fx-right">Est. cost</th></tr></thead>
                            <tbody>
                                {list.map((r) => (
                                    <tr key={r.id}>
                                        <td><b>{r.medicine}</b><br /><span className="fx-muted">Batch {r.batch || "—"} · exp {r.expiry || "—"}</span></td>
                                        <td className="fx-mono">{r.qty}</td>
                                        <td><span className={`fx-badge ${r.f.out || r.f.expired ? "bad" : "warn"}`}>{r.why}</span></td>
                                        <td><input className="fx-input" type="number" min="0" style={{ width: 90 }} value={qtyOf(r)}
                                            onChange={(e) => setOverride({ ...override, [r.id]: Math.max(0, Number(e.target.value)) })} /></td>
                                        <td className="fx-right fx-mono">{money(qtyOf(r) * Number(r.price || 0))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ))}
        </FeatureLayout>
    );
};

export default ReorderList;
