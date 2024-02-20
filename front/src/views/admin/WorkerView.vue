<template lang="pug">
v-container
v-row.d-flex.justify-center
  v-col(cols="12")
    h1.text-center 師傅管理
  v-col.text-center(cols="12")
    v-btn.login(@click="openDialog()") 新增師傅
  v-col(cols="11")
    v-data-table-server(
      v-model:items-per-page = "tableItemsPerPage"
      v-model:sort-by="tableSortBy"
      v-model:page="tablePage"
      :items="tableProducts"
      :items-per-page-options="tableItemsPerPageOption"
      :headers="tableHeaders"
      :loading="tableLoading"
      :items-length="tableItemsLength"
      :search="tableSearch"
      @update:items-per-page="tableLoadItems"
      @update:sort-by="tableLoadItems"
      @update:page="tableLoadItems"
      hover
    )
      template(#top)
        VTextField(
          label="搜尋"
          v-model="tableSearch"
          clearable
          append-inner-icon="mdi-magnify"
          @click:append-inner="tableApplySearch"
          @keydown.enter="tableApplySearch")
      template(#[`item.image[0]`]="{ item }")
        VImg(:src="item.image[0]" height="50px")
      template(#[`item.sell`]="{ item }")
        VIcon(icon="mdi-check" color="green" v-if="item.sell")
      template(#[`item.edit`]="{ item }")
        VBtn(icon="mdi-pencil" variant="text" color="#d9d5d2" @click="openDialog(item)")
v-dialog.w-75(v-model="dialog" persistent v-if="isMobile")
  v-form(:disabled="isSubmitting" @submit.prevent="submit")
    v-card
      v-card-title {{ dialogId === '' ? '新增師傅' : '編輯師傅' }}
      v-card-text
        v-text-field(label="姓名" v-model="name.value.value" :error-messages="name.errorMessage.value")
        v-text-field(label="價格/1H" v-model="price.value.value" :error-messages="price.errorMessage.value")
        v-select(label="分類" :items="categories" v-model="category.value.value" :error-messages="category.errorMessage.value")
        v-checkbox(label="上架" v-model="sell.value.value" :error-messages="sell.errorMessage.value")
        v-textarea(label="說明" v-model="description.value.value" :error-messages="description.errorMessage.value")
        vue-file-agent(
          v-model="fileRecords"
          v-model:rawModelValue="rawFileRecords"
          accept="image/jpeg,image/png"
          deletable
          :error-text="{type: '檔案格式不支援', size: '檔案超過 1 MB 限制'}"
          help-text="選擇檔案或拖曳到這"
          :max-files="3"
          max-size="1MB"
          ref="fileAgent"
        )
      v-card-actions
        v-spacer
        v-btn(color="red" :disabled="isSubmitting" @click="closeDialog") 取消
        v-btn(color="green" type="submit" :loading="isSubmitting") 送出

v-dialog.w-50(v-model="dialog" v-else)
  v-form(:disabled="isSubmitting" @submit.prevent="submit")
    v-card
      v-card-title {{ dialogId === '' ? '新增師傅' : '編輯師傅' }}
      v-card-text
        v-text-field(label="姓名" v-model="name.value.value" :error-messages="name.errorMessage.value")
        v-text-field(label="價格/1H" v-model="price.value.value" :error-messages="price.errorMessage.value")
        v-select(label="分類" :items="categories" v-model="category.value.value" :error-messages="category.errorMessage.value")
        v-checkbox(label="上架" v-model="sell.value.value" :error-messages="sell.errorMessage.value")
        v-textarea(label="說明" v-model="description.value.value" :error-messages="description.errorMessage.value")
        vue-file-agent(
          v-model="fileRecords"
          v-model:rawModelValue="rawFileRecords"
          multiple
          accept="image/jpeg,image/png"
          deletable
          :error-text="{type: '檔案格式不支援', size: '檔案超過 1 MB 限制'}"
          help-text="選擇檔案或拖曳到這"
          :max-files="3"
          max-size="1MB"
          ref="fileAgent"
        )
      v-card-actions
        v-spacer
        v-btn(color="red" :disabled="isSubmitting" @click="closeDialog") 取消
        v-btn(color="green" type="submit" :loading="isSubmitting") 送出

</template>

<script setup>
import { ref, computed } from 'vue'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'

// 手機版判斷
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

// 手機版判斷
const drawer = ref(false)

const { apiAuth } = useApi()

const createSnackbar = useSnackbar()

const fileAgent = ref(null)

// 表單對話框的開啟狀態
const dialog = ref(false)
// 表單對話框正在編輯的商品 ID，空的話代表是新增商品
const dialogId = ref('')

const openDialog = (item) => {
  if (item) {
    dialogId.value = item._id
    name.value.value = item.name
    price.value.value = item.price
    description.value.value = item.description
    category.value.value = item.category
    sell.value.value = item.sell
  } else {
    dialogId.value = ''
  }
  dialog.value = true
  drawer.value = true
}

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
  resetForm()
  fileAgent.value.deleteFileRecord()
}

// 分類
const categories = ['生理男', '生理女']

const schema = yup.object({
  name: yup.string().required('缺少師傅姓名'),
  price: yup.number().typeError('商品價格格式錯誤').required('缺少時段價格').min(0, '價格不能小於0'),
  description: yup.string().required('缺少師傅說明'),
  category: yup.string().required('缺少類別分類').test('isCategory', '商品分類錯誤', value => categories.includes(value)),
  sell: yup.boolean()
})

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    price: 0,
    description: '',
    category: '',
    sell: false
  }
})

const name = useField('name')
const price = useField('price')
const description = useField('description')
const category = useField('category')
const sell = useField('sell')

const fileRecords = ref([])
const rawFileRecords = ref([])

const submit = handleSubmit(async (values) => {
  // 如果有東西而且 error 的話 return
  if (fileRecords.value > 0 && fileRecords.value[0]?.error) return
  if (dialogId.value === '' && fileRecords.value.length === 0) return
  try {
  // 要先建立一個物件叫 FormData
    const fd = new FormData()

    // for in 是對物件的 key 去跑
    for (const key in values) {
    // 一個一個加進去
      fd.append(key, values[key])
    }

    // for (const f of fileRecords.value) {
    //   fd.append('image', f.file)
    // }
    // 如果有東西才會 push
    if (fileRecords.value.length > 0) {
      for (const f of fileRecords.value) {
        fd.append('image', f.file)
      }
    }

    // await apiAuth.post('/products', fd)

    if (dialogId.value === '') {
      await apiAuth.post('/products', fd)
    } else {
      await apiAuth.patch('/products/' + dialogId.value, fd)
    }

    createSnackbar({
      text: dialogId.value === '' ? '新增成功' : '編輯成功',
      // 不要出現關閉的按鈕
      showCloseButton: false,
      // 要傳進 snackbarProps 元件的參數
      snackbarProps: {
      // 1.5 秒鐘後消失
        timeout: 1500,
        // 顏色
        color: '#8C8987',
        // 出現在螢幕中間
        location: 'center'
      }
    })

    closeDialog()
    tableApplySearch()
  } catch (error) {
    console.log(error)

    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      // 不要出現關閉的按鈕
      showCloseButton: false,
      // 要傳進 snackbarProps 元件的參數
      snackbarProps: {
      // 1.5 秒鐘後消失
        timeout: 1500,
        // 顏色
        color: 'error',
        // 出現在螢幕中間
        location: 'center'
      }
    })
  }
})

// 表格

// 表格每頁幾個
// 選項要另外設定
const tableItemsPerPage = ref(5)

// 選項
const tableItemsPerPageOption = [
  { value: 5, title: '5' },
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' }
]
// 表格排序
const tableSortBy = ref([
  { key: 'name', order: 'desc' }
])
// 表格頁碼
const tablePage = ref(1)
// 表格商品資料陣列
const tableProducts = ref([])
// 表格欄位設定
const tableHeaders = [
// 標題要 title ; sortable 可不可以排序
  { title: '圖片', align: 'center', sortable: false, key: 'image[0]' },
  { title: '名稱', align: 'center', sortable: true, key: 'name' },
  { title: '價格', align: 'center', sortable: true, key: 'price' },
  // { title: '說明', align: 'center', sortable: true, key: 'description' },
  { title: '分類', align: 'center', sortable: true, key: 'category' },
  { title: '上架', align: 'center', sortable: true, key: 'sell' },
  { title: '編輯', align: 'center', sortable: false, key: 'edit' }

]

// 表格載入狀態
const tableLoading = ref(true)
// 表格全部資料數
const tableItemsLength = ref(0)
// 表格搜尋文字
const tableSearch = ref('')
// 表格載入資料
const tableLoadItems = async () => {
  tableLoadItems.value = true
  try {
    const { data } = await apiAuth.get('/products/all', {
      params: {
        page: tablePage.value,
        itemsPerPage: tableItemsPerPage.value,
        sortBy: tableSortBy.value[0]?.key || 'name',
        sortOrder: tableSortBy.value[0]?.order === 'asc' ? 1 : -1,
        search: tableSearch.value
      }
    })
    tableProducts.value.splice(0, tableProducts.value.length, ...data.result.data)
    tableItemsLength.value = data.result.total
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'center'
      }
    })
  }
  tableLoading.value = false
}
tableLoadItems()
// 套用表格搜尋
const tableApplySearch = () => {
  tablePage.value = 1
  tableLoadItems()
}
</script>

<style scoped lang="sass">
.form
  width: 50vw
  margin: auto
.color
  color: #d9d5d2
.login
  background: #d9d5d2
  color: #403635
</style>
