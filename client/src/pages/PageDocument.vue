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
              <v-col cols="4" class="d-flex justify-start"> Document Options </v-col>
              <v-col cols="8">
                <v-fade-transition leave-absolute>
                  <span v-if="!expanded" class="page__tool-box__title__collapse_text">
                    Environment: {{ environmentValue }}{{ search ? ` and Filter: '${search}'` : '' }}
                  </span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="page__tool-box__pane">
          <div class="page__tool-box__content">
            <div class="page__tool-box__content__left">
              <v-select
                class="page__tool-box__content__left__input"
                label="Environment"
                variant="solo"
                density="compact"
                :items="environmentList"
                v-model="environmentValue"></v-select>
              <div class="page__tool-box__content__left__wbtn-box">
                <v-select
                  class="page__tool-box__content__left__wbtn-box__input"
                  label="Document types"
                  variant="solo"
                  density="compact"
                  multiple
                  chips
                  :items="docTypes"
                  item-value="id"
                  item-text="title"
                  v-model="docTypesSelect">
                  <template v-slot:prepend-item>
                    <v-list-item title="Select All" @click="docTypesToggle">
                      <template v-slot:prepend>
                        <v-checkbox-btn
                          :indeterminate="docTypesSelect.length > 0 && docTypesSelect.length < docTypes.length"
                          :model-value="docTypesSelect.length === docTypes.length"></v-checkbox-btn>
                      </template>
                    </v-list-item>
                    <v-divider class="mt-2"></v-divider>
                  </template>
                </v-select>
                <v-btn
                  class="page__tool-box__content__left__wbtn-box__btn process"
                  :disabled="docTypesSelect.length === 0"
                  @click="loadDocuments"
                  :loading="loadingTab">
                  Load Documents
                </v-btn>
              </div>
            </div>
            <div class="page__tool-box__content__right">
              <v-text-field
                v-model="search"
                :disabled="normTable.length === 0"
                prepend-icon="mdi-magnify"
                label="Input text to filter the table"
                single-line
                hide-details
                variant="outlined"
                density="compact"></v-text-field>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="page__table-box">
      <DataTable :table="normTable" :fileds="normFields" :search="search" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

import DataTable from '@/components/DataTable.vue';

import api from '@/web/api.js';
import { store } from '@/store/store.js';
import { useNotify } from '@/composable/useNotify.js';

const expansionPanel = ref(['tools']);

const search = ref('');

const loadingList = ref(false);
const loadingTab = ref(false);

const normTable = ref([]); // Итоговая (подготовленная) таблица с данными
const normFields = ref([]); // Список полей итоговой таблицы

const environmentList = ref([]);
const environmentValue = ref(null);

const docTypes = ref([]); // Список типов документов
const docTypesSelect = ref([]); // Список выбранных типов документов

const { snackbarShow, snackbarText } = useNotify();

/* Следим за изменением sap системы */
watch(
  () => store.systemHost,
  () => {
    loadOptions();
    search.value = '';
    normTable.value.length = 0;
    normFields.value.length = 0;
    expansionPanel.value = ['tools']; // Expand tools expansion panel
  }
);

const docTypesToggle = async () => {
  if (docTypesSelect.value.length === docTypes.value.length) {
    docTypesSelect.value = [];
  } else {
    docTypesSelect.value = docTypes.value.map((e) => e.id);
  }
};

const loadEnvironments = async () => {
  const envList = await api.getEnvironment(store.systemHost);
  if (envList) {
    environmentList.value = envList;
    // Оставляем предыдущее значение Среды, если оно уже было выбрано ранее и также есть в обновленном списке, иначе берем первое
    if (!environmentValue.value || environmentList.value.indexOf(environmentValue.value) === -1) {
      environmentValue.value = environmentList.value?.length ? environmentList.value[0] : null;
    }
  }
};

const loadDocumentTypes = async () => {
  const dt = await api.getDocumentTypes(store.systemHost);
  if (dt) {
    docTypes.value = dt;
    // Устанавливаем начальные значения
    if (docTypesSelect.value.length === 0) {
      docTypesSelect.value.push(docTypes.value[0].id);
      docTypesSelect.value.push(docTypes.value[1].id);
    }
  }
};

const loadOptions = async () => {
  snackbarShow.value = false;
  loadingList.value = true;
  return Promise.all([loadEnvironments(), loadDocumentTypes()])
    .catch((e) => {
      snackbarText.value = err.message;
      snackbarShow.value = true;
    })
    .finally(() => {
      loadingList.value = false;
    });
};

const loadDocuments = async () => {
  search.value = '';
  snackbarShow.value = false;
  loadingTab.value = true;
  try {
    if (docTypesSelect.value.length === 0) throw new Error('No document type is selected');
    // Если выбраны все типы, то отдаем пустой массив типов
    const doc_types = docTypesSelect.value.length === docTypes.value.length ? [] : Object.values(docTypesSelect.value);
    const content = await api.getDocument(store.systemHost, environmentValue.value, doc_types);
    if (content.table && content.fields) {
      normTable.value = content.table;
      normFields.value = content.fields;
    } else {
      normTable.value.length = 0;
    }
  } catch (err) {
    snackbarText.value = err.message;
    snackbarShow.value = true;
  } finally {
    loadingTab.value = false;
  }
};

onMounted(loadOptions);
</script>

<style scoped lang="scss">
.page {
  margin: 10px;

  &__tool-box {
    margin-bottom: 10px;
    &__title {
      min-height: $cstm-expansion-panel-title-min-height;
      &__collapse_text {
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
