<script lang="ts">
    import {
        Row,
        TextArea,
        Checkbox,
        Button,
        CodeSnippet,
        Tabs,
        Tab,
        TabContent,
        DataTable,
        Toolbar,
        ToolbarContent,
        ToolbarSearch,
        Loading,
    } from 'carbon-components-svelte';
    import { createEventDispatcher } from 'svelte';
    import { getTableInfo } from '../ddl/ddl-parser';
    import { generatePojo } from '../ddl/ddl-to-pojo';
    import type { JPATable } from '../ddl/jpa-types';
    import { unCamelCase } from '../utilities';

    const tableHeaders = [
        'columnName',
        'columnType',
        'isNullable',
        'isPrimary',
        'isUnique',
        'isAutoIncrement',
        'defaultValue',
        'extraAttr',
    ];

    let isLoading = false;
    let currentTabIndex = 0;
    let includeJPAAnnotations = true;
    let includeLombokAnnotations = true;
    let ddl = '';
    let pojo = '';

    let jpaTable: JPATable;
    $: jpaTableColumns = jpaTable?.columns ?? [];
    let selectedColumns: string[] = [];

    const dispatch = createEventDispatcher();

    const goToPojo = () => {
        const refinedJPATable: JPATable = {
            ...jpaTable,
            columns: jpaTable.columns.filter((col) => selectedColumns.includes(col.columnName)),
        };
        try {
            let { pojo: generated, warning } = generatePojo(refinedJPATable, {
                includeJPAAnnotations,
                includeLombokAnnotations,
            });

            pojo = generated;
            changeTab(2);
            if (warning !== '') {
                dispatch('message', { message: warning, type: 'warning' });
            }
        } catch (error) {
            dispatch('message', { message: error.message, type: 'error' });
        }
    };

    const goToRefine = () => {
        try {
            jpaTable = getTableInfo(ddl);
            selectedColumns = jpaTable.columns.map((col) => col.columnName);
            changeTab(1);
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
<Row id="pojo-generator" style="margin-block: 1rem;">
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
                <Button style="margin-block: 1rem;" on:click={goToRefine}>Next</Button>
            </TabContent>
            <TabContent style="width: 100%;">
                <Checkbox labelText="Include JPA Annotations" bind:checked={includeJPAAnnotations} />
                <Checkbox labelText="Include Lombok Annotations" bind:checked={includeLombokAnnotations} />
                <DataTable
                    bind:selectedRowIds={selectedColumns}
                    stickyHeader
                    batchSelection
                    sortable
                    style="margin-block: 1rem;"
                    title="Columns"
                    description="Choose which columns you want to include."
                    headers={tableHeaders.map((header) => ({ key: header, value: unCamelCase(header) }))}
                    rows={jpaTableColumns.map((col) => ({
                        id: col.columnName,
                        ...col,
                        precision: col.precision > -1 ? col.precision : '-',
                        scale: col.scale > -1 ? col.scale : '-',
                        length: col.length > -1 ? col.length : '-',
                    }))}
                >
                    <Toolbar>
                        <ToolbarContent>
                            <ToolbarSearch persistent value="" shouldFilterRows />
                        </ToolbarContent>
                    </Toolbar>
                </DataTable>
                <Button kind="secondary" on:click={() => changeTab(0)}>Back</Button>
                <Button on:click={() => goToPojo()}>Process</Button>
            </TabContent>
            <TabContent style="width: 100%; height: 100%">
                <p class="bx--label">POJO</p>
                <CodeSnippet bind:code={pojo} type="multi" />
                <Button style="margin-block: 1rem" kind="secondary" on:click={() => changeTab(1)}>Back</Button>
            </TabContent>
        </svelte:fragment>
    </Tabs>
</Row>
{#if isLoading}
    <Loading />
{/if}

<style>
    :global(#pojo-generator .bx--snippet),
    :global(#pojo-generator .bx--snippet--multi),
    :global(#pojo-generator .bx--snippet-container) {
        min-width: 100% !important;
        min-height: 100% !important;
        max-width: 100% !important;
        width: 100% !important;
        max-height: 500px !important;
    }

    :global(#pojo-generator .bx--data-table) {
        min-height: 500px;
    }
</style>
