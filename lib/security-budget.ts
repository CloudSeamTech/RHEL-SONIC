export type SecurityBudgetInput = {
  licenses: string; hourly: string; hours: string; persistent: string; security: string;
};
export function estimateSecurityBudget(input: SecurityBudgetInput): number | null {
  if (Object.values(input).some(value => value.trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0)) return null;
  const total = Number(input.licenses) + Number(input.hourly) * Number(input.hours) + Number(input.persistent) + Number(input.security);
  return Number.isFinite(total) ? Math.round((total + Number.EPSILON) * 100) / 100 : null;
}
