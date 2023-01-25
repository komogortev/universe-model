import { AxesHelper, GridHelper } from 'three'
// Turns both axes and grid visible on/off
// lil-gui requires a property that returns a bool
// to decide to make a checkbox so we make a setter
// and getter for `visible` which we can tell lil-gui
// to look at.
export class AxisGridHelper {
  _visible: boolean;
  _grid: any;
  _axes: any

  constructor(node: any, units = 10) {
    const axes = new AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2;  // after the grid
    node.add(axes);

    const grid = new GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this._grid = grid;
    this._axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this._grid.visible = v;
    this._axes.visible = v;
  }
}