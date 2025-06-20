// src\layouts\MainLayout.vue
<template>
  <div class="flex h-screen">
    <div
      v-if="isMobileMenuOpen && isMobile"
      @click="closeMobileMenu"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
    ></div>

    <aside
      :class="{
        'w-64': !isSidebarCollapsed,
        'w-20': isSidebarCollapsed,
        'translate-x-0': isMobileMenuOpen, // Cuando el menú móvil está abierto
        '-translate-x-full': !isMobileMenuOpen && isMobile, // Cuando el menú móvil está cerrado Y es móvil
      }"
      class="fixed inset-y-0 left-0 bg-sidebar-background transition-all duration-300 ease-in-out z-40 md:static md:translate-x-0 flex flex-col justify-between">
      <div class="p-4 flex items-center justify-between h-16">
        <h1 v-if="!isSidebarCollapsed" class="text-white text-2xl font-bold">
          FinanceDiamond
        </h1>
        </div>
      <nav class="mt-8">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.path"
          active-class="bg-sidebar-active"
          class="flex items-center p-4 text-white hover:bg-sidebar-hover transition-colors duration-200"
          @click="closeMobileMenu"
        >
          <component :is="link.icon" class="w-6 h-6 mr-4" />
          <span v-if="!isSidebarCollapsed">{{ link.name }}</span>
        </router-link>
      </nav>
      <div
        v-if="user"
        class="p-4 mt-auto flex items-center justify-between"
        :class="{ 'flex-col': isSidebarCollapsed, 'items-center': isSidebarCollapsed }"
      >
        <div
          class="flex items-center"
          :class="{ 'flex-col space-y-2': isSidebarCollapsed, 'space-x-3': !isSidebarCollapsed }"
        >
          <img
            :src="user.photoURL || ''"
            :alt="user.displayName || 'Usuario'"
            class="h-8 w-8 rounded-full"
            v-if="user.photoURL"
          />
          <div class="hidden sm:block" v-if="!isSidebarCollapsed">
            <p class="text-sm font-medium text-white">
              {{ user.displayName }}
            </p>
          </div>
        </div>

        <div class="flex" :class="{ 'flex-col space-y-2': isSidebarCollapsed, 'space-x-2': !isSidebarCollapsed }">
          <router-link
            to="/settings"
            class="p-2 text-gray-300 hover:text-white transition-colors"
            :title="isSidebarCollapsed ? 'Configuración' : ''"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </router-link>
          <button
            @click="handleLogout"
            class="p-2 text-red-400 hover:text-red-300 transition-colors"
            title="Cerrar sesión"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <div
      :class="{
        'md:ml-10': !isSidebarCollapsed,
        'md:ml-5': isSidebarCollapsed,
        'ml-0': isMobile,
      }"
      class="flex-1 overflow-auto transition-all duration-300 ease-in-out py-6 px-4 md:px-6 md:ml-0 relative"
    >
    <button
        @click="toggleMobileMenu"
        class="p-2 text-text-primary-light dark:text-text-primary-dark md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
        style="box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
      <header class="flex items-center justify-between mb-6 md:static md:relative">
        <span class="md:hidden w-10 h-10"></span>
        <h2
          class="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mx-auto md:mx-0"
        >
          {{ currentRouteName }}
        </h2>
        <button
          @click="toggleSidebar"
          class="hidden md:block p-2 text-text-secondary-light dark:text-text-secondary-dark"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </header>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import DashboardIcon from "../components/icons/DashboardIcon.vue";
import TransactionsIcon from "../components/icons/TransactionsIcon.vue";
import CategoriesIcon from "../components/icons/CategoriesIcon.vue";
import AccountsIcon from "../components/icons/AccountsIcon.vue";
import { useAuth } from "@/composables/useAuth";
import CreditCardIcon from "@/components/icons/CreditCardIcon.vue";

const isSidebarCollapsed = ref(false);
const isMobileMenuOpen = ref(false);
const isMobile = ref(false);

const { user, signOut } = useAuth();
const router = useRouter(); 

const handleLogout = async () => {
  try {
    await signOut();
    router.push({ name: "login" }); // Redirige al usuario a la página de login
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    // Aquí podrías mostrar una notificación al usuario si el logout falla
  }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // Tailwind's 'md' breakpoint
  if (!isMobile.value) {
    isMobileMenuOpen.value = false; // Asegura que el menú móvil esté cerrado en escritorio
    // isSidebarCollapsed.value = false; // Opcional: Si quieres que el sidebar SIEMPRE esté expandido en desktop al redimensionar
  } else {
    // Si es móvil, y el sidebar no está abierto, asegúrate de que esté colapsado
    // isSidebarCollapsed.value = true; // Si quieres que la sidebar esté colapsada inicialmente en móvil
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  if (isMobile.value) { // Solo cierra si realmente estamos en móvil
    isMobileMenuOpen.value = false;
  }
};

const route = useRoute();
const currentRouteName = computed(() => {
  const nameMap: { [key: string]: string } = {
    dashboard: "Panel",
    transactions: "Transacciones",
    categories: "Categorías",
    accounts: "Cuentas",
    creditcards: "Tarjetas de crédito",
    settings: "Configuración",
  };
  return nameMap[route.name as string] || "FinanceDiamond"; // Default si la ruta no está mapeada
});

const navLinks = [
  { name: "Panel", path: "/", icon: DashboardIcon },
  { name: "Transacciones", path: "/transactions", icon: TransactionsIcon },
  { name: "Categorías", path: "/categories", icon: CategoriesIcon },
  { name: "Cuentas", path: "/accounts", icon: AccountsIcon },
  { name: "Tarjetas de crédito", path: "/creditcards", icon: CreditCardIcon },
];
</script>

<style scoped>
/* Puedes añadir estilos específicos si necesitas */
</style>