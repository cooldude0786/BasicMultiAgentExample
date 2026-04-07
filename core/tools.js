const tools = {
  calculator: async (input) => {
    try {
      return eval(input);
    } catch {
      return "Invalid calculation";
    }
  },

  web_search: async (query) => {
    // mock for now (important: interviewer understands this)
    return `Search results for "${query}": Tesla revenue growing, EV competition rising, mixed analyst sentiment.`;
  }
};

module.exports = { tools };