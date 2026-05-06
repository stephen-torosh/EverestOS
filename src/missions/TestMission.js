import { engine } from '@/utils/masterEngine'
import * as THREE from 'three'

export const startTestMission = () => {
  // 1. АТМОСФЕРА — Робимо її світлішою (Яскравий помаранчевий)
  engine.scene.background = new THREE.Color(0xd67b2d)
  engine.scene.fog = new THREE.FogExp2(0xd67b2d, 0.005)

  // 2. СОНЦЕ — Піднімаємо інтенсивність, щоб "пробити" туман
  const sun = new engine.Entity('BrightSun')
  const sunLight = new THREE.DirectionalLight(0xffccaa, 4) // Дуже яскраве
  sunLight.position.set(-200, 100, -400)
  sun.object3d.add(sunLight)

  // Додаємо Ambient, щоб тіні не були абсолютно чорними
  const ambient = new THREE.AmbientLight(0xff7733, 0.5)
  engine.scene.add(ambient)

  // 3. ПІДЛОГА (Світло-рудий пісок)
  const floor = new engine.Entity('RedDesert')
  new floor.MeshRenderer([
    {
      figure: 'box',
      position: { x: 0, y: -5, z: 0 },
      scale: { x: 4000, y: 1, z: 4000 },
      rotation: { x: 0, y: 0, z: 0 },
      material: { color: 0xc4501e, roughness: 1 },
    },
  ])

  // 4. ГЕНЕРАЦІЯ "Стовпів" (Тонкі скелі вдалині)
  const createPillar = (name, x, z, h) => {
    const pillar = new engine.Entity(name)
    new pillar.MeshRenderer([
      {
        figure: 'cylinder', // Або 'hexagon'
        position: { x: 0, y: h / 2, z: 0 },
        rotation: { x: 0, y: Math.random() * 3, z: 0 },
        scale: { x: 2, y: h, z: 2 }, // Дуже тонкі
        material: { color: 0x8a3a16, roughness: 1 },
      },
    ])
    pillar.transform.setPosition(x, -5, z)
  }

  // Розкидаємо багато тонких скель по всьому горизонту
  for (let i = 0; i < 60; i++) {
    const x = (Math.random() - 0.5) * 1200
    const z = -200 - Math.random() * 1500
    createPillar(`Pillar_${i}`, x, z, 20 + Math.random() * 60)
  }

  // 5. ДЕТАЛІЗАЦІЯ ПІСКУ (Плоскі камінці як на фото)
  for (let i = 0; i < 80; i++) {
    const rock = new engine.Entity(`Debris_${i}`)
    new rock.MeshRenderer([
      {
        figure: 'box',
        position: { x: 0, y: 0, z: 0 },
        scale: { x: 2 + Math.random() * 4, y: 0.2, z: 2 + Math.random() * 4 },
        rotation: { x: 0, y: Math.random() * 360, z: 0 },
        material: { color: 0x4d1f0c, roughness: 1 },
      },
    ])
    // Рандомно розкидаємо перед камерою
    rock.transform.setPosition((Math.random() - 0.5) * 300, -4.9, 150 - Math.random() * 400)
  }

  // 6. КУПОЛ (Трохи прозоріший)
  const dome = new engine.Entity('MainBase')
  const domeGeo = new THREE.SphereGeometry(25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  const domeMat = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.1,
    metalness: 0.9,
  })
  dome.object3d.add(new THREE.Mesh(domeGeo, domeMat))
  dome.transform.setPosition(0, -5, -80)

  // 7. КАМЕРА
  const camEnt = new engine.Entity('FinalCam')
  const camComp = new camEnt.Camera(40)
  camComp.offset.set(0, 0, 0)

  engine.onUpdate(() => {
    if (camComp.instance) {
      camComp.instance.position.set(0, 8, 200)
      camComp.instance.lookAt(0, 10, -300)
    }
  })

  engine.UI.log('✨ Атмосферна корекція завершена. Марс у зеніті.')
}
