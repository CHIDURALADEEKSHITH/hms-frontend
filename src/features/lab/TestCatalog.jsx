import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { Notice } from "../shared/ui";
import { money } from "../shared/data";

const CATEGORIES = ["Haematology", "Biochemistry", "Microbiology", "Serology", "Urine & Stool", "Hormones", "Other"];

const SEED = [
    { id: "seed1", testName: "Fasting blood glucose", category: "Biochemistry", sample: "Blood", fasting: "Yes", refRange: "70–99 mg/dL", price: 0, tat: 4, notes: "", createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "seed2", testName: "HbA1c", category: "Biochemistry", sample: "Blood", fasting: "No", refRange: "Below 5.7 %", price: 0, tat: 6, notes: "", createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "seed3", testName: "Complete blood count", category: "Haematology", sample: "Blood", fasting: "No", refRange: "Per analyser", price: 0, tat: 3, notes: "", createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "seed4", testName: "Urine routine", category: "Urine & Stool", sample: "Urine", fasting: "No", refRange: "Per lab", price: 0, tat: 2, notes: "", createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "seed5", testName: "TSH", category: "Hormones", sample: "Blood", fasting: "No", refRange: "0.4–4.0 mIU/L", price: 0, tat: 8, notes: "", createdAt: "2026-01-01T00:00:00.000Z" }
];

const TestCatalog = () => (
    <FeatureLayout title="Test Catalogue" subtitle="Your list of tests with price, sample type, fasting rule, reference range and turnaround time.">
        <Notice>Starter entries are examples — set prices and ranges to match your own laboratory. The catalogue is stored in this browser.</Notice>
        <RecordBoard
            storeKey="lab-catalog" shared seed={SEED} csvName="test-catalogue"
            formTitle="test" title="Catalogue" addLabel="Add test"
            fields={[
                { name: "testName", label: "Test name", required: true, wide: true },
                { name: "category", label: "Category", type: "select", options: CATEGORIES },
                { name: "sample", label: "Sample", type: "select", options: ["Blood", "Urine", "Stool", "Swab", "Sputum", "Other"] },
                { name: "fasting", label: "Fasting needed?", type: "select", options: ["No", "Yes"] },
                { name: "price", label: "Price (₹)", type: "number", min: 0, default: 0 },
                { name: "tat", label: "Turnaround (hours)", type: "number", min: 0, default: 4 },
                { name: "refRange", label: "Reference range", wide: true },
                { name: "notes", label: "Preparation notes", type: "textarea", wide: true }
            ]}
            columns={[
                { key: "testName", label: "Test", render: (r) => <><b>{r.testName}</b><br /><span className="fx-muted">{r.category} · {r.sample}</span></>, csv: (r) => r.testName },
                { key: "refRange", label: "Reference range" },
                { key: "fasting", label: "Fasting", render: (r) => (r.fasting === "Yes" ? <span className="fx-badge warn">Fasting</span> : "No") },
                { key: "tat", label: "TAT", render: (r) => `${r.tat} h` },
                { key: "price", label: "Price", render: (r) => (Number(r.price) ? money(r.price) : <span className="fx-muted">Set price</span>) }
            ]}
            sort={(a, b) => a.category.localeCompare(b.category) || a.testName.localeCompare(b.testName)}
            searchKeys={["testName", "category", "sample", "refRange"]}
            stats={(rows) => [
                { label: "Tests", value: rows.length },
                { label: "Categories", value: new Set(rows.map((r) => r.category)).size },
                { label: "Need fasting", value: rows.filter((r) => r.fasting === "Yes").length, tone: "warn" },
                { label: "Price not set", value: rows.filter((r) => !Number(r.price)).length, tone: "bad" }
            ]}
            emptyText="No tests in the catalogue."
        />
    </FeatureLayout>
);

export default TestCatalog;
