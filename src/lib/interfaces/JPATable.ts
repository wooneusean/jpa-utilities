import type JPAField from './JPAField';

export default interface JPATable {
    tableName: string;
    columns: JPAField[];
}
