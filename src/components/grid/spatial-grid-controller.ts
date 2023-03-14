import {entity} from '../../constructors/Entity';

export const spatial_grid_controller = (() => {

  class SpatialGridController extends entity.Component {
    grid_: any;
    client_: any;

    constructor(params: any) {
      super();

      this.grid_ = params.grid;
    }

    Destroy() {
      this.grid_.Remove(this.client_);
      this.client_ = null;
    }

    InitEntity() {
      this.RegisterHandler_('physics.loaded', () => this.OnPhysicsLoaded_());

      const pos = [
        this.Parent.Position.x,
        this.Parent.Position.z,
      ];

      this.client_ = this.grid_.NewClient(pos, [1, 1]);
      this.client_.entity = this.parent_;
    }

    OnPhysicsLoaded_() {
      this.RegisterHandler_('update.position', (m: any) => this.OnPosition_());
      this.OnPosition_();
    }

    OnPosition_() {
      const pos = this.Parent.Position;
      this.client_.position = [pos.x, pos.z];
      this.grid_.UpdateClient(this.client_);
    }

    FindNearbyEntities(range: any) {
      const results = this.grid_.FindNear(
          [this.parent_._position.x, this.parent_._position.z], [range, range]);

      return results.filter((c: any) => c.entity != this.parent_);
    }
  };

  return {
      SpatialGridController: SpatialGridController,
  };
})();