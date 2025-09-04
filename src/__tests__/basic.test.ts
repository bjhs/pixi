import { describe, it, expect } from 'vitest'

describe('Basic Test Suite', () => {
  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toBe('hello')
    expect(true).toBe(true)
  })

  it('should handle arrays and objects', () => {
    const arr = [1, 2, 3]
    const obj = { name: 'test', value: 42 }
    
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('test')
  })

  it('should handle async operations', async () => {
    const asyncFn = () => Promise.resolve('success')
    const result = await asyncFn()
    
    expect(result).toBe('success')
  })
})