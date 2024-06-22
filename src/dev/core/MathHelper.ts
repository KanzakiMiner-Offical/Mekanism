namespace MathHelper {
	export function randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	export function clamp(value: number, minValue: number, maxValue: number) {
		return Math.min(Math.max(value, minValue), maxValue);
	}
	export function degreeToRadian(degree: number): number {
		return (degree * Math.PI) / 180;
	}
	export let EPSILON = 9.99999997E-7
}

let randomInt = MathHelper.randomInt