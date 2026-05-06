<template>
  <div class="theo-wrapper" :class="[emotion, { 'is-talking': isTalking }]">
    <svg viewBox="0 0 200 200" class="theo-svg">
      <!-- Body (Kurzgesagt Style) -->
      <circle cx="100" cy="110" r="70" class="theo-body" />

      <!-- Eyes -->
      <g class="eyes">
        <ellipse cx="75" cy="100" rx="8" ry="12" class="eye left" />
        <ellipse cx="125" cy="100" rx="8" ry="12" class="eye right" />
      </g>

      <!-- Mouth (Changes based on talking) -->
      <path v-if="!isTalking" d="M 85 130 Q 100 140 115 130" class="mouth-static" />
      <ellipse v-else cx="100" cy="135" rx="10" ry="15" class="mouth-talking" />

      <!-- Glow Effect -->
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  emotion: { type: String, default: 'neutral' }, // happy, sad, thinking
  isTalking: { type: Boolean, default: false },
  textToSpeak: String,
})

// Функція озвучки (Web Speech API)
const speak = (text) => {
  if (!window.speechSynthesis) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'uk-UA' // або 'en-US'
  utterance.pitch = 1.2 // Трохи вищий голос, як у студента
  utterance.rate = 1.0

  window.speechSynthesis.speak(utterance)
}

watch(
  () => props.textToSpeak,
  (newText) => {
    if (newText) speak(newText)
  },
)
</script>

<style scoped>
.theo-wrapper {
  width: 120px;
  height: 120px;
  position: relative;
}

.theo-body {
  fill: var(--accent-color);
  filter: url(#glow);
  transition: fill 0.5s ease;
}

.eye {
  fill: #000;
}

.is-talking .mouth-talking {
  fill: #000;
  animation: talk-gap 0.2s infinite alternate;
}

.theo-body {
  animation: float 3s infinite ease-in-out;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes talk-gap {
  from {
    ry: 5;
  }
  to {
    ry: 12;
  }
}

/* Кліпання очей */
.eyes {
  animation: blink 4s infinite;
}
@keyframes blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}

.mouth-static {
  fill: none;
  stroke: #000;
  stroke-width: 4;
  stroke-linecap: round;
}
</style>
