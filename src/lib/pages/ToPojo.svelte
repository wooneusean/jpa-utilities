<script lang="ts">
    import {
        Row,
        Column,
        TextArea,
        Accordion,
        AccordionItem,
        Checkbox,
        Button,
        CodeSnippet,
        Tabs,
        Tab,
        TabContent,
        DataTable,
    } from 'carbon-components-svelte';
    import { createEventDispatcher } from 'svelte';
    import { getTableInfo } from '../ddl/ddl-parser';
    import { generatePojo } from '../ddl/ddl-to-pojo';
    import type { JPAField } from '../ddl/jpa-types';
    import { toSpaceCase } from '../utilities';

    const tableHeaders = [
        'columnName',
        'fieldName',
        'fieldType',
        'isNullable',
        'precision',
        'scale',
        'length',
        'isPrimary',
        'isUnique',
        'isAutoIncrement',
        'defaultValue',
        'imports',
        'extraAttr',
    ];

    let currentTabIndex = 0;
    let includeJPAAnnotations = true;
    let includeLombokAnnotations = true;
    let ddl = '';
    let pojo = '';
    let jpaColumns: JPAField[] = [];

    const dispatch = createEventDispatcher();

    const handleProcessClicked = () => {
        try {
            let { pojo: generated, warning } = generatePojo(ddl, { includeJPAAnnotations, includeLombokAnnotations });

            pojo = generated;
            if (warning !== '') {
                dispatch('message', { message: warning, type: 'warning' });
            }
        } catch (error) {
            dispatch('message', { message: error.message, type: 'error' });
        }
    };

    const changeTab = (pageIx) => {
        currentTabIndex = pageIx;
    };
</script>

<Row>
    <h1>POJO Generator</h1>
</Row>
<Row style="margin-block: 1rem;">
    <Tabs bind:selected={currentTabIndex}>
        <Tab label="DDL" />
        <Tab label="Refine" />
        <Tab label="POJO" />
        <svelte:fragment slot="content">
            <TabContent style="width: 100%;">
                <TextArea
                    labelText="Data Definition Language"
                    placeholder="CREATE TABLE `TABLE_NAME` (..."
                    bind:value={ddl}
                    rows={20}
                />
                <Button
                    style="margin-block: 1rem;"
                    on:click={() => {
                        jpaColumns = getTableInfo(ddl).columns;
                        changeTab(1);
                    }}>Next</Button
                >
            </TabContent>
            <TabContent style="width: 100%;">
                <Checkbox labelText="Include JPA Annotations" bind:checked={includeJPAAnnotations} />
                <Checkbox labelText="Include Lombok Annotations" bind:checked={includeLombokAnnotations} />
                <DataTable
                    style="margin-block: 1rem;"
                    title="Columns"
                    description="Choose which columns you want to include."
                    stickyHeader
                    headers={tableHeaders.map((header) => ({ key: header, value: toSpaceCase(header) }))}
                />
                <Button on:click={() => handleProcessClicked()}>Process</Button>
            </TabContent>
            <TabContent style="width: 100%">
                <p class="bx--label">POJO</p>
                <CodeSnippet bind:code={pojo} type="multi" />
            </TabContent>
        </svelte:fragment>
    </Tabs>
</Row>
