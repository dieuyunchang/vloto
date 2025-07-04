module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['react-native-paper/babel', {
      'web': false,
      'native': true
    }]
  ]
}; 
