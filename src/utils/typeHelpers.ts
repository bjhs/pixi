/**
 * Type helper utilities for better type safety throughout the application
 */

import type { SessionState, SessionEventType } from '@/types'

/**
 * Type guard to check if a value is a valid SessionState
 */
export const isValidSessionState = (value: string): value is SessionState => {
  const validStates: SessionState[] = ['idle', 'active', 'paused', 'completed']
  return validStates.includes(value as SessionState)
}

/**
 * Type guard to check if a value is a valid SessionEventType
 */
export const isValidSessionEventType = (value: string): value is SessionEventType => {
  const validTypes: SessionEventType[] = [
    'start', 'pause', 'resume', 'stop', 'afk_detected', 'afk_resumed'
  ]
  return validTypes.includes(value as SessionEventType)
}

/**
 * Type-safe object keys utility
 */
export const typedKeys = <T extends Record<string, unknown>>(obj: T): Array<keyof T> => {
  return Object.keys(obj) as Array<keyof T>
}

/**
 * Type-safe object entries utility
 */
export const typedEntries = <T extends Record<string, unknown>>(
  obj: T
): Array<[keyof T, T[keyof T]]> => {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}

/**
 * Assert function for never cases (exhaustiveness checking)
 */
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

/**
 * Type predicate for checking if a value is not null or undefined
 */
export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined
}

/**
 * Type-safe environment variable getter
 */
export const getEnvVar = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}