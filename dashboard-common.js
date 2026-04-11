/**
 * Claude Code Dashboard - Common Utilities
 * Shared functions for both light and dark themes
 */

window.DashboardUtils = (function() {
    'use strict';

    // ============================================================
    // CONSTANTS
    // ============================================================

    const COLORS = {
        light: {
            accent: '#ff6b47',
            accentLight: '#ff9f87',
            background: '#f8f9fa',
            card: '#ffffff',
            text: '#333333',
            textSecondary: '#666666',
            border: '#f0f0f0',
            grid: '#f0f0f0',
            tooltipBg: '#ffffff',
            overlay: 'rgba(0,0,0,0.5)'
        },
        dark: {
            accent: '#FF5722',
            accentLight: '#FF8A65',
            background: '#000000',
            card: '#1E1E1E',
            text: '#ffffff',
            textSecondary: '#888888',
            border: '#333333',
            grid: '#333333',
            tooltipBg: '#1E1E1E',
            overlay: 'rgba(0,0,0,0.7)'
        }
    };

    const MODEL_PRICING = {
        // Claude models (per million tokens, USD)
        'claude-opus-4-6': { input: 15, output: 75, cacheRead: 1.50, cacheWrite: 18.75 },
        'claude-opus-4-5-20251101': { input: 15, output: 75, cacheRead: 1.50, cacheWrite: 18.75 },
        'claude-sonnet-4-5-20250929': { input: 3, output: 15, cacheRead: 0.30, cacheWrite: 3.75 },
        'claude-haiku-4-5-20251001': { input: 0.80, output: 4, cacheRead: 0.08, cacheWrite: 1 },
        // GLM models (Zhipu AI) - not billed through Anthropic, zero cost
        'glm-4.7': { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        'glm-4.6': { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        'glm-4.5-air': { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        // Google models - not billed through Anthropic, zero cost
        'google/gemini-3-pro-preview': { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        'default': { input: 3, output: 15, cacheRead: 0.30, cacheWrite: 3.75 }
    };

    // ============================================================
    // DATA LOADERS
    // ============================================================

    async function loadStatsData() {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Could not load data.json');
        }
        return await response.json();
    }

    async function loadProjectBreakdown() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) return [];
            const projects = await response.json();

            return projects.map(project => ({
                name: formatProjectName(project.path),
                path: project.path,
                sessionCount: project.sessionCount || 0,
                tokenCount: estimateTokens(project.sessionCount),
                lastActivity: project.lastTimestamp ? new Date(project.lastTimestamp * 1000) : null
            })).sort((a, b) => b.tokenCount - a.tokenCount);
        } catch (e) {
            console.error('Could not load project data:', e);
            return [];
        }
    }

    async function loadSessionHistory() {
        try {
            const response = await fetch('sessions.json');
            if (!response.ok) return [];
            return await response.json();
        } catch (e) {
            console.error('Could not load session history:', e);
            return [];
        }
    }

    // ============================================================
    // FORMATTERS
    // ============================================================

    function formatTokens(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    function formatNumber(num) {
        return num.toLocaleString();
    }

    function formatModelName(modelId) {
        const nameMap = {
            'claude-sonnet-4-5-20250929': 'Claude Sonnet 4.5',
            'claude-opus-4-5-20251101': 'Claude Opus 4.5',
            'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
            'glm-4.7': 'GLM-4.7',
            'glm-4.6': 'GLM-4.6',
            'glm-4.5-air': 'GLM-4.5 Air',
            'google/gemini-3-pro-preview': 'Gemini 3 Pro'
        };
        return nameMap[modelId] || modelId;
    }

    function formatProjectName(path) {
        // Convert "-Users-shawn-proj-name" to "name"
        const parts = path.split('-').filter(p => p);
        const namePart = parts[parts.length - 1];
        return namePart.replace(/-/g, ' ');
    }

    function formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function formatDayName(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // ============================================================
    // CALCULATORS
    // ============================================================

    function calculateUsageCost(modelUsage) {
        let totalCost = 0;

        if (!modelUsage) return 0;

        Object.entries(modelUsage).forEach(([modelId, data]) => {
            const prices = MODEL_PRICING[modelId] || MODEL_PRICING['default'];

            const inputCost = (data.inputTokens || 0) / 1000000 * prices.input;
            const outputCost = (data.outputTokens || 0) / 1000000 * prices.output;
            const cacheReadCost = (data.cacheReadInputTokens || 0) / 1000000 * prices.cacheRead;
            const cacheWriteCost = (data.cacheCreationInputTokens || 0) / 1000000 * prices.cacheWrite;

            totalCost += inputCost + outputCost + cacheReadCost + cacheWriteCost;
        });

        return totalCost;
    }

    function calculateModelCost(modelId, modelData) {
        if (modelData.costUSD > 0) return modelData.costUSD;

        const prices = MODEL_PRICING[modelId] || MODEL_PRICING['default'];
        const inputCost = (modelData.inputTokens || 0) / 1000000 * prices.input;
        const outputCost = (modelData.outputTokens || 0) / 1000000 * prices.output;
        const cacheReadCost = (modelData.cacheReadInputTokens || 0) / 1000000 * prices.cacheRead;
        const cacheWriteCost = (modelData.cacheCreationInputTokens || 0) / 1000000 * prices.cacheWrite;

        return inputCost + outputCost + cacheReadCost + cacheWriteCost;
    }

    function calculateStreak(activity) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedActivity = [...activity].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = today;

        for (const day of sortedActivity) {
            const dayDate = new Date(day.date);
            dayDate.setHours(0, 0, 0, 0);

            const diffTime = currentDate - dayDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0 || diffDays === 1) {
                if (day.messageCount > 0 || day.sessionCount > 0) {
                    streak++;
                    currentDate = dayDate;
                }
            } else {
                break;
            }
        }

        return streak;
    }

    function calculateCacheStats(modelUsage) {
        let totalCacheRead = 0;
        let totalCacheWrite = 0;

        if (!modelUsage) return { hitRate: 0, cacheRead: 0, cacheWrite: 0 };

        Object.values(modelUsage).forEach(model => {
            totalCacheRead += model.cacheReadInputTokens || 0;
            totalCacheWrite += model.cacheCreationInputTokens || 0;
        });

        const totalCacheTokens = totalCacheRead + totalCacheWrite;
        const hitRate = totalCacheTokens > 0 ? (totalCacheRead / totalCacheTokens * 100) : 0;

        return { hitRate, cacheRead: totalCacheRead, cacheWrite: totalCacheWrite };
    }

    function identifyActivityPattern(hourlyDetails) {
        const morning = hourlyDetails.filter(h => h.hour >= 6 && h.hour < 12);
        const afternoon = hourlyDetails.filter(h => h.hour >= 12 && h.hour < 18);
        const evening = hourlyDetails.filter(h => h.hour >= 18 && h.hour < 24);
        const night = hourlyDetails.filter(h => h.hour >= 0 && h.hour < 6);

        const sumSessions = (arr) => arr.reduce((sum, h) => sum + h.sessionCount, 0);

        const totals = {
            morning: sumSessions(morning),
            afternoon: sumSessions(afternoon),
            evening: sumSessions(evening),
            night: sumSessions(night)
        };

        const maxPeriod = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];

        const patterns = {
            morning: '🌅 Early bird',
            afternoon: '☀️ Day coder',
            evening: '🌆 Afternoon warrior',
            night: '🦉 Night owl'
        };

        return patterns[maxPeriod[0]] || '📊 Balanced';
    }

    // ============================================================
    // CHART GENERATORS
    // ============================================================

    function createDailyActivityChart(ctx, data, colors) {
        const labels = data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Messages',
                        data: data.map(d => d.messages),
                        borderColor: colors.accent,
                        backgroundColor: colors.accent + '20',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Sessions',
                        data: data.map(d => d.sessions),
                        borderColor: colors.textSecondary,
                        backgroundColor: colors.textSecondary + '20',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Tools',
                        data: data.map(d => d.tools),
                        borderColor: colors.accentLight,
                        backgroundColor: colors.accentLight + '20',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: colors.textSecondary, boxWidth: 12 }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        titleColor: colors.text,
                        bodyColor: colors.accent,
                        borderColor: colors.border,
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: colors.grid },
                        ticks: { color: colors.textSecondary, maxTicksLimit: 12 }
                    },
                    y: {
                        grid: { color: colors.grid },
                        ticks: { color: colors.textSecondary },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createTokenTimelineChart(ctx, dailyModelTokens, colors) {
        // Get all unique models
        const allModels = new Set();
        dailyModelTokens.forEach(day => {
            Object.keys(day.tokensByModel || {}).forEach(m => allModels.add(m));
        });

        const modelPalette = [
            colors.accent,
            '#4CAF50',
            '#2196F3',
            '#FFC107',
            '#9C27B0',
            '#00BCD4',
            '#FF5722'
        ];

        const datasets = Array.from(allModels).map((model, idx) => ({
            label: formatModelName(model),
            data: dailyModelTokens.map(day => (day.tokensByModel || {})[model] || 0),
            borderColor: modelPalette[idx % modelPalette.length],
            backgroundColor: modelPalette[idx % modelPalette.length] + '40',
            fill: true,
            tension: 0.4,
            pointRadius: 0
        }));

        const labels = dailyModelTokens.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        return new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: colors.textSecondary, boxWidth: 12 }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        titleColor: colors.text,
                        bodyColor: colors.accent,
                        borderColor: colors.border,
                        borderWidth: 1,
                        callbacks: {
                            label: (item) => `${item.dataset.label}: ${formatTokens(item.raw)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: colors.grid },
                        ticks: { color: colors.textSecondary, maxTicksLimit: 12 }
                    },
                    y: {
                        grid: { color: colors.grid },
                        ticks: {
                            color: colors.textSecondary,
                            callback: (value) => formatTokens(value)
                        },
                        stacked: true
                    }
                }
            }
        });
    }

    // ============================================================
    // UI HELPERS
    // ============================================================

    function initExpandableCards() {
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.closest('.expandable-card').querySelector('.card-content');
                const isExpanded = content.classList.contains('expanded');

                content.classList.toggle('expanded');
                content.classList.toggle('collapsed');

                const expandText = btn.querySelector('.expand-text');
                const expandIcon = btn.querySelector('.expand-icon');

                if (expandText) {
                    expandText.textContent = isExpanded ? 'Show Details' : 'Hide Details';
                }
                if (expandIcon) {
                    expandIcon.textContent = isExpanded ? '▼' : '▲';
                }
                btn.setAttribute('aria-expanded', !isExpanded);
            });
        });
    }

    function showModal(title, content) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    // ============================================================
    // EXPORTS
    // ============================================================

    return {
        COLORS,
        MODEL_PRICING,

        // Data loaders
        loadStatsData,
        loadProjectBreakdown,
        loadSessionHistory,

        // Formatters
        formatTokens,
        formatNumber,
        formatModelName,
        formatProjectName,
        formatDuration,
        formatDate,
        formatDayName,

        // Calculators
        calculateUsageCost,
        calculateModelCost,
        calculateStreak,
        calculateCacheStats,
        identifyActivityPattern,

        // Chart generators
        createDailyActivityChart,
        createTokenTimelineChart,

        // UI helpers
        initExpandableCards,
        showModal,
        closeModal
    };

})();

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.DashboardUtils.closeModal();
    }
});
