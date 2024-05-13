namespace MathHelper {
	export function randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	export function clamp(value: number, minValue: number, maxValue: number) {
		return Math.min(Math.max(value, minValue), maxValue);
	}
}

let randomInt = MathHelper.randomInt