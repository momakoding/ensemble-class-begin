<script setup lang="ts">
</script>

<template>
  <div class="game-ui">
    <RouterView />
  </div>
</template>
<style lang="css" scoped>
@reference "@/style.css";

.game-ui {
  @apply h-screen bg-bg-page text-text-primary select-none;
}
</style>