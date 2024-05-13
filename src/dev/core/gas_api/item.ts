namespace GasItemRegister {
    type EmptyData = { id: number, data: number, gas: string, amount: number, storage?: number };

    type FullData = { id: number, data: number, amount: number, storage?: number };

    export const EmptyByFull = {};
    export const FullByEmpty = {};

    /**
    * Registers gas storage item.
    * @param gas gas name
    * @param emptyId empty item id
    * @param fullId id of item with luquid
    * @param storage capacity of gas in mB
    */
    export function registerItem(gas: string, emptyId: number, fullId: number, storage: number): void {
        EmptyByFull[fullId] = { id: emptyId, gas: gas, storage: storage };
        FullByEmpty[emptyId + ":" + gas] = { id: fullId, storage: storage };
        Item.setMaxDamage(fullId, storage);
        //if (storage == 1000) LiquidRegistry.registerItem(gas, { id: emptyId, data: 0 }, { id: fullId, data: 0 });
    }

    /**
    * Return gas type stored in item
    * @param id item id
    * @param data item data
    * @returns gas type
    */
    export function getItemLiquid(id: number, data: number): string {
        const empty = EmptyByFull[id];
        if (empty) {
            return empty.gas;
        }
        return null
    }

    /**
    * Returns empty item and stored gas data for item that contains gas,
    * null otherwise.
    * @param id item id
    * @param data item data
    * @returns object that contains empty item and stored gas.
    */
    export function getEmptyItem(id: number, data: number): EmptyData {
        const emptyData = EmptyByFull[id];
        if (emptyData) {
            const amount = emptyData.storage - data;
            return { id: emptyData.id, data: 0, gas: emptyData.gas, amount: amount, storage: emptyData.storage };
        }
        return null;
    }

    /**
    * Returns full item and free gas capacity for item that can be filled with gas,
    * null otherwise.
    * @param id item id
    * @param data item data
    * @param gas gas type
    * @returns object that contains full item and free gas capacity
    */
    export function getFullItem(id: number, data: number, gas: string): FullData {
        const emptyData = EmptyByFull[id];
        if (emptyData && emptyData.gas == gas && data > 0) {
            return { id: id, data: 0, amount: data, storage: emptyData.storage }
        }

        const fullData = FullByEmpty[id + ":" + gas];
        if (fullData) {
            return { id: fullData.id, data: 0, amount: fullData.storage, storage: fullData.storage }
        }
        return null;
    }
}