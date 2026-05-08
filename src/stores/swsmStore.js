import { defineStore } from 'pinia'

export const useSwsmStore = defineStore('swsm', {
  state: () => ({
    // --- ЕТАПИ (Chapters) ---
    chapters: [
      { id: 'ch_1', title: 'Тіні минулого', order: 1 },
      { id: 'ch_2', title: 'Прорив у безодню', order: 2 }
    ],

    // --- СВІТИ (Worlds) ---
    worlds: [
      // Етап 1
      { id: 'earth', chapterId: 'ch_1', name: 'Земля: Сектор 7', planet: 'Earth' },
      { id: 'mars_outpost', chapterId: 'ch_1', name: 'Марс: Станція "Арес"', planet: 'Mars' },
      { id: 'moon_dark', chapterId: 'ch_1', name: 'Місяць: Темна сторона', planet: 'Moon' },
      // Етап 2
      { id: 'europa_ocean', chapterId: 'ch_2', name: 'Європа: Крижаний океан', planet: 'Jupiter' },
      { id: 'titan_refinery', chapterId: 'ch_2', name: 'Титан: Метанові заводи', planet: 'Saturn' }
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
      { id: 'sec_mars_comm', worldId: 'mars_outpost', name: 'Радіощогла' }
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
      { id: 'm_mars_8', sectionId: 'sec_mars_main', title: 'Евакуація', desc: 'Підготуйте план на випадок розгерметизації.' }
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