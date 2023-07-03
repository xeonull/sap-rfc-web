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
        <v-expansion-panel-text class="page__tool-box__content">
          <v-label class="page__tool-box__content__text">{{ `Choose Environment, Model and Package name` }}</v-label>
          <div class="page__tool-box__content__package-box">
            <v-select
              class="page__tool-box__content__package-box__input"
              label="Environment"
              variant="solo"
              density="compact"
              :items="packagesAppsetList"
              v-model="packagesAppsetValue"></v-select>

            <v-select
              class="page__tool-box__content__package-box__input"
              label="Model"
              variant="solo"
              density="compact"
              :items="packagesApplList"
              v-model="packagesApplValue"></v-select>

            <div class="page__tool-box__content__package-box__name">
              <v-autocomplete
                class="page__tool-box__content__package-box__input"
                label="Package"
                variant="solo"
                density="compact"
                persistent-hint
                :hint="normTable.length ? `Rows: ${normTable.length}` : ``"
                v-model="package_name"
                v-model:search="package_search"
                :items="packagesListApplShort"
                :loading="loadingFilter"></v-autocomplete>
              <v-btn
                class="page__tool-box__content__package-box__btn"
                @click="loadPackageStatuses"
                :loading="loadingTab"
                >Load package info</v-btn
              >
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- <div class="page-tools">
      <v-card class="page-tools-card">

      </v-card>
    </div> -->
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
import { useSapTable, useSapPackageList } from "@/composable/useSapTable.js";
import { useNotify } from "@/composable/useNotify.js";

const expansionPanel = ref(["tools"]);

const loadingList = ref(false);
const loadingTab = ref(false);
const loadingFilter = ref(false);
const normTable = ref([]);
const normFields = ref([]);

const packagesList = ref([]); // Список пакетов для всех сред и моделей
const packagesListAppl = ref([]); // Список пакетов для выбранной среды и модели
const packagesListApplShort = ref([]); // Список отфильтрованных пакетов выбранной среды и модели

const packagesAppsetList = ref([]);
const packagesAppsetValue = ref(null);

const packagesApplList = ref([]);
const packagesApplValue = ref(null);

const package_name = ref("");
const package_search = ref(null);

const { snackbarShow, snackbarText } = useNotify();

/* Следим за изменением среды - меняем список моделей */
watch(packagesAppsetValue, () => {
  packagesApplList.value = packagesList.value
    ? [
        ...packagesList.value.reduce((a, v) => {
          if (v.APPSET_ID === packagesAppsetValue.value) a.add(v.APP_ID);
          return a;
        }, new Set()),
      ]
    : null;
  packagesApplValue.value = packagesApplList.value?.length ? packagesApplList.value[0] : null;
});

/* Следим за изменением модели - меняем список пакетов */
watch(packagesApplValue, () => {
  packagesListAppl.value = packagesList.value
    ? [
        ...packagesList.value.reduce((a, v) => {
          if (v.APPSET_ID === packagesAppsetValue.value && v.APP_ID === packagesApplValue.value) a.add(v.PACKAGE_ID);
          return a;
        }, new Set()),
      ]
    : null;
  packagesListAppl.value.sort();
  packagesListApplShort.value = packagesListAppl.value.slice();
  package_name.value = packagesListAppl.value?.length ? packagesListAppl.value[0] : null;
});

/* Следим за изменением sap системы */
watch(
  () => store.systemHost,
  () => {
    loadPackageList();
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
      return (e || "").toUpperCase().indexOf((value || "").toUpperCase()) > -1;
    });
  } finally {
    loadingFilter.value = false;
  }
};

const loadPackageStatuses = async () => {
  loadingTab.value = true;
  try {
    const res = await api.getPackage(
      store.systemHost,
      packagesAppsetValue.value,
      packagesApplValue.value,
      package_name.value
    );
    const { table, fields } = useSapTable(res, true);
    [fields[0], fields[4]] = [fields[4], fields[0]]; // Меняем местами колонки 0 и 4:
    fields.push({ title: "Duration", align: "start", key: "DURATION" });
    [fields[5], fields[4]] = [fields[4], fields[5]]; // Меняем местами колонки 4 и 5:
    fields[0].title = "Package";
    fields[1].title = "Status";
    fields[2].title = "UTC Time Start";
    fields[3].title = "UTC Time End";
    fields[5].title = "User";

    table.forEach((e) => {
      // Корректируем формат дат:
      e.TIMESTAMP = e.TIMESTAMP.replace(
        /(\d{2})\.(\d{2})(\d)\.(\d)(\d{2})\.(\d{2})(\d)\.(\d)(\d{2})/g,
        "$1$2-$3$4-$5 $6:$7$8:$9"
      );
      e.TIMESTAMP_END = e.TIMESTAMP_END.replace(
        /(\d{2})\.(\d{2})(\d)\.(\d)(\d{2})\.(\d{2})(\d)\.(\d)(\d{2})/g,
        "$1$2-$3$4-$5 $6:$7$8:$9"
      );
      // Корректируем Статус:
      switch (e.STATUS) {
        case "0":
          e.STATUS = "Running";
          break;
        case "1":
          e.STATUS = "Succeeded";
          break;
        case "2":
          e.STATUS = "Warning";
          break;
        case "3":
          e.STATUS = "Failed";
          break;
        case "4":
          e.STATUS = "Abort";
          break;
        default:
          e.STATUS = "Unknown";
          break;
      }
      // Расчитываем продолжительность:
      const diff = new Date(e.TIMESTAMP_END) - new Date(e.TIMESTAMP);
      const days = Math.trunc(diff / (1000 * 60 * 60 * 24));
      let day_prefix = "";
      if (days > 0) day_prefix = `${days}d `;
      e.DURATION = day_prefix + new Date(diff).toLocaleTimeString("ru", { timeZone: "UTC" });
    });

    normTable.value = table;
    normFields.value = fields;
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
    const res = await api.getPackageList(store.systemHost);
    const { packages } = useSapPackageList(res);
    packagesList.value = packages;
    packagesAppsetList.value = [...new Set(packagesList.value.map((e) => e.APPSET_ID))];
    packagesAppsetValue.value = packagesAppsetList.value[0];
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
      &__text {
        align-items: start;
      }

      &__package-box {
        padding-top: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: start;

        &__name {
          display: flex;
          flex-direction: row;
        }

        &__input {
          width: $cstm-input-max-width;
        }

        &__btn {
          margin: 0 0 0 20px;
          height: $cstm-button-height;
          background: rgb(var(--v-theme-primary));
          color: rgb(var(--v-theme-on-primary));
        }
      }
    }
  }
}
</style>
