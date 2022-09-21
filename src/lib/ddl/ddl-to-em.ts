import { toCamelCase } from '../utilities';
import { getTableInfo } from './ddl-parser';

export const generateEm = (ddl: string): string => {
    const jpaTable = getTableInfo(ddl);

    const jpaColumnsArray = jpaTable.columns.map((col) => `\`${col.columnName}\``).join(', ');
    const jpaSetParamaters = jpaTable.columns
        .map(
            (col, ix) =>
                `    .setParameter(${ix + 1}, ${toCamelCase(jpaTable.tableName)}.${toCamelCase(
                    'GET_' + col.columnName
                )}())`
        )
        .join('\n');
    return `entityManager
    .createNativeQuery("INSERT INTO ${jpaTable.tableName} (${jpaColumnsArray}) VALUES (${'?'
        .repeat(jpaTable.columns.length)
        .split('')
        .join(', ')})")
${jpaSetParamaters}
    .executeUpdate();
    `;
};
