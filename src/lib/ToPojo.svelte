<script lang="ts">
    import { Grid, Row, Column, TextArea, Accordion, AccordionItem, Checkbox, Button } from 'carbon-components-svelte';

    let includeJpaAnnotations = true;
    let includeLombokAnnotations = true;
    let ddl = '';
    let pojo = '';
</script>

<Grid>
    <Row>
        <h1>DDL to POJO</h1>
    </Row>
    <Row style="margin-block: 1rem;">
        <Accordion align="start">
            <AccordionItem title="Settings">
                <Checkbox labelText="Include JPA Annotations" bind:checked={includeJpaAnnotations} />
                <Checkbox labelText="Include Lombok Annotations" bind:checked={includeLombokAnnotations} />
            </AccordionItem>
        </Accordion>
    </Row>
    <Row style="margin-block: 1rem;">
        <Button on:click={() => alert(ddl)}>Process</Button>
    </Row>
    <Row style="margin-block: 1rem;">
        <Column>
            <TextArea
                labelText="Data Definition Language"
                placeholder="CREATE TABLE `TABLE_NAME` (..."
                bind:value={ddl}
            />
        </Column>
        <Column>
            <TextArea labelText="POJO" readonly bind:value={pojo} />
        </Column>
    </Row>
</Grid>
