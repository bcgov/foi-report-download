<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="290px"
  >
    <template #activator="{ props }">
      <v-text-field
        v-model="date"
        :label="label"
        :name="name"
        clearable
        readonly
        prepend-icon="mdi-calendar"
        v-bind="props"
      ></v-text-field>
    </template>
    <v-date-picker v-model="date" hide-header>
      <template #actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="menu = false">Cancel</v-btn>
        <v-btn variant="text" @click="save">OK</v-btn>
      </template>
    </v-date-picker>
  </v-menu>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['label', 'name', 'modelValue'])
const emit = defineEmits(['update:modelValue'])

const date = ref(props.modelValue)
const menu = ref(false)

watch(date, (newDate) => {
  if (newDate instanceof Date) {
    emit('update:modelValue', newDate.toISOString().split('T')[0]) // "YYYY-MM-DD"
  } else {
    emit('update:modelValue', newDate)
  }
})


const save = () => {
  menu.value = false
}
</script>
