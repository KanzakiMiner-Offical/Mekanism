namespace Machine {
    export abstract class BaseGenerator extends ProgressingMachine {
        maxOutput: number;

        getMaxOutput(): number {
            return this.maxOutput || 0;
        }

        updateMaxOutputRaw(maxOutput: number): void {
            this.maxOutput = maxOutput * 2
        }

        energyTick(type: string, src: EnergyTileNode): void {
            let output = Math.min(this.data.energy, this.maxOutput);
            this.data.energy += src.add(output) - output;
        }
        powerNeed(): number {
            return this.getEnergyStorage() - this.data.energy
        }
    }
}