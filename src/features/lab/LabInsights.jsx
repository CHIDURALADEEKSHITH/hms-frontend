import { useMemo } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Bars, Card, Columns, Donut, Notice, StatStrip } from "../shared/ui";
import { useApiList } from "../shared/useApi";
import { countBy, dayKey, pick, rowDate, titleCase, toItems } from "../shared/data";

const LabInsights = () => {
    const { data, loading, error, reload } = useApiList("/lab/tests");
    const tests = data[0];

    const status = toItems(countBy(tests, (t) => titleCase(t.status)));
    const category = toItems(countBy(tests, (t) => t.testCategory), 7);
    const top = toItems(countBy(tests, (t) => t.testName), 7);

    const perDay = useMemo(() => {
        const m = countBy(tests, (t) => dayKey(pick(t, ["testDate", "orderDate", "createdAt", "reportDate"])));
        return Object.keys(m).sort().slice(-14).map((k) => ({ label: k.slice(5), value: m[k] }));
    }, [tests]);

    const done = tests.filter((t) => t.status === "COMPLETED").length;
    const waiting = tests.filter((t) => ["ORDERED", "PENDING_PAYMENT", "PAID"].includes(t.status)).length;
    const withReport = tests.filter((t) => t.reportFilePath).length;

    return (
        <FeatureLayout title="Lab Insights" subtitle="What the laboratory is doing — volume, status mix and the busiest tests." actions={<button className="fx-btn" onClick={reload}>↻ Refresh</button>}>
            {error && <Notice tone="warn">{error}</Notice>}
            {loading ? <Notice>Loading tests…</Notice> : (
                <>
                    <StatStrip items={[
                        { label: "Total tests", value: tests.length },
                        { label: "Waiting", value: waiting, tone: waiting ? "warn" : "" },
                        { label: "Completed", value: done, tone: "good" },
                        { label: "Report uploaded", value: withReport },
                        { label: "Completion rate", value: tests.length ? `${Math.round((done / tests.length) * 100)}%` : "—" }
                    ]} />
                    <div className="fx-grid2">
                        <Card title="Status mix"><Donut items={status} centre={tests.length} /></Card>
                        <Card title="Tests per day (last 14 days)">
                            <Columns items={perDay} />
                            {!perDay.length && <p className="fx-disclaimer">Tests carry no date, so a daily split is not possible.</p>}
                        </Card>
                        <Card title="By category"><Bars items={category} /></Card>
                        <Card title="Most requested tests"><Bars items={top} /></Card>
                    </div>
                </>
            )}
        </FeatureLayout>
    );
};

export default LabInsights;
