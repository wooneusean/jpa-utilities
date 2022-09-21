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
    } from 'carbon-components-svelte';
    import { createEventDispatcher } from 'svelte';
    import { generatePojo } from '../ddl/ddl-to-pojo';

    let includeJPAAnnotations = true;
    let includeLombokAnnotations = true;
    let ddl = '';
    let pojo = '';

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
</script>

<Row>
    <h1>POJO Generator</h1>
</Row>
<Row style="margin-block: 1rem;">
    <Accordion align="start">
        <AccordionItem title="Settings">
            <Checkbox labelText="Include JPA Annotations" bind:checked={includeJPAAnnotations} />
            <Checkbox labelText="Include Lombok Annotations" bind:checked={includeLombokAnnotations} />
        </AccordionItem>
    </Accordion>
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
        <p class="bx--label">POJO</p>
        <CodeSnippet bind:code={pojo} type="multi" />
    </Column>
</Row>
