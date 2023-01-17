import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Raycaster, Vector2, Vector3, Quaternion } from 'three'

let clickFlag = false
let dblClickFlag = false
let contextClickFlag = false
const mouse = new Vector2(1, 1)
const raycaster = new Raycaster()

const KEYS = {
  'a': 65,
  's': 83,
  'w': 87,
  'd': 68,
};

function onMouseClick(event) {
  if (clickFlag) {
    return event.preventDefault();
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  clickFlag = true
  console.debug('onMouseClick', clickFlag, event, mouse)
}

function onMouseDblClick(event) {
  //event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  dblClickFlag = true
  console.debug('onMouseDblClick', dblClickFlag, event, mouse)
}

function onMouseContext(event) {
  //event.preventDefault();
  contextClickFlag = true
  console.debug('onMouseContext', event)
}

function createOrbitControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // Forward controls.update to our custom .tick method
  controls.tick = (delta, updatables) => {
    // Act on left click
    if (dblClickFlag) {
      dblClickFlag = false
      // find btn mesh connection and switch to its camera
      raycaster.setFromCamera(mouse, camera);
      // ! avoid intersectObjects undefined object.layer error for OrbitControls in updatables
      const eligibleMeshes = updatables.filter(u => u.type === 'Mesh')
      const intersection = raycaster.intersectObjects(eligibleMeshes);

      if (intersection.length > 0) {

        // find celestial object that has name
        for (var i = 0; i < intersection.length; i++) {

          if (intersection[i].object && intersection[i].object.name
            && intersection[i].object.name.includes(' MeshGroup')) {

              const meshSurface = intersection[i].object.scale.x
            const cameraOrbitOffset = 2

            controls.saveState();
            controls.target.copy(intersection[i].object.position);

            camera.position.copy(intersection[i].object.position)
              .add(new Vector3(0, 0, meshSurface * cameraOrbitOffset));
            camera.lookAt(intersection[i].object.position);
            camera.updateProjectionMatrix()

            console.log('touch spotted', intersection[i])
            break
          }

        }

      }

    } else if (contextClickFlag) {
      contextClickFlag = false
      // return to default camera on right click
      controls.reset();
      //camera.position.set(0,0,100)
      //camera.lookAt(controls.position);
    }

    controls.update();
  }

  document.addEventListener('click', onMouseClick) // Left click
  document.addEventListener('dblclick', onMouseDblClick) // Left, Left, Dbl
  document.addEventListener('contextmenu', onMouseContext) // Right click

  return controls;
}

function createFlyControls(camera, canvas, options = AppSettings.FLY_CONTROLS) {
  const controls = new FlyControls(camera, canvas);
  controls.lookSpeed = options.lookSpeed;
  controls.movementSpeed = options.movementSpeed;
  controls.noFly = options.noFly;
  controls.lookVertical = options.lookVertical;
  controls.constrainVertical = options.constrainVertical;
  controls.verticalMin = options.verticalMin;
  controls.verticalMax = options.verticalMax;
  controls.lon = options.lon;
  controls.lat = options.lat;
  controls.dragToLook = options.dragToLook;
  controls.rollSpeed = options.rollSpeed;

  // Forward controls.update to our custom .tick method
  controls.tick = (delta, updatables) => {
    // Act on left click
    if (dblClickFlag) {
      dblClickFlag = false
      // find btn mesh connection and switch to its camera
      raycaster.setFromCamera(mouse, camera);
      // ! avoid intersectObjects undefined object.layer error for OrbitControls in updatables
      const eligibleMeshes = updatables.filter(u => u.type === 'Mesh')
      const intersection = raycaster.intersectObjects(eligibleMeshes);

      for (var i = 0; i < intersection.length; i++) {
        if (intersection[i].object && intersection[i].object.name
          && intersection[i].object.name.includes(' MeshGroup')) {
          const meshSurface = intersection[i].object.scale.x
          const cameraOrbitOffset = 2
          camera.position.copy(intersection[i].object.position)
            .add(new Vector3(0, 0, meshSurface * cameraOrbitOffset));
          camera.lookAt(intersection[i].object.position);
          camera.updateProjectionMatrix();
          break
        }
      }
    } else if (contextClickFlag) {
      contextClickFlag = false
      // return to default camera on right click
    }
    //controls.update();
  }
  document.addEventListener('click', onMouseClick) // Left click
  document.addEventListener('dblclick', onMouseDblClick) // Left, Left, Dbl
  document.addEventListener('contextmenu', onMouseContext) // Right click
  return controls;
}

function createFpsControls(camera, canvas, options = AppSettings.FPS_CONTROLS) {
  const controls = new FirstPersonControls(camera, canvas);
  controls.movementSpeed = options.movementSpeed;
  controls.activeLook = true; // def true
  controls.autoForward = false; // def false
  //controls.lookSpeed = options.lookSpeed;

  // Forward controls.update to our custom .tick method
  controls.tick = (delta, updatables) => {
    // Act on left click
    if (dblClickFlag) {
      dblClickFlag = false
      // find btn mesh connection and switch to its camera
      raycaster.setFromCamera(mouse, camera);
      // ! avoid intersectObjects undefined object.layer error for OrbitControls in updatables
      const eligibleMeshes = updatables.filter(u => u.type === 'Mesh')
      const intersection = raycaster.intersectObjects(eligibleMeshes);

      for (var i = 0; i < intersection.length; i++) {
        if (intersection[i].object && intersection[i].object.name
          && intersection[i].object.name.includes(' MeshGroup')) {
          const meshSurface = intersection[i].object.scale.x
          const cameraOrbitOffset = 2
          camera.position.copy(intersection[i].object.position)
            .add(new Vector3(0, 0, meshSurface * cameraOrbitOffset));
          camera.lookAt(intersection[i].object.position);
          camera.updateProjectionMatrix();
          break
        }
      }
    } else if (contextClickFlag) {
      contextClickFlag = false
      // return to default camera on right click
    }

    controls.update(controls.movementSpeed);
  }
  document.addEventListener('click', onMouseClick) // Left click
  document.addEventListener('dblclick', onMouseDblClick) // Left, Left, Dbl
  document.addEventListener('contextmenu', onMouseContext) // Right click
  return controls;
}

function createPointerLockControls(cameraRig, canvas, options = AppSettings.FLY_CONTROLS) {
  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');
  const raycaster_ = new Raycaster(new Vector3(), new Vector3(0, - 1, 0), 0, 10);

  const controls = new PointerLockControls(cameraRig.camera, canvas);
  controls.isLocked === true

  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let canJump = false;

  const velocity = new Vector3();
  const direction = new Vector3();
  const vertex = new Vector3();
  //const color = new Color();

  const onKeyDown = function (event) {

    switch (event.code) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;

      case 'Space':
        if (canJump === true) velocity.y += 5;
        canJump = false;
        break;

    }

  };

  const onKeyUp = function (event) {

    switch (event.code) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;

    }

  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  instructions.addEventListener('click', function () {
    console.log('click')
    controls.lock();
  });

  controls.addEventListener('lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';

  });

  controls.addEventListener('unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';

  });

  // Forward controls.update to our custom .tick method
  controls.tick = (delta, updatables) => {

    {
        // Act on left click
        // if (dblClickFlag) {
        //   dblClickFlag = false
        //   // find btn mesh connection and switch to its camera
        //   raycaster_.setFromCamera(mouse, camera);
        //   // ! avoid intersectObjects undefined object.layer error for OrbitControls in updatables
        //   const eligibleMeshes = updatables.filter(u => u.type === 'Mesh')
        //   const intersection = raycaster_.intersectObjects(eligibleMeshes);

        //   for (var i = 0; i < intersection.length; i++) {
        //     if (intersection[i].object && intersection[i].object.name
        //       && intersection[i].object.name.includes(' MeshGroup')) {
        //       const meshSurface = intersection[i].object.scale.x
        //       const cameraOrbitOffset = 2
        //       camera.position.copy(intersection[i].object.position)
        //         .add(new Vector3(0, 0, meshSurface * cameraOrbitOffset));
        //       camera.lookAt(intersection[i].object.position);
        //       camera.updateProjectionMatrix();
        //       break
        //     }
        //   }
        // } else if (contextClickFlag) {
        //   contextClickFlag = false
        //   // return to default camera on right click
        // }
    }

    if (controls.isLocked === true) {
      const floor = cameraRig.camera.floor
      const mass = 10
      const Mmass = 1
      // Calculate direction of force
      var force = new Vector3().subVectors(cameraRig.camera.position, cameraRig.camera.floor.position);
      console.log(force)

      // Get the length of this quaternion vector(?).
      var d = force.lengthSq();

      if (d < 0) d *= -1;

      force = force.normalize();

      // Calculate gravitional force magnitude
      var strength = - (9.98 * mass * delta) / (d);

      // Get force vector --> magnitude * direction
      force = force.multiplyScalar(strength);


      if (!mass) mass = 1.0;
      var f = force.divideScalar(mass);

      const newRigPosition = cameraRig.rig.position.add(f);
      //@todo avoid altering floor position
      const xx = floor.position.add(floor.scale).x
      const xxx = floor.position.sub(floor.scale).x
      const yy = floor.position.add(floor.scale).y
      const yyy = floor.position.sub(floor.scale).y
      const zz = floor.position.add(floor.scale).z
      const zzz = floor.position.sub(floor.scale).z
      if (
        (newRigPosition.x > xx || newRigPosition.x < xxx) &&
        (newRigPosition.y > yy || newRigPosition.y < yyy) &&
        (newRigPosition.z > zz || newRigPosition.z < zzz)
      ) {
        cameraRig.rig.position.set(newRigPosition)
      }




      // let quaternion = camera.quaternion;

      // if (quaternion) {
      //   force
      //     .copy(camera.position).sub(camera.floor.position)
      //     .applyQuaternion(quaternion)

      // } else {
      //   force
      //     .copy(camera.position).sub(camera.floor.position)
      // }

      // camera.position.addVectors(camera.floor.position, force);
      // camera.lookAt(camera.floor.position);


      // Turn vertical against gravity parent
      //floor.rotation.set(0, -1, -1)

      // camera.applyQuaternion(quaternion); // Apply Quaternion
      // camera.quaternion.normalize();  // Normalize Quaternion
      // camera.lookAt(floor.position)

      // Attract controls body to gravity parent


      raycaster_.ray.origin.copy(controls.getObject().position);
      //raycaster_.layers
      raycaster_.ray.origin.y -= 10;

      const eligibleMeshes = updatables.filter(u => u.type === 'Mesh')
      //const intersection = raycaster.intersectObjects(eligibleMeshes);

      const intersections = raycaster_.intersectObjects(eligibleMeshes);
      const onObject = intersections.length > 0;

      //const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * 100.0 * delta;
      velocity.z -= velocity.z * 100.0 * delta;

      //velocity.y -= 9.8 * mass * delta;

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

      if (onObject === true) {

        velocity.y = Math.max(0, velocity.y);
        canJump = true;

      }

      controls.moveRight(- velocity.x * delta);
      controls.moveForward(- velocity.z * delta);

      controls.getObject().position.y += (velocity.y * delta); // new behavior



      // get direction vector
      if (controls.getObject().position.y < floor.position.y) {

        velocity.y = 0;
        //controls.getObject().position.y = floor.scale.y + 0.01;

        canJump = true;

      }

    }

  }

  return controls;
}

export { createOrbitControls, createFlyControls, createFpsControls, createPointerLockControls };
