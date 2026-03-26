function deepCopy(obj) {
    // Объявляем константу для сценария использования с циклической ссылкой
    // и инициализируем её экземпляром WeekMap.
    const seen = new WeakMap();
    
    // Обернул в замыкание, чтобы deepCopy принимал только один аргумент - obj.
    function clone(obj) {
        if (obj === null) {
            return null;  // в случае null
        }
        if (typeof obj !== "object") {
            return obj;  // в случае если не объект
        }
        if (seen.has(obj)) {
            return seen.get(obj);  // в случае рекурсивной ссылки
        }

        // Объявляем "ярлык" copy здесь,
        // потому что если это сделать в if, то он будет существовать только там
        let copy;  // copy = undefined

        if (Array.isArray(obj)) {  
            copy = [];  // copy указывает на массив
        } else if (obj instanceof Date) {
            return new Date(obj);  // в случае date
        } else if (obj instanceof Map) {
            const newMap = new Map();  // в случае map
            seen.set(obj, newMap)  // для обработки циклических ссылок
            obj.forEach((value, key) => {
                newMap.set(clone(key), clone(value));
            });
            return newMap
        } else if (obj instanceof Set) {
            const newSet = new Set();  // в случае set
            seen.set(obj, newSet);  // для обработки циклических ссылок
            obj.forEach(value => {
                newSet.add(clone(value));
            });
            return newSet;
        } else {
            // copy указывает на объект, сохраняя прототип исходного объекта
            copy = Object.create(Object.getPrototypeOf(obj));
        }
        
        seen.set(obj, copy);  // записываем obj в weakmap

        // Копируем собственные свойства с сохранением дескрипторов
        // (writable, enumerable, configurable, get/set)
        for (let key of Object.getOwnPropertyNames(obj)) {
            // Получаем дескриптор - полное описание свойства
            const desc = Object.getOwnPropertyDescriptor(obj, key);
            // Если свойство хранит значение (а не геттер/сеттер) - клонируем его
            if (desc.value !== undefined) {
                desc.value = clone(desc.value);
            }
            // Определяем свойство на копии с тем же дескриптором
            Object.defineProperty(copy, key, desc);
        }
        // Копируем Symbol-ключи с сохранением дескрипторов
        for (let sym of Object.getOwnPropertySymbols(obj)) {
            const desc = Object.getOwnPropertyDescriptor(obj, sym);
            if (desc.value !== undefined) {
                desc.value = clone(desc.value);
            }
            Object.defineProperty(copy, sym, desc);
        }

        // Возвращаем!
        return copy;
    }
    
    return clone(obj);
}

let original = {
    name: "Gothic",  // для проверки string
    floors: 2,  // для проверки number
    rooms: { bedrooms: 3, bathrooms: 1 },  // для проверки object
    colors: ["black", "grey", "brown"],  // для проверки array
    garden: null,  // для проверки null
    buildDate: new Date("April 15, 1163"),  // для проверки date
    metadata: new Map([  // для проверки map
        ["architect", "Alexander"],
        ["style", "Gothic"]
    ]),
    elements: new Set(["roof", "walls", "chimney", "door", "window"]),  // для проверки set
    greetings: function() { return "Greetings!" },
};

// Symbol добавляем
const secret = Symbol("secret");
original[secret] = { code: 123 };

let dublicate = deepCopy(original);

// Проверка для string
dublicate.name = "Medieval"
console.log(`original name: ${original.name}`)  // Gothic
console.log(`dublicate name: ${dublicate.name}`)  // Medieval

// Проверка для number
dublicate.floors = 10
console.log(`original floors: ${original.floors}`)  // 2
console.log(`dublicate floors: ${dublicate.floors}`)  // 10

// Проверка для object
dublicate.rooms.bedrooms = 10;
    // {bedrooms: 3, bathrooms: 1}
console.log("original rooms:", original.rooms);
    // {bedrooms: 10, bathrooms: 1}
console.log("dublicate rooms:", dublicate.rooms);

// Проверка для array
dublicate.colors.push("red");
    // black,grey,brown
console.log(`original colors: ${original.colors}`);
    // black,grey,brown,red
console.log(`dublicate colors: ${dublicate.colors}`);  

// Проверка для null
console.log("dublicate garden:", dublicate.garden);  // null

// Проверка если передаем примитив
primitive_dublicate = deepCopy(67);
console.log("primitive_dublicate:", primitive_dublicate)  // 67

// Проверка Date
    // Здесь важно писать new потому что нужен объект типа Date, а не строка "January..."
dublicate.buildDate =  new Date("January 13, 1666");
    // true
console.log(`Является ли original.buildDate типом Date: ${original.buildDate instanceof Date}`);
    // Mon Apr 15 1163 00:00:00 GMT+0402
console.log("original date:", original.buildDate);
    // true
console.log(`Является ли dublicate.buildDate типом Date: ${dublicate.buildDate instanceof Date}`);
    // Wed Jan 13 1666 00:00:00 GMT+0402
console.log("dublicate date:", dublicate.buildDate);

// Проверка Map
// Map - коллекция пар "Ключ -> значение". Отличие от объекта - ключом может быть что угодно:
// число, объект, функция или даже другой Map.
dublicate.metadata = new Map([
    ["architect", "Pierre"]
]);
    // Map(2) {size: 2, architect => Alexander, style => Gothic}
console.log("original metadata:", original.metadata);
    // Map(1) {size: 1, architect => Pierre}
console.log("dublicate metadata:", dublicate.metadata);

// Проверка Set
// Set - коллекция уникальных значений.
dublicate.elements = new Set(["door", "door", "door"])
    // Set(5) {size: 5, roof, walls, chimney, door, window}
console.log("original elements:", original.elements);
    // Set(1) {size: 1, door}
console.log("dublicate elements:", dublicate.elements);

// Проверка obj.self
// Циклическая ссылка - это когда объект ссылается сам на себя.
// const obj = { name : "Gothic" }
// obj.self = obj  // получаем бесконечный цикл
// КОНКРЕТНО ЭТОТ МОМЕНТ МНЕ ПОКА НЕ ЯСЕН ДО КОНЦА.
// Решением здесь будет - использовать WeakMap().
// WeakMap() - коллекция пар "Ключ -> значение", где ключ может являтся только объектом.

let cyclic = { name: "test" };
cyclic.self = cyclic;
let cyclicCopy = deepCopy(cyclic);
console.log(cyclicCopy.name);  // test
console.log(cyclicCopy.self === cyclicCopy);  // true 
console.log(cyclicCopy !== cyclic);  // true

// Проверка function()
// Здесь копируется ссылка на на уже существующую функцию original.greetings
// в dublicate.greetings.
// По условию нужно, как я понял, именно склонировать функцию исходную,
// но я пока не разобрался как корректно это сделать.
console.log(typeof dublicate.greetings);  // function
console.log(dublicate.greetings());  // Greetings!
console.log(dublicate.greetings === original.greetings);  // true — та же ссылка

// Проверка Symbol
dublicate[secret].code = 999;
console.log(original[secret].code);  // 123
console.log(dublicate[secret].code); // 999

// Проверка дескрипторов
// Object.defineProperty позволяет задать свойство с ограничениями:
// writable: false — нельзя изменить значение
// enumerable: false — не видно в for...in и Object.keys
// configurable: false — нельзя удалить или переопределить
let descriptorTest = {};
Object.defineProperty(descriptorTest, "locked", {
    value: "cannot change me",
    writable: false,
    enumerable: false,
    configurable: false
});
let descriptorCopy = deepCopy(descriptorTest);
const origDesc = Object.getOwnPropertyDescriptor(descriptorTest, "locked");
const copyDesc = Object.getOwnPropertyDescriptor(descriptorCopy, "locked");
console.log("Дискриптор оригинала:", origDesc);
    // {value: "cannot change me", writable: false, enumerable: false, configurable: false}
console.log("Дискриптор копии:", copyDesc);
    // {value: "cannot change me", writable: false, enumerable: false, configurable: false}
console.log("Дескрипторы совпадают:", 
    origDesc.writable === copyDesc.writable &&
    origDesc.enumerable === copyDesc.enumerable &&
    origDesc.configurable === copyDesc.configurable
);  // true

// ВРОДЕ ВСЁ