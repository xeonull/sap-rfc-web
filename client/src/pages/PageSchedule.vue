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
              <v-col cols="4" class="d-flex justify-start"> Schedule Options </v-col>
              <v-col cols="8">
                <v-fade-transition leave-absolute>
                  <span v-if="!expanded" class="page__tool-box__title__collapse_text">{{ search ? `Filter: '${search}'` : '' }}</span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="page__tool-box__pane">
          <div class="page__tool-box__content">
            <div class="page__tool-box__content__option-box">
              <div class="page__tool-box__content__option-box__wbtn-box">
                <v-select
                  class="page__tool-box__content__option-box__wbtn-box__input option-input"
                  label="Statuses"
                  variant="solo"
                  density="compact"
                  multiple
                  chips
                  :items="planStatuses"
                  item-value="id"
                  item-text="title"
                  v-model="planStatusesSelect"></v-select>
                <v-btn
                  class="page__tool-box__content__option-box__wbtn-box__btn process high"
                  @click="loadSchedule"
                  :disabled="planStatusesSelect.length === 0"
                  :loading="loadingTab"
                  >Load Schedule Info</v-btn
                >
              </div>
            </div>
            <div class="page__tool-box__content__search">
              <v-text-field
                class="filter-input"
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
import { ref, watch, onMounted } from 'vue';

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
const planStatuses = ref([]); // Список возможных статусов
const planStatusesSelect = ref([]); // Список выбранных статусов
const { snackbarShow, snackbarText } = useNotify();

/* Следим за изменением sap системы */
watch(
  () => store.systemHost,
  () => {
    loadPlanStatuses();
    search.value = '';
    normTable.value.length = 0;
    normFields.value.length = 0;
    expansionPanel.value = ['tools']; // Expand tools expansion panel
  }
);

const loadPlanStatuses = async () => {
  snackbarShow.value = false;
  loadingList.value = true;
  try {
    const res = await api.getPlanStatusList(store.systemHost);
    planStatuses.value = Object.entries(res).map((e) => {
      return { id: e[0], title: e[1] };
    });
    // В качестве начальных значений ставим 0 и 1 статус
    if (planStatusesSelect.value.length === 0) {
      planStatusesSelect.value.push(planStatuses.value[0].id);
      planStatusesSelect.value.push(planStatuses.value[1].id);
    }
  } catch (err) {
    snackbarText.value = err.message;
    snackbarShow.value = true;
  } finally {
    loadingList.value = false;
  }
};

const loadSchedule = async () => {
  search.value = '';
  snackbarShow.value = false;
  loadingTab.value = true;
  try {
    if (planStatusesSelect.value.length === 0) throw new Error('No schedule status is selected');
    const content = await api.getSchedule(store.systemHost, planStatusesSelect.value);
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

onMounted(loadPlanStatuses);
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

      &__option-box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &__wbtn-box {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: start;
          flex-grow: 1;

          &__btn {
            margin: 4px 0 24px 20px;
            align-self: flex-end;
          }
        }
      }

      &__search {
        max-width: 600px;
        flex-grow: 2;
        margin-left: 16px;
        margin-top: 2px;
      }
    }
  }
}
</style>
