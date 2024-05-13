namespace Machine {
  export interface IWrench extends TileEntity {
    canRotate(side: number): boolean;
    getFacing(): number;
    setFacing(side: number): boolean;
    getDefaultDrop(): number;
    adjustDrop(item: ItemInstance): ItemInstance;
    destroyWithWrench(coords: Vector, player: number): void
  }
}