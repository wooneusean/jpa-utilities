<script lang="ts">
    import { Row, Column, TextArea, Button, CodeSnippet } from 'carbon-components-svelte';
    // import { createEventDispatcher } from 'svelte';
    import { generateEm } from '../ddl/ddl-to-em';

    let ddl = '';
    let em = '';

    // const dispatch = createEventDispatcher();

    const handleProcessClicked = () => {
        em = generateEm(ddl);
    };
</script>

<Row>
    <h1>EntityManager Statement Generator</h1>
</Row>
<Row style="margin-block: 1rem;">
    <Button on:click={() => handleProcessClicked()}>Process</Button>
</Row>
<Row style="margin-block: 1rem;">
    <Column>
        <TextArea
            labelText="Data Definition Language"
            placeholder="CREATE TABLE `TABLE_NAME` (..."
            bind:value={ddl}
            rows={20}
        />
    </Column>
    <Column>
        <p class="bx--label">EM Statement</p>
        <CodeSnippet bind:code={em} type="multi" />
    </Column>
</Row>
