const StoryFactory = artifacts.require('StoryFactory')

module.exports = function (deployer) {
  deployer.deploy(StoryFactory)
} as Truffle.Migration

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}