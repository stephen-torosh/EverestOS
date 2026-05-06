import { reactive } from 'vue'

/**
 * InteractionEngine - рушій для керування 2D-інтеракціями,
 * SVG-анімаціями та динамічними компонентами навчання.
 */
class InteractionEngine {
  constructor() {
    // Реактивний стан для зв'язку з Vue-інтерфейсом
    this.state = reactive({
      activeApps: {}, // Відкриті інтерактивні вікна
      overlayVisible: false,
      currentStep: null, // Поточний крок у сценарії навчання
    })

    // Реєстр завантажених SVG-схем для швидкого доступу
    this.svgLibrary = new Map()
  }

  // --- МЕТОДИ КЕРУВАННЯ ВІКНАМИ (APP MANAGEMENT) ---

  /**
   * Відкриває нове інтерактивне вікно (App)
   * @param {string} id - унікальний ідентифікатор додатка
   * @param {Object} config - конфігурація (title, layout, logic)
   */
  openApp(id, config) {
    this.state.activeApps[id] = {
      id: id,
      title: config.title || 'Everest System Utility',
      type: config.type || 'standard', // 'explainer', 'coding', 'circuit'
      layout: config.layout || [], // Масив компонентів для рендеру
      runtimeData: reactive(config.initialData || {}),
      validator: config.validator || (() => true),
      onComplete: config.onComplete || (() => {}),
      onClose: config.onClose || (() => {}),
    }
    this.state.overlayVisible = true
    console.log(`[InteractionEngine] App "${id}" launched.`)
  }

  /**
   * Закриває додаток та викликає колбек завершення
   */
  closeApp(id, result = null) {
    if (this.state.activeApps[id]) {
      this.state.activeApps[id].onClose(result)
      delete this.state.activeApps[id]

      if (Object.keys(this.state.activeApps).length === 0) {
        this.state.overlayVisible = false
      }
    }
  }

  // --- МЕТОДИ SVG-НАТИВНОЇ АНІМАЦІЇ (<animate>) ---

  /**
   * Запускає нативні SMIL анімації всередині SVG за їх ID або селектором
   * @param {string} svgSelector - селектор SVG контейнера
   * @param {string} animationId - ID конкретного тегу <animate> (необов'язково)
   */
  startAnimation(svgSelector, animationId = null) {
    const container = document.querySelector(svgSelector)
    if (!container) return

    const animations = animationId
      ? container.querySelectorAll(`#${animationId}`)
      : container.querySelectorAll('animate, animateTransform, animateMotion')

    animations.forEach((ani) => {
      if (typeof ani.beginElement === 'function') {
        ani.beginElement()
      }
    })
  }

  /**
   * Зупиняє всі анімації в SVG (пауза на рівні документа)
   */
  pauseAnimations(svgSelector) {
    const svg = document.querySelector(svgSelector)
    if (svg && typeof svg.pauseAnimations === 'function') {
      svg.pauseAnimations()
    }
  }

  /**
   * Відновлює анімації
   */
  resumeAnimations(svgSelector) {
    const svg = document.querySelector(svgSelector)
    if (svg && typeof svg.unpauseAnimations === 'function') {
      svg.unpauseAnimations()
    }
  }

  /**
   * Динамічна ін'єкція тегу <animate> в елемент SVG
   * Дозволяє Данилу створювати анімації "на льоту"
   */
  injectNativeAnimation(elementId, params) {
    const target = document.getElementById(elementId)
    if (!target) return

    // Створюємо елемент у просторі імен SVG
    const svgNS = 'http://www.w3.org/2000/svg'
    const anim = document.createElementNS(svgNS, 'animate')

    anim.setAttribute('attributeName', params.attribute || 'opacity')
    anim.setAttribute('from', params.from)
    anim.setAttribute('to', params.to)
    anim.setAttribute('dur', params.dur || '1s')
    anim.setAttribute('begin', 'indefinite')
    anim.setAttribute('fill', 'freeze') // Залишити кінцевий стан

    target.appendChild(anim)
    anim.beginElement()
  }

  // --- МЕТОДИ ВАЛІДАЦІЇ ТА ЛОГІКИ ---

  /**
   * Перевіряє стан додатка через валідатор
   */
  checkProgress(id) {
    const app = this.state.activeApps[id]
    if (app && app.validator(app.runtimeData)) {
      app.onComplete(app.runtimeData)
      console.log(`[InteractionEngine] Task in "${id}" completed successfully!`)
    }
  }

  /**
   * Оновлює дані в контексті додатка (наприклад, зі слайдера)
   */
  updateData(id, key, value) {
    if (this.state.activeApps[id]) {
      this.state.activeApps[id].runtimeData[key] = value
      this.checkProgress(id)
    }
  }
}

export const interaction = new InteractionEngine()
