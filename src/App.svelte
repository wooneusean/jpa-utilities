<script lang="ts">
    import { Header, SkipToContent, Content, SideNav, SideNavItems, SideNavLink } from 'carbon-components-svelte';
    import ToEntityManager from './lib/ToEntityManager.svelte';
    import ToPojo from './lib/ToPojo.svelte';

    let isSideNavOpen = false;
    let currentPage = 0;
</script>

<Header company="JPA" platformName="Utilities" bind:isSideNavOpen>
    <svelte:fragment slot="skip-to-content">
        <SkipToContent />
    </svelte:fragment>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
    <SideNavItems>
        <SideNavLink text="DDL to JPA POJO" on:click={() => (currentPage = 0)} />
        <SideNavLink text="DDL to EntityManager Insert" on:click={() => (currentPage = 1)} />
    </SideNavItems>
</SideNav>

<Content>
    {#if currentPage == 0}
        <ToPojo />
    {:else}
        <ToEntityManager />
    {/if}
</Content>
