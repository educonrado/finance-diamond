// src\layouts\MainLayout.vue
<template>
  <div class="flex h-screen">
    <div v-if="isMobileMenuOpen && isMobile" @click="closeMobileMenu"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>

    <aside :class="{
      'w-64': !isSidebarCollapsed,
      'w-20': isSidebarCollapsed,
      'translate-x-0': isMobileMenuOpen,
      '-translate-x-full': !isMobileMenuOpen && isMobile,
    }"
      class="fixed inset-y-0 left-0 bg-sidebar-background transition-all duration-300 ease-in-out z-40 md:static md:translate-x-0 flex flex-col justify-between">
      <div class="p-4 flex items-center justify-between h-16">
        <h1 v-if="!isSidebarCollapsed" class="text-white text-2xl font-bold">
          FinanceDiamond
        </h1>
      </div>
      <nav class="mt-8">
        <router-link v-for="link in navLinks" :key="link.name" :to="link.path" active-class="bg-sidebar-active"
          class="flex items-center p-4 text-white hover:bg-sidebar-hover transition-colors duration-200"
          @click="closeMobileMenu">
          <component :is="link.icon" class="w-6 h-6 mr-4" />
          <span v-if="!isSidebarCollapsed">{{ link.name }}</span>
        </router-link>

      </nav>
      <div v-if="user" class="p-4 mt-auto flex items-center justify-between"
        :class="{ 'flex-col': isSidebarCollapsed, 'items-center': isSidebarCollapsed }">
        <div class="flex items-center"
          :class="{ 'flex-col space-y-2': isSidebarCollapsed, 'space-x-3': !isSidebarCollapsed }">
          <img :src="user.photoURL || ''" :alt="user.displayName || 'Usuario'" class="h-8 w-8 rounded-full"
            v-if="user.photoURL" />
          <div class="hidden sm:block" v-if="!isSidebarCollapsed">
            <p class="text-sm font-medium text-white">
              {{ user.displayName }}
            </p>
          </div>
        </div>

        <div class="flex" :class="{ 'flex-col space-y-2': isSidebarCollapsed, 'space-x-2': !isSidebarCollapsed }">
          <router-link to="/settings" class="p-2 text-gray-300 hover:text-white transition-colors"
            :title="isSidebarCollapsed ? 'Configuración' : ''">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </router-link>
          <button @click="handleLogout" class="p-2 text-gray-300 hover:text-red-300 transition-colors"
            title="Cerrar sesión">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <div :class="{
      'md:ml-10': !isSidebarCollapsed,
      'md:ml-5': isSidebarCollapsed,
      'ml-0': isMobile,
    }" class="flex-1 overflow-auto transition-all duration-300 ease-in-out py-6 px-4 md:px-6 md:ml-0 relative">
      <header class="flex items-center mb-6 md:relative">
        <button @click="toggleMobileMenu"
          class="p-2 mr-2 text-text-primary-light dark:text-text-primary-dark md:hidden bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700"
          style="box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2
          class="flex-1 text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark text-right md:text-left m-0 pr-5 md:pr-0">
          {{ currentRouteName }}
        </h2>
        <button @click="toggleSidebar"
          class="hidden md:block p-2 text-text-secondary-light dark:text-text-secondary-dark">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>
      <router-view />
      <button @click="toggleFabMenu" :class="[
        'fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center group',
        isFabMenuOpen && 'rotate-45'
      ]" :aria-label="isFabMenuOpen ? 'Cerrar menú de acciones' : 'Abrir menú de acciones rápidas'"
        :aria-expanded="isFabMenuOpen">
        <svg class="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <div
          class="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200">
        </div>
      </button>
      <Transition enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-75 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-75 translate-y-4">
        <div v-if="isFabMenuOpen" class="fixed bottom-24 right-6 flex flex-col items-end gap-3 z-50">
          <button @click="goToNewTransfer"
            class="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl active:scale-95 transition-all duration-200"
            aria-label="Crear nueva transferencia entre cuentas">
            <span class="hidden sm:inline whitespace-nowrap">Movimiento entre cuentas</span>
            <span class="sm:hidden">Movimiento entre cuentas</span>
            <div
              class="w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </button>
          <button @click="goToNewTransaction"
            class="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl active:scale-95 transition-all duration-200"
            aria-label="Crear nueva transacción de ingreso o gasto">
            <span class="hidden sm:inline whitespace-nowrap">Nueva Transacción</span>
            <span class="sm:hidden">Transacción</span>
            <div
              class="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import DashboardIcon from "../components/icons/DashboardIcon.vue";
import TransactionsIcon from "../components/icons/TransactionsIcon.vue";
import AccountsIcon from "../components/icons/AccountsIcon.vue";
import { useAuth } from "@/composables/useAuth";
import CreditCardIcon from "@/components/icons/CreditCardIcon.vue";
import LoanIcon from "@/components/icons/LoanIcon.vue";

const isSidebarCollapsed = ref(false);
const isMobileMenuOpen = ref(false);
const isMobile = ref(false);
const isFabMenuOpen = ref(false);

const { user, signOut } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  try {
    await signOut();
    router.push({ name: "login" });
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
  // Cerrar el FAB al hacer clic fuera
  document.addEventListener('click', handleGlobalClick, true);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  document.removeEventListener('click', handleGlobalClick, true);
});

function handleGlobalClick(e: MouseEvent) {
  const fab = document.querySelector('.fixed.bottom-6.right-6');
  const fabMenu = document.querySelector('.fixed.bottom-24.right-6');
  if (!fab || !isFabMenuOpen.value) return;
  if (fab.contains(e.target as Node) || (fabMenu && fabMenu.contains(e.target as Node))) return;
  isFabMenuOpen.value = false;
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const toggleFabMenu = () => {
  isFabMenuOpen.value = !isFabMenuOpen.value;
};

const closeMobileMenu = () => {
  if (isMobile.value) {
    isMobileMenuOpen.value = false;
  }
};

const route = useRoute();
const currentRouteName = computed(() => {
  const nameMap: { [key: string]: string } = {
    dashboard: "Panel",
    transactions: "Transacciones",
    accounts: "Cuentas",
    creditcards: "Tarjetas de crédito",
    loans: "Préstamos",
    settings: "Configuración",
  };
  return nameMap[route.name as string] || "FinanceDiamond";
});

const navLinks = [
  { name: "Panel", path: "/", icon: DashboardIcon },
  { name: "Transacciones", path: "/transactions", icon: TransactionsIcon },
  { name: "Cuentas", path: "/accounts", icon: AccountsIcon },
  { name: "Tarjetas de crédito", path: "/creditcards", icon: CreditCardIcon },
  { name: "Préstamos", path: "/loans", icon: LoanIcon }
];

const goToNewTransaction = () => {
  isFabMenuOpen.value = false;
  router.push('/transactions');
};

const goToNewTransfer = () => {
  isFabMenuOpen.value = false;
  router.push('/accounts');
};
</script>

<style scoped></style>