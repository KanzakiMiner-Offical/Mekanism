namespace Machine {
    export class BasicHeatCapacitor {
        heatCapacity: number;

        ambientTempSupplier: number;
        inverseConductionCoefficient: number;
        inverseInsulationCoefficient: number;

        // set to ambient * heat capacity by default
        storedHeat = -1;
        heatToHandle: number;


        constructor(heatCapacity: number, inverseConductionCoefficient: number, inverseInsulationCoefficient: number, ambientTempSupplier?: number) {
            this.heatCapacity = heatCapacity;
            this.inverseConductionCoefficient = inverseConductionCoefficient;
            this.inverseInsulationCoefficient = inverseInsulationCoefficient;
            this.ambientTempSupplier = ambientTempSupplier;
        }
        initStoredHeat() {
            if (this.storedHeat == -1) {
                //If the stored heat hasn't been initialized yet, update the stored heat based on initial capacity
                this.storedHeat = this.heatCapacity * this.getAmbientTemperature();
            }
        }
        getAmbientTemperature(): number {
            return this.ambientTempSupplier == null ? 300 : this.ambientTempSupplier;
        }
        getTemperature() {
            return this.getHeat() / this.getHeatCapacity();
        }


        getInverseConduction() {
            return this.inverseConductionCoefficient;
        }


        getInverseInsulation() {
            return this.inverseInsulationCoefficient;
        }


        getHeatCapacity() {
            return this.heatCapacity;
        }


        handleHeat(transfer: number) {
            this.heatToHandle += transfer;
        }


        getHeat() {
            this.initStoredHeat();
            return this.storedHeat;
        }


        setHeat(heat: number) {
            if (this.getHeat() != heat) {
                this.storedHeat = heat;
            }
        }

        setHeatCapacity(newCapacity: number, updateHeat: boolean) {
            if (updateHeat && this.storedHeat != -1) {
                this.setHeat(this.getHeat() + (newCapacity - this.getHeatCapacity()) * this.getAmbientTemperature());
            }
            this.heatCapacity = newCapacity;
        }

        setHeatCapacityFromPacket(newCapacity: number) {
            this.heatCapacity = newCapacity;
        }

        update() {
            if (this.heatToHandle != 0 && Math.abs(this.heatToHandle) > MathHelper.EPSILON) {
                this.initStoredHeat();
                this.storedHeat += this.heatToHandle;
                // reset our handling heat
                this.heatToHandle = 0;
            }
        }
    }
}