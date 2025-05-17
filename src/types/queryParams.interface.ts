export interface queryParams<T> {
    page: number;
    limit: number;
    orderBy: string;
    order: 'ASC' | 'DESC';
    orderByField: keyof T;
    search: string;
}