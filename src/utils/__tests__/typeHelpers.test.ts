import { describe, it, expect, vi } from 'vitest'
import {
  isValidSessionState,
  isValidSessionEventType,
  typedKeys,
  typedEntries,
  assertNever,
  isNotNullish,
  getEnvVar
} from '../typeHelpers'
import { SessionState, SessionEventType } from '@/types'

describe('Type Helper Utilities', () => {
  describe('isValidSessionState', () => {
    it('should return true for valid session states', () => {
      expect(isValidSessionState(SessionState.IDLE)).toBe(true)
      expect(isValidSessionState(SessionState.ACTIVE)).toBe(true)
      expect(isValidSessionState(SessionState.PAUSED)).toBe(true)
      expect(isValidSessionState(SessionState.COMPLETED)).toBe(true)
    })

    it('should return false for invalid session states', () => {
      expect(isValidSessionState('invalid')).toBe(false)
      expect(isValidSessionState('')).toBe(false)
      expect(isValidSessionState('RUNNING')).toBe(false)
    })
  })

  describe('isValidSessionEventType', () => {
    it('should return true for valid session event types', () => {
      expect(isValidSessionEventType(SessionEventType.START)).toBe(true)
      expect(isValidSessionEventType(SessionEventType.PAUSE)).toBe(true)
      expect(isValidSessionEventType(SessionEventType.RESUME)).toBe(true)
      expect(isValidSessionEventType(SessionEventType.STOP)).toBe(true)
      expect(isValidSessionEventType(SessionEventType.AFK_DETECTED)).toBe(true)
      expect(isValidSessionEventType(SessionEventType.AFK_RESUMED)).toBe(true)
    })

    it('should return false for invalid session event types', () => {
      expect(isValidSessionEventType('invalid')).toBe(false)
      expect(isValidSessionEventType('')).toBe(false)
      expect(isValidSessionEventType('STARTED')).toBe(false)
    })
  })

  describe('typedKeys', () => {
    it('should return typed keys of an object', () => {
      const obj = { name: 'John', age: 30, active: true }
      const keys = typedKeys(obj)
      
      expect(keys).toEqual(['name', 'age', 'active'])
      expect(keys).toHaveLength(3)
    })

    it('should work with empty objects', () => {
      const obj = {}
      const keys = typedKeys(obj)
      
      expect(keys).toEqual([])
      expect(keys).toHaveLength(0)
    })
  })

  describe('typedEntries', () => {
    it('should return typed entries of an object', () => {
      const obj = { name: 'John', age: 30 }
      const entries = typedEntries(obj)
      
      expect(entries).toEqual([['name', 'John'], ['age', 30]])
      expect(entries).toHaveLength(2)
    })

    it('should work with empty objects', () => {
      const obj = {}
      const entries = typedEntries(obj)
      
      expect(entries).toEqual([])
      expect(entries).toHaveLength(0)
    })
  })

  describe('assertNever', () => {
    it('should throw an error with the unexpected value', () => {
      const unexpectedValue = 'unexpected' as never
      
      expect(() => assertNever(unexpectedValue)).toThrow(
        'Unexpected value: "unexpected"'
      )
    })

    it('should throw an error with JSON stringified object', () => {
      const unexpectedValue = { type: 'unknown' } as never
      
      expect(() => assertNever(unexpectedValue)).toThrow(
        'Unexpected value: {"type":"unknown"}'
      )
    })
  })

  describe('isNotNullish', () => {
    it('should return true for non-null and non-undefined values', () => {
      expect(isNotNullish('string')).toBe(true)
      expect(isNotNullish(0)).toBe(true)
      expect(isNotNullish(false)).toBe(true)
      expect(isNotNullish([])).toBe(true)
      expect(isNotNullish({})).toBe(true)
    })

    it('should return false for null and undefined values', () => {
      expect(isNotNullish(null)).toBe(false)
      expect(isNotNullish(undefined)).toBe(false)
    })

    it('should work as type guard', () => {
      const values: (string | null | undefined)[] = ['hello', null, 'world', undefined]
      const filteredValues = values.filter(isNotNullish)
      
      expect(filteredValues).toEqual(['hello', 'world'])
      // Type should be inferred as string[] after filtering
    })
  })

  describe('getEnvVar', () => {
    it('should be defined as a function', () => {
      expect(typeof getEnvVar).toBe('function')
    })
    
    // Note: Testing getEnvVar with import.meta.env is complex in test environment
    // In a real application, we would test this with actual environment variables
    it('should handle environment variable access', () => {
      // This test verifies the function exists and can be called
      // In practice, environment variables would be set in the test environment
      expect(() => {
        // We expect this to throw in test environment since VITE_SUPABASE_URL isn't set
        getEnvVar('VITE_SUPABASE_URL')
      }).toThrow()
    })
  })
})