<script setup lang="ts">
import Button from 'primevue/button';
import type { ButtonProps } from 'primevue/button';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PageHeaderActionProps extends /* @vue-ignore */ ButtonProps {}

const props = withDefaults(defineProps<PageHeaderActionProps>(), {
  size: 'small',
});

</script>

<template>
  <Button v-bind="props">
    <slot />
  </Button>
</template>
