import { Vector3 } from 'three';
// import GUI from 'lil-gui';
// import Stats from 'three/examples/jsm/libs/stats.module.js';

// core engine
import { entity_manager } from '../systems/EntityManager';
import { entity } from './Entity';

// threejs systems
import { THREE } from '../components/three-defs';
import { Resizer } from '../systems/Resizer';
import { Loop } from '../systems/Loop';

// entity components
import { threejs_component } from '../components/threejs-component';
import { three_load_controller } from '../components/three-load-controller';
import { spawners } from '../components/spawners';


// WorldScene instruments
import { createPerspectiveCamera } from "../utils/cameras"
import { createOrbitControls } from "../utils/controls"
import { createAmbientLight, createPointLight } from '../utils/lights';
import { helperAddToLoopRecursevly, findClassByNameIdRecursevly } from '../utils/helpers';

// WorldScene decorations
import type { IPlanetoid } from '../types/StarsStoreTypes';
import { PlanetoidGroupClass } from './PlanetoidGroupClass';
import { SpaceCraftClass } from './SpaceCraftClass';
import { CharacterGroupClass } from './CharacterGroupClass';

// Connect to App stores
import useStarSystemsStore from "../stores/StarsSystemsStore";
const { getStarSystemConfigByName } = useStarSystemsStore();
import useWorldSettingsStore from "../stores/WorldSettingsStore";
import { BasicCharacterController } from '../systems/BasicCharacterController';
import { gltf_component } from './gltf-component';
import { player_input } from '../systems/player-input';
import { player_entity } from './Models/Characters/player-entity';
import { third_person_camera } from '../utils/third-person-camera'
const { getWorldSettings, getWorldConstants, setTimeSpeed, setSizeScaleMultiplier, setDistanceScaleMultiplier } = useWorldSettingsStore();

// *WorldScene systems
let Renderer_: any;
let Scene_: any;
let SceneCameras_: Array<THREE.PerspectiveCamera>;
let DefaultCamera_: THREE.PerspectiveCamera;
let ActiveCamera_: THREE.PerspectiveCamera;
let DefaultControls_: any;
let Resizer_: any;
let Loop_: any;

let GUI_: any;
// *WorldScene instruments


// *WorldScene decorations
// let StarGroupClass_: any;
// let SpaceCraft_: any;
// let CharacterGroupClass_: any;

class WorldScene {
  container_: HTMLElement;
  entityManager_: any;
  textureLoader: any;

  constructor(container: HTMLElement) {
    this.container_ = container;
    SceneCameras_ = [];

    // core engine
    this.entityManager_ = new entity_manager.EntityManager();

    // threejs systems component
    const threejs = new entity.Entity();
    threejs.AddComponent(new threejs_component.ThreeJSController());
    this.entityManager_.Add(threejs, 'threejs');

    const threeLoader = new entity.Entity();
    threeLoader.AddComponent(new three_load_controller.LoadController());
    this.entityManager_.Add(threeLoader, 'loader');

    Renderer_ = threejs.GetComponent('ThreeJSController').threejsRenderer_;
    Scene_ = threejs.GetComponent('ThreeJSController').scene_; // createScene(Renderer_, this.textureLoader);
    DefaultCamera_ = threejs.GetComponent('ThreeJSController').camera_;
    SceneCameras_.push(DefaultCamera_);

    DefaultControls_ = createOrbitControls(DefaultCamera_, Renderer_.domElement);
    ActiveCamera_ = SceneCameras_[0];
    Resizer_ = new Resizer(this.container_, ActiveCamera_, Renderer_);

    // initialize *WorldScene animation Loop
    Loop_ = new Loop(ActiveCamera_, Scene_, Renderer_);
    Loop_.updatables.push(this, this.entityManager_)

    this.OnGameStarted_();

    // attach constructed scene to the WorldTheater view
    this.container_.appendChild(Renderer_.domElement);
    // switch cameras on key press
    document.addEventListener('keydown', onKeyDown );
  }

  // initialize *WorldScene decorations
  OnGameStarted_() {
    const spawner = new entity.Entity();

    {
      const spaceShipCamera = createPerspectiveCamera();
      SceneCameras_.push(spaceShipCamera);

      spawner.AddComponent(new spawners.SpaceShipSpawner({
        scene: Scene_,
        camera: spaceShipCamera
      }));
      spawner.AddComponent(new spawners.SolarSystemSpawner({
        scene: Scene_
      }));
    }

    this.entityManager_.Add(spawner, 'spawners');

    const spaceShip = spawner.GetComponent('SpaceShipSpawner').Spawn()
    spaceShip.SetPosition(new Vector3(0,12,0));

    const solarSystem = spawner.GetComponent('SolarSystemSpawner').Spawn()
    solarSystem.SetPosition(new Vector3(5,1,-10));


    this._initGymTools();
    //this._LoadSpaceShip();
    //this.initializeStarGroup();
    //this.initSpaceCraft();
    //this.initializeCharacterGroup();
    //this._LoadPlayer();
    //this._LoadRocket();
  }

  _initGymTools() {
    // Checkers workdesk
    {
      const planeSize = 1200;

      const loader = new THREE.TextureLoader();
      const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      const repeats = planeSize / 2;
      texture.repeat.set(repeats, repeats);

      const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.position.set(0,0,0)
      mesh.rotation.x = Math.PI * -.5;
      Scene_.add(mesh);
    }
    // Ambient worklights
    {
      const ambientLight = createAmbientLight()
      Scene_.add(ambientLight)
    }
  }

  // _initLilGUI() {
  //   //Create gui instance
  //   GUI_ = new GUI();

  //   //Create object for gui's properties
  //   const settings = getWorldSettings()
  //   const guiProperties = { ...settings };

  //   GUI_.add( document, 'title' );
  //   GUI_.add(guiProperties, "timeSpeed", -100, 100).onChange(
  //     (value: number) => { setTimeSpeed(value);  }
  //   )
  //   GUI_.add(guiProperties, "planetoidScale", 0, 10000, 1000 ).onChange(
  //     (value: number) => { setSizeScaleMultiplier(value);  }
  //   )
  //   GUI_.add(guiProperties, "distanceScale", -10, 10 ).onChange(
  //     (value: number) => { setDistanceScaleMultiplier(value);  }
  //   )
  // }

  _registerCandidatesWithLoop(candidatesClass: Array<any>) {
    candidatesClass.forEach((candidate) => {
      helperAddToLoopRecursevly(candidate, (_candidate) => {
        if (_candidate.tick != null) {
          Loop_.updatables.push(_candidate)
        }
      })
    })
  }

  // makeXYZGUI(gui: any, vector3: THREE.Vector3, name: string, onChangeFn: () => {}) {
  //   const folder = gui.addFolder(name);
  //   folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  //   folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  //   folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  //   folder.open();
  // }

  // initializeStarGroup() {
  //   const _starSystemConfig: IPlanetoid = getStarSystemConfigByName(getWorldConstants().STAR_SYSTEM);
  //   StarGroupClass_ = new PlanetoidGroupClass(_starSystemConfig);
  //   Scene_.add(StarGroupClass_.threeGroup);
  //   // Register star system classes with animation Loop
  //   this._registerCandidatesWithLoop(StarGroupClass_.updatables)
  //   console.log(StarGroupClass_, Loop_)
  // }

  // initSpaceCraft() {
  //   // const _cam = createPerspectiveCamera();
  //   // const params = {
  //   //   camera: _cam,
  //   //   scene: Scene_,
  //   // }
  //   // const _controls = new BasicCharacterController(params);
  //   // const spaceCraftCamera_ = new third_person_camera.ThirdPersonCamera({
  //   //   camera: _cam,
  //   //   target: _controls,
  //   // });
  //   // ActiveCamera_ = SceneCameras_[1];

  //   // SceneCameras_.push(spaceCraftCamera_._camera);
  //   // SpaceCraft_ = new SpaceCraftClass(spaceCraftCamera_._camera);
  //   // SpaceCraft_.threeGroup.position.set(0, 5, -5);
  //   // SpaceCraft_.threeGroup.scale.set(0.125, 0.125, 0.125);
  //   // Scene_.layers.enable( 1 );
  //   // SpaceCraft_.intersectables = Scene_.children;

  //   // Scene_.add(SpaceCraft_.threeGroup);
  //   // Loop_.updatables.push(SpaceCraft_);
  // }


  // initializeCharacterGroup() {
  //   const characterCamera = createPerspectiveCamera();
  //   CharacterGroupClass_ = new CharacterGroupClass(characterCamera, parent);
  //   CharacterGroupClass_.threeGroup.scale(.5, .5, .5)
  //   // attempt to spot spawn location (planetoid surface?)

  //   // for (let potentialParentThreeGroup in [StarGroupClass_.threeGroup]) {
  //   //   if (potentialParentThreeGroup.nameId != null) {
  //   //     isParent = possibleSpawnClass.nameId == parentNameid
  //   //   }
  //   // }

  //   // const spawn = [StarGroupClass_].forEach((possibleSpawnClass: IPlanetoid) => {
  //   //   let isParent = false;

  //   // })

  //   SceneCameras_.push(CharacterGroupClass_.camera)
  //   Scene_.add(CharacterGroupClass_.cameraHelper)
  //   Loop_.updatables.push(CharacterGroupClass_)

  //   // Spawn has to be at updatable (animated) Object?
  //   // const spawnConfig = findClassByNameIdRecursevly(Loop_.updatables, getWorldConstants().CHARACTER_SPAWN);

  //   // let refToCharacterSpawnClass: any;

  //   // // loopup through star systems for matching spawn PlanetoidClass
  //   // StarGroupClass_.forEach((starSystemClass: any) => {
  //   //   if (refToCharacterSpawnClass == null) {
  //   //     const spawn = findClassByNameIdRecursevly(starSystemClass, characterSpawnName)

  //   //     if (spawn != null) {
  //   //       refToCharacterSpawnClass = spawn;
  //   //     }
  //   //   }
  //   // })

  //   // if (refToCharacterSpawnClass != null) {
  //   //   refToCharacterSpawnClass.threeGroup.children[0].add(CharacterClass_.threeGroup);
  //   //   this._registerCandidatesWithLoop([CharacterClass_]);
  //   // }
  //   // console.log(Loop_)
  // }

  // _LoadRocket() {
  //   const name = 'RocketShip';
  //   const pos = new THREE.Vector3(
  //       (Math.random() * 2.0 - 1.0) * 10,
  //       0,
  //       (Math.random() * 2.0 - 1.0) * 10);

  //   // Initialize entity class
  //   const e = new entity.Entity();

  //   // gltf_c is responsive for intantiation of the model on the Scene_
  //   const c = new gltf_component.StaticModelComponent({
  //     scene: Scene_,
  //     resourcePath: './models/aircrafts/',
  //     resourceName: name + '.glb',
  //     //resourceTexture: './models/aircrafts/wing/textures/Scifi_Panel4_1K_ao.jpg',
  //     scale: 0.05125,
  //     //emissive: new THREE.Color(0xff0000),
  //     //specular: new THREE.Color(0xFFFFFF),
  //     receiveShadow: true,
  //     castShadow: true,
  //   });
  //   e.AddComponent(c);
  //   // e.AddComponent(
  //   //     new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  //   e.SetPosition(pos);
  //   this.entityManager_.Add(e);
  //   e.SetActive(false);
  // }

  // _LoadSpaceShip() {
  //   const _cam = createPerspectiveCamera();
  //   SceneCameras_.push(_cam);

  //   const params = {
  //     camera: SceneCameras_[1],
  //     scene: Scene_,
  //     enabled: false
  //   };

  //   const player = new entity.Entity();
  //   player.AddComponent(new player_input.BasicCharacterControllerInput(params));
  //   player.AddComponent(new player_entity.BasicCharacterController(params));

  //   this.entityManager_.Add(player, 'player');

  //   const camera = new entity.Entity();
  //   camera.AddComponent(
  //       new third_person_camera.ThirdPersonCamera({
  //           camera: _cam,
  //           target: this.entityManager_.Get('player')}));
  //   this.entityManager_.Add(camera, 'player-camera');
  // }

  // _LoadPlayer() {
  //   // const params = {
  //   //   camera: SceneCameras_[1],
  //   //   scene: Scene_,
  //   // };

  //   // const levelUpSpawner = new entity.Entity();
  //   // levelUpSpawner.AddComponent(new level_up_component.LevelUpComponentSpawner({
  //   //     camera: SceneCameras_[1],
  //   //     scene: Scene_,
  //   // }));
  //   // this.entityManager_.Add(levelUpSpawner, 'level-up-spawner');

  //   // const axe = new entity.Entity();
  //   // axe.AddComponent(new inventory_controller.InventoryItem({
  //   //     type: 'weapon',
  //   //     damage: 3,
  //   //     renderParams: {
  //   //       name: 'Axe',
  //   //       scale: 0.25,
  //   //       icon: 'war-axe-64.png',
  //   //     },
  //   // }));
  //   // this.entityManager_.Add(axe);

  //   // const sword = new entity.Entity();
  //   // sword.AddComponent(new inventory_controller.InventoryItem({
  //   //     type: 'weapon',
  //   //     damage: 3,
  //   //     renderParams: {
  //   //       name: 'Sword',
  //   //       scale: 0.25,
  //   //       icon: 'pointy-sword-64.png',
  //   //     },
  //   // }));
  //   // this.entityManager_.Add(sword);

  //   // const girl = new entity.Entity();
  //   // girl.AddComponent(new gltf_component.AnimatedModelComponent({
  //   //     scene: this._scene,
  //   //     resourcePath: './resources/girl/',
  //   //     resourceName: 'peasant_girl.fbx',
  //   //     resourceAnimation: 'Standing Idle.fbx',
  //   //     scale: 0.035,
  //   //     receiveShadow: true,
  //   //     castShadow: true,
  //   // }));
  //   // girl.AddComponent(new spatial_grid_controller.SpatialGridController({
  //   //     grid: this._grid,
  //   // }));
  //   // girl.AddComponent(new player_input.PickableComponent());
  //   // girl.AddComponent(new quest_component.QuestComponent());
  //   // girl.SetPosition(new THREE.Vector3(30, 0, 0));
  //   // this.entityManager_.Add(girl);

  //   //const player = new entity.Entity();
  //   // player.AddComponent(new player_input.BasicCharacterControllerInput(params));
  //   // player.AddComponent(new player_entity.BasicCharacterController(params));
  //   // player.AddComponent(
  //   //   new equip_weapon_component.EquipWeapon({anchor: 'RightHandIndex1'}));
  //   // player.AddComponent(new inventory_controller.InventoryController(params));
  //   // player.AddComponent(new health_component.HealthComponent({
  //   //     updateUI: true,
  //   //     health: 100,
  //   //     maxHealth: 100,
  //   //     strength: 50,
  //   //     wisdomness: 5,
  //   //     benchpress: 20,
  //   //     curl: 100,
  //   //     experience: 0,
  //   //     level: 1,
  //   // }));
  //   // player.AddComponent(
  //   //     new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  //   // player.AddComponent(new attack_controller.AttackController({timing: 0.7}));
  //   //this.entityManager_.Add(player, 'player');

  //   // player.Broadcast({
  //   //     topic: 'inventory.add',
  //   //     value: axe.Name,
  //   //     added: false,
  //   // });

  //   // player.Broadcast({
  //   //     topic: 'inventory.add',
  //   //     value: sword.Name,
  //   //     added: false,
  //   // });

  //   // player.Broadcast({
  //   //     topic: 'inventory.equip',
  //   //     value: sword.Name,
  //   //     added: false,
  //   // });

  //   // const camera = new entity.Entity();
  //   // camera.AddComponent(
  //   //     new third_person_camera.ThirdPersonCamera({
  //   //         camera: this._camera,
  //   //         target: this.entityManager_.Get('player')}));
  //   // this.entityManager_.Add(camera, 'player-camera');

  //   // for (let i = 0; i < 50; ++i) {
  //   //   const monsters = [
  //   //     {
  //   //       resourceName: 'Ghost.fbx',
  //   //       resourceTexture: 'Ghost_Texture.png',
  //   //     },
  //   //     {
  //   //       resourceName: 'Alien.fbx',
  //   //       resourceTexture: 'Alien_Texture.png',
  //   //     },
  //   //     {
  //   //       resourceName: 'Skull.fbx',
  //   //       resourceTexture: 'Skull_Texture.png',
  //   //     },
  //   //     {
  //   //       resourceName: 'GreenDemon.fbx',
  //   //       resourceTexture: 'GreenDemon_Texture.png',
  //   //     },
  //   //     {
  //   //       resourceName: 'Cyclops.fbx',
  //   //       resourceTexture: 'Cyclops_Texture.png',
  //   //     },
  //   //     {
  //   //       resourceName: 'Cactus.fbx',
  //   //       resourceTexture: 'Cactus_Texture.png',
  //   //     },
  //   //   ];
  //   //   const m = monsters[math.rand_int(0, monsters.length - 1)];

  //   //   const npc = new entity.Entity();
  //   //   npc.AddComponent(new npc_entity.NPCController({
  //   //       camera: this._camera,
  //   //       scene: this._scene,
  //   //       resourceName: m.resourceName,
  //   //       resourceTexture: m.resourceTexture,
  //   //   }));
  //   //   npc.AddComponent(
  //   //       new health_component.HealthComponent({
  //   //           health: 50,
  //   //           maxHealth: 50,
  //   //           strength: 2,
  //   //           wisdomness: 2,
  //   //           benchpress: 3,
  //   //           curl: 1,
  //   //           experience: 0,
  //   //           level: 1,
  //   //           camera: this._camera,
  //   //           scene: this._scene,
  //   //       }));
  //   //   npc.AddComponent(
  //   //       new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  //   //   npc.AddComponent(new health_bar.HealthBar({
  //   //       parent: this._scene,
  //   //       camera: this._camera,
  //   //   }));
  //   //   npc.AddComponent(new attack_controller.AttackController({timing: 0.35}));
  //   //   npc.SetPosition(new THREE.Vector3(
  //   //       (Math.random() * 2 - 1) * 500,
  //   //       0,
  //   //       (Math.random() * 2 - 1) * 500));
  //   //   this.entityManager_.Add(npc);
  //   //}
  // }

  tick(delta: number) {
    //this.stats.update();
    //DefaultCameraHelper_.update();
  }

  start() { Loop_.start(); }

  stop() { Loop_.stop(); }
}



function onKeyDown( event: KeyboardEvent ) {
  switch ( event.key ) {
    case '1':
      ActiveCamera_ = SceneCameras_[0];
      ActiveCamera_.updateProjectionMatrix();
      DefaultControls_.enabled = true;
      //SpaceCraft_.enabled = false

      Loop_.camera = ActiveCamera_;
      Resizer_.camera = ActiveCamera_;
      break;
    case '2':
      ActiveCamera_ = SceneCameras_[1];
      ActiveCamera_.updateProjectionMatrix();
      DefaultControls_.enabled = false;
      //SpaceCraft_.enabled = true

      Loop_.camera = ActiveCamera_
      Resizer_.camera = ActiveCamera_
      break;
    case '3':
      // ActiveCamera_ = SceneCameras_[2];
      // ActiveCamera_.updateProjectionMatrix();
      // DefaultControls_.enabled = false;

      // Loop_.camera = ActiveCamera_
      // Resizer_.camera = ActiveCamera_
      break;
  }
}

export { WorldScene };
