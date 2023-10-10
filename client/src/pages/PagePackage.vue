<template>
  <div class="page">
    <v-overlay class="align-center justify-center" persistent v-model="loadingList">
      <v-progress-circular :size="50" color="blue" indeterminate></v-progress-circular>
    </v-overlay>
    <v-expansion-panels v-model="expansionPanel">
      <v-expansion-panel class="page__tool-box" value="tools">
        <v-expansion-panel-title class="page__tool-box__title">
          <template v-slot:default="{ expanded }">
            <v-row no-gutters>
              <v-col cols="4" class="d-flex justify-start"> Package Options </v-col>
              <v-col cols="8">
                <v-fade-transition leave-absolute>
                  <span v-if="!expanded" class="page__tool-box__title__package_name">{{ package_name }}</span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="page__tool-box__pane">
          <div class="page__tool-box__content">
            <div class="page__tool-box__content__left">
              <v-label class="page__tool-box__content__left__label">{{ `Choose Environment, Model and Package name` }}</v-label>
              <v-select
                class="page__tool-box__content__left__input"
                label="Environment"
                variant="solo"
                density="compact"
                :items="environmentList"
                v-model="environmentValue"></v-select>

              <v-select
                class="page__tool-box__content__left__input"
                label="Model"
                variant="solo"
                density="compact"
                :items="modelList"
                v-model="modelValue"></v-select>

              <div class="page__tool-box__content__left__wbtn-box">
                <v-autocomplete
                  class="page__tool-box__content__left__wbtn-box__input"
                  label="Package"
                  variant="solo"
                  density="compact"
                  persistent-hint
                  :hint="normTable.length ? `Rows: ${normTable.length}` : ``"
                  v-model="package_name"
                  v-model:search="package_search"
                  :items="packagesListApplShort"
                  :loading="loadingFilter"></v-autocomplete>
                <v-btn class="page__tool-box__content__left__wbtn-box__btn process" @click="loadPackageTable" :loading="loadingTab">
                  Load package info
                </v-btn>
              </div>
            </div>

            <div class="page__tool-box__content__right"></div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="page__table-box">
      <DataTable :table="normTable" :fileds="normFields" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

import DataTable from '@/components/DataTable.vue';

import api from '@/web/api.js';
import { store } from '@/store/store.js';
import { useNotify } from '@/composable/useNotify.js';

const expansionPanel = ref(['tools']);

const loadingList = ref(false);
const loadingTab = ref(false);
const loadingFilter = ref(false);
const normTable = ref([]);
const normFields = ref([]);

const packagesList = ref([]); // Список пакетов для всех сред и моделей
const packagesListAppl = ref([]); // Список пакетов для выбранной среды и модели
const packagesListApplShort = ref([]); // Список отфильтрованных пакетов выбранной среды и модели

const environmentList = ref([]);
const environmentValue = ref(null);

const modelList = ref([]);
const modelValue = ref(null);

const package_name = ref('');
const package_search = ref(null);

const { snackbarShow, snackbarText } = useNotify();

const updateModelList = () => {
  modelList.value = packagesList.value
    ? [
        ...packagesList.value.reduce((a, v) => {
          if (v.APPSET_ID === environmentValue.value) a.add(v.APP_ID);
          return a;
        }, new Set()),
      ]
    : null;
};

const updatePackageList = () => {
  packagesListAppl.value = packagesList.value
    ? [
        ...packagesList.value.reduce((a, v) => {
          if (v.APPSET_ID === environmentValue.value && v.APP_ID === modelValue.value) a.add(v.PACKAGE_ID);
          return a;
        }, new Set()),
      ]
    : null;
  packagesListAppl.value.sort();
  packagesListApplShort.value = packagesListAppl.value.slice();
};

/* Следим за изменением среды - меняем список моделей */
watch(environmentValue, () => {
  updateModelList();
  modelValue.value = modelList.value?.length ? modelList.value[0] : null;
});

/* Следим за изменением модели - меняем список пакетов */
watch(modelValue, () => {
  updatePackageList();
  package_name.value = packagesListAppl.value?.length ? packagesListAppl.value[0] : null;
});

/* Следим за изменением sap системы */
watch(
  () => store.systemHost,
  () => {
    loadPackageList();
    normTable.value.length = 0;
    normFields.value.length = 0;
    expansionPanel.value = ['tools']; // Expand tools expansion panel
  }
);

/* Следим за изменением названия таблицы */
watch(package_search, (val) => {
  val !== package_name.value && updateListView(val);
});

const updateListView = (value) => {
  loadingFilter.value = true;
  try {
    packagesListApplShort.value = packagesListAppl.value.filter((e) => {
      return (e || '').toUpperCase().indexOf((value || '').toUpperCase()) > -1;
    });
  } finally {
    loadingFilter.value = false;
  }
};

const loadPackageTable = async () => {
  loadingTab.value = true;
  try {
    const content = await api.getPackage(store.systemHost, environmentValue.value, modelValue.value, package_name.value);
    if (content.table && content.fields) {
      normTable.value = content.table;
      normFields.value = content.fields;
    } else {
      normTable.value.length = 0;
    }
    expansionPanel.value = []; // Hide tools expansion panel
  } catch (err) {
    snackbarText.value = err.message;
    snackbarShow.value = true;
  } finally {
    loadingTab.value = false;
  }
};

const loadPackageList = async () => {
  snackbarShow.value = false;
  loadingList.value = true;
  try {
    const content = await api.getPackageList(store.systemHost);
    if (content.table) {
      packagesList.value = content.table;
      environmentList.value = [...new Set(packagesList.value.map((e) => e.APPSET_ID))];
      // Оставляем предыдущее значение Среды, если оно уже было выбрано ранее и также есть в обновленном списке, иначе берем первое
      if (!environmentValue.value || environmentList.value.indexOf(environmentValue.value) === -1) {
        // При изменении Среды список пакетов обновиться через watch
        environmentValue.value = environmentList.value?.length ? environmentList.value[0] : null;
      } else updateModelList();

      // Оставляем предыдущее значение Модели, если оно уже было выбрано ранее и есть в обновленном списке, иначе берем первое
      if (!modelValue.value || modelList.value.indexOf(modelValue.value) === -1) {
        // При изменении Модели список пакетов обновиться через watch
        modelValue.value = modelList.value?.length ? modelList.value[0] : null;
      } else updatePackageList();

      // Оставляем предыдущее значение Пакета, если оно уже было выбрано ранее и есть в обновленном списке, иначе берем первое
      if (!package_name.value || packagesListAppl.value.indexOf(package_name.value) === -1) {
        package_name.value = packagesListAppl.value?.length ? packagesListAppl.value[0] : null;
      }
    } else {
      packagesList.value.length = 0;
    }
  } catch (err) {
    snackbarText.value = err.message;
    snackbarShow.value = true;
  } finally {
    loadingList.value = false;
  }
};

onMounted(loadPackageList);
</script>

<style scoped lang="scss">
.page {
  margin: 10px;

  &__tool-box {
    margin-bottom: 10px;
    &__title {
      min-height: $cstm-expansion-panel-title-min-height;
      &__package_name {
        color: rgba(var(--v-theme-secondary), 0.5);
        white-space: nowrap;
      }
    }

    &__content {
      padding-top: 12px;
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-between;

      &__left {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &__label {
          align-items: start;
        }
        &__input {
          max-width: $cstm-input-max-width;
        }

        &__wbtn-box {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: start;
          flex-grow: 1;

          &__input {
            width: $cstm-input-max-width;
          }

          &__btn {
            margin: 4px 0 24px 20px;
            align-self: flex-end;
          }
        }
      }

      &__right {
        max-width: 600px;
        flex-grow: 2;
        margin-left: 16px;
        margin-top: 2px;
      }
    }
  }
}
</style>
