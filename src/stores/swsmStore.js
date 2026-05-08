import { defineStore } from 'pinia'

export const useSwsmStore = defineStore('swsm', {
  state: () => ({
    overview: {
      title: 'SWSM Strategic Briefing',
      summary:
        'Stages&Worlds — це стратегічна карта експансії EverestOS, де кожен етап показує новий рівень освоєння Сонячної системи: від стабілізації Землі до глибокої зовнішньої експансії.',
      detail:
        'Тут обʼєднані всі ключові рівні прогресу: етапи задають вектор розселення, світи показують конкретні театри операцій, секції розбивають їх на локальні зони, а місії формують реальні завдання командира. Ідея карти — не просто показати планети, а дати відчуття великої міжпланетної кампанії, де кожен новий світ є окремим науковим та логістичним викликом.',
    },

    chapters: [
      {
        id: 'ch_1',
        title: 'Етап I: Земна система',
        order: 1,
        locationLabel: 'Земля • Орбіта • Місяць',
        mapX: 28,
        mapY: 58,
        summary:
          'Перший етап відродження цивілізації. Земля, орбітальні конструкції та Місяць працюють як єдина індустріальна система, що забезпечує базу для подальших стрибків.',
        objective:
          'Стабілізувати планетарну інфраструктуру, відновити виробництво та побудувати постійний транспортний ланцюг між поверхнею, орбітою і Місяцем.',
        status: 'Operational',
      },
      {
        id: 'ch_2',
        title: 'Етап II: Марсіанський фронтир',
        order: 2,
        locationLabel: 'Марс • Тераформінг',
        mapX: 54,
        mapY: 36,
        summary:
          'Марс стає першим повноцінним зовнішнім форпостом людства. Тут перевіряються системи автономного життєзабезпечення, великі реактори й біосферні комплекси.',
        objective:
          'Перетворити Марс з експериментальної бази на самодостатню колонію, здатну приймати нові хвилі населення і виробляти критичні ресурси.',
        status: 'Expansion',
      },
      {
        id: 'ch_3',
        title: 'Етап III: Зовнішня експансія',
        order: 3,
        locationLabel: 'Юпітер • Сатурн',
        mapX: 78,
        mapY: 62,
        summary:
          'Глибокосистемний рубіж, де людство переходить від виживання до масштабної індустріальної присутності серед супутників газових гігантів.',
        objective:
          'Розгорнути далекі добувні та наукові вузли, забезпечити стабільні маршрути постачання і відкрити шлях до ще дальших міжзоряних програм.',
        status: 'Deep Space',
      },
    ],

    worlds: [
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
        status: 'Core Habitat',
        summary:
          'Головний урбаністичний центр відновленої Землі, де зберігається командна, енергетична та освітня інфраструктура EverestOS.',
        dossier:
          'Місто на Землі — це серце операцій, де зосереджені житлові зони, навчальні комплекси, інженерні хаби та головні пункти координації. Саме звідси керуються локальні місії, розподіляються ресурси й відправляються експедиції на орбіту та за її межі.',
        objective:
          'Підтримувати стабільність ядра колоніальної мережі та забезпечувати безперервну роботу систем звʼязку, енергії й логістики.',
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
        status: 'Shipyard Belt',
        summary:
          'Кільце верфей, доків і промислових ферм, що формують перший справжній космічний мегакомплекс людства.',
        dossier:
          'Орбітальні конструкції обʼєднують станції технічного обслуговування, модульні верфі, великі сонячні ферми та перевантажувальні вузли. Це місце, де будується флот, збираються орбітальні системи та готуються важкі експедиції.',
        objective:
          'Розширювати транспортний коридор навколо Землі й перетворити орбіту на головний виробничий шар цивілізації.',
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
        status: 'Lunar Habitat',
        summary:
          'Мережа купольних поселень, що працюють як науковий полігон і ресурсний плацдарм для всіх дальших польотів.',
        dossier:
          'Колонії Місяця поєднують житлові куполи, гірничі вузли, тестові лабораторії і стартові майданчики для міжпланетних місій. Вони ідеально підходять для відпрацювання замкнених екосистем і важкої позаземної логістики.',
        objective:
          'Нарощувати автономність поселень і використовувати Місяць як головний тренувальний та виробничий рубіж перед Марсом.',
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
        status: 'Shadow Array',
        summary:
          'Прихований технічний сектор, де розгорнуті ретранслятори, телеметричні масиви та довготривалі експерименти без шуму Землі.',
        dossier:
          'Темна сторона Місяця використовується для звʼязкових кластерів, глибоких сканерів, захищених серверних вузлів і експериментів, яким потрібна ізоляція. Це напівсекретний сектор з високим значенням для навігації та наукової розвідки.',
        objective:
          'Підтримувати невидимий інфраструктурний шар місячної програми й гарантувати безпечний звʼязок для всіх дальніх операцій.',
      },
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
        status: 'Terraform Hub',
        summary:
          'Польовий центр марсіанського освоєння, де сходяться купольні міста, реакторні відсіки, біосфери й великі роботи з адаптації середовища.',
        dossier:
          'Форпост на Марсі — це перша планета, яку людство не просто відвідує, а намагається змінити під себе. Тут випробовуються довгі ланцюги автономного виживання, очищення льоду, енергетичні комплекси та системи локального тераформінгу.',
        objective:
          'Закріпити постійну присутність на Марсі, підвищити ресурсну незалежність і перетворити форпост на повноцінну колонію.',
      },
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
        status: 'Research Frontier',
        summary:
          'Глибокий науковий вузол для дослідження підлідних океанів і екстремальних середовищ зовнішньої системи.',
        dossier:
          'Операції біля Європи орієнтовані на глибоке сканування льоду, роботу з автономними підлідними системами та пошук нових форм енергії й біологічної активності. Це один з найнебезпечніших, але й найперспективніших театрів наукового прориву.',
        objective:
          'Відкрити стабільний дослідницький коридор у системі Юпітера та інтегрувати результати у глобальну наукову програму EverestOS.',
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
        status: 'Industrial Extractor',
        summary:
          'Промислова зона далекої експансії, де добуваються й переробляються хімічні ресурси для важкої міжпланетної економіки.',
        dossier:
          'Титанські метанові комплекси працюють як головний енергетичний та хімічний резервуар зовнішньої системи. Тут формується новий тип колоніальної індустрії — масштабний, повільний, але надзвичайно вигідний для дальніх польотів і мегапроєктів.',
        objective:
          'Закласти основу для автономної індустріальної мережі зовнішньої системи та підготувати постачання для ще дальших рубежів.',
      },
      {
        id: 'earth_oceans',
        chapterId: 'ch_1',
        name: 'Земля: Океанічні платформи',
        planet: 'Earth',
        mapBody: 'earth',
        locationLabel: 'Світовий океан Землі',
        locationType: 'surface',
        orbitalBand: 1,
        orbitalAngle: 150,
        mapTag: 'OC',
        status: 'Blue Logistics',
        summary:
          'Мережа плавучих мегаплатформ, що підтримують аграрне виробництво, опріснення води й мобільні енергетичні вузли для наземних міст.',
        dossier:
          'Океанічні платформи формують гнучкий тиловий шар Землі. Вони виробляють паливо, воду, біомасу та резервні матеріали, а також слугують безпечними хабами для випробування морських автономних систем.',
        objective:
          'Зробити океанічну інфраструктуру стабільним резервом для наземних мегаполісів і джерелом надлишкових ресурсів для орбіти.',
      },
      {
        id: 'geo_arcology',
        chapterId: 'ch_1',
        name: 'Геостаціонарна аркологія',
        planet: 'Earth Orbit',
        mapBody: 'earth',
        locationLabel: 'Висока орбіта Землі',
        locationType: 'orbit',
        orbitalBand: 3,
        orbitalAngle: 112,
        mapTag: 'GA',
        status: 'Civic Ring',
        summary:
          'Великий житлово-адміністративний кластер на високій орбіті, де поєднані дипломатія, архіви, освіта й цивільне життя поза атмосферою.',
        dossier:
          'Аркологія працює як вітрина нової цивілізації EverestOS: тут живуть фахівці, навчаються кадети, збираються стратегічні ради та підтримуються центральні архіви технологій.',
        objective:
          'Перенести частину цивільного ядра людства в космос і зменшити навантаження на наземні мегаполіси.',
      },
      {
        id: 'l1_gateway',
        chapterId: 'ch_1',
        name: 'Вузол L1 Gateway',
        planet: 'Earth Orbit',
        mapBody: 'earth',
        locationLabel: 'Точка переходу Земля - Місяць',
        locationType: 'orbit',
        orbitalBand: 4,
        orbitalAngle: 24,
        mapTag: 'L1',
        status: 'Transfer Nexus',
        summary:
          'Перехідний вузол між земною орбітою та місячними трасами, де стикуються вантажні каравани, пасажирські шатли і навігаційні мережі.',
        dossier:
          'L1 Gateway зменшує логістичну напругу всієї земно-місячної системи. Тут проводяться стиковки, митні перевірки, дозаправка та швидкий перерозподіл колоніальних ресурсів.',
        objective:
          'Стандартизувати транспортний потік між Землею та Місяцем і прибрати вузькі місця з орбітальної логістики.',
      },
      {
        id: 'lunar_poles',
        chapterId: 'ch_1',
        name: 'Місяць: Полярні шахти',
        planet: 'Moon',
        mapBody: 'moon',
        locationLabel: 'Полярні кратери Місяця',
        locationType: 'surface',
        orbitalBand: 2,
        orbitalAngle: 56,
        mapTag: 'LP',
        status: 'Ice Reserve',
        summary:
          'Промисловий сектор у тіньових кратерах, де добуваються лід, рідкісні метали та будівельний реголіт для дальніх програм.',
        dossier:
          'Полярні шахти Місяця мають критичне значення для виробництва води, палива та теплоізоляційних матеріалів. Це один із найважливіших ресурсних театрів усього першого етапу.',
        objective:
          'Забезпечити земно-місячну систему стабільними ресурсами без залежності від наземного імпорту.',
      },
      {
        id: 'valles_station',
        chapterId: 'ch_2',
        name: 'Марс: Valles Station',
        planet: 'Mars',
        mapBody: 'mars',
        locationLabel: 'Система каньйонів Марса',
        locationType: 'surface',
        orbitalBand: 4,
        orbitalAngle: 82,
        mapTag: 'VS',
        status: 'Canyon Link',
        summary:
          'Транспортно-промисловий вузол у зоні великих каньйонів, що зʼєднує віддалені поселення Марса в єдину сухопутну мережу.',
        dossier:
          'Valles Station обслуговує магістралі, вантажні ровери, ремонтні доки та локальні заводи. Саме звідси формується довгий сухопутний ланцюг, який тримає разом розпорошені марсіанські колонії.',
        objective:
          'Перетворити марсіанську поверхню на звʼязану інфраструктурну сітку, а не набір ізольованих аванпостів.',
      },
      {
        id: 'phobos_yard',
        chapterId: 'ch_2',
        name: 'Фобос: Штурмові верфі',
        planet: 'Mars',
        mapBody: 'mars',
        locationLabel: 'Орбіта Марса',
        locationType: 'satellite',
        orbitalBand: 5,
        orbitalAngle: 334,
        mapTag: 'PH',
        status: 'Assault Dock',
        summary:
          'Передова орбітальна верф біля Марса, де збираються важкі транспортники, буксири та далекі розвідувальні модулі.',
        dossier:
          'Фобос зручний як природний опорний пункт для монтажу, захисту та запуску важких кораблів. Верфі тут працюють у звʼязці з марсіанським форпостом і забезпечують зовнішній фронтир технікою.',
        objective:
          'Винести виробництво далекого флоту на марсіанський рівень і зменшити залежність від земних верфей.',
      },
      {
        id: 'mars_icefront',
        chapterId: 'ch_2',
        name: 'Марс: Крижаний фронт',
        planet: 'Mars',
        mapBody: 'mars',
        locationLabel: 'Полярна зона Марса',
        locationType: 'surface',
        orbitalBand: 5,
        orbitalAngle: 146,
        mapTag: 'IF',
        status: 'Cryo Frontier',
        summary:
          'Північний ресурсний рубіж, орієнтований на видобуток льоду, кріохімію та експериментальне довгострокове зберігання ресурсів.',
        dossier:
          'Крижаний фронт дає Марсу доступ до великих запасів води, газів та холодових виробничих процесів. Це важкий, але стратегічно вирішальний сектор для автономності колонії.',
        objective:
          'Закріпити контроль над полярними ресурсами й забезпечити колонію водою та кріогенним паливом.',
      },
      {
        id: 'ganymede_forge',
        chapterId: 'ch_3',
        name: 'Ганімед: Велика кузня',
        planet: 'Jupiter',
        mapBody: 'jupiter',
        locationLabel: 'Система Юпітера',
        locationType: 'satellite',
        orbitalBand: 6,
        orbitalAngle: 72,
        mapTag: 'GF',
        status: 'Heavy Foundry',
        summary:
          'Індустріальний центр важкої металургії та конструкцій для проєктів зовнішньої системи.',
        dossier:
          'Ганімедська кузня створена для роботи з великими обсягами руди, льоду й сплавів. Тут збирають секції станцій, магістральні вузли та захищені контейнери для наддалеких експедицій.',
        objective:
          'Дати зовнішній системі власну металургійну базу і масштабне виробництво поза земно-марсіанським ядром.',
      },
      {
        id: 'callisto_anchor',
        chapterId: 'ch_3',
        name: 'Каллісто: Якірний порт',
        planet: 'Jupiter',
        mapBody: 'jupiter',
        locationLabel: 'Дальня орбіта Юпітера',
        locationType: 'satellite',
        orbitalBand: 7,
        orbitalAngle: 152,
        mapTag: 'CA',
        status: 'Relay Anchorage',
        summary:
          'Далекий порт відпочинку, ремонту й карантинної ізоляції для екіпажів, що працюють біля Юпітера.',
        dossier:
          'Каллісто обрано як відносно безпечний тиловий опорний пункт у системі Юпітера. Тут проходять довгі цикли обслуговування, медичний контроль та реорганізація експедицій.',
        objective:
          'Створити стійкий тил для юпітеріанських операцій і знизити ризики від радіаційного середовища внутрішніх орбіт.',
      },
      {
        id: 'enceladus_lab',
        chapterId: 'ch_3',
        name: 'Енцелад: Кріолабораторії',
        planet: 'Saturn',
        mapBody: 'saturn',
        locationLabel: 'Система Сатурна',
        locationType: 'satellite',
        orbitalBand: 7,
        orbitalAngle: 214,
        mapTag: 'EL',
        status: 'Cryo Science',
        summary:
          'Науковий комплекс у зоні крижаних викидів, присвячений екстремальній біології, хімії та пошуку придатних для життя середовищ.',
        dossier:
          'Енцеладські лабораторії працюють біля гейзерів, де можна збирати матеріал без буріння глибоких шарів. Це один з найцінніших обʼєктів зовнішньої науки.',
        objective:
          'Максимально використати унікальні умови Енцелада для прориву в кріобіології та глибокій хімії.',
      },
      {
        id: 'ring_habitat',
        chapterId: 'ch_3',
        name: 'Сатурн: Кільцевий пояс',
        planet: 'Saturn',
        mapBody: 'saturn',
        locationLabel: 'Кільця Сатурна',
        locationType: 'orbit',
        orbitalBand: 5,
        orbitalAngle: 108,
        mapTag: 'RB',
        status: 'Civil Belt',
        summary:
          'Ланцюг цивільних станцій і торгових вузлів, що підтримують повсякденне життя у великій далекій колоніальній економіці.',
        dossier:
          'Кільцевий пояс поєднує ринки, ремонтні доки, житлові модулі, дослідні осередки й легку промисловість. Це не фронтир, а вже ознака справжнього заселення зовнішньої системи.',
        objective:
          'Перетворити сатурніанський сектор з набору окремих баз на повноцінний цивільний регіон.',
      },
    ],

    sections: [
      { id: 'sec_earth_hub', worldId: 'earth', name: 'Центральний хаб' },
      { id: 'sec_earth_mines', worldId: 'earth', name: 'Занедбані шахти' },
      { id: 'sec_earth_lab', worldId: 'earth', name: 'Секретна лабораторія' },
      { id: 'sec_earth_ruins', worldId: 'earth', name: 'Руїни мегаполіса' },
      { id: 'sec_earth_dock', worldId: 'earth', name: 'Космопорт' },

      { id: 'sec_mars_main', worldId: 'mars_outpost', name: 'Головний купол' },
      { id: 'sec_mars_bio', worldId: 'mars_outpost', name: 'Біосферний відсік' },
      { id: 'sec_mars_power', worldId: 'mars_outpost', name: 'Реакторна зона' },
      { id: 'sec_mars_canyon', worldId: 'mars_outpost', name: 'Червоний каньйон' },
      { id: 'sec_mars_comm', worldId: 'mars_outpost', name: 'Радіощогла' },

      { id: 'sec_orbit_hub', worldId: 'earth_orbit', name: 'Орбітальний хаб' },
      { id: 'sec_orbit_ring', worldId: 'earth_orbit', name: 'Кільцева ферма' },

      { id: 'sec_moon_colony', worldId: 'moon_colonies', name: 'Купольне місто' },
      { id: 'sec_moon_darkside', worldId: 'moon_dark', name: 'Тіньовий масив' },

      { id: 'sec_europa_base', worldId: 'europa_ocean', name: 'Підлідний шлюз' },
      { id: 'sec_titan_port', worldId: 'titan_refinery', name: 'Метановий порт' },
      { id: 'sec_moon_dark_array', worldId: 'moon_dark', name: 'Радіотиша' },
      { id: 'sec_europa_probe', worldId: 'europa_ocean', name: 'Глибокий зонд' },
      { id: 'sec_titan_hab', worldId: 'titan_refinery', name: 'Житловий купол' },

      { id: 'sec_ocean_port', worldId: 'earth_oceans', name: 'Плавучий порт' },
      { id: 'sec_ocean_array', worldId: 'earth_oceans', name: 'Опріснювальний масив' },

      { id: 'sec_geo_hab', worldId: 'geo_arcology', name: 'Житловий сплайн' },
      { id: 'sec_geo_docks', worldId: 'geo_arcology', name: 'Верхні доки' },
      { id: 'sec_geo_shield', worldId: 'geo_arcology', name: 'Щитовий контур' },

      { id: 'sec_l1_customs', worldId: 'l1_gateway', name: 'Митний перехід' },
      { id: 'sec_l1_bridge', worldId: 'l1_gateway', name: 'Транспортний міст' },

      { id: 'sec_pole_mines', worldId: 'lunar_poles', name: 'Крижана шахта' },
      { id: 'sec_pole_cryo', worldId: 'lunar_poles', name: 'Кріосховище' },

      { id: 'sec_valles_transit', worldId: 'valles_station', name: 'Транзитний двір' },
      { id: 'sec_valles_foundry', worldId: 'valles_station', name: 'Каньйонна ливарня' },

      { id: 'sec_phobos_drydock', worldId: 'phobos_yard', name: 'Сухий док' },
      { id: 'sec_phobos_magrail', worldId: 'phobos_yard', name: 'Магрейл катапульта' },

      { id: 'sec_icefront_drills', worldId: 'mars_icefront', name: 'Полярні бурові' },
      { id: 'sec_icefront_greenhouse', worldId: 'mars_icefront', name: 'Холодні теплиці' },

      { id: 'sec_ganymede_smelter', worldId: 'ganymede_forge', name: 'Плавильний вузол' },
      { id: 'sec_ganymede_vault', worldId: 'ganymede_forge', name: 'Склад сплавів' },

      { id: 'sec_callisto_beacons', worldId: 'callisto_anchor', name: 'Маяковий пояс' },
      { id: 'sec_callisto_docks', worldId: 'callisto_anchor', name: 'Дальній порт' },

      { id: 'sec_enceladus_vents', worldId: 'enceladus_lab', name: 'Зона гейзерів' },
      { id: 'sec_enceladus_bio', worldId: 'enceladus_lab', name: 'Біоізолятор' },

      { id: 'sec_ring_spokes', worldId: 'ring_habitat', name: 'Кільцеві спиці' },
      { id: 'sec_ring_exchange', worldId: 'ring_habitat', name: 'Торгова біржа' },
    ],

    missions: [
      { id: 'm_e_h_1', sectionId: 'sec_earth_hub', title: 'Перевірка систем', desc: 'Діагностика головного комп\'ютера.' },
      { id: 'm_e_h_2', sectionId: 'sec_earth_hub', title: 'Відновлення зв\'язку', desc: 'Налаштуйте антени на даху.' },
      { id: 'm_e_h_3', sectionId: 'sec_earth_hub', title: 'Енергопостачання', desc: 'Замініть старі запобіжники.' },
      { id: 'm_e_h_4', sectionId: 'sec_earth_hub', title: 'Інвентаризація', desc: 'Перевірте запаси на складі.' },
      { id: 'm_e_h_5', sectionId: 'sec_earth_hub', title: 'Охорона', desc: 'Встановіть камери спостереження.' },
      { id: 'm_e_h_6', sectionId: 'sec_earth_hub', title: 'Протокол безпеки', desc: 'Активуйте турелі периметра.' },
      { id: 'm_e_h_7', sectionId: 'sec_earth_hub', title: 'Перший контакт', desc: 'Отримайте зашифрований сигнал.' },
      { id: 'm_e_h_8', sectionId: 'sec_earth_hub', title: 'Брифінг', desc: 'Зустріч з командором сектора.' },

      { id: 'm_e_m_1', sectionId: 'sec_earth_mines', title: 'Спуск у глибину', desc: 'Відремонтуйте вантажний ліфт.' },
      { id: 'm_e_m_2', sectionId: 'sec_earth_mines', title: 'Видобуток літію', desc: 'Зберіть кристали для батарей.' },
      { id: 'm_e_m_3', sectionId: 'sec_earth_mines', title: 'Зачистка тунелів', desc: 'Усуньте загрозу в нижніх ярусах.' },
      { id: 'm_e_m_4', sectionId: 'sec_earth_mines', title: 'Вентиляція', desc: 'Запустіть очищувачі повітря.' },
      { id: 'm_e_m_5', sectionId: 'sec_earth_mines', title: 'Георозвідка', desc: 'Скануйте стіни на наявність руди.' },
      { id: 'm_e_m_6', sectionId: 'sec_earth_mines', title: 'Пошук зниклих', desc: 'Знайдіть групу шахтарів.' },
      { id: 'm_e_m_7', sectionId: 'sec_earth_mines', title: 'Детонація', desc: 'Пробийте шлях через завал.' },
      { id: 'm_e_m_8', sectionId: 'sec_earth_mines', title: 'Серце шахти', desc: 'Активуйте стародавній бур.' },

      { id: 'm_mars_1', sectionId: 'sec_mars_main', title: 'Герметизація', desc: 'Усуньте витік кисню.' },
      { id: 'm_mars_2', sectionId: 'sec_mars_main', title: 'Пилова буря', desc: 'Укріпіть зовнішні щити.' },
      { id: 'm_mars_3', sectionId: 'sec_mars_main', title: 'Водопостачання', desc: 'Очистіть марсіанський лід.' },
      { id: 'm_mars_4', sectionId: 'sec_mars_main', title: 'Гідропоніка', desc: 'Висадіть першу партію картоплі.' },
      { id: 'm_mars_5', sectionId: 'sec_mars_main', title: 'Лабораторний аналіз', desc: 'Дослідіть зразки ґрунту.' },
      { id: 'm_mars_6', sectionId: 'sec_mars_main', title: 'Ровер', desc: 'Підготуйте транспорт до виїзду.' },
      { id: 'm_mars_7', sectionId: 'sec_mars_main', title: 'Сонячні панелі', desc: 'Очистіть панелі від піску.' },
      { id: 'm_mars_8', sectionId: 'sec_mars_main', title: 'Евакуація', desc: 'Підготуйте план на випадок розгерметизації.' },

      { id: 'm_orbit_1', sectionId: 'sec_orbit_hub', title: 'Стабілізація гіроскопів', desc: 'Синхронізуйте орбітальні кільця.' },
      { id: 'm_orbit_2', sectionId: 'sec_orbit_ring', title: 'Монтаж секції', desc: 'Розгорніть новий конструкційний модуль.' },

      { id: 'm_moon_1', sectionId: 'sec_moon_colony', title: 'Підтримка купола', desc: 'Вирівняйте тиск у житловому блоці.' },
      { id: 'm_moon_2', sectionId: 'sec_moon_darkside', title: 'Тіньовий ретранслятор', desc: 'Поверніть звʼязок із зворотного боку.' },

      { id: 'm_europa_1', sectionId: 'sec_europa_base', title: 'Лід-скан', desc: 'Проскануйте шари підлідного океану.' },
      { id: 'm_titan_1', sectionId: 'sec_titan_port', title: 'Метановий контур', desc: 'Відкалібруйте переробний контур.' },

      { id: 'm_e_lab_1', sectionId: 'sec_earth_lab', title: 'Чистий доступ', desc: 'Відновіть біометричний шлюз лабораторії.' },
      { id: 'm_e_lab_2', sectionId: 'sec_earth_lab', title: 'Архів протоколів', desc: 'Завантажте резерви старих досліджень.' },
      { id: 'm_e_lab_3', sectionId: 'sec_earth_lab', title: 'Стабілізація реактивів', desc: 'Перекалібруйте холодові контейнери.' },
      { id: 'm_e_ruins_1', sectionId: 'sec_earth_ruins', title: 'Карта руїн', desc: 'Прокладіть безпечний маршрут між кварталами.' },
      { id: 'm_e_ruins_2', sectionId: 'sec_earth_ruins', title: 'Пошук архіву', desc: 'Знайдіть сервери довоєнної мережі.' },
      { id: 'm_e_ruins_3', sectionId: 'sec_earth_ruins', title: 'Світло внизу', desc: 'Поверніть живлення у підземний вузол.' },
      { id: 'm_e_dock_1', sectionId: 'sec_earth_dock', title: 'Вікно запуску', desc: 'Підготуйте чергу шатлів до вильоту.' },
      { id: 'm_e_dock_2', sectionId: 'sec_earth_dock', title: 'Розвантаження орбіти', desc: 'Прийміть контейнер з верфей.' },
      { id: 'm_e_dock_3', sectionId: 'sec_earth_dock', title: 'Пасажирський коридор', desc: 'Стабілізуйте трафік евакуаційної лінії.' },

      { id: 'm_mars_bio_1', sectionId: 'sec_mars_bio', title: 'Дерева під куполом', desc: 'Перевірте стан молодих біокуполів.' },
      { id: 'm_mars_bio_2', sectionId: 'sec_mars_bio', title: 'Генетичний каталог', desc: 'Оновіть насіннєвий банк колонії.' },
      { id: 'm_mars_bio_3', sectionId: 'sec_mars_bio', title: 'Кисневий баланс', desc: 'Синхронізуйте ферми водоростей.' },
      { id: 'm_mars_power_1', sectionId: 'sec_mars_power', title: 'Тепловий цикл', desc: 'Відновіть контур охолодження реактора.' },
      { id: 'm_mars_power_2', sectionId: 'sec_mars_power', title: 'Резервна шина', desc: 'Підключіть мобільні акумулятори.' },
      { id: 'm_mars_power_3', sectionId: 'sec_mars_power', title: 'Нічний режим', desc: 'Переналаштуйте навантаження колонії.' },
      { id: 'm_mars_canyon_1', sectionId: 'sec_mars_canyon', title: 'Спуск у каньйон', desc: 'Проведіть розвідку нової тріщини.' },
      { id: 'm_mars_canyon_2', sectionId: 'sec_mars_canyon', title: 'Сейсмічний маяк', desc: 'Встановіть датчики на скельному ребрі.' },
      { id: 'm_mars_canyon_3', sectionId: 'sec_mars_canyon', title: 'Пиловий тунель', desc: 'Очистіть прохід для важкого ровера.' },
      { id: 'm_mars_comm_1', sectionId: 'sec_mars_comm', title: 'Високий канал', desc: 'Вирівняйте головну антену на Землю.' },
      { id: 'm_mars_comm_2', sectionId: 'sec_mars_comm', title: 'Буфер затримки', desc: 'Стисніть пакети для дальнього каналу.' },
      { id: 'm_mars_comm_3', sectionId: 'sec_mars_comm', title: 'Червоний пінг', desc: 'Підтвердіть контакт з орбітальною верфю.' },

      { id: 'm_orbit_hub_2', sectionId: 'sec_orbit_hub', title: 'Суха стиковка', desc: 'Підготуйте док до вантажного модуля.' },
      { id: 'm_orbit_hub_3', sectionId: 'sec_orbit_hub', title: 'План польотів', desc: 'Синхронізуйте чергу до L1 вузла.' },
      { id: 'm_orbit_ring_2', sectionId: 'sec_orbit_ring', title: 'Сонячний масив', desc: 'Розгорніть нову батарейну ферму.' },
      { id: 'm_orbit_ring_3', sectionId: 'sec_orbit_ring', title: 'Тест ферми', desc: 'Запустіть автоматичний цикл вирощування.' },

      { id: 'm_moon_colony_2', sectionId: 'sec_moon_colony', title: 'Прокладка тунелю', desc: 'Зʼєднайте два куполи сервісним рукавом.' },
      { id: 'm_moon_colony_3', sectionId: 'sec_moon_colony', title: 'Місячний клас', desc: 'Підготуйте навчальний модуль для кадетів.' },
      { id: 'm_moon_dark_2', sectionId: 'sec_moon_darkside', title: 'Тихе вікно', desc: 'Проведіть нічне сканування глибокого космосу.' },
      { id: 'm_moon_dark_3', sectionId: 'sec_moon_darkside', title: 'Чорний канал', desc: 'Захистіть резервну лінію звʼязку.' },
      { id: 'm_moon_dark_array_1', sectionId: 'sec_moon_dark_array', title: 'Розклад антен', desc: 'Виставте решітку на нову частоту.' },
      { id: 'm_moon_dark_array_2', sectionId: 'sec_moon_dark_array', title: 'Мертва тиша', desc: 'Відсійте фонові перешкоди Землі.' },

      { id: 'm_europa_2', sectionId: 'sec_europa_base', title: 'Теплий прохід', desc: 'Підігрійте шлюз бурового апарата.' },
      { id: 'm_europa_3', sectionId: 'sec_europa_base', title: 'Пакет зразків', desc: 'Поверніть контейнери з льодової шахти.' },
      { id: 'm_europa_probe_1', sectionId: 'sec_europa_probe', title: 'Спуск зонда', desc: 'Відправте модуль у глибокий канал.' },
      { id: 'm_europa_probe_2', sectionId: 'sec_europa_probe', title: 'Солона вода', desc: 'Зберіть нову серію хімічних даних.' },

      { id: 'm_titan_2', sectionId: 'sec_titan_port', title: 'Газовий резерв', desc: 'Перерозподіліть паливо між цистернами.' },
      { id: 'm_titan_3', sectionId: 'sec_titan_port', title: 'Льодова баржа', desc: 'Підготуйте конвой до дальнього рейсу.' },
      { id: 'm_titan_hab_1', sectionId: 'sec_titan_hab', title: 'Жовте небо', desc: 'Відновіть фільтри зовнішнього купола.' },
      { id: 'm_titan_hab_2', sectionId: 'sec_titan_hab', title: 'Теплий коридор', desc: 'Перевірте утеплення житлових тунелів.' },

      { id: 'm_ocean_port_1', sectionId: 'sec_ocean_port', title: 'Морський конвой', desc: 'Прийміть транспорт з реакторним паливом.' },
      { id: 'm_ocean_port_2', sectionId: 'sec_ocean_port', title: 'Штормова швартовка', desc: 'Закріпіть модулі під час фронту.' },
      { id: 'm_ocean_array_1', sectionId: 'sec_ocean_array', title: 'Опріснювачі', desc: 'Запустіть резервний фільтраційний блок.' },
      { id: 'm_ocean_array_2', sectionId: 'sec_ocean_array', title: 'Соляний скид', desc: 'Збалансуйте навантаження на мембрани.' },

      { id: 'm_geo_hab_1', sectionId: 'sec_geo_hab', title: 'Цивільний сектор', desc: 'Стабілізуйте добовий цикл житлового кільця.' },
      { id: 'm_geo_hab_2', sectionId: 'sec_geo_hab', title: 'Шкільний модуль', desc: 'Підготуйте аудиторії до нового потоку.' },
      { id: 'm_geo_docks_1', sectionId: 'sec_geo_docks', title: 'Висотний причал', desc: 'Прийміть пасажирський орбітальний лайнер.' },
      { id: 'm_geo_docks_2', sectionId: 'sec_geo_docks', title: 'Легкий буксир', desc: 'Виведіть ремонтний модуль у док.' },
      { id: 'm_geo_shield_1', sectionId: 'sec_geo_shield', title: 'Метеорний екран', desc: 'Посильте зовнішній щитовий контур.' },
      { id: 'm_geo_shield_2', sectionId: 'sec_geo_shield', title: 'Сліпа зона', desc: 'Закрийте пролом у сенсорному полі.' },

      { id: 'm_l1_customs_1', sectionId: 'sec_l1_customs', title: 'Швидка перевірка', desc: 'Проскануйте караван без затримок.' },
      { id: 'm_l1_customs_2', sectionId: 'sec_l1_customs', title: 'Червоний контейнер', desc: 'Ідентифікуйте підозрілий вантаж.' },
      { id: 'm_l1_bridge_1', sectionId: 'sec_l1_bridge', title: 'Транспортний міст', desc: 'Переналаштуйте чергу стикування.' },
      { id: 'm_l1_bridge_2', sectionId: 'sec_l1_bridge', title: 'Вікно на Місяць', desc: 'Відкрийте коридор для колоніальних шатлів.' },

      { id: 'm_pole_mines_1', sectionId: 'sec_pole_mines', title: 'Лід під тінню', desc: 'Підніміть нову партію криги з кратера.' },
      { id: 'm_pole_mines_2', sectionId: 'sec_pole_mines', title: 'Реголітний щит', desc: 'Укріпіть стіни шахтного стовбура.' },
      { id: 'm_pole_cryo_1', sectionId: 'sec_pole_cryo', title: 'Холодовий склад', desc: 'Перевірте камери довгого зберігання.' },
      { id: 'm_pole_cryo_2', sectionId: 'sec_pole_cryo', title: 'Паливна лінія', desc: 'Відкачайте воду у конвертор палива.' },

      { id: 'm_valles_transit_1', sectionId: 'sec_valles_transit', title: 'Колона роверіів', desc: 'Супроводьте вантаж через каньйон.' },
      { id: 'm_valles_transit_2', sectionId: 'sec_valles_transit', title: 'Червоний міст', desc: 'Перекиньте нову секцію магістралі.' },
      { id: 'm_valles_foundry_1', sectionId: 'sec_valles_foundry', title: 'Ливарний пуск', desc: 'Розігрійте печі перед зміною.' },
      { id: 'm_valles_foundry_2', sectionId: 'sec_valles_foundry', title: 'Марсіанський сплав', desc: 'Виготовте каркас для нового купола.' },

      { id: 'm_phobos_drydock_1', sectionId: 'sec_phobos_drydock', title: 'Корпус буксира', desc: 'Зберіть носову секцію важкого корабля.' },
      { id: 'm_phobos_drydock_2', sectionId: 'sec_phobos_drydock', title: 'Вакуумний шов', desc: 'Перевірте герметичність стиків.' },
      { id: 'm_phobos_magrail_1', sectionId: 'sec_phobos_magrail', title: 'Стартовий розгін', desc: 'Калібруйте магрейл для вантажного модуля.' },
      { id: 'm_phobos_magrail_2', sectionId: 'sec_phobos_magrail', title: 'Вікно перехоплення', desc: 'Синхронізуйте запуск з орбітою Марса.' },

      { id: 'm_icefront_drills_1', sectionId: 'sec_icefront_drills', title: 'Полярне буріння', desc: 'Опустіть нову бурову колону.' },
      { id: 'm_icefront_drills_2', sectionId: 'sec_icefront_drills', title: 'Крижаний керн', desc: 'Доставте зразки у лабораторію.' },
      { id: 'm_icefront_greenhouse_1', sectionId: 'sec_icefront_greenhouse', title: 'Холодна ферма', desc: 'Стабілізуйте тепловий купол теплиць.' },
      { id: 'm_icefront_greenhouse_2', sectionId: 'sec_icefront_greenhouse', title: 'Снігове світло', desc: 'Переналаштуйте спектр ламп для рослин.' },

      { id: 'm_ganymede_smelter_1', sectionId: 'sec_ganymede_smelter', title: 'Важкий ковш', desc: 'Запустіть подачу руди у плавильний блок.' },
      { id: 'm_ganymede_smelter_2', sectionId: 'sec_ganymede_smelter', title: 'Тиск печі', desc: 'Утримайте стабільний цикл сплаву.' },
      { id: 'm_ganymede_vault_1', sectionId: 'sec_ganymede_vault', title: 'Склад броні', desc: 'Розкладіть нові плити за типами.' },
      { id: 'm_ganymede_vault_2', sectionId: 'sec_ganymede_vault', title: 'Маркування партій', desc: 'Промаркуйте контейнери для відправки.' },

      { id: 'm_callisto_beacons_1', sectionId: 'sec_callisto_beacons', title: 'Дальній маяк', desc: 'Відновіть навігаційний промінь сектора.' },
      { id: 'm_callisto_beacons_2', sectionId: 'sec_callisto_beacons', title: 'Тиха тінь', desc: 'Налаштуйте резервний сигнал для конвою.' },
      { id: 'm_callisto_docks_1', sectionId: 'sec_callisto_docks', title: 'Карантинний док', desc: 'Підготуйте шлюз після дальнього рейсу.' },
      { id: 'm_callisto_docks_2', sectionId: 'sec_callisto_docks', title: 'Ремонт корпусу', desc: 'Замініть пошкоджену секцію порому.' },

      { id: 'm_enceladus_vents_1', sectionId: 'sec_enceladus_vents', title: 'Гейзерний проліт', desc: 'Проведіть забір матеріалу у струмені.' },
      { id: 'm_enceladus_vents_2', sectionId: 'sec_enceladus_vents', title: 'Крижаний шлейф', desc: 'Стабілізуйте датчики у викиді.' },
      { id: 'm_enceladus_bio_1', sectionId: 'sec_enceladus_bio', title: 'Стерильний цикл', desc: 'Закрийте біоізолятор перед аналізом.' },
      { id: 'm_enceladus_bio_2', sectionId: 'sec_enceladus_bio', title: 'Живий слід', desc: 'Перевірте підозрілий органічний зразок.' },

      { id: 'm_ring_spokes_1', sectionId: 'sec_ring_spokes', title: 'Кільцевий рейс', desc: 'Забезпечте маршрут між трьома станціями.' },
      { id: 'm_ring_spokes_2', sectionId: 'sec_ring_spokes', title: 'Зношений сегмент', desc: 'Замініть стару транспортну секцію.' },
      { id: 'm_ring_exchange_1', sectionId: 'sec_ring_exchange', title: 'Біржова сесія', desc: 'Підтвердіть поставки ресурсів на тиждень.' },
      { id: 'm_ring_exchange_2', sectionId: 'sec_ring_exchange', title: 'Сектор купців', desc: 'Відкрийте новий торговий коридор.' },
    ],

    activeWorldId: 'earth',
    activeSectionId: 'sec_earth_hub',
  }),

  getters: {
    currentWorld: (state) => state.worlds.find((world) => world.id === state.activeWorldId),
    currentSections: (state) => state.sections.filter((section) => section.worldId === state.activeWorldId),
    activeMissions: (state) => state.missions.filter((mission) => mission.sectionId === state.activeSectionId),
  },
})
