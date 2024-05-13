// Fork from Storage Interface
interface StorageDescriptor {
    slots?: {
        [key: string]: SlotData
    },
    liquidUnitRatio?: number;
    isValidInput?(item: ItemInstance, side: number, tileEntity: TileEntity): boolean,
    addItem?(item: ItemInstance, side?: number, maxCount?: number): number,
    getInputSlots?(side?: number): string[] | number[],
    getOutputSlots?(side?: number): string[] | number[],
    canReceiveLiquid?(liquid: string, side: number): boolean,
    canTransportLiquid?(liquid: string, side: number): boolean,
    receiveLiquid?(liquidStorage: ILiquidStorage, liquid: string, amount: number): number,
    extractLiquid?(liquidStorage: ILiquidStorage, liquid: string, amount: number): number,
    getInputTank?(side: number): ILiquidStorage,
    getOutputTank?(side: number): ILiquidStorage
}
interface StorageDescriptorWithGas extends StorageDescriptor {
    gasUnitRatio?: number;
    canReceiveGas?(gas: string, side: number): boolean,
    canTransportGas?(gas: string, side: number): boolean,
    receiveGas?(gasStorage: IGasStorage, gas: string, amount: number): number,
    extractGas?(gasStorage: IGasStorage, gas: string, amount: number): number,
    getInputGasTank?(side: number): IGasStorage,
    getOutputGasTank?(side: number): IGasStorage
}
interface IGasStorage {
    getGasStored(): string;
    getLimit(gas: string): number;
    getAmount(gas: string): number;
    getGas(gas: string, amount: number): number;
    addGas(gas: string, amount: number): number;
    isFull(): boolean;
    isEmpty(): boolean;
}
interface GasStorage extends Storage {
    gasUnitRatio?: number;
    canReceiveGas?(gas: string, side: number): boolean,
    canTransportGas?(gas: string, side: number): boolean,
    receiveGas?(gasStorage: IGasStorage, gas: string, amount: number): number,
    extractGas?(gasStorage: IGasStorage, gas: string, amount: number): number,
    getInputGasTank?(side: number): IGasStorage,
    getOutputGasTank?(side: number): IGasStorage
}

namespace StorageInterface {
    type GasMap = { [key: number]: Storage };

    export let data_with_gas: { [key: number]: StorageDescriptor } = {};

    export function createInterfaceWithGas(id: number, descriptor: StorageDescriptorWithGas) {
        createInterface(id, descriptor);

        data_with_gas[id] = descriptor
    }

    /** Returns storage interface for TileEntity with gas storage */
	export function getGasStorage(region: BlockSource, x: number, y: number, z: number): Nullable<TileEntityInterfaceWithGas> {
		let tileEntity = World.getTileEntity(x, y, z, region);
		if (tileEntity && tileEntity.__initialized) {
			return new TileEntityInterfaceWithGas(tileEntity);
		}
		return null;
	}

    /** Returns storage interface for neighbour TileEntity with gas storage on specified side */
    export function getNeighbourGasStorage(region: BlockSource, coords: Vector, side: number): Nullable<TileEntityInterfaceWithGas> {
        let dir = getRelativeCoords(coords, side);
        return getGasStorage(region, dir.x, dir.y, dir.z);
    }

    /**
     * Returns object containing neigbour gas storages where keys are block side numbers
     * @coords position from which check neighbour blocks
    */
    export function getNearestGasStorages(coords: Vector, region: BlockSource): GasMap;
    export function getNearestGasStorages(coords: Vector, region: any): GasMap {
        let side = -1;
        if (typeof region == "number") { // reverse compatibility
            region = null;
            side = region;
        }
        let storages = {};
        for (let i = 0; i < 6; i++) {
            if (side >= 0 && side != i) continue;
            let storage = getNeighbourGasStorage(region, coords, i);
            if (storage) storages[i] = storage;
        }
        return storages;
    }

    /**
 * Extract gas from one storage to another
 * @gas gas to extract. If null, will extract gas stored in output storage
 * @maxAmount max amount of gas that can be transfered
 * @inputStorage storage to input gas
 * @outputStorage storage to extract gas
 * @inputSide block side of input storage which is receiving 
 * @returns left gas amount
*/
    export function extractGas(gas: Nullable<string>, maxAmount: number, inputStorage: TileEntity | GasStorage, outputStorage: GasStorage, inputSide: number): number {
        if (!(inputStorage instanceof TileEntityInterfaceWithGas)) { // reverse compatibility
            inputStorage = new TileEntityInterfaceWithGas(inputStorage as TileEntity);
        }
        let outputSide = inputSide ^ 1;
        let inputTank = inputStorage.getInputTank(inputSide);
        let outputTank = outputStorage.getOutputTank(outputSide);
        if (!inputTank || !outputTank) return 0;

        if (!gas) gas = outputTank.getLiquidStored();
        if (gas && outputStorage.canTransportLiquid(gas, outputSide) && inputStorage.canReceiveLiquid(gas, inputSide) && !inputTank.isFull()) {
            let amount = Math.min(outputTank.getAmount(gas) * outputStorage.gasUnitRatio, maxAmount);
            amount = inputStorage.receiveLiquid(inputTank, gas, amount);
            outputStorage.extractLiquid(outputTank, gas, amount);
            return amount;
        }
        return 0;
    }

    /** Similar to StorageInterface.extractLiquid, but gas must be specified */
    export function transportGas(gas: string, maxAmount: number, outputStorage: TileEntity | GasStorage, inputStorage: GasStorage, outputSide: number): number {
        if (!(outputStorage instanceof TileEntityInterfaceWithGas)) { // reverse compatibility
            outputStorage = new TileEntityInterfaceWithGas(outputStorage as TileEntity);
        }
        let inputSide = outputSide ^ 1;
        let inputTank = inputStorage.getInputTank(inputSide);
        let outputTank = outputStorage.getOutputTank(outputSide);
        if (!inputTank || !outputTank) return 0;

        if (inputStorage.canReceiveLiquid(gas, inputSide) && !inputTank.isFull()) {
            let amount = Math.min(outputTank.getAmount(gas) * outputStorage.gasUnitRatio, maxAmount);
            amount = inputStorage.receiveLiquid(inputTank, gas, amount);
            outputStorage.extractLiquid(outputTank, gas, amount);
            return amount;
        }
        return 0;
    }

}