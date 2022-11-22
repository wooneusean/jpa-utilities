import type DDLToPOJOOptions from '../interfaces/DDLToPOJOOptions';
import type JPAField from '../interfaces/JPAField';
import type JPATable from '../interfaces/JPATable';
import { capitalize, toCamelCase } from '../utilities';

const generateJpaString = (jpaField: JPAField, options: DDLToPOJOOptions): string => {
    const fieldDetails = [];

    if (options.includeJPAAnnotations === true) {
        const combinedFields = [];

        combinedFields.push(`name = "${jpaField.columnName}"`);
        combinedFields.push(jpaField.isNullable == false ? `nullable = false` : '');
        combinedFields.push(jpaField.length > -1 ? `length = ${jpaField.length}` : '');
        combinedFields.push(jpaField.precision > 0 ? `precision = ${jpaField.precision}` : '');
        combinedFields.push(jpaField.scale > 0 ? `scale = ${jpaField.scale}` : '');
        combinedFields.push(jpaField.isUnique ? 'unique = true' : '');

        if (options.includeColumnDefinition === true) {
            combinedFields.push(jpaField.defaultValue ? `columnDefinition = "DEFAULT ${jpaField.defaultValue}"` : '');
        }

        let annotationFieldsStr = combinedFields.filter((x) => x !== '').join(', ');

        jpaField.annotations.forEach((ann) => fieldDetails.push(`    ${ann}`));

        fieldDetails.push(`    @Column(${annotationFieldsStr})`);
        jpaField.imports.push('javax.persistence.Column');

        if (jpaField.isAutoIncrement) {
            fieldDetails.unshift('    @GeneratedValue(strategy = GenerationType.IDENTITY)');
            jpaField.imports.push('javax.persistence.GeneratedValue');
            jpaField.imports.push('javax.persistence.GenerationType');
        }

        if (jpaField.isPrimary) {
            fieldDetails.unshift('    @Id');
            jpaField.imports.push('javax.persistence.Id');
        }

        if (jpaField.imports.includes('org.hibernate.annotations.UpdateTimestamp')) {
            fieldDetails.unshift('    @UpdateTimestamp');
        } else if (jpaField.imports.includes('org.hibernate.annotations.CreationTimestamp')) {
            fieldDetails.unshift('    @CreationTimestamp');
        }
    }

    fieldDetails.push(`    private ${jpaField.fieldType} ${jpaField.fieldName};`);

    return fieldDetails.join('\n');
};

export const generatePojo = (
    jpaTable: JPATable = null,
    options: DDLToPOJOOptions
): { pojo: string; warning: string } => {
    // max length 4194304

    // Move primary key to the top
    const jpaColumnsString = jpaTable.columns
        .sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0))
        .map((col) => generateJpaString(col, options))
        .join('\n\n');

    const jpaImportsString = [
        ...(options.includeJPAAnnotations ? ['javax.persistence.Entity', 'javax.persistence.Table'] : []),
        ...new Set(
            jpaTable.columns
                .reduce((prev, curr, _) => {
                    return [...prev, ...curr.imports];
                }, [])
                .filter((x) => x)
        ),
    ]
        .map((imp) => `import ${imp};`)
        .join('\n');

    const pojo = `${options.includeLombokAnnotations === true ? 'import lombok.Data;' : ''}

import java.io.Serializable;
${jpaImportsString}

${options.includeLombokAnnotations === true ? '@Data' : ''}
${
    options.includeJPAAnnotations === true
        ? `@Entity
@Table(name = "${jpaTable.tableName.toUpperCase()}")`
        : ''
}
public class ${capitalize(toCamelCase(jpaTable.tableName))} implements Serializable {
${jpaColumnsString}
}`;

    return {
        pojo,
        warning:
            jpaTable.columns.length > 60
                ? `Tables with a large amount of columns may cause problems due to certain databases' query length limits. Consider selecting only the needed columns to avoid this problem.`
                : '',
    };
};
