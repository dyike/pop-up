// 本地存储服务
// 使用 IndexedDB 存储生成的图片和收藏

const DB_NAME = 'pop-up-db';
const DB_VERSION = 1;
const STORE_IMAGES = 'images';
const STORE_SETTINGS = 'settings';

let db = null;

/**
 * 初始化数据库
 * @returns {Promise<IDBDatabase>}
 */
function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // 图片存储
            if (!database.objectStoreNames.contains(STORE_IMAGES)) {
                const imageStore = database.createObjectStore(STORE_IMAGES, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                imageStore.createIndex('createdAt', 'createdAt', { unique: false });
                imageStore.createIndex('isFavorite', 'isFavorite', { unique: false });
            }

            // 设置存储
            if (!database.objectStoreNames.contains(STORE_SETTINGS)) {
                database.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
            }
        };
    });
}

/**
 * 保存图片记录
 * @param {object} imageData - 图片数据
 * @returns {Promise<number>} - 返回新记录的 ID
 */
export async function saveImage(imageData) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_IMAGES], 'readwrite');
        const store = transaction.objectStore(STORE_IMAGES);

        const record = {
            ...imageData,
            createdAt: new Date().toISOString(),
            isFavorite: imageData.isFavorite || false
        };

        const request = store.add(record);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * 获取所有图片
 * @param {object} options - 过滤选项
 * @returns {Promise<Array>}
 */
export async function getAllImages(options = {}) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_IMAGES], 'readonly');
        const store = transaction.objectStore(STORE_IMAGES);

        const request = store.getAll();
        request.onsuccess = () => {
            let results = request.result || [];

            // 按创建时间倒序排列
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // 过滤收藏
            if (options.favoritesOnly) {
                results = results.filter(img => img.isFavorite);
            }

            resolve(results);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * 获取单个图片
 * @param {number} id - 图片 ID
 * @returns {Promise<object>}
 */
export async function getImage(id) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_IMAGES], 'readonly');
        const store = transaction.objectStore(STORE_IMAGES);

        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * 更新图片（如切换收藏状态）
 * @param {number} id - 图片 ID
 * @param {object} updates - 更新内容
 * @returns {Promise<void>}
 */
export async function updateImage(id, updates) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_IMAGES], 'readwrite');
        const store = transaction.objectStore(STORE_IMAGES);

        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            const record = getRequest.result;
            if (!record) {
                reject(new Error('图片不存在'));
                return;
            }

            const updatedRecord = { ...record, ...updates };
            const putRequest = store.put(updatedRecord);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
}

/**
 * 删除图片
 * @param {number} id - 图片 ID
 * @returns {Promise<void>}
 */
export async function deleteImage(id) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_IMAGES], 'readwrite');
        const store = transaction.objectStore(STORE_IMAGES);

        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * 切换收藏状态
 * @param {number} id - 图片 ID
 * @returns {Promise<boolean>} - 返回新的收藏状态
 */
export async function toggleFavorite(id) {
    const image = await getImage(id);
    if (!image) throw new Error('图片不存在');

    const newStatus = !image.isFavorite;
    await updateImage(id, { isFavorite: newStatus });
    return newStatus;
}

/**
 * 保存设置
 * @param {string} key - 设置键
 * @param {any} value - 设置值
 */
export async function saveSetting(key, value) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SETTINGS], 'readwrite');
        const store = transaction.objectStore(STORE_SETTINGS);

        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * 获取设置
 * @param {string} key - 设置键
 * @param {any} defaultValue - 默认值
 * @returns {Promise<any>}
 */
export async function getSetting(key, defaultValue = null) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SETTINGS], 'readonly');
        const store = transaction.objectStore(STORE_SETTINGS);

        const request = store.get(key);
        request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.value : defaultValue);
        };
        request.onerror = () => reject(request.error);
    });
}

export default {
    saveImage,
    getAllImages,
    getImage,
    updateImage,
    deleteImage,
    toggleFavorite,
    saveSetting,
    getSetting
};
