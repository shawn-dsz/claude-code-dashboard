import { describe, it, expect } from 'vitest';

// Provide minimal browser globals the IIFE expects
globalThis.window = globalThis.window || {};
globalThis.document = globalThis.document || {
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null,
};

const utils = require('../dashboard-common.js');

describe('formatTokens', () => {
  it('formats billions', () => {
    expect(utils.formatTokens(1500000000)).toBe('1.5B');
  });

  it('formats millions', () => {
    expect(utils.formatTokens(2300000)).toBe('2.3M');
  });

  it('formats thousands', () => {
    expect(utils.formatTokens(45600)).toBe('45.6K');
  });

  it('returns raw number below 1000', () => {
    expect(utils.formatTokens(999)).toBe('999');
  });

  it('handles zero', () => {
    expect(utils.formatTokens(0)).toBe('0');
  });
});

describe('formatProjectName', () => {
  it('extracts last segment from path', () => {
    expect(utils.formatProjectName('-Users-shawn-proj-my-dashboard')).toBe('dashboard');
  });

  it('handles single segment', () => {
    expect(utils.formatProjectName('project')).toBe('project');
  });
});

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(utils.formatDuration(5000)).toBe('5s');
  });

  it('formats minutes', () => {
    expect(utils.formatDuration(120000)).toBe('2m');
  });

  it('formats hours and minutes', () => {
    expect(utils.formatDuration(3720000)).toBe('1h 2m');
  });

  it('formats days and hours', () => {
    expect(utils.formatDuration(90000000)).toBe('1d 1h');
  });
});

describe('formatModelName', () => {
  it('maps known model IDs', () => {
    expect(utils.formatModelName('claude-sonnet-4-5-20250929')).toBe('Claude Sonnet 4.5');
    expect(utils.formatModelName('claude-haiku-4-5-20251001')).toBe('Claude Haiku 4.5');
  });

  it('returns raw ID for unknown models', () => {
    expect(utils.formatModelName('unknown-model')).toBe('unknown-model');
  });
});

describe('calculateUsageCost', () => {
  it('returns 0 for null input', () => {
    expect(utils.calculateUsageCost(null)).toBe(0);
  });

  it('returns 0 for empty object', () => {
    expect(utils.calculateUsageCost({})).toBe(0);
  });

  it('calculates cost using known model pricing', () => {
    const usage = {
      'claude-haiku-4-5-20251001': {
        inputTokens: 1000000,
        outputTokens: 1000000,
        cacheReadInputTokens: 0,
        cacheCreationInputTokens: 0,
      },
    };
    // haiku: input $0.80/M, output $4/M => $0.80 + $4 = $4.80
    expect(utils.calculateUsageCost(usage)).toBeCloseTo(4.8, 2);
  });

  it('uses default pricing for unknown models', () => {
    const usage = {
      'unknown-model': {
        inputTokens: 1000000,
        outputTokens: 0,
        cacheReadInputTokens: 0,
        cacheCreationInputTokens: 0,
      },
    };
    // default input: $3/M
    expect(utils.calculateUsageCost(usage)).toBeCloseTo(3, 2);
  });

  it('returns 0 for zero-cost models', () => {
    const usage = {
      'glm-4.7': {
        inputTokens: 5000000,
        outputTokens: 5000000,
        cacheReadInputTokens: 1000000,
        cacheCreationInputTokens: 1000000,
      },
    };
    expect(utils.calculateUsageCost(usage)).toBe(0);
  });
});

describe('calculateModelCost', () => {
  it('returns costUSD directly if positive', () => {
    expect(utils.calculateModelCost('claude-haiku-4-5-20251001', { costUSD: 5.5 })).toBe(5.5);
  });

  it('calculates from tokens when costUSD is 0', () => {
    const data = {
      costUSD: 0,
      inputTokens: 1000000,
      outputTokens: 1000000,
      cacheReadInputTokens: 0,
      cacheCreationInputTokens: 0,
    };
    // haiku: $0.80 + $4 = $4.80
    expect(utils.calculateModelCost('claude-haiku-4-5-20251001', data)).toBeCloseTo(4.8, 2);
  });
});

describe('calculateStreak', () => {
  it('returns 0 for empty activity', () => {
    expect(utils.calculateStreak([])).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const activity = [
      { date: today.toISOString().split('T')[0], messageCount: 5 },
      { date: yesterday.toISOString().split('T')[0], messageCount: 3 },
      { date: twoDaysAgo.toISOString().split('T')[0], messageCount: 1 },
    ];

    expect(utils.calculateStreak(activity)).toBe(3);
  });

  it('breaks streak on gap', () => {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const activity = [
      { date: today.toISOString().split('T')[0], messageCount: 5 },
      { date: threeDaysAgo.toISOString().split('T')[0], messageCount: 1 },
    ];

    expect(utils.calculateStreak(activity)).toBe(1);
  });
});

describe('calculateCacheStats', () => {
  it('returns zeros for null input', () => {
    expect(utils.calculateCacheStats(null)).toEqual({
      hitRate: 0,
      cacheRead: 0,
      cacheWrite: 0,
    });
  });

  it('calculates hit rate correctly', () => {
    const usage = {
      model1: { cacheReadInputTokens: 800, cacheCreationInputTokens: 200 },
    };
    const result = utils.calculateCacheStats(usage);
    expect(result.hitRate).toBeCloseTo(80, 0);
    expect(result.cacheRead).toBe(800);
    expect(result.cacheWrite).toBe(200);
  });
});

describe('identifyActivityPattern', () => {
  it('identifies night owl', () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sessionCount: i >= 0 && i < 6 ? 10 : 0,
    }));
    expect(utils.identifyActivityPattern(hours)).toContain('Night owl');
  });

  it('identifies early bird', () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sessionCount: i >= 6 && i < 12 ? 10 : 0,
    }));
    expect(utils.identifyActivityPattern(hours)).toContain('Early bird');
  });

  it('identifies day coder', () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sessionCount: i >= 12 && i < 18 ? 10 : 0,
    }));
    expect(utils.identifyActivityPattern(hours)).toContain('Day coder');
  });
});

describe('COLORS', () => {
  it('has light and dark themes', () => {
    expect(utils.COLORS).toHaveProperty('light');
    expect(utils.COLORS).toHaveProperty('dark');
  });

  it('light theme has required keys', () => {
    const keys = ['accent', 'background', 'card', 'text', 'textSecondary', 'border'];
    for (const key of keys) {
      expect(utils.COLORS.light).toHaveProperty(key);
    }
  });
});

describe('MODEL_PRICING', () => {
  it('has default pricing', () => {
    expect(utils.MODEL_PRICING).toHaveProperty('default');
  });

  it('opus pricing is more expensive than sonnet', () => {
    const opus = utils.MODEL_PRICING['claude-opus-4-6'];
    const sonnet = utils.MODEL_PRICING['claude-sonnet-4-5-20250929'];
    expect(opus.input).toBeGreaterThan(sonnet.input);
    expect(opus.output).toBeGreaterThan(sonnet.output);
  });
});
