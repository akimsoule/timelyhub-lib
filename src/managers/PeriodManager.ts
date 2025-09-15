export class PeriodManager {
  private periods: { companyId: string; start: Date; end: Date }[] = [];

  close(companyId: string, start: Date, end: Date): void {
    if (end <= start) throw new Error('Invalid period');
    this.periods.push({ companyId, start, end });
  }

  isClosed(companyId: string, start: Date, end: Date): boolean {
    return this.periods.some((p) => p.companyId === companyId && start < p.end && p.start < end);
  }

  list(companyId?: string): ReadonlyArray<{ companyId: string; start: Date; end: Date }> {
    return companyId ? this.periods.filter((p) => p.companyId === companyId) : this.periods;
  }
}
