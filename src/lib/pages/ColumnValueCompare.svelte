<script lang="ts">
    import { Button, Column, DataTable, Row, TextArea } from 'carbon-components-svelte';
    import { createEventDispatcher } from 'svelte';
    import type ColumnValue from '../interfaces/ColumnValue';

    const dispatch = createEventDispatcher();
    let rows: ColumnValue[] = [];
    let statement = '';

    const getColumnValues = (statement): ColumnValue[] => {
        const pattern = /\((.+?)\)/gi;
        let matches: string[] = [];
        let match: RegExpExecArray;
        do {
            match = pattern.exec(statement);
            if (match) {
                matches.push(match[1]);
            }
        } while (match);

        if (matches.length != 2) {
            dispatch('message', { message: 'Column or value array not present or is too many.', type: 'error' });
            return [];
        }

        const columns = matches[0].split(',');
        const values = matches[1].split(',');

        if (columns.length != values.length) {
            dispatch('message', { message: 'Lengths of columns and values do not match.', type: 'error' });
            return [];
        }

        return columns.map((col, ix) => ({ id: ix, column: col, value: values[ix] }));
    };

    const handleProcessClicked = () => {
        rows = getColumnValues(statement);
    };
</script>

<Row>
    <h1>Column to Value Comparer</h1>
</Row>
<Row style="margin-block: 1rem;">
    <Button on:click={() => handleProcessClicked()}>Process</Button>
</Row>
<Row style="margin-block: 1rem;">
    <Column>
        <TextArea
            labelText="SQL INSERT Statement"
            placeholder="INSERT INTO `TABLE_NAME` (COLUMNS...) VALUES(..."
            bind:value={statement}
            rows={20}
        />
    </Column>
    <Column>
        <p class="bx--label">Compare</p>
        <DataTable
            headers={[
                { key: 'column', value: 'Column' },
                { key: 'value', value: 'Value' },
            ]}
            {rows}
        />
    </Column>
</Row>
