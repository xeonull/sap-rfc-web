<template>
  <v-layout>
    <v-app-bar class="app-bar" :elevation="1" density="compact">
      <v-app-bar-title class="app-bar__title">SAP_RFC</v-app-bar-title>
      <template v-slot:image>
        <v-img class="app-bar__img"></v-img>
      </template>

      <v-tabs class="app-bar__tabs" density="compact">
        <v-tab value="home" to="/">Tables</v-tab>
        <v-tab value="package" to="/package">Packages</v-tab>
        <v-tab value="schedule" to="/schedule">Schedules</v-tab>
        <v-tab value="document" to="/document">Documents</v-tab>
      </v-tabs>

      <AppSettings />
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

<style lang="scss"></style>
