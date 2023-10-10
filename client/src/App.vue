<template>
  <v-layout>
    <v-app-bar class="app-bar" :elevation="1" density="compact">
      <v-app-bar-title class="app-bar__title">SAP_RFC</v-app-bar-title>
      <template v-slot:image>
        <v-img class="app-bar__img"></v-img>
        <!-- <v-img gradient="to top right, red, blue"></v-img> -->
      </template>

      <v-tabs class="app-bar__tabs" density="compact">
        <v-tab value="home" to="/">Tables</v-tab>
        <v-tab value="package" to="/package">Packages</v-tab>
        <v-tab value="schedule" to="/schedule">Schedules</v-tab>
        <v-tab value="document" to="/document">Documents</v-tab>
      </v-tabs>

      <AppSettings />
      <!-- 
      -->
      <v-select
        class="app-bar__system-select"
        variant="solo"
        label="System"
        density="compact"
        v-model="store.systemHost"
        :items="store.systemHostList" />
    </v-app-bar>

    <v-main class="main">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </v-main>

    <v-snackbar content-class="snackbar" v-model="snackbarShow" timeout="-1">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="tonal" @click="snackbarShow = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

import AppSettings from '@/components/AppSettings.vue';

import api from '@/web/api.js';
import { store } from '@/store/store.js';
import { useNotify } from '@/composable/useNotify.js';

const { snackbarShow, snackbarText } = useNotify();

const loadSystems = async () => {
  try {
    const res = await api.getSystemList();
    store.updateSystemHostList(res);
  } catch (err) {
    snackbarText.value = err.message;
    snackbarShow.value = true;
    console.log('err:', err);
  }
};

onMounted(loadSystems);
</script>

<style lang="scss">
@font-face {
  font-family: 'Roboto';
  src: local('Roboto'), url('/fonts/Roboto/Roboto-Regular.woff2') format('woff2'), url('/fonts/Roboto/Roboto-Regular.woff') format('woff');
  font-weight: 100;
  font-style: normal;
}

:root {
  font-family: Roboto, Helvetica, Arial, sans-serif !important;
  background-color: rgb(var(--v-theme-background));
}

a {
  color: rgb(var(--v-theme-text));
  text-decoration: none;
}
.app-bar {
  &__title {
    color: rgb(var(--v-theme-on-primary));
  }
  &__tabs {
    position: absolute;
    left: 180px;
    max-height: 70px;
    color: rgb(var(--v-theme-on-primary));
  }
  &__img {
    background: linear-gradient(to right, rgb(var(--v-theme-bg-head)), rgb(var(--v-theme-bg-head-lighten)));
  }
  &__system-select {
    max-width: $cstm-input-min-width;
    margin-right: 12px;
    margin-top: 22px;
  }
}
.snackbar {
  color: rgb(var(--v-theme-on-primary)) !important;
  background: rgb(var(--v-theme-error)) !important;
}

::-webkit-scrollbar {
  display: none;
}

.v-btn {
  &.process {
    height: $cstm-button-height !important;
    background: rgb(var(--v-theme-primary)) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
  }
  &--disabled {
    background-color: rgb(var(--v-theme-surface-variant)) !important;
    opacity: 0.58 !important;
  }
}
</style>
