<script setup lang="ts">
import FileUploadController from './components/FileUploadController.vue';
import {ref} from 'vue'

let controller = ref()

const handleFileChange = (event: Event) =>{
  let files = (event.target as HTMLInputElement).files
  if(files != null){
    let file = files[0]
    controller.value.setFileObj(file)
  }
}
</script>

<template>
  <header>
    <!-- <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" /> -->

    <!-- <div class="wrapper">
    </div> -->
  </header>
  <input type="file" @change="handleFileChange" />
  <FileUploadController ref="controller" class="fileUploadController"></FileUploadController>

</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.fileUploadController{
  width: 500px;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
