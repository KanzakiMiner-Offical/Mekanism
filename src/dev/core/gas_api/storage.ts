// Fork From Block Engine
namespace BlockEngine {
    /**
     * Class to store and manipulate gases in TileEntity.
     */
    export class GasTank {
        /** Parent TileEntity instance */
        tileEntity: TileEntity;

        /** Gas tank name */
        readonly name: string;

        /** Max gas amount. */
        limit: number;

        /** Set of valid gases */
        gases: object;

        /** Gas data stored in TileEntity data object. */
        data: {
            gas: string,
            amount: number
        }

        /**
         * Creates new instance of `GasTank` and binds it to TileEntity.
         * @param tileEntity TileEntity instance
         * @param name gas tank name
         * @param limit max gas amount
         * @param gases types of valid gases
         */
        constructor(tileEntity: TileEntity, name: string, limit: number, gases?: string[]) {
            this.name = name;
            this.limit = limit;
            if (gases) this.setValidGass(gases);
            this.setParent(tileEntity);
        }

        /**
         * Binds gas tank to TileEntity.
         * @param tileEntity TileEntity instance
         */
        setParent(tileEntity: TileEntity) {
            this.tileEntity = tileEntity;
            const gasData = tileEntity.data[this.name] || {
                gas: null,
                amount: 0
            };
            tileEntity.data[this.name] = this.data = gasData;
        }

        /**
         * Gets type of gas stored in tank.
         * @returns gas type
         */
        getGasStored(): string {
            return this.data.gas;
        }

        /**
         * Gets max amount of gas in tank.
         * @returns amount of gas
         */
        getLimit(): number {
            return this.limit;
        }

        /**
         * @param gas gas type
         * @returns true if gas can be stored in tank, false otherwise.
         */
        isValidGas(gas: string): boolean {
            if (!this.gases) {
                return true;
            }
            return this.gases[gas] || false;
        }

        /**
         * Sets gases that can be stored in tank (replace old!).
         * @param gases arrays of gas types
         */
        setValidGass(gases: string[]): void {
            this.gases = {};
            for (let name of gases) {
                this.gases[name] = true;
            }
        }

        /**
         * Gets amount of gas in tank. If `gas` parameter is set,
         * returns amount of the specified gas.
         * @param gas gas type
         * @returns amount of gas
         */
        getAmount(gas?: string): number {
            if (!gas || this.data.gas == gas) {
                return this.data.amount;
            }
            return 0;
        }

        /**
         * Sets gas to tank.
         * @param gas gas type
         * @param amount amount of gas
         */
        setAmount(gas: string, amount: number): void {
            this.data.gas = gas;
            this.data.amount = amount;
        }

        /**
         * Gets amount of gas divided by max amount.
         * @returns scalar value from 0 to 1
         */
        getRelativeAmount(): number {
            return this.data.amount / this.limit;
        }

        /**
         * Adds gas to tank.
         * @param gas gas type
         * @param amount amount of gas to add
         * @returns amount of gas that wasn't added
         */
        addGas(gas: string, amount: number): number {
            if (!this.data.gas || this.data.gas == gas) {
                this.data.gas = gas;
                const add = Math.min(amount, this.limit - this.data.amount);
                this.data.amount += add;
                return amount - add;
            }
            return 0;
        }

        /**
         * Gets gas from tank.
         * @param amount max amount of gas to get
         * @returns amount of got gas
         */
        getGas(amount: number): number;

        /**
         * Gets gas from tank.
         * @param gas gas type
         * @param amount max amount of gas to get
         * @returns amount of got gas
         */
        getGas(gas: string, amount: number): number;
        getGas(gas: any, amount?: number): number {
            if (amount == undefined) {
                amount = gas;
                gas = null;
            }
            if (!gas || this.data.gas == gas) {
                const got = Math.min(amount, this.data.amount);
                this.data.amount -= got;
                if (this.data.amount == 0) {
                    this.data.gas = null;
                }
                return got;
            }
            return 0;
        }

        /**
         * @returns true if tank is full, false otherwise
         */
        isFull(): boolean {
            return this.data.amount >= this.limit;
        }

        /**
         * @returns true if tank is empty, false otherwise
         */
        isEmpty(): boolean {
            return this.data.amount <= 0;
        }

        /**
         * Tries to fill item with gas from tank.
         * @param inputSlot slot for empty item
         * @param outputSlot slot for full item
         * @returns true if gas was added, false otherwise.
         */
        addGasToItem(inputSlot: ItemContainerSlot, outputSlot: ItemContainerSlot): boolean {
            const gas = this.getGasStored();
            if (!gas) return false;

            let amount = this.getAmount(gas);
            if (amount > 0) {
                const full = GasItemRegister.getFullItem(inputSlot.id, inputSlot.data, gas);
                if (full && (outputSlot.id == full.id && outputSlot.data == full.data && outputSlot.count < Item.getMaxStack(full.id) || outputSlot.id == 0)) {
                    if (amount >= full.amount) {
                        this.getGas(full.amount);
                        inputSlot.setSlot(inputSlot.id, inputSlot.count - 1, inputSlot.data);
                        inputSlot.validate();
                        outputSlot.setSlot(full.id, outputSlot.count + 1, full.data);
                        return true;
                    }
                    if (inputSlot.count == 1 && full.storage) {
                        if (inputSlot.id == full.id) {
                            amount = this.getGas(full.amount);
                            inputSlot.setSlot(inputSlot.id, 1, inputSlot.data - amount);
                        } else {
                            amount = this.getGas(full.storage);
                            inputSlot.setSlot(full.id, 1, full.storage - amount);
                        }
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * Tries to fill tank with gas from item.
         * @param inputSlot slot for full item
         * @param outputSlot slot for empty item
         * @returns true if gas was extracted, false otherwise.
         */
        getGasFromItem(inputSlot: ItemContainerSlot, outputSlot: ItemContainerSlot): boolean {
            const gas = this.getGasStored();
            const empty = GasItemRegister.getEmptyItem(inputSlot.id, inputSlot.data);
            if (empty && (!gas && this.isValidGas(empty.gas) || empty.gas == gas) && !this.isFull()) {
                if (outputSlot.id == empty.id && outputSlot.data == empty.data && outputSlot.count < Item.getMaxStack(empty.id) || outputSlot.id == 0) {
                    const freeAmount = this.getLimit() - this.getAmount();
                    if (freeAmount >= empty.amount) {
                        this.addGas(empty.gas, empty.amount);
                        inputSlot.setSlot(inputSlot.id, inputSlot.count - 1, inputSlot.data);
                        inputSlot.validate();
                        outputSlot.setSlot(empty.id, outputSlot.count + 1, empty.data);
                        return true;
                    }
                    if (inputSlot.count == 1 && empty.storage) {
                        const amount = Math.min(freeAmount, empty.amount);
                        this.addGas(empty.gas, amount);
                        inputSlot.setSlot(inputSlot.id, 1, inputSlot.data + amount);
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * Updates UI bar of gas.
         * Warning: Only support new container !
         * Note: add setGasScale event to your Tile Entity
         * @param scale name of gas bar
         */
        updateUiScale(scale: string): void {
            const container = this.tileEntity.container;
            (container as ItemContainer).sendEvent("setGasScale", { scale: scale, gas: this.data.gas, amount: this.getRelativeAmount() });

        }
    }
}