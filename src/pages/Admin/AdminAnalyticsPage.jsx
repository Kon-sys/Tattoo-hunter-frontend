import React, { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
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
} from "recharts";
import "./AdminAnalyticsPage.css";

const STATUS_COLORS = {
    PENDING: "#fbbf24",
    APPROVED: "#22c55e",
    REJECTED: "#ef4444",
};

const AdminAnalyticsPage = () => {
    const [responsesData, setResponsesData] = useState(null);
    const [categoriesData, setCategoriesData] = useState(null);
    const [chatsData, setChatsData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAll = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    responsesRes,
                    categoriesRes,
                    chatsRes,
                ] = await Promise.all([
                    apiFetch("/api/admin/analytics/responses/conversion"),
                    apiFetch("/api/admin/analytics/categories/popularity"),
                    apiFetch("/api/admin/analytics/chats/duration"),
                ]);

                if (!responsesRes.ok || !categoriesRes.ok || !chatsRes.ok) {
                    throw new Error("Ошибка загрузки одного из отчётов");
                }

                const [
                    responsesJson,
                    categoriesJson,
                    chatsJson,
                ] = await Promise.all([
                    responsesRes.json(),
                    categoriesRes.json(),
                    chatsRes.json(),
                ]);

                setResponsesData(responsesJson);
                setCategoriesData(categoriesJson);
                setChatsData(chatsJson);
            } catch (e) {
                console.error(e);
                setError("Не удалось загрузить данные аналитики");
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, []);


    // --- подготовка данных для графиков ---

    const responsePieData =
        responsesData && responsesData.byStatus
            ? Object.entries(responsesData.byStatus).map(([status, count]) => ({
                status,
                count,
            }))
            : [];

    const categoriesBarData =
        categoriesData && categoriesData.items
            ? categoriesData.items.map((item) => ({
                category: item.category, // строковое имя enum
                employeesCount: item.employeesCount,
                percentOfAll: item.percentOfAll,
            }))
            : [];

    // топ-10 диалогов по длительности
    const chatsBarData =
        chatsData && chatsData.items
            ? [...chatsData.items]
                .sort((a, b) => b.durationMinutes - a.durationMinutes)
                .slice(0, 10)
                .map((item) => ({
                    chatId: `Чат #${item.chatId}`,
                    durationMinutes: item.durationMinutes,
                    messagesCount: item.messagesCount,
                }))
            : [];

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
                    <h1>Аналитика платформы</h1>
                    <p>
                        Отчёты по откликам, категориям мастеров и качеству коммуникации между
                        компаниями и кандидатами.
                    </p>
                </div>

                {/* --- KPI блок --- */}
                <div className="admin-analytics-kpi-grid">
                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Всего откликов</span>
                        <span className="kpi-value">
              {responsesData?.totalResponses ?? 0}
            </span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Конверсия в APPROVED</span>
                        <span className="kpi-value">
              {responsesData?.approvedConversionPercent != null
                  ? `${responsesData.approvedConversionPercent.toFixed(1)}%`
                  : "—"}
            </span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Доля REJECTED</span>
                        <span className="kpi-value">
              {responsesData?.rejectedPercent != null
                  ? `${responsesData.rejectedPercent.toFixed(1)}%`
                  : "—"}
            </span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Среднее время обработки отклика</span>
                        <span className="kpi-value">
              {responsesData?.avgProcessingHours != null
                  ? `${responsesData.avgProcessingHours.toFixed(1)} ч`
                  : "—"}
            </span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Средняя длительность диалога</span>
                        <span className="kpi-value">
              {chatsData?.avgDurationMinutes != null
                  ? `${chatsData.avgDurationMinutes.toFixed(1)} мин`
                  : "—"}
            </span>
                    </div>

                    <div className="admin-analytics-kpi-card">
                        <span className="kpi-label">Максимальная длительность диалога</span>
                        <span className="kpi-value">
              {chatsData?.maxDurationMinutes != null
                  ? `${chatsData.maxDurationMinutes} мин`
                  : "—"}
            </span>
                    </div>
                </div>

                {/* --- Графики --- */}
                <div className="admin-analytics-charts-grid">
                    {/* Отклики по статусам */}
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
                                        label={(entry) =>
                                            `${entry.status} (${entry.count})`
                                        }
                                    >
                                        {responsePieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    STATUS_COLORS[entry.status] ||
                                                    "#6366f1" /* запасной цвет */
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value}`, "Откликов"]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Категории мастеров */}
                    <div className="admin-analytics-card">
                        <h2>Популярность категорий мастеров</h2>
                        {categoriesBarData.length === 0 ? (
                            <div className="admin-analytics-empty">Нет данных по категориям</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={categoriesBarData}
                                    margin={{ top: 16, right: 16, left: 0, bottom: 70 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="category"
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        height={70}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="employeesCount" name="Мастеров">
                                        {categoriesBarData.map((entry, index) => (
                                            <Cell key={`cat-cell-${index}`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                        <p className="admin-analytics-subtext">
                            Всего мастеров с указанными категориями:{" "}
                            <strong>
                                {categoriesData?.totalEmployeesWithCategories ?? 0}
                            </strong>
                        </p>
                    </div>

                    {/* Длительность диалогов */}
                    <div className="admin-analytics-card admin-analytics-card-wide">
                        <h2>Топ-10 диалогов по длительности</h2>
                        {chatsBarData.length === 0 ? (
                            <div className="admin-analytics-empty">Нет данных по чатам</div>
                        ) : (
                            <div className="admin-analytics-chat-section">
                                <div className="admin-analytics-chat-chart">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart
                                            data={chatsBarData}
                                            margin={{ top: 16, right: 16, left: 0, bottom: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="chatId"
                                                angle={-45}
                                                textAnchor="end"
                                                interval={0}
                                                height={60}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar
                                                dataKey="durationMinutes"
                                                name="Минут"
                                            >
                                                {chatsBarData.map((entry, index) => (
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
                                            <th>Чат</th>
                                            <th>Сообщений</th>
                                            <th>Длительность (мин)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {chatsBarData.map((row) => (
                                            <tr key={row.chatId}>
                                                <td>{row.chatId}</td>
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
            </div>
        </>
    );
};

export default AdminAnalyticsPage;
