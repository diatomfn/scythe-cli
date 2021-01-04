const { SourceMapConsumer } = require('source-map')
const stackTraceParser = require('stacktrace-parser')

async function getMappedTrace(stackTrace, sourceMap, bundleName) {
    const stack = stackTraceParser.parse(stackTrace)
    const consumer = await new SourceMapConsumer(JSON.parse(sourceMap))

    const originalStack = stack.map(stackValue => {
        if (stackValue.file && stackValue.file.endsWith(bundleName)) {
            const originalStackValue = consumer.originalPositionFor({
                line: stackValue.lineNumber,
                column: stackValue.column - 1, // columns are considered 0-based on source-map
            })

            stackValue.lineNumber = originalStackValue.line
            stackValue.column = originalStackValue.column + 1
            stackValue.file = originalStackValue.source
            stackValue.methodName = originalStackValue.name
        }
        return stackValue
    })

    let newStackTrace = new String()
    originalStack.forEach( (stackValue) => {
        newStackTrace += `at ${stackValue.methodName || '<unknown>'} (${stackValue.file}:${stackValue.lineNumber}:${stackValue.column})\n`
    })

    return newStackTrace
}

module.exports = { getMappedTrace }