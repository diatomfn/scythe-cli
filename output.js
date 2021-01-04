function parse(output, sourceMap) {
    let toLog = []
    output.forEach(line => {
        line.values.forEach(val => {
            switch(val.type) {
                case 'object':
                    toLog.push(convertObject(val, sourceMap))
                    break
                default:
                    toLog.push(val.value)
                    break
            }
        })
    })
    return toLog
}

function getError(boxObject) {
    // Check syntax error, webpack should prevent this
    if (boxObject.prototype === "SyntaxError" && boxObject.value["line"] && boxObject.value["column"] && boxObject.value["source"]) {
        return `${boxObject.value["source"].value}\n${' '.repeat(boxObject.value["column"].value)}^\nSyntaxError on (${boxObject.value["line"].value}:${boxObject.value["column"].value})`
    }

    // Ducktype checking for error
    if (boxObject.prototype && boxObject.value["message"] && boxObject.value["stack"]) {
        return boxObject.value["stack"].value
    }

    return false
}

function convertObject(boxObject, sourceMap) {
    const errCheck = getError(boxObject, sourceMap)
    if (errCheck) return errCheck

    let object = new Object()
    for (let element in boxObject.value) {
        object[element] = boxObject.value[element].value
    }

    // Check if value is compatible as an array type
    if (boxObject.value["length"]) {
        if (Array.from(object).length === boxObject.value["length"].value) {
            return Array.from(object)
        }
    }

    return object
}

module.exports = { parse }