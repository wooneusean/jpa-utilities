import { toCamelCase } from '../utilities';
import type { DDLToPOJOOptions } from './ddl-to-pojo';
import type { JPAField, JPATable } from './jpa-types';

const processExtraAttributes = (jpaField: JPAField, extraAttr: string): JPAField => {
    let extraAttrList = extraAttr.trim().split(' ');

    let i = 0;
    while (i < extraAttrList.length) {
        switch (extraAttrList[i].toLowerCase()) {
            case 'not':
                if (extraAttrList[i + 1].toLowerCase() == 'null') {
                    jpaField.isNullable = false;
                    i++;
                }
                break;
            case 'default':
                jpaField.defaultValue = extraAttrList[i + 1];
                i++;
                break;
            case 'auto_increment':
                jpaField.isAutoIncrement = true;
                break;
            case 'primary':
                if (extraAttrList[i + 1] == 'key') {
                    jpaField.isPrimary = true;
                    i++;
                }
                break;
            case 'unique':
                if (extraAttrList[i + 1] == 'key') {
                    jpaField.isUnique = true;
                    i++;
                }
                break;
            default:
                break;
        }
        i++;
    }

    return jpaField;
};

export const parseDDL = (ddl: string, options: DDLToPOJOOptions): JPAField => {
    const jpaTypeValues = ddl[3].replace('(', '').replace(')', '').split(',');

    const jpaField: JPAField = {
        columnName: '',
        columnType: '',
        fieldName: '',
        fieldType: '',
        isNullable: true,
        precision: -1,
        scale: -1,
        length: -1,
        isPrimary: false,
        isUnique: false,
        isAutoIncrement: false,
        defaultValue: '',
        imports: [],
        extraAttr: '',
    };

    jpaField.columnName = ddl[1];
    jpaField.columnType = ddl[2];
    jpaField.fieldName = toCamelCase(ddl[1]);

    processExtraAttributes(jpaField, ddl[4]);

    switch (jpaField.columnType) {
        case 'varbinary':
        case 'longvarbinary':
        case 'binary':
            jpaField.fieldType = 'Byte[]';
            break;
        case 'real':
            jpaField.fieldType = 'Float';
            jpaField.precision = parseInt(jpaTypeValues[0]);
            jpaField.scale = parseInt(jpaTypeValues[1]);
            break;
        case 'float':
        case 'double':
            jpaField.fieldType = 'Double';
            jpaField.precision = parseInt(jpaTypeValues[0]);
            jpaField.scale = parseInt(jpaTypeValues[1]);
            break;
        case 'bigint':
            jpaField.fieldType = 'Long';
            break;
        case 'time':
            if (options.useNewTimeLibrary === true) {
                jpaField.fieldType = 'LocalTime';
                jpaField.imports.push('java.time.LocalTime');
            } else {
                jpaField.fieldType = 'Time';
                jpaField.imports.push('java.sql.Time');
            }
            break;
        case 'datetime':
        case 'timestamp':
            if (options.useNewTimeLibrary === true) {
                jpaField.fieldType = 'LocalDateTime';
                jpaField.imports.push('java.time.LocalDateTime');
            } else {
                jpaField.fieldType = 'Timestamp';
                jpaField.imports.push('java.sql.Timestamp');
            }
            if (jpaField.defaultValue.toLowerCase() == 'current_timestamp') {
                const colName = jpaField.columnName.toLowerCase();
                if (colName.includes('update')) {
                    jpaField.imports.push('org.hibernate.annotations.UpdateTimestamp');
                } else if (colName.includes('create') || colName.includes('insert')) {
                    jpaField.imports.push('org.hibernate.annotations.CreationTimestamp');
                }
            }
            break;
        case 'date':
            if (options.useNewTimeLibrary === true) {
                jpaField.fieldType = 'LocalDate';
                jpaField.imports.push('java.time.LocalDate');
            } else {
                jpaField.fieldType = 'Date';
                jpaField.imports.push('java.sql.Date');
            }
            break;
        case 'numeric':
        case 'decimal':
            jpaField.fieldType = 'BigDecimal';
            jpaField.imports.push('java.math.BigDecimal');
            jpaField.precision = parseInt(jpaTypeValues[0]);
            jpaField.scale = parseInt(jpaTypeValues[1]);
            break;
        case 'integer':
        case 'int':
            jpaField.fieldType = 'Integer';
            break;
        case 'bit':
            jpaField.fieldType = 'Boolean';
            break;
        case 'tinyint':
            jpaField.fieldType = 'Byte';
            break;
        case 'smallint':
            jpaField.fieldType = 'Short';
            break;
        case 'char':
            jpaField.fieldType = 'Character';
            break;
        case 'varchar':
        case 'longvarchar':
            jpaField.fieldType = 'String';
            jpaField.length = parseInt(jpaTypeValues[0]);
            break;
        default:
            jpaField.fieldType = 'Object';
            break;
    }

    return jpaField;
};

export const getTableInfo = (ddlString: string, options: DDLToPOJOOptions): JPATable => {
    const tableNameRegExp = /CREATE TABLE `(.+)`/gi;
    const tableNameMatch = tableNameRegExp.exec(ddlString);

    if (tableNameMatch == null) {
        throw new SyntaxError('Cannot find table name!');
    }

    const tableName = tableNameMatch[1];

    const columnRegExp = /(?:`|)([\w\d]+?)(?:`|)\s(\w+?)((?:\(\d+(?:,\d+|)\))|)\s(.+?)(?:,|(?:[\n\r]|)\))/gim;

    const columnList = [];
    let columnMatch: RegExpExecArray;
    do {
        columnMatch = columnRegExp.exec(ddlString);
        if (columnMatch) {
            const columnName = columnMatch[1].toLowerCase();
            if (columnName == 'primary' || columnName == 'create' || columnName == 'unique' || columnName == 'key')
                continue;
            columnList.push(columnMatch);
        }
    } while (columnMatch);

    const jpaColumns = columnList.map((col) => parseDDL(col, options));

    const primaryKeyPattern = /PRIMARY KEY \(`(.+)`\)/gi;
    const primaryKeyMatch = primaryKeyPattern.exec(ddlString);
    if (primaryKeyMatch != null) {
        const primaryKey = primaryKeyMatch[1];
        jpaColumns.find((x) => x.columnName == primaryKey).isPrimary = true;
    }

    return {
        tableName: tableName,
        columns: jpaColumns,
    };
};
