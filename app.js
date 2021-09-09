//app.js
let camera, scene, cubes, light, renderer; //定义摄像机、场景、几何体、光源、渲染器变量
const originalPoint = new THREE.Vector3(0, 0, 0); //设置原点

// 画布初始化
function initCanvas() {
  const width = window.innerWidth; //获取窗口的的宽度(不包含工具条与滚动条)
  const height = window.innerHeight; //获取窗口的高度(不包含工具条与滚动条)
  renderer = new THREE.WebGLRenderer({
    antialias: true, //开启反锯齿
  }); // 实例化一个WebGL 渲染器
  renderer.setSize(width, height);
  //告诉渲染器需要阴影效果
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 默认的是，没有设置的这个清晰 THREE.PCFShadowMap，可有效减少马赛克
  renderer.setClearColor(0xffffff, 1.0);
  document.getElementById("can").appendChild(renderer.domElement);
}
// 场景初始化
function initScene() {
  scene = new THREE.Scene();
}
// 摄像机初始化
function initCamera() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  ); //实例化透视投影摄像机
  camera.position.set(200, 400, 600); //设置相机的摆放位置(x,y,z)
  camera.up.set(0, 1, 0); // 正向(up方向为y轴正方向)，此属性表示我们以哪个方向作为图的上方
  camera.lookAt(originalPoint); //设置相机望向哪里
  scene.add(camera);
}
// 光源初始化
function initLight() {
  light = new THREE.DirectionalLight(0xffffff, 1, 100); // 平行光
  light.position.set(100, 100, -100);
  //这两个值决定使用多少像素生成阴影
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 50; //产生阴影的最近距离
  light.shadow.camera.far = 500; //产生阴影的最远距离
  light.shadow.camera.left = -50; //产生阴影距离位置的最左边位置
  light.shadow.camera.right = 50; //最右边
  light.shadow.camera.top = 50; //最上边
  light.shadow.camera.bottom = -50; //最下面
  light.castShadow = true;
  scene.add(light);
}
// 魔方
/**
 * @param {魔方中心点坐标x} x
 * @param {魔方中心点坐标y} y
 * @param {魔方中心点坐标z} z
 * @param {魔方阶数} num
 * @param {方块高宽} len
 * @param {面颜色} colors
 * @returns
 */
//设置魔方参数
const cubeParams = {
  x: 0,
  y: 0,
  z: 0,
  num: 3,
  len: 50,
  colors: [
    "rgba(255,73,120,1)",
    "rgba(0,141,255,1)",
    "rgba(20,205,50,1)",
    "rgba(178,34,34,1)",
    "rgba(255,255,0,1)",
    "rgba(255,255,255,1)",
  ],
};
function generateCube(x, y, z, num, len, colors) {
  let leftUpX = x - (num / 2) * len;
  let leftUpY = y + (num / 2) * len;
  let leftUpZ = z + (num / 2) * len;
  // 构造材质
  let materialArr = [];
  for (let i = 0; i < colors.length; i++) {
    let texture = new THREE.Texture(faces(colors[i]));
    texture.needsUpdate = true;
    let material = new THREE.MeshLambertMaterial({ map: texture }); //MeshLambertMaterial用于非发光表面的材料
    materialArr.push(material);
  }
  let cubes = [];
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num * num; j++) {
      let cubegeo = new THREE.BoxGeometry(len, len, len); //BoxGeometry是具有给定的宽度，高度和深度的矩形长方体的几何类
      let cube = new THREE.Mesh(cubegeo, materialArr);
      //依次计算各个小方块中心点坐标
      cube.position.x = leftUpX + len / 2 + (j % num) * len;
      cube.position.y = leftUpY - len / 2 - parseInt(j / num) * len;
      cube.position.z = leftUpZ - len / 2 - i * len;
      cube.castShadow = true;
      cubes.push(cube);
    }
  }
  return cubes;
}
//生成canvas素材
function faces(rgbaColor) {
  var canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  var context = canvas.getContext("2d");
  if (context) {
    //画一个宽高256的黑色正方形
    context.fillStyle = "rgba(1,0,0,1)";
    context.fillRect(0, 0, 256, 256);
    context.rect(16, 16, 224, 224); //画一个宽高为224正方形
    context.lineJoin = "round"; //将正方形变为圆角
    context.lineWidth = 16; //16px宽的线
    context.fillStyle = rgbaColor; //填充颜色
    context.strokeStyle = rgbaColor;
    context.stroke(); //canvas.stroke() 方法会实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径
    context.fill();
  } else {
    console.info("当前浏览器版本不支持Canvas！");
  }
  return canvas;
}

// 几何体初始化
function initCubeObject() {
  //生成魔方小正方体
  cubes = generateCube(
    cubeParams.x,
    cubeParams.y,
    cubeParams.z,
    cubeParams.num,
    cubeParams.len,
    cubeParams.colors
  );
  for (let i = 0; i < cubes.length; i++) {
    let item = cubes[i];
    scene.add(item); //并依次加入到场景中
  }
}

//初始化底部平面
function initPlane() {
  const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 20, 20); //实例化一个平面几何体
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  //水平面旋转并且设置位置
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = -140;
  plane.position.z = 0;
  //告诉底部平面需要接收阴影
  plane.receiveShadow = true;
  scene.add(plane);
}

// 渲染器
function render() {
  renderer.clear();
  renderer.render(scene, camera);
}
// 入口
function main() {
  initCanvas();
  initScene();
  initCamera();
  initLight();
  initCubeObject();
  initPlane();
  render();
}