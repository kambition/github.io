import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// 专业的模型加载器
export class ModelLoader {
    constructor() {
        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        // 设置Draco解码器路径（用于压缩模型）
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }

    // 加载GLTF/GLB模型
    loadModel(url) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    resolve(gltf);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(2);
                    console.log(`Loading: ${percent}%`);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    // 清理资源
    dispose() {
        if (this.dracoLoader) {
            this.dracoLoader.dispose();
        }
    }
}

// 创建专业的人体骨骼模型 - 平躺姿势 (Supine Position)
export function createRealisticSkeleton() {
    const skeletonGroup = new THREE.Group();
    skeletonGroup.userData.type = 'skeleton';

    // 更真实的骨骼材质
    const boneMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff8dc,  // 象牙白
        metalness: 0.1,
        roughness: 0.7,
        emissive: 0x222222,
        emissiveIntensity: 0.05,
        transparent: true,
        opacity: 0.95
    });

    // ========== 头部 (Head) ==========
    // 颅骨 - 更真实的形状 (人平躺,头在Y轴正方向)
    const skullGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const skull = new THREE.Mesh(skullGeometry, boneMaterial);
    skull.position.set(0, 7.5, 0);  // 平躺时头部位置
    skull.scale.set(1, 1.2, 1.15);  // 更符合人头形状
    skull.castShadow = true;
    skull.userData.type = 'skeleton';
    skeletonGroup.add(skull);

    // 下颌骨
    const jawGeometry = new THREE.BoxGeometry(1, 0.3, 0.6);
    const jaw = new THREE.Mesh(jawGeometry, boneMaterial);
    jaw.position.set(0, 6.8, 0.8);
    jaw.userData.type = 'skeleton';
    skeletonGroup.add(jaw);

    // ========== 颈椎和脊柱 (Cervical & Spine) ==========

    // 颈椎 - 7节 (C1-C7)
    for (let i = 0; i < 7; i++) {
        const vertebraGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.2, 12);
        const vertebra = new THREE.Mesh(vertebraGeo, boneMaterial);
        vertebra.position.set(0, 6.2 - i * 0.25, -0.2);
        vertebra.rotation.x = Math.PI / 2;  // 旋转使其水平
        vertebra.userData.type = 'skeleton';
        skeletonGroup.add(vertebra);
    }

    // 胸椎 - 12节 (T1-T12)
    for (let i = 0; i < 12; i++) {
        const size = 0.18 + i * 0.008;
        const vertebraGeo = new THREE.CylinderGeometry(size, size + 0.02, 0.25, 12);
        const vertebra = new THREE.Mesh(vertebraGeo, boneMaterial);
        vertebra.position.set(0, 4.5 - i * 0.35, -0.3);
        vertebra.rotation.x = Math.PI / 2;
        vertebra.userData.type = 'skeleton';
        skeletonGroup.add(vertebra);
        
        // 椎骨横突 (Transverse processes)
        const transverseGeo = new THREE.BoxGeometry(0.7, 0.08, 0.12);
        const leftProcess = new THREE.Mesh(transverseGeo, boneMaterial);
        leftProcess.position.set(-0.35, 4.5 - i * 0.35, -0.3);
        leftProcess.userData.type = 'skeleton';
        skeletonGroup.add(leftProcess);
        
        const rightProcess = leftProcess.clone();
        rightProcess.position.x = 0.35;
        rightProcess.userData.type = 'skeleton';
        skeletonGroup.add(rightProcess);
    }

    // 腰椎 - 5节 (L1-L5)
    for (let i = 0; i < 5; i++) {
        const size = 0.25 + i * 0.01;
        const vertebraGeo = new THREE.CylinderGeometry(size, size + 0.03, 0.3, 12);
        const vertebra = new THREE.Mesh(vertebraGeo, boneMaterial);
        vertebra.position.set(0, 0.7 - i * 0.35, -0.3);
        vertebra.rotation.x = Math.PI / 2;
        vertebra.userData.type = 'skeleton';
        skeletonGroup.add(vertebra);
    }

    // ========== 胸廓 (Thoracic Cage) ==========

    // 肋骨已完全移除，以便更清晰地观察内部器官和血管系统
    // Ribs completely removed for better visibility of internal organs and blood vessels

    // 胸骨 (平躺时在前方)
    const sternumGeo = new THREE.BoxGeometry(0.25, 1.5, 0.18);
    const sternum = new THREE.Mesh(sternumGeo, boneMaterial);
    sternum.position.set(0, 3.2, 1.8);  // 胸部中央前方
    sternum.userData.type = 'skeleton';
    skeletonGroup.add(sternum);

    // ========== 肩带 (Shoulder Girdle) ==========

    // 锁骨 (Clavicles) - 平躺时横向延伸
    const clavicleCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0.2, 4.8, 1.5),    // 靠近胸骨
        new THREE.Vector3(1.5, 4.9, 1.2),    // 中点略向上
        new THREE.Vector3(2.8, 4.7, 0.5)     // 肩膀位置
    );
    const clavicleGeo = new THREE.TubeGeometry(clavicleCurve, 20, 0.08, 8, false);
    
    const leftClavicle = new THREE.Mesh(clavicleGeo, boneMaterial);
    leftClavicle.userData.type = 'skeleton';
    skeletonGroup.add(leftClavicle);
    
    const rightClavicle = leftClavicle.clone();
    rightClavicle.scale.x = -1;
    rightClavicle.userData.type = 'skeleton';
    skeletonGroup.add(rightClavicle);

    // 肩胛骨 (Scapulae) - 平躺时在背部
    const scapulaGeo = new THREE.BoxGeometry(0.8, 1.2, 0.15);
    
    const leftScapula = new THREE.Mesh(scapulaGeo, boneMaterial);
    leftScapula.position.set(-2.2, 4, -0.6);  // 背部位置
    leftScapula.rotation.y = 0.2;
    leftScapula.userData.type = 'skeleton';
    skeletonGroup.add(leftScapula);
    
    const rightScapula = leftScapula.clone();
    rightScapula.position.x = 2.2;
    rightScapula.rotation.y = -0.2;
    rightScapula.userData.type = 'skeleton';
    skeletonGroup.add(rightScapula);

    // ========== 骨盆 (Pelvis) ==========

    // 骨盆 - 髋骨 (平躺姿势)
    const pelvisRingGeo = new THREE.TorusGeometry(1.8, 0.2, 12, 24, Math.PI);
    const pelvisRing = new THREE.Mesh(pelvisRingGeo, boneMaterial);
    pelvisRing.position.set(0, -0.8, -0.2);
    pelvisRing.rotation.x = Math.PI / 2;
    pelvisRing.castShadow = true;
    pelvisRing.userData.type = 'skeleton';
    skeletonGroup.add(pelvisRing);

    // 髂骨翼 (Iliac wings)
    const iliumGeo = new THREE.BoxGeometry(1.2, 0.8, 0.15);
    const leftIlium = new THREE.Mesh(iliumGeo, boneMaterial);
    leftIlium.position.set(-1.5, -0.3, -0.4);
    leftIlium.rotation.z = -0.15;
    leftIlium.userData.type = 'skeleton';
    skeletonGroup.add(leftIlium);
    
    const rightIlium = leftIlium.clone();
    rightIlium.position.x = 1.5;
    rightIlium.rotation.z = 0.15;
    rightIlium.userData.type = 'skeleton';
    skeletonGroup.add(rightIlium);

    // 骶骨 (Sacrum)
    const sacrumGeo = new THREE.BoxGeometry(0.8, 1, 0.2);
    const sacrum = new THREE.Mesh(sacrumGeo, boneMaterial);
    sacrum.position.set(0, -1.2, -0.3);
    sacrum.userData.type = 'skeleton';
    skeletonGroup.add(sacrum);

    // ========== 上肢骨骼 (Upper Limbs) ==========

    // 上肢骨骼 (平躺,手臂放在身体两侧)
    createArmBonesLying(skeletonGroup, boneMaterial, -2.8, 'left');
    createArmBonesLying(skeletonGroup, boneMaterial, 2.8, 'right');

    // ========== 下肢骨骼 (Lower Limbs) ==========
    // 下肢骨骼 (平躺,腿伸直)
    createLegBonesLying(skeletonGroup, boneMaterial, -0.9, 'left');
    createLegBonesLying(skeletonGroup, boneMaterial, 0.9, 'right');

    return skeletonGroup;
}

// 创建手臂骨骼 - 平躺姿势 (手臂放在身体两侧)
function createArmBonesLying(group, material, xOffset, side) {
    const sideMultiplier = side === 'left' ? -1 : 1;
    
    // 肱骨 (Humerus) - 上臂骨
    const humerusGeo = new THREE.CylinderGeometry(0.1, 0.09, 2.2, 12);
    const humerus = new THREE.Mesh(humerusGeo, material);
    humerus.position.set(xOffset, 3.2, 0.2);
    humerus.rotation.x = Math.PI / 2;  // 水平放置
    humerus.rotation.z = sideMultiplier * 0.1;
    humerus.userData.type = 'skeleton';
    group.add(humerus);

    // 桡骨 (Radius) - 前臂外侧骨
    const radiusGeo = new THREE.CylinderGeometry(0.06, 0.055, 1.8, 10);
    const radius = new THREE.Mesh(radiusGeo, material);
    radius.position.set(xOffset, 1.2, 0.3);
    radius.rotation.x = Math.PI / 2;
    radius.userData.type = 'skeleton';
    group.add(radius);

    // 尺骨 (Ulna) - 前臂内侧骨
    const ulna = radius.clone();
    ulna.position.z = 0.1;
    ulna.scale.set(0.9, 1, 0.9);
    ulna.userData.type = 'skeleton';
    group.add(ulna);

    // 手掌骨 (Hand bones)
    const handGeo = new THREE.BoxGeometry(0.15, 0.6, 0.4);
    const hand = new THREE.Mesh(handGeo, material);
    hand.position.set(xOffset, 0.1, 0.2);
    hand.userData.type = 'skeleton';
    group.add(hand);

    // 手指骨 (Finger bones)
    for (let i = 0; i < 5; i++) {
        const fingerGeo = new THREE.BoxGeometry(0.12, 0.04, 0.04);
        const finger = new THREE.Mesh(fingerGeo, material);
        finger.position.set(xOffset, -0.2, 0.3 - i * 0.09);
        finger.userData.type = 'skeleton';
        group.add(finger);
    }
}

// 创建腿部骨骼 - 平躺姿势 (腿伸直)
function createLegBonesLying(group, material, xOffset, side) {
    // 股骨 (Femur) - 大腿骨
    const femurGeo = new THREE.CylinderGeometry(0.12, 0.11, 3.2, 12);
    const femur = new THREE.Mesh(femurGeo, material);
    femur.position.set(xOffset, -2.8, -0.1);
    femur.userData.type = 'skeleton';
    femur.castShadow = true;
    group.add(femur);

    // 髌骨 (Patella) - 膝盖骨
    const patellaGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const patella = new THREE.Mesh(patellaGeo, material);
    patella.position.set(xOffset, -4.4, 0.3);
    patella.scale.set(0.8, 1, 0.6);
    patella.userData.type = 'skeleton';
    group.add(patella);

    // 胫骨 (Tibia) - 小腿骨
    const tibiaGeo = new THREE.CylinderGeometry(0.09, 0.08, 3, 10);
    const tibia = new THREE.Mesh(tibiaGeo, material);
    tibia.position.set(xOffset, -6, -0.1);
    tibia.userData.type = 'skeleton';
    group.add(tibia);

    // 腓骨 (Fibula) - 小腿细骨
    const fibula = tibia.clone();
    fibula.position.x = xOffset + (side === 'left' ? -0.15 : 0.15);
    fibula.scale.set(0.7, 1, 0.7);
    fibula.userData.type = 'skeleton';
    group.add(fibula);

    // 足部 (Foot)
    const footGeo = new THREE.BoxGeometry(0.5, 0.25, 1.5);
    const foot = new THREE.Mesh(footGeo, material);
    foot.position.set(xOffset, -7.6, 0.5);
    foot.userData.type = 'skeleton';
    group.add(foot);

    // 脚趾骨 (Toe bones)
    for (let i = 0; i < 5; i++) {
        const toeGeo = new THREE.BoxGeometry(0.08, 0.04, 0.15);
        const toe = new THREE.Mesh(toeGeo, material);
        toe.position.set(xOffset - 0.15 + i * 0.08, -7.6, 1.3);
        toe.userData.type = 'skeleton';
        group.add(toe);
    }
}

// 创建高质量心脏模型 - 教学重点增强版
export function createRealisticHeart() {
    const heartGroup = new THREE.Group();
    heartGroup.userData.type = 'heart';

    // 心脏材质 - 更真实的肌肉质感
    const heartMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc41e3a,  // 深红色
        metalness: 0.2,
        roughness: 0.3,
        emissive: 0x8b0000,
        emissiveIntensity: 0.6,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide
    });

    // 左心室 - 主泵室，壁厚（泵送动脉血到全身）
    const leftVentricleGeo = new THREE.SphereGeometry(1.4, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.75);
    const leftVentricle = new THREE.Mesh(leftVentricleGeo, heartMaterial);
    leftVentricle.position.set(-0.5, 2.2, 0);
    leftVentricle.scale.set(1.05, 1.5, 0.95);
    leftVentricle.castShadow = true;
    leftVentricle.receiveShadow = true;
    leftVentricle.userData.type = 'heart';
    leftVentricle.userData.part = 'leftVentricle';
    heartGroup.add(leftVentricle);

    // 右心室（泵送静脉血到肺部）
    const rightVentricleGeo = new THREE.SphereGeometry(1.2, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const rightVentricle = new THREE.Mesh(rightVentricleGeo, heartMaterial);
    rightVentricle.position.set(0.6, 2.2, 0.25);
    rightVentricle.scale.set(0.95, 1.35, 0.9);
    rightVentricle.castShadow = true;
    rightVentricle.receiveShadow = true;
    rightVentricle.userData.type = 'heart';
    rightVentricle.userData.part = 'rightVentricle';
    heartGroup.add(rightVentricle);

    // 心房材质 - 稍浅的颜色
    const atriumMaterial = heartMaterial.clone();
    atriumMaterial.color.setHex(0xd94450);
    atriumMaterial.emissiveIntensity = 0.4;

    // 左心房（接收来自肺的含氧血）
    const leftAtriumGeo = new THREE.SphereGeometry(1, 32, 32);
    const leftAtrium = new THREE.Mesh(leftAtriumGeo, atriumMaterial);
    leftAtrium.position.set(-0.9, 4.1, -0.2);
    leftAtrium.scale.set(1, 0.9, 0.95);
    leftAtrium.castShadow = true;
    leftAtrium.userData.type = 'heart';
    leftAtrium.userData.part = 'leftAtrium';
    heartGroup.add(leftAtrium);

    // 右心房（接收来自全身的缺氧血）
    const rightAtriumGeo = new THREE.SphereGeometry(0.95, 32, 32);
    const rightAtrium = new THREE.Mesh(rightAtriumGeo, atriumMaterial);
    rightAtrium.position.set(0.75, 4.1, 0.1);
    rightAtrium.scale.set(0.95, 0.85, 0.9);
    rightAtrium.castShadow = true;
    rightAtrium.userData.type = 'heart';
    rightAtrium.userData.part = 'rightAtrium';
    heartGroup.add(rightAtrium);

    // 心尖 - 使用锥形
    const apexGeo = new THREE.ConeGeometry(0.7, 1.2, 24);
    const apex = new THREE.Mesh(apexGeo, heartMaterial);
    apex.position.set(-0.3, 0.7, 0);
    apex.rotation.z = 0.35;
    apex.castShadow = true;
    apex.userData.type = 'heart';
    apex.userData.part = 'apex';
    heartGroup.add(apex);

    // 心室间隔（分隔左右心室的肌肉墙）
    const septumGeo = new THREE.BoxGeometry(0.15, 2, 1.5);
    const septumMaterial = heartMaterial.clone();
    septumMaterial.color.setHex(0xa83844);
    const septum = new THREE.Mesh(septumGeo, septumMaterial);
    septum.position.set(0, 2, 0.1);
    septum.rotation.z = 0.1;
    septum.userData.type = 'heart';
    heartGroup.add(septum);

    // 冠状动脉系统 - 心脏表面血管（非常重要！）
    const coronaryMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff2233,
        emissive: 0xaa0000,
        emissiveIntensity: 0.8,
        metalness: 0.3,
        roughness: 0.2,
        clearcoat: 0.6,
        shininess: 100
    });

    // 左冠状动脉主干
    const leftMainCoronary = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.3, 4.2, 0.9),
        new THREE.Vector3(-0.6, 3.8, 1),
        new THREE.Vector3(-0.9, 3.2, 1.05)
    ]);
    const leftMainArt = new THREE.Mesh(
        new THREE.TubeGeometry(leftMainCoronary, 20, 0.12, 12, false),
        coronaryMaterial
    );
    leftMainArt.castShadow = true;
    leftMainArt.userData.type = 'heart';
    heartGroup.add(leftMainArt);

    // 左前降支（LAD）- 最重要的冠状动脉
    const ladCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.9, 3.2, 1.05),
        new THREE.Vector3(-1, 2.8, 1.1),
        new THREE.Vector3(-1.1, 2.2, 1.05),
        new THREE.Vector3(-1.1, 1.5, 0.9),
        new THREE.Vector3(-0.9, 1, 0.6)
    ]);
    const lad = new THREE.Mesh(
        new THREE.TubeGeometry(ladCurve, 30, 0.1, 12, false),
        coronaryMaterial
    );
    lad.castShadow = true;
    lad.userData.type = 'heart';
    heartGroup.add(lad);

    // 左回旋支（LCX）
    const lcxCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.9, 3.2, 1.05),
        new THREE.Vector3(-1.2, 3, 0.7),
        new THREE.Vector3(-1.3, 2.5, 0.2),
        new THREE.Vector3(-1.2, 2, -0.3)
    ]);
    const lcx = new THREE.Mesh(
        new THREE.TubeGeometry(lcxCurve, 25, 0.09, 12, false),
        coronaryMaterial
    );
    lcx.castShadow = true;
    lcx.userData.type = 'heart';
    heartGroup.add(lcx);

    // 右冠状动脉（RCA）
    const rcaCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.5, 4.2, 0.9),
        new THREE.Vector3(0.9, 3.8, 1),
        new THREE.Vector3(1.2, 3.2, 0.95),
        new THREE.Vector3(1.4, 2.6, 0.7),
        new THREE.Vector3(1.3, 2, 0.3),
        new THREE.Vector3(1.1, 1.5, 0)
    ]);
    const rca = new THREE.Mesh(
        new THREE.TubeGeometry(rcaCurve, 35, 0.1, 12, false),
        coronaryMaterial
    );
    rca.castShadow = true;
    rca.userData.type = 'heart';
    heartGroup.add(rca);

    // 冠状动脉细小分支（模拟血管网络）
    for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        const height = 1.5 + Math.random() * 2.5;
        const radius = 0.9 + Math.random() * 0.4;
        
        const branchStart = new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius * 0.9
        );
        
        const branchEnd = new THREE.Vector3(
            Math.cos(angle) * (radius + 0.3),
            height + (Math.random() - 0.5) * 0.4,
            Math.sin(angle) * (radius + 0.3) * 0.9
        );
        
        const branchCurve = new THREE.LineCurve3(branchStart, branchEnd);
        const branch = new THREE.Mesh(
            new THREE.TubeGeometry(branchCurve, 8, 0.04, 6, false),
            coronaryMaterial
        );
        branch.userData.type = 'heart';
        heartGroup.add(branch);
    }

    // 心脏瓣膜（重要结构）
    const valveMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffd1dc,
        metalness: 0.1,
        roughness: 0.4,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });

    // 二尖瓣（左心房和左心室之间）
    const mitralValveGeo = new THREE.CircleGeometry(0.3, 32);
    const mitralValve = new THREE.Mesh(mitralValveGeo, valveMaterial);
    mitralValve.position.set(-0.6, 3, 0);
    mitralValve.rotation.x = Math.PI / 2;
    mitralValve.userData.type = 'heart';
    heartGroup.add(mitralValve);

    // 三尖瓣（右心房和右心室之间）
    const tricuspidValve = mitralValve.clone();
    tricuspidValve.position.set(0.6, 3, 0.2);
    tricuspidValve.scale.set(0.95, 0.95, 1);
    tricuspidValve.userData.type = 'heart';
    heartGroup.add(tricuspidValve);

    // 主动脉瓣（左心室和主动脉之间）
    const aorticValve = mitralValve.clone();
    aorticValve.position.set(-0.2, 3.5, 0.5);
    aorticValve.rotation.x = Math.PI / 3;
    aorticValve.scale.set(0.85, 0.85, 1);
    aorticValve.userData.type = 'heart';
    heartGroup.add(aorticValve);

    // 肺动脉瓣（右心室和肺动脉之间）
    const pulmonaryValve = mitralValve.clone();
    pulmonaryValve.position.set(0.4, 3.5, 0.6);
    pulmonaryValve.rotation.x = Math.PI / 3.5;
    pulmonaryValve.scale.set(0.8, 0.8, 1);
    pulmonaryValve.userData.type = 'heart';
    heartGroup.add(pulmonaryValve);

    // 心肌纹理细节（增加真实感）
    const muscleDetailGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const muscleDetailMat = new THREE.MeshPhongMaterial({
        color: 0xb83844,
        emissive: 0x660000,
        emissiveIntensity: 0.3
    });
    
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const height = 1 + Math.random() * 3;
        const radius = 0.7 + Math.random() * 0.5;
        
        const detail = new THREE.Mesh(muscleDetailGeo, muscleDetailMat);
        detail.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius * 0.85
        );
        detail.userData.type = 'heart';
        heartGroup.add(detail);
    }

    // 增强的心脏搏动动画
    heartGroup.userData.animate = (time) => {
        // 更真实的心脏搏动（收缩期和舒张期）
        const heartRate = 3.5; // 心率
        const beat = Math.sin(time * heartRate);
        
        // 收缩期（快速收缩）
        const systole = beat > 0 ? Math.pow(beat, 2) * 0.1 : 0;
        // 舒张期（缓慢舒张）
        const diastole = beat < 0 ? Math.abs(beat) * 0.06 : 0;
        
        const scale = 1 + systole - diastole;
        const squeeze = Math.sin(time * heartRate + Math.PI / 2) * 0.04;
        
        heartGroup.scale.set(scale + squeeze * 0.5, scale - squeeze, scale + squeeze * 0.3);
        
        // 轻微旋转模拟心脏运动
        heartGroup.rotation.y = Math.sin(time * 1.2) * 0.06;
        heartGroup.rotation.x = Math.cos(time * 0.8) * 0.03;
        
        // 心脏瓣膜开合动画
        heartGroup.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'CircleGeometry') {
                const valveOpen = (beat + 1) / 2; // 0-1
                child.scale.z = 0.5 + valveOpen * 0.5;
            }
        });
    };

    return heartGroup;
}

// 导出统一的模型创建函数
export { createArmBonesLying, createLegBonesLying };
