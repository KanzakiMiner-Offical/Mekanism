/// <reference path="ProgressingMachine.ts" /> 

namespace Machine {
    export class ConfigMachine extends ProgressingMachine {
        @ContainerEvent(Side.Client)
        setGasScale(container: any, window: any, content: any, data: {scale: string, gas: string, amount: number}): void {
            const gui = container.getUiAdapter();
            if (gui) {
                const size = gui.getBinding(data.scale, "element_rect");
                if (!size) return;
                const texture = LiquidRegistry.getLiquidUITexture(data.gas, size.width(), size.height());
                gui.setBinding(data.scale, "texture", texture);
                gui.setBinding(data.scale, "value", data.amount);
            }
        }
    }
}