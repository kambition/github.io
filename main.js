import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 场景设置
let scene, camera, renderer, controls;
let heartGroup, arteryGroup, veinGroup, capillaryGroup;
let raycaster, mouse;
let selectedObject = null;

// 知识库
const knowledgeBase = {
    heart: {
        title: "心脏 - 生命的泵",
        content: `
            <h3>🫀 心脏的结构</h3>
            <p>心脏是人体循环系统的<span class="highlight">动力泵</span>，大小约拳头大小，位于胸腔中部偏左。</p>
            
            <h3>四个腔室</h3>
            <p>• <span class="highlight">左心房</span>：接收来自肺部的含氧血液</p>
            <p>• <span class="highlight">左心室</span>：将含氧血液泵送到全身</p>
            <p>• <span class="highlight">右心房</span>：接收来自全身的缺氧血液</p>
            <p>• <span class="highlight">右心室</span>：将缺氧血液泵送到肺部</p>
            
            <h3>💓 心脏的功能</h3>
            <p>每天跳动约<span class="highlight">10万次</span>，泵送约<span class="highlight">7000升</span>血液，为全身输送氧气和营养物质。</p>
        `
    },
    artery: {
        title: "动脉 - 血液高速公路",
        content: `
            <h3>🔴 动脉的特点</h3>
            <p>动脉是将血液从<span class="highlight">心脏输送到全身</span>各个器官的血管。</p>
            
            <h3>结构特征</h3>
            <p>• <span class="highlight">管壁厚</span>：能承受心脏泵血的高压</p>
            <p>• <span class="highlight">弹性好</span>：随心脏跳动而有节奏地搏动</p>
            <p>• <span class="highlight">管腔小</span>：保持较高的血压</p>
            
            <h3>🌟 主要动脉</h3>
            <p>• <span class="highlight">主动脉</span>：人体最粗的动脉</p>
            <p>• <span class="highlight">肺动脉</span>：唯一流动脉血的动脉</p>
            
            <h3>血液特点</h3>
            <p>除肺动脉外，动脉中流动的是<span class="highlight">鲜红色的动脉血</span>（富含氧气）。</p>
        `
    },
    vein: {
        title: "静脉 - 血液回流通道",
        content: `
            <h3>🔵 静脉的特点</h3>
            <p>静脉是将血液从<span class="highlight">全身各处送回心脏</span>的血管。</p>
            
            <h3>结构特征</h3>
            <p>• <span class="highlight">管壁薄</span>：承受的压力较小</p>
            <p>• <span class="highlight">弹性小</span>：血流速度较慢</p>
            <p>• <span class="highlight">管腔大</span>：便于血液回流</p>
            <p>• <span class="highlight">有静脉瓣</span>：防止血液倒流</p>
            
            <h3>🌟 主要静脉</h3>
            <p>• <span class="highlight">上下腔静脉</span>：收集全身血液</p>
            <p>• <span class="highlight">肺静脉</span>：唯一流动脉血的静脉</p>
            
            <h3>血液特点</h3>
            <p>除肺静脉外，静脉中流动的是<span class="highlight">暗红色的静脉血</span>（含氧量低）。</p>
        `
    },
    capillary: {
        title: "毛细血管 - 物质交换站",
        content: `
            <h3>💜 毛细血管的特点</h3>
            <p>毛细血管是连接<span class="highlight">动脉和静脉</span>的最细小血管，是物质交换的场所。</p>
            
            <h3>结构特征</h3>
            <p>• <span class="highlight">管壁极薄</span>：只有一层上皮细胞</p>
            <p>• <span class="highlight">管径极细</span>：仅能容纳一个红细胞通过</p>
            <p>• <span class="highlight">数量巨大</span>：遍布全身各处</p>
            <p>• <span class="highlight">血流缓慢</span>：便于物质交换</p>
            
            <h3>🔄 重要功能</h3>
            <p>• 血液与组织细胞之间进行<span class="highlight">氧气、二氧化碳</span>的交换</p>
            <p>• 进行<span class="highlight">营养物质和代谢废物</span>的交换</p>
            
            <h3>💡 知识拓展</h3>
            <p>全身毛细血管总长度可达<span class="highlight">10万公里</span>，可绕地球2.5圈！</p>
        `
    },
    reset: {
        title: "人体循环系统",
        content: `
            <h3>🔄 血液循环路径</h3>
            <p>人体有两条循环路径：</p>
            
            <h3>1️⃣ 体循环（大循环）</h3>
            <p><span class="highlight">左心室 → 主动脉 → 全身毛细血管 → 上下腔静脉 → 右心房</span></p>
            <p>功能：为全身输送氧气和营养</p>
            
            <h3>2️⃣ 肺循环（小循环）</h3>
            <p><span class="highlight">右心室 → 肺动脉 → 肺部毛细血管 → 肺静脉 → 左心房</span></p>
            <p>功能：进行气体交换，更新氧气</p>
            
            <h3>💡 趣味知识</h3>
            <p>• 血液循环一周只需<span class="highlight">23秒</span></p>
            <p>• 成人体内约有<span class="highlight">4-5升</span>血液</p>
            <p>• 心脏一生要跳动约<span class="highlight">25-30亿次</span></p>
        `
    }
};

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2332);
    
    // 添加雾效
    scene.fog = new THREE.Fog(0x1a2332, 10, 50);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 15);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 添加控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;

    // 射线投射器（用于点击检测）
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 添加光源
    addLights();

    // 创建3D模型
    createHeart();
    createArteries();
    createVeins();
    createCapillaries();

    // 添加环境装饰
    addEnvironment();

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const part = e.target.dataset.part;
            focusOnPart(part);
        });
    });

    // 隐藏加载提示
    document.getElementById('loading').style.display = 'none';

    // 开始动画
    animate();
}

// 添加光源
function addLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 主光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // 点光源（心脏内部光）
    const pointLight = new THREE.PointLight(0xff3366, 1, 10);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);
}

// 创建心脏
function createHeart() {
    heartGroup = new THREE.Group();
    heartGroup.userData.type = 'heart';

    // 心脏主体（使用球体组合）
    const heartGeometry = new THREE.SphereGeometry(2, 32, 32);
    const heartMaterial = new THREE.MeshPhongMaterial({
        color: 0xe74c3c,
        emissive: 0x8b0000,
        emissiveIntensity: 0.3,
        shininess: 100,
        transparent: true,
        opacity: 0.95
    });

    const heartMain = new THREE.Mesh(heartGeometry, heartMaterial);
    heartMain.position.y = 2;
    heartMain.castShadow = true;
    heartMain.userData.type = 'heart';
    heartGroup.add(heartMain);

    // 心房（上部）
    const atriumGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const atriumMaterial = new THREE.MeshPhongMaterial({
        color: 0xc0392b,
        emissive: 0x8b0000,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.9
    });

    const leftAtrium = new THREE.Mesh(atriumGeometry, atriumMaterial);
    leftAtrium.position.set(-0.8, 3.5, 0);
    leftAtrium.scale.set(1, 0.8, 1);
    leftAtrium.userData.type = 'heart';
    heartGroup.add(leftAtrium);

    const rightAtrium = new THREE.Mesh(atriumGeometry, atriumMaterial);
    rightAtrium.position.set(0.8, 3.5, 0);
    rightAtrium.scale.set(1, 0.8, 1);
    rightAtrium.userData.type = 'heart';
    heartGroup.add(rightAtrium);

    // 添加心脏搏动效果
    heartGroup.userData.animate = (time) => {
        const scale = 1 + Math.sin(time * 2) * 0.05;
        heartGroup.scale.set(scale, scale, scale);
    };

    scene.add(heartGroup);
}

// 创建动脉系统
function createArteries() {
    arteryGroup = new THREE.Group();
    arteryGroup.userData.type = 'artery';

    const arteryMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6b6b,
        emissive: 0xff0000,
        emissiveIntensity: 0.2,
        shininess: 80,
        transparent: true,
        opacity: 0.9
    });

    // 主动脉
    createArtery(arteryGroup, arteryMaterial, [
        { x: 0, y: 3, z: 0 },
        { x: 0, y: 5, z: 0 },
        { x: 0, y: 6, z: 0 }
    ], 0.4);

    // 分支动脉
    createArtery(arteryGroup, arteryMaterial, [
        { x: 0, y: 6, z: 0 },
        { x: -2, y: 6, z: 0 },
        { x: -3, y: 5, z: 0 }
    ], 0.25);

    createArtery(arteryGroup, arteryMaterial, [
        { x: 0, y: 6, z: 0 },
        { x: 2, y: 6, z: 0 },
        { x: 3, y: 5, z: 0 }
    ], 0.25);

    // 下行动脉
    createArtery(arteryGroup, arteryMaterial, [
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: -3, z: 0 }
    ], 0.35);

    scene.add(arteryGroup);
}

// 创建静脉系统
function createVeins() {
    veinGroup = new THREE.Group();
    veinGroup.userData.type = 'vein';

    const veinMaterial = new THREE.MeshPhongMaterial({
        color: 0x3498db,
        emissive: 0x0066cc,
        emissiveIntensity: 0.2,
        shininess: 60,
        transparent: true,
        opacity: 0.85
    });

    // 上腔静脉
    createArtery(veinGroup, veinMaterial, [
        { x: 1, y: 6, z: 0.5 },
        { x: 1, y: 4, z: 0.5 },
        { x: 0.5, y: 3, z: 0.3 }
    ], 0.3);

    // 下腔静脉
    createArtery(veinGroup, veinMaterial, [
        { x: 0.8, y: 0.5, z: 0.5 },
        { x: 0.8, y: -2, z: 0.5 },
        { x: 0.8, y: -3.5, z: 0.5 }
    ], 0.35);

    // 肺静脉
    createArtery(veinGroup, veinMaterial, [
        { x: -1, y: 4, z: -0.5 },
        { x: -2, y: 4.5, z: -0.5 },
        { x: -3, y: 4.5, z: -0.5 }
    ], 0.25);

    scene.add(veinGroup);
}

// 创建毛细血管网络
function createCapillaries() {
    capillaryGroup = new THREE.Group();
    capillaryGroup.userData.type = 'capillary';

    const capillaryMaterial = new THREE.MeshPhongMaterial({
        color: 0x9b59b6,
        emissive: 0x6a1b9a,
        emissiveIntensity: 0.3,
        shininess: 40,
        transparent: true,
        opacity: 0.7
    });

    // 创建毛细血管网络（放射状）
    const positions = [
        { x: -4, y: 2, z: 0 },
        { x: 4, y: 2, z: 0 },
        { x: 0, y: 5, z: 3 },
        { x: 0, y: 5, z: -3 },
        { x: -3, y: -1, z: 2 },
        { x: 3, y: -1, z: 2 }
    ];

    positions.forEach(pos => {
        createCapillaryNetwork(capillaryGroup, capillaryMaterial, pos);
    });

    scene.add(capillaryGroup);
}

// 辅助函数：创建血管
function createArtery(group, material, points, radius) {
    const curve = new THREE.CatmullRomCurve3(
        points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    );

    const tubeGeometry = new THREE.TubeGeometry(curve, 20, radius, 8, false);
    const tube = new THREE.Mesh(tubeGeometry, material);
    tube.castShadow = true;
    tube.userData.type = group.userData.type;
    group.add(tube);

    // 添加血液流动粒子效果
    createFlowParticles(group, curve, material.color);
}

// 创建血液流动粒子
function createFlowParticles(group, curve, color) {
    const particleCount = 20;
    const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
    });

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.userData.progress = i / particleCount;
        particle.userData.curve = curve;
        particles.push(particle);
        group.add(particle);
    }

    group.userData.particles = particles;
    group.userData.animateParticles = (time) => {
        particles.forEach(particle => {
            particle.userData.progress = (particle.userData.progress + 0.002) % 1;
            const pos = curve.getPoint(particle.userData.progress);
            particle.position.copy(pos);
        });
    };
}

// 创建毛细血管网络
function createCapillaryNetwork(group, material, centerPos) {
    const segments = 8;
    const radius = 1.5;

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const points = [
            new THREE.Vector3(centerPos.x, centerPos.y, centerPos.z),
            new THREE.Vector3(
                centerPos.x + Math.cos(angle) * radius * 0.5,
                centerPos.y + (Math.random() - 0.5),
                centerPos.z + Math.sin(angle) * radius * 0.5
            ),
            new THREE.Vector3(
                centerPos.x + Math.cos(angle) * radius,
                centerPos.y + (Math.random() - 0.5) * 2,
                centerPos.z + Math.sin(angle) * radius
            )
        ];

        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 10, 0.05, 4, false);
        const tube = new THREE.Mesh(tubeGeometry, material);
        tube.userData.type = 'capillary';
        group.add(tube);
    }
}

// 添加环境装饰
function addEnvironment() {
    // 添加粒子背景
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = (Math.random() - 0.5) * 50;
        positions[i + 2] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // 添加旋转动画
    particleSystem.userData.animate = (time) => {
        particleSystem.rotation.y = time * 0.05;
    };
}

// 聚焦到特定部位
function focusOnPart(part) {
    let targetGroup, position, distance;

    switch (part) {
        case 'heart':
            targetGroup = heartGroup;
            position = new THREE.Vector3(0, 2, 0);
            distance = 8;
            highlightGroup(heartGroup);
            break;
        case 'artery':
            targetGroup = arteryGroup;
            position = new THREE.Vector3(0, 3, 0);
            distance = 10;
            highlightGroup(arteryGroup);
            break;
        case 'vein':
            targetGroup = veinGroup;
            position = new THREE.Vector3(0, 2, 0);
            distance = 10;
            highlightGroup(veinGroup);
            break;
        case 'capillary':
            targetGroup = capillaryGroup;
            position = new THREE.Vector3(0, 2, 0);
            distance = 12;
            highlightGroup(capillaryGroup);
            break;
        case 'reset':
            position = new THREE.Vector3(0, 3, 0);
            distance = 15;
            resetHighlight();
            break;
    }

    // 更新信息面板
    updateInfoPanel(part);

    // 平滑移动相机
    animateCamera(position, distance);
}

// 高亮显示组
function highlightGroup(group) {
    // 重置所有组
    resetHighlight();

    // 高亮选中的组
    group.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.emissiveIntensity = 0.6;
            child.material.opacity = 1;
        }
    });

    // 降低其他组的透明度
    [heartGroup, arteryGroup, veinGroup, capillaryGroup].forEach(g => {
        if (g !== group) {
            g.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 0.3;
                }
            });
        }
    });
}

// 重置高亮
function resetHighlight() {
    [heartGroup, arteryGroup, veinGroup, capillaryGroup].forEach(group => {
        group.traverse((child) => {
            if (child.isMesh && child.material) {
                // 恢复原始发光强度
                if (group === heartGroup) {
                    child.material.emissiveIntensity = 0.3;
                    child.material.opacity = 0.95;
                } else if (group === arteryGroup) {
                    child.material.emissiveIntensity = 0.2;
                    child.material.opacity = 0.9;
                } else if (group === veinGroup) {
                    child.material.emissiveIntensity = 0.2;
                    child.material.opacity = 0.85;
                } else if (group === capillaryGroup) {
                    child.material.emissiveIntensity = 0.3;
                    child.material.opacity = 0.7;
                }
            }
        });
    });
}

// 更新信息面板
function updateInfoPanel(part) {
    const infoPanel = document.getElementById('info-panel');
    const knowledge = knowledgeBase[part];

    if (knowledge) {
        infoPanel.innerHTML = `<h2>${knowledge.title}</h2>${knowledge.content}`;
    }
}

// 相机动画
function animateCamera(targetPosition, distance) {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1500;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);

        // 计算新位置
        const newTarget = startTarget.clone().lerp(targetPosition, easeProgress);
        controls.target.copy(newTarget);

        // 计算相机位置
        const direction = startPosition.clone().sub(startTarget).normalize();
        const newCameraPos = newTarget.clone().add(direction.multiplyScalar(distance));
        camera.position.lerp(newCameraPos, easeProgress);

        controls.update();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

// 缓动函数
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 鼠标点击事件
function onMouseClick(event) {
    // 检查是否点击了按钮
    if (event.target.classList.contains('control-btn')) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const allObjects = [];
    [heartGroup, arteryGroup, veinGroup, capillaryGroup].forEach(group => {
        group.traverse((child) => {
            if (child.isMesh) {
                allObjects.push(child);
            }
        });
    });

    const intersects = raycaster.intersectObjects(allObjects);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const partType = clickedObject.userData.type;
        focusOnPart(partType);
    }
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // 心脏搏动动画
    if (heartGroup.userData.animate) {
        heartGroup.userData.animate(time);
    }

    // 血液流动动画
    [arteryGroup, veinGroup].forEach(group => {
        if (group.userData.animateParticles) {
            group.userData.animateParticles(time);
        }
    });

    // 环境粒子旋转
    scene.children.forEach(child => {
        if (child.userData.animate) {
            child.userData.animate(time);
        }
    });

    controls.update();
    renderer.render(scene, camera);
}

// 启动应用
init();
