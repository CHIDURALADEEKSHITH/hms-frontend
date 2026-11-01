import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

/* GET one or more endpoints. Always returns arrays (empty on failure).     */
export function useApiList(paths) {
    const list = Array.isArray(paths) ? paths : [paths];
    const key = list.join("|");
    const [data, setData] = useState(list.map(() => []));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        const results = await Promise.allSettled(list.map((p) => api.get(p)));
        setData(results.map((r) => (r.status === "fulfilled" && Array.isArray(r.value.data) ? r.value.data : [])));
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed) setError(failed === results.length ? "Unable to reach the server." : "Some data could not be loaded.");
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    useEffect(() => { load(); }, [load]);

    return { data, loading, error, reload: load };
}
