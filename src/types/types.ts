export interface LinterError {
    type: 'Error' | 'Warning' | 'Info';
    row: number;
    message: string;
}