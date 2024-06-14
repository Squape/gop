export function compare_objects(obj1: any, obj2: any) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
}

export function is_in_map<K, V>(map: Map<K, V>, object_to_find: K): V | null {
    const stringified_object = JSON.stringify(object_to_find);

    for (const [key, value] of map) {
        if (JSON.stringify(key) == stringified_object)
            return value;
    }

    return null;
}

export function delete_from_map<K, V>(map: Map<K, V>, object_to_delete: K) {
    const stringified_object = JSON.stringify(object_to_delete);

    for (const [key, _] of map) {
        if (JSON.stringify(key) == stringified_object)
            map.delete(key);
    }
}