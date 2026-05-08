import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { reactive } from 'vue'

/**
 * MasterEngine v1.0 "Everest Core"
 * Повноцінний рушій для EverestOS.
 * Об'єднує візуал (Three.js), фізику (Cannon-es), звук та UI (Vue 3).
 */
class MasterEngine {
  constructor() {
    // 1. Ініціалізація Світу
    this.entities = []
    this.scene = new THREE.Scene()
    this.world = new CANNON.World()
    this.world.gravity.set(0, -9.82, 0)
    this.clock = new THREE.Clock()

    this.activeCamera = null
    this.isPaused = false
    this.updateCallbacks = []

    // 2. Система вводу (InputHandler)
    this.input = {
      keys: {},
      mouse: { x: 0, y: 0, left: false, right: false },
      isKeyDown: (code) => this.input.keys[code] || false,
    }

    // 3. Аудіосистема
    this.audioListener = new THREE.AudioListener()
    this.audioLoader = new THREE.AudioLoader()

    // 4. Реактивний UI (Overlay System)
    this.UIStore = reactive({
      modules: {}, // Спідометри, датчики, графіки
      logs: [], // Системні повідомлення місії
      missionStatus: 'idle', // idle, running, paused, success, failed
    })

    this._setupSystemEvents()

    const engine = this

    /**
     * КЛАС ENTITY (Сутність)
     */
    this.Entity = class Entity {
      constructor(name = 'New Entity') {
        this.name = name
        this.components = {}
        this.object3d = new THREE.Group()
        engine.scene.add(this.object3d)

        const self = this

        // --- COMPONENT: TRANSFORM ---
        this.transform = {
          setPosition: (x, y, z) => self.object3d.position.set(x, y, z),
          setRotation: (x, y, z) =>
            self.object3d.rotation.set(
              THREE.MathUtils.degToRad(x),
              THREE.MathUtils.degToRad(y),
              THREE.MathUtils.degToRad(z),
            ),
          setScale: (x, y, z) => self.object3d.scale.set(x, y, z),
          getPosition: () => self.object3d.position,
          getRotation: () => self.object3d.rotation,
          lookAt: (v) => self.object3d.lookAt(v),
        }

        // --- COMPONENT: MESH RENDERER (Tinkercad-style Parser) ---
        this.MeshRenderer = class {
          constructor(assetArray) {
            this.parts = []
            this.shapesData = assetArray

            assetArray.forEach((data) => {
              const geometry = engine._createGeometry(data.figure)
              const material = new THREE.MeshStandardMaterial({
                color: data.material.color,
                roughness: data.material.roughness || 0.5,
                transparent: data.material.transparency > 0,
                opacity: 1 - (data.material.transparency || 0),
              })

              const mesh = new THREE.Mesh(geometry, material)
              mesh.position.set(data.position.x, data.position.y, data.position.z)
              mesh.rotation.set(
                THREE.MathUtils.degToRad(data.rotation.x),
                THREE.MathUtils.degToRad(data.rotation.y),
                THREE.MathUtils.degToRad(data.rotation.z),
              )
              mesh.scale.set(data.scale.x, data.scale.y, data.scale.z)

              // enable shadows by default for nicer visuals
              mesh.castShadow = true
              mesh.receiveShadow = true
              self.object3d.add(mesh)
              this.parts.push(mesh)
            })
            self.components.meshRenderer = this
          }
          setVisible(val) {
            self.object3d.visible = val
          }
        }

        // --- COMPONENT: RIGIDBODY (Physics Engine) ---
        this.Rigidbody = class {
          constructor(mass = 1) {
            this.body = new CANNON.Body({ mass: mass })
            this.drag = 0.1
            this.onCollideCallback = null

            // Налаштування слухача зіткнень
            this.body.addEventListener('collide', (e) => {
              if (this.onCollideCallback) {
                const targetBody = e.body === this.body ? e.target : e.body
                const targetEntity = engine.entities.find(
                  (ent) => ent.components.rigidbody?.body === targetBody,
                )
                this.onCollideCallback(targetEntity)
              }
            })

            engine.world.addBody(this.body)
            // Debug: log body creation to help trace duplicates
            try {
              engine.UI.log(`Rigidbody created mass=${this.body.mass} id=${this.body.id}`)
            } catch (err) {}
            self.components.rigidbody = this
          }

          // Авто-генерація колайдерів з мешів
          attachColliderFromMesh() {
            const renderer = self.components.meshRenderer
            if (!renderer) return

            renderer.shapesData.forEach((s) => {
              const shape = engine._createPhysicsShape(s.figure, s.scale)
              const q = new CANNON.Quaternion()
              q.setFromEuler(
                THREE.MathUtils.degToRad(s.rotation.x),
                THREE.MathUtils.degToRad(s.rotation.y),
                THREE.MathUtils.degToRad(s.rotation.z),
              )
              this.body.addShape(
                shape,
                new CANNON.Vec3(s.position.x, s.position.y, s.position.z),
                q,
              )
            })
          }

          // Керування силами
          addForce(x, y, z) {
            this.body.applyForce(new CANNON.Vec3(x, y, z), this.body.position)
          }
          addLocalForce(x, y, z) {
            const worldForce = this.body.quaternion.vmult(new CANNON.Vec3(x, y, z))
            this.body.applyForce(worldForce, this.body.position)
          }
          // --- Усередині класу Rigidbody в MasterEngine.js ---

          addTorque(x, y, z) {
            // У Cannon-es ми просто додаємо значення до компонентів x, y, z
            this.body.angularVelocity.x += x
            this.body.angularVelocity.y += y
            this.body.angularVelocity.z += z
          }
          setVelocity(x, y, z) {
            this.body.velocity.set(x, y, z)
          }

          // Фізичні обмеження та сенсори
          setSensor(isSensor) {
            this.body.shapes.forEach((shape) => (shape.collisionResponse = !isSensor))
          }
          onCollide(fn) {
            this.onCollideCallback = fn
          }

          // З'єднання (Joints)
          attachTo(targetEntity, type = 'fixed', offset = { x: 0, y: 0, z: 0 }) {
            const targetRB = targetEntity.components.rigidbody
            if (!targetRB) return
            const constraint = new CANNON.PointToPointConstraint(
              this.body,
              new CANNON.Vec3(0, 0, 0),
              targetRB.body,
              new CANNON.Vec3(offset.x, offset.y, offset.z),
            )
            engine.world.addConstraint(constraint)
          }

          // Пружини (Suspension)
          addSpring(targetEntity, opts = { restLength: 1, stiffness: 50, damping: 0.5 }) {
            const targetRB = targetEntity.components.rigidbody
            if (!targetRB) return
            const spring = new CANNON.Spring(this.body, targetRB.body, {
              restLength: opts.restLength,
              stiffness: opts.stiffness,
              damping: opts.damping,
              localAnchorB: new CANNON.Vec3(opts.ox || 0, opts.oy || 0, opts.oz || 0),
            })
            engine.onUpdate(() => spring.applyForce())
          }
        }

        // --- COMPONENT: AUDIO CONTROLLER ---
        this.AudioController = class {
          constructor() {
            this.sounds = new Map()
            self.components.audio = this
          }
          load(id, url, loop = false, volume = 0.5) {
            const sound = new THREE.PositionalAudio(engine.audioListener)
            engine.audioLoader.load(url, (buffer) => {
              sound.setBuffer(buffer)
              sound.setRefDistance(10)
              sound.setLoop(loop)
              sound.setVolume(volume)
            })
            this.sounds.set(id, sound)
            self.object3d.add(sound)
          }
          play(id) {
            if (this.sounds.has(id)) this.sounds.get(id).play()
          }
          stop(id) {
            if (this.sounds.has(id)) this.sounds.get(id).stop()
          }
        }

        // --- COMPONENT: CAMERA ---
        this.Camera = class {
          constructor(fov = 75) {
            this.instance = new THREE.PerspectiveCamera(
              fov,
              window.innerWidth / window.innerHeight,
              0.1,
              1000,
            )
            this.instance.add(engine.audioListener) // Вуха гравця
            this.offset = new THREE.Vector3(0, 5, 10)
            if (!engine.activeCamera) engine.activeCamera = this.instance
            self.components.camera = this
          }
          update() {
            const targetPos = new THREE.Vector3()
            self.object3d.getWorldPosition(targetPos)
            this.instance.position.copy(targetPos).add(this.offset)
            this.instance.lookAt(targetPos)
          }
        }

        // --- COMPONENT: LIGHT ---
        this.Light = class {
          constructor(type = 'point', color = 0xffffff, intensity = 1) {
            this.light =
              type === 'spot'
                ? new THREE.SpotLight(color, intensity)
                : new THREE.PointLight(color, intensity)

            // ВАЖЛИВО: додаємо світло в глобальну сцену, а не в групу сутності
            engine.scene.add(this.light)

            // Синхронізуємо позицію світла з позицією сутності один раз
            this.light.position.copy(self.object3d.position)

            self.components.light = this
          }

          // Додамо метод для оновлення позиції, якщо раптом треба рухати світло
          updatePosition() {
            this.light.position.copy(self.object3d.position)
          }
        }

        // SENSOR / MEASUREMENT: raycast forward from entity using Three -> Cannon conversion
        this.raycastForward = (range = 100) => {
          const origin = new THREE.Vector3()
          self.object3d.getWorldPosition(origin)

          // forward direction in world space
          const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(self.object3d.quaternion).normalize()

          // convert to CANNON vectors
          const from = new CANNON.Vec3(origin.x, origin.y, origin.z)
          const to = new CANNON.Vec3(origin.x + dir.x * range, origin.y + dir.y * range, origin.z + dir.z * range)

          const result = new CANNON.RaycastResult()
          engine.world.raycastClosest(from, to, {}, result)

          if (!result.hasHit) return null

          // compute distance from origin to hit point
          const hp = result.hitPointWorld || result.hitPoint || null
          if (!hp) return null
          const dx = hp.x - from.x
          const dy = hp.y - from.y
          const dz = hp.z - from.z
          return Math.sqrt(dx * dx + dy * dy + dz * dz)
        }

        engine.entities.push(this)
      }
    }
  }

  // ВНУТРІШНІ МЕТОДИ (Helpers)
  _setupSystemEvents() {
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.code] = true
      // small debug trace for input issues
      if (typeof console !== 'undefined' && console.debug) console.debug('[Engine] keydown', e.code)
      // show WASD presses in UI for quick verification
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        try {
          this.UI.log(`[input] keydown ${e.code}`)
        } catch (err) {}
      }
    })
    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false
      if (typeof console !== 'undefined' && console.debug) console.debug('[Engine] keyup', e.code)
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        try {
          this.UI.log(`[input] keyup ${e.code}`)
        } catch (err) {}
      }
    })
    window.addEventListener('mousemove', (e) => {
      this.input.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      this.input.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    })
    // Clear keys when window loses focus to avoid stuck keys
    window.addEventListener('blur', () => {
      this.input.keys = {}
    })
  }

  _createGeometry(figure) {
    const d = {
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(0.5, 32, 32),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      cone: new THREE.ConeGeometry(0.5, 1, 32),
      torus: new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      pyramid: new THREE.ConeGeometry(0.5, 1, 4),
      hexagon: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
      hemisphere: new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    }
    return d[figure] || d['box']
  }

  _createPhysicsShape(figure, scale) {
    if (figure === 'sphere') return new CANNON.Sphere(scale.x * 0.5)
    if (figure === 'cylinder') return new CANNON.Cylinder(scale.x * 0.5, scale.x * 0.5, scale.y, 16)
    return new CANNON.Box(new CANNON.Vec3(scale.x / 2, scale.y / 2, scale.z / 2))
  }

  // PUBLIC API
  onUpdate(fn) {
    this.updateCallbacks.push(fn)
  }

  // Convenience: stable isKeyDown method to query input state
  isKeyDown(code) {
    return this.input.keys[code] || false
  }

  UI = {
    set: (key, val) => {
      this.UIStore.modules[key] = val
    },
    log: (msg) => {
      this.UIStore.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
      if (this.UIStore.logs.length > 10) this.UIStore.logs.shift()
    },
    updateChart: (key, val) => {
      if (!this.UIStore.modules[key]) this.UIStore.modules[key] = []
      this.UIStore.modules[key].push(val)
      if (this.UIStore.modules[key].length > 60) this.UIStore.modules[key].shift()
    },
  }

  init(container) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    // Enable shadow map for nicer lighting when directional lights are used
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)
    this.animate()
  }

  animate() {
    if (this.isPaused) return
    requestAnimationFrame(() => this.animate())

    const delta = this.clock.getDelta()
    this.world.step(1 / 60)

    // Скрипти користувача
    this.updateCallbacks.forEach((cb) => cb(delta))

    // Синхронізація об'єктів
    this.entities.forEach((e) => {
      if (e.components.rigidbody) {
        const rb = e.components.rigidbody
        e.object3d.position.copy(rb.body.position)
        e.object3d.quaternion.copy(rb.body.quaternion)

        // Аеродинаміка
        const v = rb.body.velocity
        v.scale(1 - rb.drag * 0.012, v)
      }
      if (e.components.camera) e.components.camera.update()
    })

    // Only render when renderer and activeCamera are available
    if (this.renderer && this.activeCamera) {
      try {
        this.renderer.render(this.scene, this.activeCamera)
      } catch (err) {
        // Log and swallow render errors to avoid noisy pageErrors
        try {
          this.UI.log(`render error: ${err?.message || err}`)
        } catch (e) {}
      }
    }
  }

  stop() {
    // Pause the loop while we clear scene and physics
    this.isPaused = true
    this.entities = []
    this.updateCallbacks = []
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0])
    }
    // Clear physics world bodies to avoid duplicates on re-init
    if (this.world && Array.isArray(this.world.bodies)) {
      for (let i = this.world.bodies.length - 1; i >= 0; i--) {
        try {
          this.world.removeBody(this.world.bodies[i])
        } catch (err) {}
      }
    }

    // Resume animation loop so new missions can run immediately (only if renderer exists)
    this.isPaused = false
    if (this.renderer) this.animate()
  }
}

export const engine = new MasterEngine()
