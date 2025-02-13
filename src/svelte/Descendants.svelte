<script lang="ts">
  import type { App } from "obsidian";
  import type { DBManager } from "../db";
  import { GetDisplayName, NavigateToFile } from "../utils";
  import type { expandManager } from "./helpers/expandManager";

  export let note_path: string;
  export let db: DBManager;
  export let indentation: number;
  export let view: any;
  export let app: App;
  export let expandMan: expandManager;

  expandMan.logIndent(indentation);
  let dark_mode = document.body.classList.contains("theme-dark")
    ? "dark-mode"
    : "light-mode";

  let expanded;

  let children = [];
  if (db.descendants.has(note_path)) {
    children = db.descendants.get(note_path).slice();
  }

  function resetExpanded(new_max_indent: number) {
    if (indentation == 0) {
      expanded = true;
    } else if (!view.plugin.settings.isExpanded(note_path)) {
      expanded = false;
    } else {
      expanded = true ? indentation < new_max_indent : false;
    }
  }
  resetExpanded(expandMan.initial_max_indent);

  expandMan.registerRedrawDescendantCallback(resetExpanded);
</script>

<!-- expand svg-->
<svg display="none">
  <symbol
    id="expand-arrow-svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    ><path d="M22 12l-20 12 5-12-5-12z" />
  </symbol></svg
>
<!--start descendants view-->
{#if indentation == 0 && children.length == 0}
  No descendants
{:else}
  <li class="container {dark_mode}">
    <p>
      {#if indentation == 0}
        {GetDisplayName(note_path, db)}
      {:else}{#if children.length > 0}
          <span
            class="expand-arrow"
            on:click={() => {
              expanded = !expanded;
              console.log("known path: ", note_path);
              view.plugin.settings.setExpanded(note_path, expanded);
              if (expanded) {
                expandMan.onManualExpand();
                expandMan.logIndent(indentation + 1);
              }
            }}
            ><div class="expand_button">
              {#if expanded}
                <svg class="svg expanded">
                  <use href="#expand-arrow-svg" />
                </svg>
              {:else}<svg class="svg">
                  <use href="#expand-arrow-svg" />
                </svg>
              {/if}
            </div></span
          >{/if}
        <a
          class="link"
          title={note_path}
          on:click={(event) => {
            NavigateToFile(app, note_path, event);
          }}
        >
          {GetDisplayName(note_path, db)}</a
        >
      {/if}
    </p>
    <ul>
      {#if children.length > 0 && expanded}
        {#each children as child}
          <svelte:self
            {db}
            {app}
            note_path={child}
            indentation={indentation + 1}
            {view}
            {expandMan}
          />
        {/each}
      {/if}
    </ul>
  </li>
{/if}

<style>
  a.link {
    cursor: pointer;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  ul {
    padding-left: 1em;
  }

  li {
    padding-left: 1em;
    border: 5px solid darkgray;
    border-width: 0 0 1px 1px;
  }
  li.dark-mode {
    padding-left: 1em;
    border: 5px solid gray;
    border-width: 0 0 1px 1px;
  }
  li.container {
    border-bottom: 0px;
  }

  li p {
    margin: 0;
    position: relative;
    top: 0em;
  }

  li ul {
    border-top: 1px solid darkgray;
    margin-left: -1em;
    padding-left: 2em;
  }

  li.dark-mode ul {
    border-top: 1px solid gray;
  }

  ul li:last-child ul {
    border-left: none;
    margin-left: -17px;
  }

  .expand-arrow {
    color: darkgrey;
  }

  .expand-arrow:hover {
    color: gray;
  }

  div.expand_button {
    display: inline;
  }

  div.expand_button svg.svg {
    width: 14px;
    height: 14px;
    margin-top: 5px;
  }

  li.light-mode div.expand_button svg.svg {
    fill: darkgrey;
  }
  li.light-mode div.expand_button svg.svg:hover {
    fill: gray;
  }

  li.dark-mode div.expand_button svg.svg {
    fill: gray;
  }
  li.dark-mode div.expand_button svg.svg:hover {
    fill: lightgray;
  }

  div.expand_button svg.svg.expanded {
    transform: rotate(90deg);
  }
</style>
