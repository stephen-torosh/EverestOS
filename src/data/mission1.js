import engine from '@/masterEngine.js'

const assets = {
  carbody: [
    {
      figure: 'box',
      position: { x: 0, y: -0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: {
        color: '#ff0000',
        roughness: 0.5,
        transparency: 0,
      },
    },
    {
      figure: 'box',
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.5, y: 0.5, z: 1 },
      material: {
        color: '#2537d8',
        roughness: 0.5,
        transparency: 0.6,
      },
    },
  ],
  wheel: [
    {
      figure: 'cylinder',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 90, y: 0, z: 0 },
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      material: {
        color: '#000000',
        roughness: 1,
        transparency: 0,
      },
    },
  ],
}

// === carbody ===
// initialize all the components
const carbody = new engine.Entity()
const carbodyMesh = new carbody.Mesh()
const carbodyRigidbody = new carbody.Rigidbody()
const _carbodyCollider = new carbody.Collider()
const carbodyTransform = new carbody.Transform()
// set the settings of the components
carbodyMesh.setAsset(assets.carbody)
carbodyRigidbody.setMass(1000)
carbodyTransform.setPosition(transform.position.x, transform.position.y, transform.position.z)
carbodyTransform.setRotation(transform.rotation.x, transform.rotation.y, transform.rotation.z)
carbodyTransform.setScale(transform.scale.x, transform.scale.y, transform.scale.z)

// === wheel 1 ===
// initialize all the components
const wheel1 = new engine.Entity()
const wheelMesh1 = new wheel1.Mesh()
const wheelRigidbody1 = new wheel1.Rigidbody()
const wheelTransform1 = new wheel1.Transform()
// set the settings of the components
wheelMesh1.setAsset(assets.wheel)
wheelRigidbody1.setMass(100)
wheelRigidbody1.attachToParent(carbodyRigidbody)
wheelTransform1.setPosition(-0.75, -0.5, 0.5)
wheelTransform1.setRotation(Math.PI / 2, 0, 0)
wheelTransform1.setScale(0.5, 0.5, 0.5)

// === wheel 2 ===
// initialize all the components
const wheel2 = new engine.Entity()
const wheelMesh2 = new wheel2.Mesh()
const wheelRigidbody2 = new wheel2.Rigidbody()
const wheelTransform2 = new wheel2.Transform()
// set the settings of the components
wheelMesh2.setAsset(assets.wheel)
wheelRigidbody2.setMass(100)
wheelRigidbody2.attachToParent(carbodyRigidbody)
wheelTransform2.setPosition(0.75, -0.5, 0.5)
wheelTransform2.setRotation(Math.PI / 2, 0, 0)
wheelTransform2.setScale(0.5, 0.5, 0.5)

// === wheel 3 ===
// initialize all the components
const wheel3 = new engine.Entity()
const wheelMesh3 = new wheel3.Mesh()
const wheelRigidbody3 = new wheel3.Rigidbody()
const wheelTransform3 = new wheel3.Transform()
// set the settings of the components
wheelMesh3.setAsset(assets.wheel)
wheelRigidbody3.setMass(100)
wheelRigidbody3.attachToParent(carbodyRigidbody)
wheelTransform3.setPosition(-0.75, -0.5, -0.5)
wheelTransform3.setRotation(Math.PI / 2, 0, 0)
wheelTransform3.setScale(0.5, 0.5, 0.5)

// === wheel 4 ===
// initialize all the components
const wheel4 = new engine.Entity()
const wheelMesh4 = new wheel4.Mesh()
const wheelRigidbody4 = new wheel4.Rigidbody()
const wheelTransform4 = new wheel4.Transform()
// set the settings of the components
wheelMesh4.setAsset(assets.wheel)
wheelRigidbody4.setMass(100)
wheelRigidbody4.attachToParent(carbodyRigidbody)
wheelTransform4.setPosition(0.75, -0.5, -0.5)
wheelTransform4.setRotation(Math.PI / 2, 0, 0)
wheelTransform4.setScale(0.5, 0.5, 0.5)

function rotateWheels() {
  const speed = 0.1
  wheelTransform1.rotate(
    wheelTransform1.rotation.x + speed,
    wheelTransform1.rotation.y,
    wheelTransform1.rotation.z,
  )
  wheelTransform2.rotate(
    wheelTransform2.rotation.x + speed,
    wheelTransform2.rotation.y,
    wheelTransform2.rotation.z,
  )
  wheelTransform3.rotate(
    wheelTransform3.rotation.x + speed,
    wheelTransform3.rotation.y,
    wheelTransform3.rotation.z,
  )
  wheelTransform4.rotate(
    wheelTransform4.rotation.x + speed,
    wheelTransform4.rotation.y,
    wheelTransform4.rotation.z,
  )
}

function mainloop() {
  rotateWheels()
}
