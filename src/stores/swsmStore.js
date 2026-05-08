import { defineStore } from 'pinia'

export const useSwsmStore = defineStore('swsm', {
  state: () => ({
    // --- ЕТАПИ (Chapters) ---
    chapters: [
      {
        id: 'ch_1',
        title: 'Етап I: Земна система',
        order: 1,
        locationLabel: 'Земля • Орбіта • Місяць',
        mapX: 28,
        mapY: 58,
      },
      {
        id: 'ch_2',
        title: 'Етап II: Марсіанський фронтир',
        order: 2,
        locationLabel: 'Марс • Тераформінг',
        mapX: 54,
        mapY: 36,
      },
      {
        id: 'ch_3',
        title: 'Етап III: Зовнішня експансія',
        order: 3,
        locationLabel: 'Юпітер • Сатурн',
        mapX: 78,
        mapY: 62,
      },
    ],

    // --- СВІТИ (Worlds) ---
    worlds: [
      // Етап 1
      {
        id: 'earth',
        chapterId: 'ch_1',
        name: 'Місто на Землі',
        planet: 'Earth',
        mapBody: 'earth',
        locationLabel: 'Поверхня Землі',
        locationType: 'surface',
        orbitalBand: 1,
        orbitalAngle: 205,
        mapTag: 'EZ',
      },
      {
        id: 'earth_orbit',
        chapterId: 'ch_1',
        name: 'Великі орбітальні конструкції',
        planet: 'Earth Orbit',
        mapBody: 'earth',
        locationLabel: 'Низька орбіта Землі',
        locationType: 'orbit',
        orbitalBand: 2,
        orbitalAngle: 270,
        mapTag: 'EO',
      },
      {
        id: 'moon_colonies',
        chapterId: 'ch_1',
        name: 'Колонії Місяця',
        planet: 'Moon',
        mapBody: 'moon',
        locationLabel: 'Супутник Землі',
        locationType: 'satellite',
        orbitalBand: 3,
        orbitalAngle: 330,
        mapTag: 'MC',
      },
      {
        id: 'moon_dark',
        chapterId: 'ch_1',
        name: 'Місяць: Темна сторона',
        planet: 'Moon',
        mapBody: 'moon',
        locationLabel: 'Зворотний бік Місяця',
        locationType: 'satellite',
        orbitalBand: 3,
        orbitalAngle: 348,
        mapTag: 'MD',
      },
      // Етап 2
      {
        id: 'mars_outpost',
        chapterId: 'ch_2',
        name: 'Марс: Тераформінг форпост',
        planet: 'Mars',
        mapBody: 'mars',
        locationLabel: 'Поверхня Марса',
        locationType: 'surface',
        orbitalBand: 4,
        orbitalAngle: 28,
        mapTag: 'MR',
      },
      // Етап 3
      {
        id: 'europa_ocean',
        chapterId: 'ch_3',
        name: 'Європа: Крижаний океан',
        planet: 'Jupiter',
        mapBody: 'jupiter',
        locationLabel: 'Орбіта Юпітера',
        locationType: 'orbit',
        orbitalBand: 5,
        orbitalAngle: 118,
        mapTag: 'EU',
      },
      {
        id: 'titan_refinery',
        chapterId: 'ch_3',
        name: 'Титан: Метанові заводи',
        planet: 'Saturn',
        mapBody: 'saturn',
        locationLabel: 'Орбіта Сатурна',
        locationType: 'orbit',
        orbitalBand: 6,
        orbitalAngle: 158,
        mapTag: 'TT',
      },
    ],

    // --- СЕКЦІЇ (Sections) ---
    sections: [
      // Земля (Сектор 7)
      { id: 'sec_earth_hub', worldId: 'earth', name: 'Центральний хаб' },
      { id: 'sec_earth_mines', worldId: 'earth', name: 'Занедбані шахти' },
      { id: 'sec_earth_lab', worldId: 'earth', name: 'Секретна лабораторія' },
      { id: 'sec_earth_ruins', worldId: 'earth', name: 'Руїни мегаполіса' },
      { id: 'sec_earth_dock', worldId: 'earth', name: 'Космопорт' },

      // Марс (Станція Арес)
      { id: 'sec_mars_main', worldId: 'mars_outpost', name: 'Головний купол' },
      { id: 'sec_mars_bio', worldId: 'mars_outpost', name: 'Біосферний відсік' },
      { id: 'sec_mars_power', worldId: 'mars_outpost', name: 'Реакторна зона' },
      { id: 'sec_mars_canyon', worldId: 'mars_outpost', name: 'Червоний каньйон' },
      { id: 'sec_mars_comm', worldId: 'mars_outpost', name: 'Радіощогла' },

      // Земна орбіта
      { id: 'sec_orbit_hub', worldId: 'earth_orbit', name: 'Орбітальний хаб' },
      { id: 'sec_orbit_ring', worldId: 'earth_orbit', name: 'Кільцева ферма' },

      // Місячні світи
      { id: 'sec_moon_colony', worldId: 'moon_colonies', name: 'Купольне місто' },
      { id: 'sec_moon_darkside', worldId: 'moon_dark', name: 'Тіньовий масив' },

      // Зовнішня експансія
      { id: 'sec_europa_base', worldId: 'europa_ocean', name: 'Підлідний шлюз' },
      { id: 'sec_titan_port', worldId: 'titan_refinery', name: 'Метановий порт' },
    ],

    // --- МІСІЇ (Missions) ---
    missions: [
      // ЗЕМЛЯ: Центральний хаб
      { id: 'm_e_h_1', sectionId: 'sec_earth_hub', title: 'Перевірка систем', desc: 'Діагностика головного комп\'ютера.' },
      { id: 'm_e_h_2', sectionId: 'sec_earth_hub', title: 'Відновлення зв\'язку', desc: 'Налаштуйте антени на даху.' },
      { id: 'm_e_h_3', sectionId: 'sec_earth_hub', title: 'Енергопостачання', desc: 'Замініть старі запобіжники.' },
      { id: 'm_e_h_4', sectionId: 'sec_earth_hub', title: 'Інвентаризація', desc: 'Перевірте запаси на складі.' },
      { id: 'm_e_h_5', sectionId: 'sec_earth_hub', title: 'Охорона', desc: 'Встановіть камери спостереження.' },
      { id: 'm_e_h_6', sectionId: 'sec_earth_hub', title: 'Протокол безпеки', desc: 'Активуйте турелі периметра.' },
      { id: 'm_e_h_7', sectionId: 'sec_earth_hub', title: 'Перший контакт', desc: 'Отримайте зашифрований сигнал.' },
      { id: 'm_e_h_8', sectionId: 'sec_earth_hub', title: 'Брифінг', desc: 'Зустріч з командором сектора.' },

      // ЗЕМЛЯ: Занедбані шахти
      { id: 'm_e_m_1', sectionId: 'sec_earth_mines', title: 'Спуск у глибину', desc: 'Відремонтуйте вантажний ліфт.' },
      { id: 'm_e_m_2', sectionId: 'sec_earth_mines', title: 'Видобуток літію', desc: 'Зберіть кристали для батарей.' },
      { id: 'm_e_m_3', sectionId: 'sec_earth_mines', title: 'Зачистка тунелів', desc: 'Усуньте загрозу в нижніх ярусах.' },
      { id: 'm_e_m_4', sectionId: 'sec_earth_mines', title: 'Вентиляція', desc: 'Запустіть очищувачі повітря.' },
      { id: 'm_e_m_5', sectionId: 'sec_earth_mines', title: 'Георозвідка', desc: 'Скануйте стіни на наявність руди.' },
      { id: 'm_e_m_6', sectionId: 'sec_earth_mines', title: 'Пошук зниклих', desc: 'Знайдіть групу шахтарів.' },
      { id: 'm_e_m_7', sectionId: 'sec_earth_mines', title: 'Детонація', desc: 'Пробийте шлях через завал.' },
      { id: 'm_e_m_8', sectionId: 'sec_earth_mines', title: 'Серце шахти', desc: 'Активуйте стародавній бур.' },

      // МАРС: Головний купол
      { id: 'm_mars_1', sectionId: 'sec_mars_main', title: 'Герметизація', desc: 'Усуньте витік кисню.' },
      { id: 'm_mars_2', sectionId: 'sec_mars_main', title: 'Пилова буря', desc: 'Укріпіть зовнішні щити.' },
      { id: 'm_mars_3', sectionId: 'sec_mars_main', title: 'Водопостачання', desc: 'Очистіть марсіанський лід.' },
      { id: 'm_mars_4', sectionId: 'sec_mars_main', title: 'Гідропоніка', desc: 'Висадіть першу партію картоплі.' },
      { id: 'm_mars_5', sectionId: 'sec_mars_main', title: 'Лабораторний аналіз', desc: 'Дослідіть зразки ґрунту.' },
      { id: 'm_mars_6', sectionId: 'sec_mars_main', title: 'Ровер', desc: 'Підготуйте транспорт до виїзду.' },
      { id: 'm_mars_7', sectionId: 'sec_mars_main', title: 'Сонячні панелі', desc: 'Очистіть панелі від піску.' },
      { id: 'm_mars_8', sectionId: 'sec_mars_main', title: 'Евакуація', desc: 'Підготуйте план на випадок розгерметизації.' },

      // Земна орбіта
      { id: 'm_orbit_1', sectionId: 'sec_orbit_hub', title: 'Стабілізація гіроскопів', desc: 'Синхронізуйте орбітальні кільця.' },
      { id: 'm_orbit_2', sectionId: 'sec_orbit_ring', title: 'Монтаж секції', desc: 'Розгорніть новий конструкційний модуль.' },

      // Місяць
      { id: 'm_moon_1', sectionId: 'sec_moon_colony', title: 'Підтримка купола', desc: 'Вирівняйте тиск у житловому блоці.' },
      { id: 'm_moon_2', sectionId: 'sec_moon_darkside', title: 'Тіньовий ретранслятор', desc: 'Поверніть звʼязок із зворотного боку.' },

      // Зовнішня експансія
      { id: 'm_europa_1', sectionId: 'sec_europa_base', title: 'Лід-скан', desc: 'Проскануйте шари підлідного океану.' },
      { id: 'm_titan_1', sectionId: 'sec_titan_port', title: 'Метановий контур', desc: 'Відкалібруйте переробний контур.' },
    ],

    activeWorldId: 'earth',
    activeSectionId: 'sec_earth_hub'
  }),
  
  getters: {
    currentWorld: (state) => state.worlds.find(w => w.id === state.activeWorldId),
    
    // Фільтруємо секції для поточного світу
    currentSections: (state) => state.sections.filter(s => s.worldId === state.activeWorldId),
    
    // Фільтруємо місії для обраної секції
    activeMissions: (state) => state.missions.filter(m => m.sectionId === state.activeSectionId)
  }
})
