test('addition', () => {
    expect(2 + 2).toBe(4)
})

const animals = ['Lion', 'Tiger']
test('array', () => {
    expect(animals).toContain('Lion')
    expect(animals).toBeInstanceOf(Array)
})

test('exception', () => {
    expect(() => getData()).toThrow('Not Found')
})

function getData() {
    throw new Error('Not Found')
}