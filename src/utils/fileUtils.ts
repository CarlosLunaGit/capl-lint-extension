import { LinterError } from '../types/types';

export function countErrorsByType(errors: LinterError[]): { [key: string]: number } {
    const errorCount = { Error: 0, Warning: 0, Info: 0, Total: 0 };
    errors.forEach(error => {
        errorCount[error.type]++;
        errorCount.Total++;
    });
    return errorCount;
}