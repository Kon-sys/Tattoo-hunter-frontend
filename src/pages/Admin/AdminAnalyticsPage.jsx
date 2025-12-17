import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { apiFetch } from "../../api/apiClient";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";
import "./AdminAnalyticsPage.css";

const STATUS_COLORS = {
    PENDING: "#fbbf24",
    APPROVED: "#22c55e",
    REJECTED: "#ef4444",
};

const GRANULARITY_OPTIONS = [
    { value: "DAY", label: "По дням" },
    { value: "MONTH", label: "По месяцам" },
    { value: "YEAR", label: "По годам" },
];

const ChatTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;

    return (
        <div className="admin-analytics-tooltip">
            <div>
                <strong>{label}{p.chatId ? ` (id: ${p.chatId})` : ""}</strong>
            </div>
            <div>Компания: {p.companyName || "—"}</div>
            <div>Работник: {p.employeeName || "—"}</div>
            <div>Сообщений: {p.messagesCount ?? 0}</div>
            <div>Длительность: {p.durationMinutes ?? 0} мин</div>
        </div>
    );
};

const AdminAnalyticsPage = () => {
    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState("");

    const [granularity, setGranularity] = useState("DAY");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [horizon, setHorizon] = useState(14);

    const [responsesData, setResponsesData] = useState(null);
    const [categoriesData, setCategoriesData] = useState(null);
    const [chatsDurationData, setChatsDurationData] = useState(null);
    const [chatSeriesData, setChatSeriesData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [seriesLoading, setSeriesLoading] = useState(false);
    const [error, setError] = useState("");

    const companyQuery = useMemo(() => {
        return companyId ? `companyId=${encodeURIComponent(companyId)}` : "";
    }, [companyId]);

    const withParams = (baseUrl, extraParams = "") => {
        const params = [companyQuery, extraParams].filter(Boolean).join("&");
        return params ? `${baseUrl}?${params}` : baseUrl;
    };

    // companies options
    useEffect(() => {
        let cancelled = false;
        const loadCompanies = async () => {
            try {
                const res = await apiFetch("/api/admin/companies/options");
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled) setCompanies(Array.isArray(json) ? json : []);
            } catch (e) {
                console.warn(e);
            }
        };
        loadCompanies();
        return () => {
            cancelled = true;
        };
    }, []);

    // main analytics
    useEffect(() => {
        let cancelled = false;

        const loadMain = async () => {
            try {
                setLoading(true);
                setError("");

                const [responsesRes, categoriesRes, chatsRes] = await Promise.all([
                    apiFetch(withParams("/api/admin/analytics/responses/conversion")),
                    apiFetch(withParams("/api/admin/analytics/categories/popularity")),
                    apiFetch(withParams("/api/admin/analytics/chats/duration")),
                ]);

                if (!responsesRes.ok || !categoriesRes.ok || !chatsRes.ok) {
                    throw new Error("Ошибка загрузки одного из отчётов");
                }

                const [responsesJson, categoriesJson, chatsJson] = await Promise.all([
                    responsesRes.json(),
                    categoriesRes.json(),
                    chatsRes.json(),
                ]);

                if (!cancelled) {
                    setResponsesData(responsesJson);
                    setCategoriesData(categoriesJson);
                    setChatsDurationData(chatsJson);
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) setError("Не удалось загрузить данные аналитики");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadMain();
        return () => {
            cancelled = true;
        };
    }, [companyQuery]);

    const loadSeries = async () => {
        try {
            setSeriesLoading(true);
            setError("");

            const extra = [
                `granularity=${encodeURIComponent(granularity)}`,
                from ? `from=${encodeURIComponent(from)}` : "",
                to ? `to=${encodeURIComponent(to)}` : "",
                `horizon=${encodeURIComponent(horizon)}`,
                "lookback=60",
            ]
                .filter(Boolean)
                .join("&");

            const res = await apiFetch(withParams("/api/admin/analytics/chats/timeseries", extra));
            if (!res.ok) throw new Error("Ошибка загрузки time-series");

            const json = await res.json();
            setChatSeriesData(json);
        } catch (e) {
            console.error(e);
            setError("Не удалось загрузить график чатов");
        } finally {
            setSeriesLoading(false);
        }
    };

    // auto-load series on company/granularity
    useEffect(() => {
        loadSeries();
        // eslint-disable-next-line
    }, [companyQuery, granularity]);

    // --- charts data ---

    const responsePieData =
        responsesData && responsesData.byStatus
            ? Object.entries(responsesData.byStatus).map(([status, count]) => ({
                status,
                count,
            }))
            : [];

    // ✅ TOP-5 categories
    const categoriesBarData =
        categoriesData && Array.isArray(categoriesData.items)
            ? categoriesData.items
                .slice(0, 5)
                .map((item) => ({
                    category: item.name,
                    employeesCount: item.count,
                    percentOfAll: item.percent,
                }))
            : [];

    // ✅ TOP-5 chats with "ТОП 1..5" labels on X axis
    const chatsBarData =
        chatsDurationData && Array.isArray(chatsDurationData.items)
            ? chatsDurationData.items.slice(0, 5).map((item, idx) => {
                const employeeName = `${item.employeeFirstName || ""} ${item.employeeLastName || ""}`.trim();
                return {
                    rankLabel: `ТОП ${idx + 1}`,
                    chatId: item.chatId,
                    durationMinutes: item.durationMinutes,
                    messagesCount: item.messagesCount,
                    companyName: item.companyName || "—",
                    employeeName: employeeName || item.employeeLogin || "—",
                };
            })
            : [];

    // line + forecast (single array)
    const seriesData = useMemo(() => {
        const pts = chatSeriesData?.points;
        if (!Array.isArray(pts) || pts.length === 0) return [];
        const sorted = [...pts].sort((a, b) => (a.period > b.period ? 1 : -1));
        return sorted.map((p) => ({
            period: p.period,
            actual: p.forecast ? null : p.value,
            forecast: p.forecast ? p.value : null,
        }));
    }, [chatSeriesData]);

    // KPI
    const totalResponses = responsesData?.total ?? 0;

    const approvedPct =
        responsesData?.approvedPercent != null ? `${responsesData.approvedPercent.toFixed(1)}%` : "—";

    const rejectedPct =
        responsesData?.rejectedPercent != null ? `${responsesData.rejectedPercent.toFixed(1)}%` : "—";

    const avgProc =
        responsesData?.avgProcessingHours != null ? `${responsesData.avgProcessingHours.toFixed(1)} ч` : "—";

    const avgChat =
        chatsDurationData?.avgMinutes != null ? `${chatsDurationData.avgMinutes.toFixed(1)} мин` : "—";

    const medianChat =
        chatsDurationData?.medianMinutes != null ? `${chatsDurationData.medianMinutes.toFixed(1)} мин` : "—";

    const maxChat = chatsDurationData?.maxMinutes != null ? `${chatsDurationData.maxMinutes} мин` : "—";

    if (loading) {
        return (
            <>
                <Header />
                <div className="admin-analytics-page">
                    <div className="admin-analytics-loading">Загрузка аналитики…</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="admin-analytics-page">
                    <div className="admin-analytics-error">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="admin-analytics-page">
                <div className="admin-analytics-header">
                    <div className="admin-analytics-title-row">
                        <div>
                            <h1>Аналитика платформы</h1>
                            <p>Отклики, категории и коммуникация (динамика сообщений + прогноз).</p>
                        </div>

                        <div className="admin-analytics-filters">
                            <label className="filter-label">
                                Компания
                                <select className="filter-select" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                                    <option value="">Все компании</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

                {/* KPI */}
                <div className="admin-analytics-kpi-grid">
                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Всего откликов</span>
                        <span className="kpi-value">{totalResponses}</span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Конверсия в APPROVED</span>
                        <span className="kpi-value">{approvedPct}</span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Доля REJECTED</span>
                        <span className="kpi-value">{rejectedPct}</span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Среднее время обработки отклика</span>
                        <span className="kpi-value">{avgProc}</span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Средняя длительность диалога</span>
                        <span className="kpi-value">{avgChat}</span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Медианная длительность</span>
                        <span className="kpi-value">{medianChat}</span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Максимальная длительность</span>
                        <span className="kpi-value">{maxChat}</span>
                    </div>
                </div>

                {/* Charts */}
                <div className="admin-analytics-charts-grid">
                    {/* Pie */}
                    <div className="admin-analytics-card">
                        <h2>Распределение откликов по статусам</h2>
                        {responsePieData.length === 0 ? (
                            <div className="admin-analytics-empty">Нет данных по откликам</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={responsePieData}
                                        dataKey="count"
                                        nameKey="status"
                                        outerRadius={100}
                                        label={(entry) => `${entry.status} (${entry.count})`}
                                    >
                                        {responsePieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || "#6366f1"} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value}`, "Откликов"]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Categories TOP-5 */}
                    <div className="admin-analytics-card">
                        <h2>Популярность категорий (ТОП-5)</h2>
                        {categoriesBarData.length === 0 ? (
                            <div className="admin-analytics-empty">Нет данных по категориям</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={categoriesBarData} margin={{ top: 16, right: 16, left: 0, bottom: 70 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" angle={-45} textAnchor="end" interval={0} height={70} />
                                    <YAxis />
                                    <Tooltip formatter={(v) => [`${v}`, "Пользователей"]} />
                                    <Bar dataKey="employeesCount" name="Пользователей">
                                        {categoriesBarData.map((_, index) => (
                                            <Cell key={`cat-cell-${index}`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                        <p className="admin-analytics-subtext">
                            Всего пользователей с категориями: <strong>{categoriesData?.totalUsers ?? 0}</strong>
                        </p>
                    </div>

                    {/* Line + forecast */}
                    <div className="admin-analytics-card admin-analytics-card-wide">
                        <div className="admin-analytics-card-head">
                            <div>
                                <h2>Динамика сообщений + прогноз</h2>
                                <p className="admin-analytics-subtext" style={{ marginTop: 4 }}>
                                    Y — количество сообщений, X — дата/месяц/год.
                                </p>
                            </div>

                            <div className="admin-analytics-series-controls">
                                <label className="filter-label">
                                    Группировка
                                    <select className="filter-select" value={granularity} onChange={(e) => setGranularity(e.target.value)}>
                                        {GRANULARITY_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="filter-label">
                                    От
                                    <input className="filter-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                                </label>

                                <label className="filter-label">
                                    До
                                    <input className="filter-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                                </label>

                                <label className="filter-label">
                                    Прогноз (периодов)
                                    <input
                                        className="filter-input"
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={horizon}
                                        onChange={(e) => setHorizon(Number(e.target.value || 1))}
                                    />
                                </label>

                                <button className="filter-btn" onClick={loadSeries} disabled={seriesLoading}>
                                    {seriesLoading ? "Загрузка..." : "Применить"}
                                </button>
                            </div>
                        </div>

                        {seriesData.length === 0 ? (
                            <div className="admin-analytics-empty">Нет данных по динамике сообщений</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={seriesData} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip formatter={(v) => [`${v}`, "Сообщений"]} />
                                    <Legend />
                                    <Line type="monotone" dataKey="actual" name="Сообщений (факт)" dot={false} strokeWidth={2} connectNulls />
                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        name="Сообщений (прогноз)"
                                        dot={false}
                                        strokeWidth={2}
                                        strokeDasharray="6 6"
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Chats TOP-5 with tooltip */}
                    <div className="admin-analytics-card admin-analytics-card-wide">
                        <h2>Топ-5 диалогов по длительности</h2>

                        {chatsBarData.length === 0 ? (
                            <div className="admin-analytics-empty">Нет данных по чатам</div>
                        ) : (
                            <div className="admin-analytics-chat-section">
                                <div className="admin-analytics-chat-chart">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={chatsBarData} margin={{ top: 16, right: 16, left: 0, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="rankLabel" />
                                            <YAxis />
                                            <Tooltip content={<ChatTooltip />} />
                                            <Bar dataKey="durationMinutes" name="Минут">
                                                {chatsBarData.map((_, index) => (
                                                    <Cell key={`chat-cell-${index}`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="admin-analytics-chat-table-wrapper">
                                    <table className="admin-analytics-chat-table">
                                        <thead>
                                        <tr>
                                            <th>ТОП</th>
                                            <th>Компания</th>
                                            <th>Работник</th>
                                            <th>Сообщений</th>
                                            <th>Мин</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {chatsBarData.map((row) => (
                                            <tr key={row.rankLabel}>
                                                <td>{row.rankLabel}</td>
                                                <td>{row.companyName}</td>
                                                <td>{row.employeeName}</td>
                                                <td>{row.messagesCount}</td>
                                                <td>{row.durationMinutes}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default AdminAnalyticsPage;
