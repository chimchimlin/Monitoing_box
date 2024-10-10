<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="close-button" @click="close">&times;</button>
        <h3 v-if="title" class="modal-title">{{ title }}</h3> 
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'ModalWindow',
    props: {
      isOpen   
  : {
        type: Boolean,
        required: true
      },
      title: { 
        type: String,
        default: '' 
      }
    },
    emits: ['close'],
    methods: {
      close() {
        this.$emit('close');
      }
    }
  });
  </script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  max-width: 500px; /* 调整最大宽度 */
  width: 80%; /* 调整宽度比例 */
}

.modal-title {
    margin-top: 0; 
    margin-bottom: 15px; 
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
}
</style>
