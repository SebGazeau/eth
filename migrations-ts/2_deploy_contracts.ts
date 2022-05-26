const Characters = artifacts.require('Characters')

module.exports = function (deployer) {
  deployer.deploy(Characters, 'Prototype', 'PTT')
} as Truffle.Migration

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}