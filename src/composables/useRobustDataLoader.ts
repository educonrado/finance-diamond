// composables/useRobustDataLoader.ts
import { ref, computed } from 'vue'

interface LoaderOptions {
  timeout?: number
  maxRetries?: number
  retryDelay?: number
  cacheDuration?: number
  cacheKey?: string
}

import type { UnwrapRef } from 'vue'

interface LoaderState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  retryCount: number
  lastLoaded: Date | null
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Cache global para todos los loaders
const globalCache = new Map<string, CacheEntry<any>>()

export function useRobustDataLoader<T>(
  fetchFn: () => Promise<T>,
  options: LoaderOptions = {}
) {
  const {
    timeout = 10000, // 10 segundos
    maxRetries = 3,
    retryDelay = 1000, // 1 segundo
    cacheDuration = 5 * 60 * 1000, // 5 minutos
    cacheKey
  } = options

  const state = ref<LoaderState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0,
    lastLoaded: null
  })

  // Verificar si hay datos en cache válidos
  const getCachedData = (): T | null => {
    if (!cacheKey) return null
    
    const cached = globalCache.get(cacheKey)
    if (!cached) return null
    
    const now = Date.now()
    if (now > cached.expiresAt) {
      globalCache.delete(cacheKey)
      return null
    }
    
    return cached.data
  }

  // Guardar datos en cache
  const setCachedData = (data: T) => {
    if (!cacheKey) return
    
    const now = Date.now()
    globalCache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + cacheDuration
    })
  }

  // Función para crear timeout
  const createTimeoutPromise = (ms: number): Promise<never> => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout después de ${ms}ms`)), ms)
    })
  }

  // Función para delay entre reintentos
  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Función principal de carga con retry
  const loadWithRetry = async (attemptNumber = 0): Promise<T> => {
    try {
      state.value.retryCount = attemptNumber
      
      // Ejecutar fetch con timeout
      const result = await Promise.race([
        fetchFn(),
        createTimeoutPromise(timeout)
      ])
      
      // Resetear error si la carga fue exitosa
      state.value.error = null
      state.value.retryCount = 0
      
      return result
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      
      // Si hemos alcanzado el máximo de reintentos, lanzar error
      if (attemptNumber >= maxRetries) {
        throw errorObj
      }
      
      // Esperar antes del siguiente intento
      await delay(retryDelay * Math.pow(2, attemptNumber)) // Backoff exponencial
      
      // Reintentar
      return loadWithRetry(attemptNumber + 1)
    }
  }

  // Función principal para cargar datos
  const load = async (forceRefresh = false): Promise<T | null> => {
    // Si no es un refresh forzado, intentar usar cache
    if (!forceRefresh) {
      const cached = getCachedData()
      if (cached) {
        state.value.data = cached as UnwrapRef<T>
        state.value.lastLoaded = new Date(globalCache.get(cacheKey!)!.timestamp)
        return cached as T
      }
    }

    // Si ya está cargando, no hacer nada
    if (state.value.loading) {
      return state.value.data as T | null
    }

    state.value.loading = true
    state.value.error = null

    try {
      const result = await loadWithRetry()
      
      state.value.data = result as UnwrapRef<T>
      state.value.lastLoaded = new Date()
      
      // Guardar en cache
      setCachedData(result)
      
      return result
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      state.value.error = errorObj
      
      console.error(`Error cargando datos (${cacheKey || 'unknown'}):`, errorObj)
      
      return null
    } finally {
      state.value.loading = false
    }
  }

  // Función para limpiar cache específico
  const clearCache = () => {
    if (cacheKey) {
      globalCache.delete(cacheKey)
    }
  }

  // Función para verificar si los datos están obsoletos
  const isStale = computed(() => {
    if (!state.value.lastLoaded) return true
    
    const now = Date.now()
    const lastLoadedTime = state.value.lastLoaded.getTime()
    return (now - lastLoadedTime) > cacheDuration
  })

  // Función para obtener el tiempo restante de cache
  const cacheTimeRemaining = computed(() => {
    if (!cacheKey || !state.value.lastLoaded) return 0
    
    const cached = globalCache.get(cacheKey)
    if (!cached) return 0
    
    const now = Date.now()
    return Math.max(0, cached.expiresAt - now)
  })

  // Función para refrescar datos si están obsoletos
  const refreshIfStale = async (): Promise<T | null> => {
    if (isStale.value) {
      return await load(true)
    }
    return state.value.data as T | null
  }

  return {
    // Estado
    data: computed(() => state.value.data),
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),
    retryCount: computed(() => state.value.retryCount),
    lastLoaded: computed(() => state.value.lastLoaded),
    isStale,
    cacheTimeRemaining,
    
    // Métodos
    load,
    refresh: () => load(true),
    clearCache,
    refreshIfStale,
    
    // Métodos de conveniencia
    isLoading: computed(() => state.value.loading),
    hasError: computed(() => !!state.value.error),
    hasData: computed(() => !!state.value.data),
    isEmpty: computed(() => !state.value.data && !state.value.loading && !state.value.error)
  }
}

// Composable específico para toast notifications
export function useErrorToast() {
  const showError = (error: Error, context?: string) => {
    const message = context ? `${context}: ${error.message}` : error.message
    
    // Aquí puedes integrar con tu sistema de notificaciones
    // Por ejemplo, si usas vue-toastification:
    // toast.error(message)
    
    console.error('Error Toast:', message)
  }

  const showSuccess = (message: string) => {
    // toast.success(message)
    console.log('Success Toast:', message)
  }

  const showWarning = (message: string) => {
    // toast.warning(message)
    console.warn('Warning Toast:', message)
  }

  return {
    showError,
    showSuccess,
    showWarning
  }
}

// Helper para limpiar todo el cache
export function clearAllCache() {
  globalCache.clear()
}

// Helper para obtener información del cache
export function getCacheInfo() {
  const entries = Array.from(globalCache.entries()).map(([key, entry]) => ({
    key,
    size: JSON.stringify(entry.data).length,
    expiresAt: new Date(entry.expiresAt),
    age: Date.now() - entry.timestamp
  }))
  
  return {
    totalEntries: globalCache.size,
    entries
  }
}