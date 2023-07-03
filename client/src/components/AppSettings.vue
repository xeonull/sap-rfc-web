<template>
  <v-menu :close-on-content-click="false" open-on-hover>
    <template v-slot:activator="{ props }">
      <v-btn class="settings-btn" v-bind="props" icon="mdi:mdi-cog" />
    </template>

    <v-card class="settings-content" min-width="200">
      <template v-slot:append>
        <v-switch
          density="compact"
          class="settings-content__theme-switch"
          v-model="store.isDarkTheme"
          :label="`${store.isDarkTheme ? 'Dark' : 'Light'} theme`"></v-switch>
        <!-- <v-switch true-icon="mdi:mdi-weather-night" false-icon="mdi:mdi-weather-sunny" @change="toggleTheme"></v-switch> -->
        <v-text-field variant="underlined" label="Max Rows" v-model="store.tableMaxRows" type="number" ></v-text-field>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup>
import { useTheme } from "vuetify";
import { store } from "@/store/store.js";
import { watch } from "vue";
const theme = useTheme();

watch(
  () => store.isDarkTheme,
  (val) => (theme.global.name.value = val ? "corpDarkTheme" : "corpLightTheme")
);
</script>

<style lang="scss" scoped>
.settings {
  &-btn {
    margin-right: 8px;
    color: rgb(var(--v-theme-secondary)) !important;
  }
  &-content {
    padding-right: 12px;

    &__theme-switch {
      margin-top: 12px;
      margin-right: 12px;
    }
  }
}
</style>
