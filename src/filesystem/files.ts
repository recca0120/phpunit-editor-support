export interface Files {
    find(search: string[] | string, opts?: {}): string;
    exists(search: string[] | string, opts?: {}): boolean;
    findUp(search: string[] | string, opts?: {}): string;
}
