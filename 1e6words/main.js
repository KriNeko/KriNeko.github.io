
import { getRpc } from "./getRpc.js";

export default {
  data() {
    return {
      inpText: "",
      patternCount: 0,
      generateProgress: 0,
      inpNewWord: ""
    };
  },
  methods: {
    async generate() {
      const { rpc } = await getRpc();
      await rpc.generate();
    },
    async addWord() {
      const { rpc } = await getRpc();
      await rpc.addWord(this.inpNewWord);
    }
  },
  watch: {
    async inpText(val) {
      const { rpc } = await getRpc();
      this.patternCount = await rpc.searchCount(val);
      console.log({ val });
    }
  },
  async created() {
    const { rpc } = await getRpc();
    rpc.addMethods({
      informProgress: ({ current, total }) => {
        console.log(current, total);
        this.generateProgress = ((current / total) * 100).toFixed(2);
      }
    });
    console.log(rpc);
  },
  destroyed() {}
};
