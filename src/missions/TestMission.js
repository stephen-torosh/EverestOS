import { engine } from '@/utils/masterEngine'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// Minimal scene: only an autonomous car (chassis + 4 visual wheels),
// a directional sun, a hidden ground physics body, and a follow camera.
export const startTestMission = () => {
  // Clear any previous scene
  engine.stop()

  // Atmosphere (dark neutral)
  engine.scene.background = new THREE.Color(0x071428)
  engine.scene.fog = new THREE.FogExp2(0x071428, 0.0025)

  // Directional sun
  const sunLight = new THREE.DirectionalLight(0xfff1d6, 2.2)
  sunLight.position.set(120, 200, 80)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 1024
  sunLight.shadow.mapSize.height = 1024
  engine.scene.add(sunLight)

  // Hidden ground (physics only) so car has something to drive on
  const groundBody = new CANNON.Body({ mass: 0 })
  groundBody.addShape(new CANNON.Box(new CANNON.Vec3(200, 1, 200)))
  groundBody.position.set(0, -2.5, 0)
  engine.world.addBody(groundBody)

  // Autonomous car entity (chassis + visual wheels)
  const car = new engine.Entity('AutoCar')
  new car.MeshRenderer([
    // chassis
    {
      figure: 'box',
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 4, y: 1.2, z: 6 },
      material: { color: 0x3344cc, roughness: 0.4 },
    },
    // visual wheels (cylinders) - local positions
    { figure: 'cylinder', position: { x: -1.5, y: -0.4, z: -2.6 }, rotation: { x: 90, y: 0, z: 0 }, scale: { x: 0.9, y: 0.5, z: 0.9 }, material: { color: 0x111111, roughness: 1 } },
    { figure: 'cylinder', position: { x: 1.5, y: -0.4, z: -2.6 }, rotation: { x: 90, y: 0, z: 0 }, scale: { x: 0.9, y: 0.5, z: 0.9 }, material: { color: 0x111111, roughness: 1 } },
    { figure: 'cylinder', position: { x: -1.5, y: -0.4, z: 2.6 }, rotation: { x: 90, y: 0, z: 0 }, scale: { x: 0.9, y: 0.5, z: 0.9 }, material: { color: 0x111111, roughness: 1 } },
    { figure: 'cylinder', position: { x: 1.5, y: -0.4, z: 2.6 }, rotation: { x: 90, y: 0, z: 0 }, scale: { x: 0.9, y: 0.5, z: 0.9 }, material: { color: 0x111111, roughness: 1 } },
  ])
  car.transform.setPosition(0, 1.2, 0)

  // Chassis physics body
  const carRB = new car.Rigidbody(250)
  carRB.attachColliderFromMesh()
  carRB.body.position.set(car.object3d.position.x, car.object3d.position.y, car.object3d.position.z)
  carRB.body.linearDamping = 0.7
  carRB.body.angularDamping = 0.9

  // Camera attached to car for a driving view
  const carCamEnt = new engine.Entity('CarCam')
  const carCam = new carCamEnt.Camera(60)
  carCam.offset.set(0, 5, 12)
  carCamEnt.transform.setPosition(0, 0, 0)

  // Simple autonomous driving: move forward and avoid very near obstacles
  const targetSpeed = 6
  const maxPower = 300
  const steerStrength = 4
  const rayRange = 8

  engine.onUpdate((dt) => {
    // sample forward speed
    const pos = new THREE.Vector3()
    car.object3d.getWorldPosition(pos)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(car.object3d.quaternion).normalize()
    const vel = carRB.body.velocity
    const speedForward = vel.x * forward.x + vel.y * forward.y + vel.z * forward.z

    // simple forward ray
    const from = new CANNON.Vec3(pos.x, pos.y + 0.5, pos.z)
    const to = new CANNON.Vec3(pos.x + forward.x * rayRange, pos.y + 0.5 + forward.y * rayRange, pos.z + forward.z * rayRange)
    const res = new CANNON.RaycastResult()
    engine.world.raycastClosest(from, to, {}, res)

    let steer = 0
    let avoid = 0
    if (res.hasHit) {
      avoid = 1
      // if obstacle ahead, try to turn slightly right
      steer = 1
    }

    // throttle
    const need = targetSpeed - speedForward
    const throttle = Math.max(Math.min(need * 5, 1), -0.3)
    carRB.addLocalForce(0, 0, -throttle * maxPower * dt)

    // steering torque
    carRB.addTorque(0, steer * steerStrength * dt, 0)

    // keep camera following car
    carCamEnt.transform.setPosition(pos.x, pos.y, pos.z)
  })

  engine.UI.log('🚗 Car-only scene: chassis + 4 visual wheels (no other visible objects)')
}
