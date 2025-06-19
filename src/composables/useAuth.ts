// src/composables/useAuth.ts
import { ref, computed } from "vue";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/config";

// 🟢 Variables globales (fuera de la función)
const user = ref<User | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isInitialized = ref(false);

onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser;
  isLoading.value = false;
  isInitialized.value = true;
});

export const useAuth = () => {
  const userUid = computed(() => user.value?.uid || null);
  const isAuthenticated = computed(() => !!user.value);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log("✅ Sesión cerrada correctamente");
      return true;
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      return false;
    }
  };

  const signInWithGoogle = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      console.log("✅ Sesión iniciada con Google:", result.user);
      return result.user;
    } catch (err: any) {
      console.error("❌ Error en inicio de sesión con Google:", err);
      error.value = err.message || "Error desconocido al iniciar sesión";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Sesión iniciada con email:", result.user);
      return result.user;
    } catch (err: any) {
      console.error("❌ Error en inicio de sesión con email:", err);
      error.value = err.message || "Error desconocido al iniciar sesión";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user,
    userUid,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    signOut,
    signInWithGoogle,
    signInWithEmailPassword,
  };
};
