<template>
  <p-modal-base
    v-model="modalProps"
    :name="name"
    color="primary"
    :title="title"
    @change="onModalStateChange"
  >
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-file-input
            ref="fileInput"
            v-model="filename"
            accept="pptx"
            label="Select a Presentation File"
            chips
            clearable
            :disabled="disabled"
            @change="handleFileSelect"
          />
          <br>
          <div class="d-flex flex-column p-4">
            <v-progress-linear
              :color="progressColor"
              height="15"
              :value="progressValue"
              striped
              class="align-stretch"
            />
            <p class="font-weight-light align-stretch">
              {{ progressMessage }}
            </p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </p-modal-base>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import PModalBase from './PModalBase.vue'
import { create as createjsondiffpatch, formatters } from 'jsondiffpatch'

export default {
  name: 'PUploadPptxModal',
  components: {PModalBase},
  data: () => ({
    title: 'Create a New Story',
    name: 'PUploadPptxModal',
    progressColor: 'success',
    progressValue: 0,
    progressMessage: "Upload a .pptx file to create a story",
    disabled: false,
    modalProps: {},
    startMessage: "Upload a .pptx file to create a story",
    timeoutPtr: null,
    filename: null,
    jsondiffpatch: null
  }),
  created() {
    this.jsondiffpatch =  createjsondiffpatch({
      objectHash: function (obj) {
        return obj.id
      },
      cloneDiffValues: true,
    })
  },
  methods: {
    async handleFileSelect(file) {
      try {
        if (file) {
          this.disabled = true
          let storyId = uuidv4()
          this.setProgress(5, 'Creating story...')
          let story = await this.$http.postData('/api/stories/', {
            outline: {
              document: {},
            },
            id: storyId,
            isPublic: false,
            title: this.filename.name
          })
          this.setProgress(10, 'Uploading File for processing...')
          let formData = new FormData();
          formData.append("files", file, file.name)
          let accessToken = await this.$auth.getTokenSilently()
          formData.append("storyId", story.id) 
          let uploadResponse = await fetch('/api/ooxml/Documents', {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + accessToken
            },
            body: formData
          })
          if (uploadResponse.status != 200) {
            this.setProgress(0, 'File upload failure', 'danger')
            this.disabled = false
            throw new Error('File upload failure.')
          } else {
            this.setProgress(25, 'File uploaded to server.  Creating story outline...')
          }
          let ooxmlTrees = await uploadResponse.json()
          let outline = await this.createOutlineFromUploadedPptx(ooxmlTrees[0])
          let diff = this.diffOutlines({}, outline)
          await this.$http.postData('/api/stories/outline/' + story.id + '/patch', diff)
          this.setProgress(90, 'Outline finalized.  Saving new Story to API...')
          story = await this.$http.getData('/api/stories/' + story.id)
          this.$dispatcher.emit("story.created", story)
          this.setProgress(100, 'Story created.  Redirecting...')
          let vm = this
          setTimeout(() => {
            vm.$router.push('/stories/view/' + storyId)
          }, 4000)
        }
      } catch (err) {
        this.setProgress(50, 'An error occured creating your outline.  Please try again', 'red')
        console.error(err)  //eslint-disable-line
      } finally {
        let vm = this
        this.timeoutPtr = setTimeout(() => vm.reset(), 5000)
      }

    },
    reset() {
      this.setProgress(0, this.startMessage, 'success')
      this.disabled = false
      this.filename = null
      if (this.timeoutPtr) {
        window.clearTimeout(this.timeoutPtr)
        this.timeoutPtr = null
      }
    },
    setProgress(value, message = null, color = null) {
      this.progressValue = value
      if (message) this.progressMessage = message
      if (color) this.color = color
    },
    onModalStateChange() {
      this.reset()
    },
    async createOutlineFromUploadedPptx(repoData) {
      let slides = repoData.descendants.filter( (cur) => cur.repositoryType === "Slide")
      if (slides.length === 0) throw new Error('Presentation Contains no slides')
      let increment = 50 / slides.length
      let slideMetaData = await Promise.all(slides.map( async (cur) => {
        let response =  await this.$http.getData('/api/ooxml/Slides/' + cur.id)
        this.setProgress(this.progressValue + increment, "Creating page metadata...")
        return response
      }))
      this.setProgress(75, 'Slide Metadata created.  Finalizing outline...')
      let pages = slideMetaData.sort( (a, b) => {
        if (a.slideNumber > b.slideNumber) {
          return 1
        } else {
          return -1
        }
      }).map( (cur) => {
        return {
          id: uuidv4(),
          name: cur.name,
          kind: 'widget-page',
          widgets: [
            {
              name: cur.name,
              kind: 'ooxml-file-object',
              data: {
                filename: repoData.document.filename,
                object_name: cur.name,
                endpoint_id: "Slides",
                document_ooxml_id: repoData.document.id,
                object_ooxml_id: cur.id,
                story_id: repoData.document.storyId
              },
              plugins: []
            },
          ],
          plugins: []
        }
      })

      return {
        title: repoData.name,
        description: '',
        info: {
          dateCreated: new Date().toISOString(),
          createdBy: this.$store.getters.userId,
          filename: repoData.document.filename,
          dateModified: new Date().toISOString(),
          modifiedBy: this.$store.getters.userId, 
        },
        storyId: repoData.document.storyId,
        pages: pages,
        themes: []
      }

    },
    diffOutlines(original, updated) {
      const delta = this.jsondiffpatch.diff(original, updated)
      const rfc = formatters.jsonpatch.format(delta)
      return {
        jsondiffpatch: delta,
        rfc_6902_patch: rfc
      }
    }
  } 
}
</script>