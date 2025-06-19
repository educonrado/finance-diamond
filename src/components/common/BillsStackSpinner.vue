<template>
  <div class="loader-overlay-transparent">
    <div class="loader-container loader-conveyor">
      <div class="stack-shadow conveyor-shadow"></div>
      <div class="bills-stack">
        <div class="bill conveyor-bill" style="animation-delay:0s;"><img src="/icons/money1.svg" alt="Billete" /></div>
        <div class="bill conveyor-bill" style="animation-delay:0.4s;"><img src="/icons/money1.svg" alt="Billete" /></div>
        <div class="bill conveyor-bill" style="animation-delay:0.8s;"><img src="/icons/money1.svg" alt="Billete" /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props ni lógica, loader visual puro
</script>

<style scoped>
.loader-overlay-transparent {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.loader-container {
  pointer-events: auto;
}
.loader-container {
  width: 50px;
  height: 100px;
  position: relative;
  perspective: 1000px;
}
.bill {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100px;
  transform-style: preserve-3d;
  opacity: 1;
}
.bill img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
  transform: rotateZ(15deg);
  display: block;
}
.conveyor-bill {
  animation: conveyorMove 1.2s linear infinite;
  left: 0;
  z-index: 2;
}
@keyframes conveyorMove {
  0% { opacity: 0; transform: translateX(-60px) scale(1) rotateZ(15deg); }
  10% { opacity: 1; }
  60% { opacity: 1; transform: translateX(0) scale(1) rotateZ(15deg); }
  80% { opacity: 1; transform: translateX(30px) scale(1) rotateZ(15deg); }
  100% { opacity: 0; transform: translateX(60px) scale(1) rotateZ(15deg); }
}
.conveyor-shadow {
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  filter: blur(3px);
  transform: scaleX(0.8);
  animation: conveyorShadow 1.2s linear infinite;
}
@keyframes conveyorShadow {
  0%,100% { transform: scaleX(0.8); opacity:0.2; }
  50% { transform: scaleX(1.1); opacity:0.4; }
}
.bills-stack {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
</style>
