export interface JPAField {
    columnName: string;
    columnType: String;
    fieldName: string;
    fieldType: string;
    isNullable: boolean;
    precision: number;
    scale: number;
    length: number;
    isPrimary: boolean;
    isUnique: boolean;
    isAutoIncrement: boolean;
    defaultValue?: string;
    imports: string[];
    extraAttr: string;
}

export interface JPATable {
    tableName: string;
    columns: JPAField[];
}

export interface ToastMessage {
    message: string;
    type: 'warning' | 'error' | 'info' | 'info-square' | 'success' | 'warning-alt';
}
