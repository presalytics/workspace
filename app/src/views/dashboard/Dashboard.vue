<template>
  <v-container
    id="dashboard"
    fluid
    tag="section"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <base-material-card
          color="primary"
          class="px-5 py-3"
        >
          <template #heading>
            <div class="display-2 font-weight-light">
              Links
            </div>

            <div class="subtitle-1 font-weight-light">
              Documentation, Management, and Repos
            </div>
          </template>
          <v-card-text>
            <v-list
              subheader
              two-line
            >
              <v-subheader>
                Repos
              </v-subheader>

              <v-list-item
                v-for="repo in repos"
                :key="repo.link"
              >
                <v-list-item-avatar>
                  <v-icon
                    color="black"
                  >
                    mdi-github
                  </v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="repo.title" />

                  <v-list-item-subtitle v-text="repo.description" />
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn 
                    icon
                    text
                    color="success"
                    @click="openInNewTab(repo.link)"
                  >
                    <v-icon>mdi-open-in-new</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-subheader inset>
                Other links
              </v-subheader>
              <v-list-item
                v-for="item in mgmt"
                :key="item.link"
              >
                <v-list-item-avatar>
                  <v-icon
                    color="success"
                  >
                    mdi-view-dashboard
                  </v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="item.title" />

                  <v-list-item-subtitle v-text="item.description" />
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn 
                    icon
                    text
                    color="success"
                    @click="openInNewTab(repo.link)"
                  >
                    <v-icon>mdi-open-in-new</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </base-material-card>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <base-material-card class="px-5 py-3">
          <template #heading>
            <v-tabs
              v-model="tabs"
              background-color="transparent"
              slider-color="white"
            >
              <span
                class="subheading font-weight-light mx-3"
                style="align-self: center"
              >Tasks:</span>
              <v-tab class="mr-3">
                <v-icon class="mr-2">
                  mdi-bug
                </v-icon>
                Bugs
              </v-tab>
              <v-tab class="mr-3">
                <v-icon class="mr-2">
                  mdi-code-tags
                </v-icon>
                UI Features
              </v-tab>
              <v-tab>
                <v-icon class="mr-2">
                  mdi-cloud
                </v-icon>
                APIs
              </v-tab>
            </v-tabs>
          </template>

          <v-tabs-items
            v-model="tabs"
            class="transparent"
          >
            <v-tab-item
              v-for="n in 3"
              :key="n"
            >
              <v-card-text>
                <template v-for="(task, i) in tasks[tabs]">
                  <v-row
                    :key="i"
                    align="center"
                  >
                    <v-col cols="1">
                      <v-list-item-action>
                        <v-checkbox
                          v-model="task.value"
                          color="secondary"
                        />
                      </v-list-item-action>
                    </v-col>

                    <v-col cols="9">
                      <div
                        class="font-weight-light"
                        v-text="task.text"
                      />
                    </v-col>

                    <v-col
                      cols="2"
                      class="text-right"
                    >
                      <v-icon class="mx-1">
                        mdi-pencil
                      </v-icon>
                      <v-icon
                        color="error"
                        class="mx-1"
                      >
                        mdi-close
                      </v-icon>
                    </v-col>
                  </v-row>
                </template>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import  MaterialCard from '@/components/base/MaterialCard.vue'
  // import MaterialChartCard from '@/components/base/MaterialChartCard.vue'
  // import MaterialStatsCard from '@/components/base/MaterialStatsCard.vue'
  export default {
    name: 'Dashboard',
    components: {
      BaseMaterialCard: MaterialCard,
      // BaseMaterialChartCard: MaterialChartCard,
      // BaseMaterialStatsCard: MaterialStatsCard
    },
    data () {
      return {
        repos: [
          {
            title: "Workspace (this App)",
            link: "https://github.com/presalytics/workspace",
            description: "Frontend and user data api"
          },
          {
            title: "Python Client",
            link: "https://github.com/presalytics/python-client",
            description: "API client and CLI"
          },
          {
            title: "Ooxml Automation",
            link: "https://github.com/presalytics/ooxml-automation",
            description: "Presentation software automation API"
          },
          {
            title: "Doc Converter",
            description: "Convert pptx to svg on the fly",
            link: "https://github.com/presalytics/doc-converter",
          },
          {
            title: "Events",
            description: "Event store and websocket hub",
            link: "https://github.com/presalytics/events",
          },
          {
            title: "Amplitude",
            description: "Forward SSE events to Amplitude",
            link: "https://github.com/presalytics/amplitude",
          }
        ],
        mgmt: [
          {
            title: "Invision",
            description: "Wireframes and product notes",
            link: "https://presalytics.invisionapp.com/freehand/Presalyticsio-website-UZhW2pWad",
          },
          {
            title: "Trello",
            description: "Project anagement",
            link: "https://trello.com/b/HXtQD1QT/development"
          }
        ],
        dailySalesChart: {
          data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            series: [
              [12, 17, 7, 17, 23, 18, 38],
            ],
          },
          options: {
            lineSmooth: this.$chartist.Interpolation.cardinal({
              tension: 0,
            }),
            low: 0,
            high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
            chartPadding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
        },
        dataCompletedTasksChart: {
          data: {
            labels: ['12am', '3pm', '6pm', '9pm', '12pm', '3am', '6am', '9am'],
            series: [
              [230, 750, 450, 300, 280, 240, 200, 190],
            ],
          },
          options: {
            lineSmooth: this.$chartist.Interpolation.cardinal({
              tension: 0,
            }),
            low: 0,
            high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
            chartPadding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
        },
        emailsSubscriptionChart: {
          data: {
            labels: ['Ja', 'Fe', 'Ma', 'Ap', 'Mai', 'Ju', 'Jul', 'Au', 'Se', 'Oc', 'No', 'De'],
            series: [
              [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],

            ],
          },
          options: {
            axisX: {
              showGrid: false,
            },
            low: 0,
            high: 1000,
            chartPadding: {
              top: 0,
              right: 5,
              bottom: 0,
              left: 0,
            },
          },
          responsiveOptions: [
            ['screen and (max-width: 640px)', {
              seriesBarDistance: 5,
              axisX: {
                labelInterpolationFnc: function (value) {
                  return value[0]
                },
              },
            }],
          ],
        },
        headers: [
          {
            sortable: false,
            text: 'ID',
            value: 'id',
          },
          {
            sortable: false,
            text: 'Name',
            value: 'name',
          },
          {
            sortable: false,
            text: 'Salary',
            value: 'salary',
            align: 'right',
          },
          {
            sortable: false,
            text: 'Country',
            value: 'country',
            align: 'right',
          },
          {
            sortable: false,
            text: 'City',
            value: 'city',
            align: 'right',
          },
        ],
        items: [
          {
            id: 1,
            name: 'Dakota Rice',
            country: 'Niger',
            city: 'Oud-Tunrhout',
            salary: '$35,738',
          },
          {
            id: 2,
            name: 'Minerva Hooper',
            country: 'Curaçao',
            city: 'Sinaai-Waas',
            salary: '$23,738',
          },
          {
            id: 3,
            name: 'Sage Rodriguez',
            country: 'Netherlands',
            city: 'Overland Park',
            salary: '$56,142',
          },
          {
            id: 4,
            name: 'Philip Chanley',
            country: 'Korea, South',
            city: 'Gloucester',
            salary: '$38,735',
          },
          {
            id: 5,
            name: 'Doris Greene',
            country: 'Malawi',
            city: 'Feldkirchen in Kārnten',
            salary: '$63,542',
          },
        ],
        tabs: 0,
        tasks: {
          0: [
            {
              text: 'MAJOR: Fix server-side re-rendering of SVGs error. Doc-converter',
              value: false,
            },
            {
              text: 'Fix Concurrent Queuing problem in OOxml automation for thread safety',
              value: true,
            },
             {
              text: 'Major: Figure out why out presentations render locally but not in production.  Likely uncaught error on main thread',
              value: false
            }
          ],
          1: [
            {
              text: 'Finish widgets on action and work panes in Story View page',
              value: false,
            },
            {
              text: 'Add Events page and timeline widgets',
              value: false,
            },
            {
              text: 'Add Notifications page with user configuration options',
              value: false,
            },
            {
              text: 'Add an admin panel to modify how events and notifications are displayed to users.  Internal + external',
              value: false
            },
            {
              text: 'Update dashboard page to a configurable welcome screen with pluggable widgets (see office365 admin example)',
              value: false
            }
          ],
          2: [
            {
              text: 'MAJOR: Add notifications database and dependent Serverless functions ',
              value: false,
            },
            {
              text: 'MAJOR: Write tests for event streaming to allow re-create evene-base real-time updates',
              value: true,
            },
            {
              text: 'DELAY: Build websocket for "Agent" service behind Corporate VPNs',
              value: true,
            },
          ],
        },
        list: {
          0: false,
          1: false,
          2: false,
        },
      }
    },

    methods: {
      complete (index) {
        this.list[index] = !this.list[index]
      },
      openInNewTab(url) {
        window.open(url, '_blank').focus();
      }
    },
  }
</script>
