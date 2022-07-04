const initState = () => ({
  docId: null,
  size: null,
  bytesSent: 0,
});

const getters = {
  progress: ({ docId, bytesSent, size }) => {
    if (!docId) return 0;
    return  Math.round((bytesSent/size) * 100)
  },
  inProgress({ docId }) {
    return Boolean(docId);
  }
}

const mutations = {
  setDocId: (state, { docId }) => { state.docId = docId },
  setSize: (state, { size }) => { state.size = size },
  updateProgress: (state, { bytesSent }) => { state.bytesSent = bytesSent },
  done: (state) => {
    const { docId, size, bytesSent } = initState();
    state.docId = docId;
    state.size = size;
    state.bytesSent = bytesSent;
  }
}

const actions = {
  initStream(context, { docId, size }) {
    context.commit('setDocId', { docId });
    context.commit('setSize', { size });
  },
  onProgress(context, { bytesSent }) {
    context.commit('updateProgress', { bytesSent });
  },
  endOfFile(context) {
    context.commit('done');
  }
}

export default {
  namespaced: true,
  state: initState,
  getters,
  mutations,
  actions
}