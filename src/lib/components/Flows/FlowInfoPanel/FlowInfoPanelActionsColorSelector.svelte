<script lang="ts">
  import '@simonwep/pickr/dist/themes/monolith.min.css'; // 'monolith' theme
  import { COLORS } from '$lib/common/config/colorConfig';
  import { onMount } from 'svelte';
  import { selectedColor } from '$lib/client/stores/UIDataStore';
  import type Pickr from '@simonwep/pickr';

  // color selector state
  let openColorSelectorButton: HTMLElement;
  let colorPicker: Pickr;
  let PickrObject: typeof Pickr;

  onMount(async () => {
    // have to dynamically import or else we get a 'self is not defined' error (SSR related)
    const PickrModule = await import('@simonwep/pickr');
    PickrObject = PickrModule.default;
  });

  $: {
    if (PickrObject) {
      colorPicker?.destroy();
      initColorPicker(openColorSelectorButton);
    }
  }

  function initColorPicker(node: HTMLElement) {
    const pickr = new PickrObject({
      el: node,
      useAsButton: true,
      default: $selectedColor,
      theme: 'monolith',
      lockOpacity: true,
      position: 'right-middle',
      autoReposition: false,
      swatches: [
        COLORS.major[0],
        COLORS.support[0],
        COLORS.ge[0],
        COLORS.conc1[0],
        COLORS.conc2[0],
        COLORS.elective[0],
        COLORS.gwr[0], // GWR color
        COLORS.other[0] // 'other' course box color (gray, shows up in flows every so often)
      ],
      components: {
        preview: true,
        hue: true,
        interaction: {
          input: true,
          save: true
        }
      }
    }).on('save', (color: Pickr.HSVaColor) => {
      const colorHex = color.toHEXA().toString();
      selectedColor.set(colorHex);
      pickr.hide();

      // so that when we use keyboard shortcuts to color a specific course
      // after picking one from Pickr, it doesn't focus on the pickr 'save & close' button,
      // which was preventing the hovered course card from being colored
      document.body.focus();
    });
  }
</script>

<a
  href={'#'}
  class="flex justify-between"
  on:click|preventDefault
  bind:this={openColorSelectorButton}
>
  <span>Color Selector</span>
  <div class="colorSelectorSquare" style="background-color: {$selectedColor};" />
</a>

<style lang="postcss">
  .colorSelectorSquare {
    @apply rounded-sm;
    border: 1px solid hsla(var(--n) / 0.625);
    width: 1.125rem;
    height: 1.125rem;
    margin: 1px 0.25rem 0 0.5rem;
  }
</style>
