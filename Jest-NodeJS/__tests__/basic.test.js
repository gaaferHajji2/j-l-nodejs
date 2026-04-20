

test('addition', () => {
    expect(2 + 2).toBe(4)
})

const animals = ['Lion', 'Tiger']
test('array', () => {
    expect(animals).toContain('Lion')
})