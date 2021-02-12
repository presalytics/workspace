const state = () => ({
    agentId: ''
})

const getters = {

}

const actions = {
    async getWorkspaceProperties() {
        var siteUrl = (process.env.presalytics_site_url) ?  process.env.presalytics_site_url : "https://presalytics.io";
        var agentUrl = siteUrl + "/"
        
    }
    
}

const mutations = {
    register(state, agentId) {
        state.agentId = agentId;
    }
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }