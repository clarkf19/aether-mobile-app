/**
 * API Response Handler Utility
 * Provides consistent error handling and response formatting across all API routes
 */

import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
  timestamp?: string
}

export interface ApiErrorDetails {
  code?: string
  message: string
  status: number
  details?: any
}

/**
 * Success Response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Error Response
 */
export function errorResponse(
  error: string | Error | ApiErrorDetails,
  status = 500
): NextResponse<ApiResponse> {
  let errorMessage = 'Unknown error'
  let details: any = null

  if (typeof error === 'string') {
    errorMessage = error
  } else if (error instanceof Error) {
    errorMessage = error.message
    details = {
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  } else if (typeof error === 'object' && 'message' in error) {
    errorMessage = error.message
    status = error.status || status
    details = error.details || error
  }

  console.error('❌ API Error:', errorMessage, details)

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Database Error Handler
 */
export function handleDatabaseError(error: any, table: string) {
  console.error(`❌ Database error in ${table}:`, error)

  // Check for specific database errors
  if (error.code === '23505') {
    return errorResponse(
      {
        code: 'DUPLICATE_KEY',
        message: `Duplicate entry in ${table}`,
        status: 409,
        details: { table, originalError: error.message },
      },
      409
    )
  }

  if (error.code === '23503') {
    return errorResponse(
      {
        code: 'FOREIGN_KEY',
        message: 'Invalid reference to related data',
        status: 400,
        details: { table, originalError: error.message },
      },
      400
    )
  }

  if (error.code === '42P01') {
    return errorResponse(
      {
        code: 'TABLE_NOT_FOUND',
        message: `Table ${table} does not exist`,
        status: 500,
        details: { table },
      },
      500
    )
  }

  // Generic database error
  return errorResponse(
    {
      code: 'DATABASE_ERROR',
      message: error.message || `Failed to access ${table}`,
      status: 500,
      details: {
        table,
        code: error.code,
        hint: error.hint,
      },
    },
    500
  )
}

/**
 * Validation Error Handler
 */
export function validationError(missingFields: string[]) {
  return errorResponse(
    {
      code: 'VALIDATION_ERROR',
      message: `Missing required fields: ${missingFields.join(', ')}`,
      status: 400,
      details: { missingFields },
    },
    400
  )
}

/**
 * Wrap an async API handler with automatic error handling
 */
export function withErrorHandling(
  handler: (req: any) => Promise<NextResponse>
) {
  return async (req: any) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('❌ Unhandled error in API route:', error)
      return errorResponse(
        error instanceof Error ? error : 'An unexpected error occurred',
        500
      )
    }
  }
}

/**
 * Retry utility for failed database operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`⏳ Attempt ${attempt}/${maxRetries}...`)
      return await operation()
    } catch (error) {
      lastError = error
      console.warn(
        `⚠️ Attempt ${attempt} failed:`,
        error instanceof Error ? error.message : error
      )

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError
}
