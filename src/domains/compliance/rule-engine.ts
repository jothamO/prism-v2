// =====================================================
// PRISM V2 - Compliance Rule Engine
// Evaluates JSON Logic rules against contexts
// =====================================================

import type { ComplianceRule } from '@/shared/types';

interface RuleContext {
    amount?: number;
    type?: 'credit' | 'debit';
    category?: string;
    income?: number;
    year?: number;
    transferCount?: number;
    [key: string]: unknown;
}

interface RuleResult {
    applies: boolean;
    outcome?: Record<string, unknown>;
    message?: string;
}

/**
 * Simple JSON Logic evaluator
 * Supports: ==, !=, <, <=, >, >=, and, or, var
 */
export function evaluateCondition(
    condition: Record<string, unknown>,
    context: RuleContext
): boolean {
    const operators = Object.keys(condition);
    if (operators.length === 0) return true;

    const operator = operators[0]!;
    const operands = condition[operator];

    switch (operator) {
        case '==':
        case '===': {
            const [left, right] = operands as [unknown, unknown];
            return resolveValue(left, context) === resolveValue(right, context);
        }

        case '!=':
        case '!==': {
            const [left, right] = operands as [unknown, unknown];
            return resolveValue(left, context) !== resolveValue(right, context);
        }

        case '<': {
            const [left, right] = operands as [unknown, unknown];
            return (resolveValue(left, context) as number) < (resolveValue(right, context) as number);
        }

        case '<=': {
            const [left, right] = operands as [unknown, unknown];
            return (resolveValue(left, context) as number) <= (resolveValue(right, context) as number);
        }

        case '>': {
            const [left, right] = operands as [unknown, unknown];
            return (resolveValue(left, context) as number) > (resolveValue(right, context) as number);
        }

        case '>=': {
            const [left, right] = operands as [unknown, unknown];
            return (resolveValue(left, context) as number) >= (resolveValue(right, context) as number);
        }

        case 'and': {
            const conditions = operands as Record<string, unknown>[];
            return conditions.every(c => evaluateCondition(c, context));
        }

        case 'or': {
            const conditions = operands as Record<string, unknown>[];
            return conditions.some(c => evaluateCondition(c, context));
        }

        case 'in': {
            const [value, array] = operands as [unknown, unknown[]];
            const resolved = resolveValue(value, context);
            return array.includes(resolved);
        }

        case '!': {
            const inner = operands as Record<string, unknown>;
            return !evaluateCondition(inner, context);
        }

        default:
            console.warn(`Unknown operator: ${operator}`);
            return false;
    }
}

/**
 * Resolve a value from context or return literal
 */
function resolveValue(value: unknown, context: RuleContext): unknown {
    if (typeof value === 'object' && value !== null && 'var' in value) {
        const path = (value as { var: string }).var;
        return getNestedValue(context, path);
    }
    return value;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
        if (current && typeof current === 'object') {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

/**
 * Evaluate a compliance rule against a context
 */
export function evaluateRule(rule: ComplianceRule, context: RuleContext): RuleResult {
    const conditions = rule.conditions as Record<string, unknown>;
    const applies = evaluateCondition(conditions, context);

    if (!applies) {
        return { applies: false };
    }

    return {
        applies: true,
        outcome: rule.outcome as Record<string, unknown>,
        message: `Rule "${rule.ruleName}" applies`,
    };
}

/**
 * Evaluate multiple rules and return all that apply
 */
export function evaluateRules(
    rules: ComplianceRule[],
    context: RuleContext
): Array<{ rule: ComplianceRule; result: RuleResult }> {
    const results: Array<{ rule: ComplianceRule; result: RuleResult }> = [];

    for (const rule of rules) {
        if (!rule.isActive) continue;

        // Check effective date
        if (rule.effectiveFrom) {
            const effectiveDate = new Date(rule.effectiveFrom);
            const contextDate = context.year
                ? new Date(context.year, 0, 1)
                : new Date();

            if (contextDate < effectiveDate) continue;
        }

        const result = evaluateRule(rule, context);
        if (result.applies) {
            results.push({ rule, result });
        }
    }

    return results;
}

/**
 * Calculate EMTL based on rules
 */
export function calculateEMTLFromRules(
    amount: number,
    rules: ComplianceRule[]
): { levy: number; applies: boolean } {
    const emtlRules = rules.filter(r => r.ruleType === 'emtl');

    for (const rule of emtlRules) {
        const result = evaluateRule(rule, { amount });
        if (result.applies && result.outcome) {
            return {
                levy: result.outcome.charge as number ?? 0,
                applies: true,
            };
        }
    }

    return { levy: 0, applies: false };
}

/**
 * Get applicable tax bands from rules
 */
export function getTaxBandsFromRules(
    year: number,
    rules: ComplianceRule[]
): Array<{ threshold: number; rate: number }> {
    const bandRules = rules
        .filter(r => r.ruleType === 'tax_band')
        .filter(r => {
            if (!r.effectiveFrom) return true;
            return new Date(r.effectiveFrom).getFullYear() <= year;
        });

    return bandRules
        .map(r => ({
            threshold: (r.outcome as { threshold: number }).threshold,
            rate: (r.outcome as { rate: number }).rate,
        }))
        .sort((a, b) => a.threshold - b.threshold);
}
