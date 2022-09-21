import { toCamelCase } from '../utilities';
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

const parseDDL = (ddl: string): JPAField => {
    const jpaTypeValues = ddl[3].replace('(', '').replace(')', '').split(',');

    const jpaField: JPAField = {
        columnName: '',
        fieldName: '',
        fieldType: '',
        isNullable: true,
        precision: -1,
        scale: -1,
        length: -1,
        isPrimary: false,
        isUnique: false,
        isAutoIncrement: false,
        defaultValue: null,
        imports: [],
        extraAttr: '',
    };

    jpaField.columnName = ddl[1];
    jpaField.fieldName = toCamelCase(ddl[1]);

    processExtraAttributes(jpaField, ddl[4]);

    switch (ddl[2].toLowerCase()) {
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
            jpaField.fieldType = 'Time';
            jpaField.imports.push('java.sql.Time');
            break;
        case 'datetime':
        case 'timestamp':
            jpaField.fieldType = 'Timestamp';
            jpaField.imports.push('java.sql.Timestamp');
            if (jpaField.defaultValue.toLowerCase() == 'current_timestamp') {
                if (jpaField.columnName.toLowerCase().includes('upd')) {
                    jpaField.imports.push('org.hibernate.annotations.UpdateTimestamp');
                } else if (jpaField.columnName.toLowerCase().includes('creat')) {
                    jpaField.imports.push('org.hibernate.annotations.CreationTimestamp');
                }
            }
            break;
        case 'date':
            jpaField.fieldType = 'Date';
            jpaField.imports.push('java.sql.Date');
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
        default:
            jpaField.fieldType = 'String';
            jpaField.length = parseInt(jpaTypeValues[0]);
            break;
    }

    return jpaField;
};

export const getTableInfo = (ddlString: string): JPATable => {
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

    const jpaColumns = columnList.map((col) => parseDDL(col));

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