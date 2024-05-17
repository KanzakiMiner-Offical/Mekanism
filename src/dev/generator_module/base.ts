namespace Machine {
    export abstract class BaseGenerator extends ProgressingMachine {
        maxOutput: number;

        getMaxOutput(): number {
            return this.maxOutput || 0;
        }

        updateMaxOutputRaw(maxOutput: number): void {
            this.maxOutput = maxOutput * 2
        }
    }
}