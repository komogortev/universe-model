import { entity } from "../../constructors/Entity";

export const player_input = (() => {

  class PlayerInput extends entity.Component {

    constructor() {
      super();
    }

    InitEntity() {
      this.Parent.Attributes.InputCurrent = {
        axis1Forward: 0.0,
        axis1Side: 0.0,
        axis2Forward: 0.0,
        axis2Side: 0.0,
        axisYRotation: 0.0,
        pageUp: false,
        pageDown: false,
        space: false,
        shift: 0.0,
        ctrl: 0.0,
        backspace: false,
      };
      this.Parent.Attributes.InputPrevious = {
        ...this.Parent.Attributes.InputCurrent};

      document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
      document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
    }

    OnKeyDown_(event: Event) {
      if (event.currentTarget.activeElement != document.body) {
        return;
      }
      switch (event.keyCode) {
        case 81: // Q
          this.Parent.Attributes.InputCurrent.axisZLeft = -1.0;
          break;
        case 87: // w
          this.Parent.Attributes.InputCurrent.axis1Forward = -1.0;
          break;
        case 69: // E
          this.Parent.Attributes.InputCurrent.axisZRight = 1.0;
          break;
        case 65: // a
          this.Parent.Attributes.InputCurrent.axis1Side = -1.0;
          break;
        case 83: // s
          this.Parent.Attributes.InputCurrent.axis1Forward = 1.0;
          break;
        case 68: // d
          this.Parent.Attributes.InputCurrent.axis1Side = 1.0;
          break;
        case 33: // PG_UP
          this.Parent.Attributes.InputCurrent.pageUp = true;
          break;
        case 34: // PG_DOWN
          this.Parent.Attributes.InputCurrent.pageDown = true;
          break;
        case 32: // SPACE
          this.Parent.Attributes.InputCurrent.space = true;
          break;
        case 16: // SHIFT
          this.Parent.Attributes.InputCurrent.shift = this.Parent.Attributes.InputCurrent.shift < 5 ? this.Parent.Attributes.InputCurrent.shift + 1 : this.Parent.Attributes.InputCurrent.shift;
          break;
        case 17: // CTRL
            this.Parent.Attributes.InputCurrent.shift = this.Parent.Attributes.InputCurrent.shift > 0 ? this.Parent.Attributes.InputCurrent.shift - 1 : this.Parent.Attributes.InputCurrent.shift;
            this.Parent.Attributes.InputCurrent.ctrl = this.Parent.Attributes.InputCurrent.ctrl > 0 ? this.Parent.Attributes.InputCurrent.ctrl - 1 : this.Parent.Attributes.InputCurrent.ctrl;
          break;
        case 8: // BACKSPACE
          this.Parent.Attributes.InputCurrent.backspace = true;
          break;
      }
    }

    OnKeyUp_(event: Event) {
      if (event.currentTarget.activeElement != document.body) {
        return;
      }
      switch(event.keyCode) {
        case 81: // Q
          this.Parent.Attributes.InputCurrent.axisZLeft = 0.0;
          break;
        case 87: // w
          this.Parent.Attributes.InputCurrent.axis1Forward = 0.0;
          break;
        case 69: // E
          this.Parent.Attributes.InputCurrent.axisZRight = 0.0;
          break;
        case 65: // a
          this.Parent.Attributes.InputCurrent.axis1Side = 0.0;
          break;
        case 83: // s
          this.Parent.Attributes.InputCurrent.axis1Forward = 0.0;
          break;
        case 68: // d
          this.Parent.Attributes.InputCurrent.axis1Side = 0.0;
          break;
        case 33: // PG_UP
          this.Parent.Attributes.InputCurrent.pageUp = false;
          break;
        case 34: // PG_DOWN
          this.Parent.Attributes.InputCurrent.pageDown = false;
          break;
        case 32: // SPACE
          this.Parent.Attributes.InputCurrent.space = false;
          break;
        case 16: // SHIFT
          break;
        case 17: // CTRL
          break;
        case 8: // BACKSPACE
          this.Parent.Attributes.InputCurrent.backspace = false;
          break;
      }
    }

    tick(_: number) {
      this.Parent.Attributes.InputPrevious = {
          ...this.Parent.Attributes.InputCurrent};
    }
  };

  return {
    PlayerInput: PlayerInput,
  };

})();