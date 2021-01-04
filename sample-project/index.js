const factorial = require('./factorial.wasm')

WebAssembly.instantiate(factorial).then(module => {
    console.log(module.instance.exports._Z4facti(5))
})

console.log("lol")