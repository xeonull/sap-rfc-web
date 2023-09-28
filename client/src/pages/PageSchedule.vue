<template>
  <div class="page">
    <v-overlay class="align-center justify-center" persistent v-model="loadingList">
      <v-progress-circular :size="50" color="blue" indeterminate></v-progress-circular>
    </v-overlay>

    <!-- <v-expansion-panels v-model="expansionPanel">
      <v-expansion-panel class="page__tool-box" value="tools">
        <v-expansion-panel-title class="page__tool-box__title">
          <template v-slot:default="{ expanded }">
            <v-row no-gutters>
              <v-col cols="4" class="d-flex justify-start"> Table Options </v-col>
              <v-col cols="8">
                <v-fade-transition leave-absolute>
                  <span v-if="!expanded" class="page__tool-box__title__tab_name">{{ table_name }}</span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="page__tool-box__content">
          <v-label class="page__tool-box__content__text">{{
            `Number of transparent tables of ${store.systemHost} system: ${tableList.length}`
          }}</v-label>
          <div class="page__tool-box__content__table-name-box">
            <v-autocomplete
              class="page__tool-box__content__table-name-box__input"
              label="SAP Table"
              variant="solo"
              density="compact"
              persistent-hint
              :hint="normTable.length ? `Rows: ${normTable.length}` : ``"
              v-model="table_name"
              v-model:search="table_search"
              :items="tableListShort"
              :loading="loadingFilter"
              :no-data-text="table_no_data_text"></v-autocomplete>

            <v-btn class="page__tool-box__content__table-name-box__btn" @click="loadTable" :loading="loadingTab"
              >Load table</v-btn
            >
          </div>
          <div class="page__tool-box__content__table-field-expand">
            <v-btn
              :icon="showFieldBox ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              @click="showFieldBox = !showFieldBox"
              :disabled="!tableFieldList.length"
              density="compact"></v-btn>
          </div>
          <v-expand-transition>
            <div v-show="showFieldBox" class="page__tool-box__content__table-field">
              <div class="page__tool-box__content__table-field-box">
                <div v-for="fld in tableFieldList" :key="fld.FIELDNAME">
                  <v-text-field
                    class="page__tool-box__content__table-field-box__input"
                    :label="fld.FIELDNAME"
                    placeholder="Input value"
                    variant="outlined"
                    v-model="fld.VALUE"
                    density="compact" />
                </div>
              </div>
              <div class="page__tool-box__content__table-field-info">
                <v-tooltip location="right top">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-information-variant"
                      class="page__tool-box__content__table-field-info__icon" />
                  </template>
                  <span class="page__tool-box__content__table-field-info__text">
                    <p>Use <v-icon icon="mdi-comma" /> for listing</p>
                    <p>Use <v-icon icon="mdi-asterisk" /> for masking</p>
                    <p>Use <v-icon icon="mdi-keyboard-space" /> for empty element</p>
                  </span>
                </v-tooltip>
              </div>
            </div>
          </v-expand-transition>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels> -->
    <div class="page__table-box">
      <DataTable :table="normTable" :fileds="normFields" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

import DataTable from "@/components/DataTable.vue";

import api from "@/web/api.js";
import { store } from "@/store/store.js";
// import { useSapPackageList } from "@/composable/useSapTable.js";
import { useNotify } from "@/composable/useNotify.js";

// const expansionPanel = ref(["tools"]);
// const showFieldBox = ref(false);

const loadingList = ref(false);
// const loadingTab = ref(false);
// const loadingFilter = ref(false);
// const tableFieldList = ref([]); // Список полей выбранной таблицы (для фильтрации)
// const tableListShort = ref([]); // Список таблиц системы (отфильтрованный в соответствии с условием), для отображения в интерфейсе
// const scheduleList = ref([]); // Список таблиц системы
const normTable = ref([]); // Итоговая (подготовленная) таблица с данными
const normFields = ref([]); // Список полей итоговой таблицы

const { snackbarShow, snackbarText } = useNotify();

// const table_name = ref("");
// const table_search = ref(null);
// const table_no_data_text = ref("");

/* Следим за изменением sap системы */
watch(
  () => store.systemHost,
  () => {
    loadSchedule();
  }
);

// /* Следим за изменением текста в поле с названием таблицы */
// watch(table_search, (val) => {
//   if (val.length < 3) {
//     table_no_data_text.value = "Type at least 3 characters";
//     tableListShort.value = [];
//   } else {
//     updateListView(val);
//     table_no_data_text.value = "Such table was not found";
//   }
// });

// /* Следим за изменением названия таблицы */
// watch(table_name, () => {
//   loadTableFields();
// });

// const updateListView = (value) => {
//   loadingFilter.value = true;
//   try {
//     tableListShort.value = tableList.value.filter((e) => {
//       return (e || "").indexOf((value || "").toUpperCase()) > -1;
//     });
//   } finally {
//     loadingFilter.value = false;
//   }
// };

// const loadTableFields = async () => {
//   loadingFilter.value = true;
//   try {
//     const res = await api.getTableFieldList(store.systemHost, table_name.value);
//     const { table } = useSapTable(res);
//     table.sort((a, b) => a.POSITION - b.POSITION);
//     table.forEach((e) => {
//       e.VALUE = ""; // Используется для списка (или шаблона) значений столбца таблицы
//     });
//     tableFieldList.value = table;
//   } catch (err) {
//     snackbarText.value = err.message;
//     snackbarShow.value = true;
//   } finally {
//     loadingFilter.value = false;
//   }
// };

const loadSchedule = async () => {
  snackbarShow.value = false;
  loadingList.value = true;
  try {
    const res = await api.getSchedule(store.systemHost);
    normTable.value = res.table;
    normFields.value = res.fields;
  } catch (err) {
    snackbarText.value = err.message;
    snackbarShow.value = true;
  } finally {
    loadingList.value = false;
  }
};

onMounted(loadSchedule);
</script>

<style scoped lang="scss">
.page {
  margin: 10px;

  &__tool-box {
    margin-bottom: 10px;
    &__title {
      min-height: $cstm-expansion-panel-title-min-height;
      &__tab_name {
        color: rgba(var(--v-theme-secondary), 0.5);
        white-space: nowrap;
      }
    }

    &__content {
      &__text {
        align-items: start;
      }

      &__table-name-box {
        padding-top: 12px;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: start;

        &__input {
          max-width: $cstm-input-max-width;
        }

        &__btn {
          margin: 0 0 0 20px;
          height: $cstm-button-height;
          background: rgb(var(--v-theme-primary));
          color: rgb(var(--v-theme-on-primary));
        }
      }
      &__table-field {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: start;
        &-expand {
          display: flex;
          justify-content: center;
        }
        &-box {
          padding: 5px 0 0 0;
          width: calc($cstm-input-max-width + 145px);
          // &__input {
          //   max-width: calc($cstm-input-max-width + 145px);
          // }
        }
        &-info {
          padding: 10px 0 0 10px;
          &__text {
            color: rgb(var(--v-theme-on-primary));
            font-weight: lighter;
          }
        }
      }

      // &__chk {
      //   align-self: flex-start;
      //   max-width: 180px;
      //   margin-left: 20px;
      // }
    }
  }
}
</style>
