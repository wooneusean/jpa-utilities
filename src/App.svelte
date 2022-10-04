<script lang="ts">
    import {
        Header,
        SkipToContent,
        Content,
        SideNav,
        SideNavItems,
        SideNavMenu,
        SideNavMenuItem,
        Grid,
        ToastNotification,
    } from 'carbon-components-svelte';
    import type { ToastMessage } from './lib/ddl/jpa-types';
    import ToEntityManager from './lib/pages/ToEntityManager.svelte';
    import ToPojo from './lib/pages/ToPojo.svelte';
    import { capitalize } from './lib/utilities';

    let isSideNavOpen = false;
    let currentPage = 0;

    let messages: ToastMessage[] = [];

    let handleMessage = (message: CustomEvent<ToastMessage>) => {
        messages.push(message.detail);
        messages = messages;
    };
</script>

<Header company="JPA" platformName="Utilities" bind:isSideNavOpen>
    <svelte:fragment slot="skip-to-content">
        <SkipToContent />
    </svelte:fragment>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
    <SideNavItems>
        <SideNavMenu expanded={true} text="Generators">
            <SideNavMenuItem text="POJO" on:click={() => (currentPage = 0)} />
            <SideNavMenuItem text="EntityManager Statements" on:click={() => (currentPage = 1)} />
        </SideNavMenu>
    </SideNavItems>
</SideNav>

<Content>
    <Grid>
        {#if currentPage == 0}
            <ToPojo on:message={handleMessage} />
        {:else}
            <ToEntityManager on:message={handleMessage} />
        {/if}
    </Grid>
</Content>
<div class="bottom-right">
    {#each messages as message}
        <ToastNotification
            kind={message.type}
            timeout={10000}
            title={capitalize(message.type)}
            subtitle={message.message}
            caption={new Date().toLocaleString()}
        />
    {/each}
</div>

<style>
    .bottom-right {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 10;
    }
</style>
